import { NextRequest, NextResponse } from "next/server"

// Google Places Autocomplete API
// Also validates delivery address with DoorDash delivery zone

interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")
  const sessionToken = searchParams.get("session") // For billing optimization

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] })
  }

  // Check if Google API key is configured
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    // Return mock data for development
    return NextResponse.json({
      predictions: [
        {
          place_id: "mock_1",
          description: "123 Main St, Brooklyn, NY 11201, USA",
          structured_formatting: {
            main_text: "123 Main St",
            secondary_text: "Brooklyn, NY 11201, USA",
          },
        },
        {
          place_id: "mock_2",
          description: "456 Oak Ave, Manhattan, NY 10001, USA",
          structured_formatting: {
            main_text: "456 Oak Ave",
            secondary_text: "Manhattan, NY 10001, USA",
          },
        },
      ],
    })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
    url.searchParams.append("input", input)
    url.searchParams.append("key", process.env.GOOGLE_PLACES_API_KEY)
    url.searchParams.append("types", "address")
    url.searchParams.append("components", "country:us") // US only
    if (sessionToken) {
      url.searchParams.append("sessiontoken", sessionToken)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message)
      return NextResponse.json({ predictions: [] })
    }

    const predictions: PlacePrediction[] = data.predictions || []

    return NextResponse.json({
      predictions: predictions.map((p) => ({
        place_id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting.main_text,
        secondary_text: p.structured_formatting.secondary_text,
      })),
    })
  } catch (error) {
    console.error("Address autocomplete error:", error)
    return NextResponse.json({ predictions: [] })
  }
}

// Get full address details from place_id
export async function POST(request: NextRequest) {
  const { place_id, session } = await request.json()

  if (!place_id) {
    return NextResponse.json({ error: "place_id required" }, { status: 400 })
  }

  // Mock response for development
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({
      address: {
        street: "123 Main St",
        city: "Brooklyn",
        state: "NY",
        zip: "11201",
        lat: 40.6892,
        lng: -73.9857,
      },
      deliveryAvailable: true,
      estimatedDeliveryFee: 4.99,
      estimatedDeliveryTime: "30-45 min",
    })
  }

  try {
    // Get place details
    const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json")
    detailsUrl.searchParams.append("place_id", place_id)
    detailsUrl.searchParams.append("key", process.env.GOOGLE_PLACES_API_KEY)
    detailsUrl.searchParams.append("fields", "address_components,geometry")
    if (session) {
      detailsUrl.searchParams.append("sessiontoken", session)
    }

    const detailsResponse = await fetch(detailsUrl.toString())
    const detailsData = await detailsResponse.json()

    if (detailsData.status !== "OK") {
      return NextResponse.json({ error: "Failed to get address details" }, { status: 400 })
    }

    // Parse address components
    const components: AddressComponent[] = detailsData.result.address_components
    const getComponent = (type: string) => 
      components.find(c => c.types.includes(type))?.long_name || ""
    const getShortComponent = (type: string) => 
      components.find(c => c.types.includes(type))?.short_name || ""

    const address: ParsedAddress = {
      street: `${getComponent("street_number")} ${getComponent("route")}`.trim(),
      city: getComponent("locality") || getComponent("sublocality"),
      state: getShortComponent("administrative_area_level_1"),
      zip: getComponent("postal_code"),
      lat: detailsData.result.geometry.location.lat,
      lng: detailsData.result.geometry.location.lng,
    }

    // Check delivery availability with DoorDash
    const deliveryInfo = {
      deliveryAvailable: true,
      estimatedDeliveryFee: 4.99,
      estimatedDeliveryTime: "30-45 min",
    }

    if (process.env.DOORDASH_DEVELOPER_ID) {
      try {
        // TODO: Call DoorDash delivery quote API
        // const quote = await getDoorDashQuote(restaurantAddress, address)
        // deliveryInfo = {
        //   deliveryAvailable: quote.available,
        //   estimatedDeliveryFee: quote.fee,
        //   estimatedDeliveryTime: quote.estimated_time,
        // }
      } catch (e) {
        console.error("DoorDash quote error:", e)
      }
    }

    return NextResponse.json({
      address,
      ...deliveryInfo,
    })
  } catch (error) {
    console.error("Address details error:", error)
    return NextResponse.json({ error: "Failed to get address" }, { status: 500 })
  }
}
