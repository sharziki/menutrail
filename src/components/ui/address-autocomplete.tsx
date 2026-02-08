"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { MapPin, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AddressPrediction {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}

interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  value?: string
  onSelect?: (address: ParsedAddress) => void
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  value = "",
  onSelect,
  onChange,
  placeholder = "Enter your address...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [predictions, setPredictions] = useState<AddressPrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [sessionToken] = useState(() => crypto.randomUUID())
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch predictions
  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/address/autocomplete?input=${encodeURIComponent(input)}&session=${sessionToken}`
      )
      const data = await res.json()
      setPredictions(data.predictions || [])
      setShowDropdown(true)
    } catch (error) {
      console.error("Address autocomplete error:", error)
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }, [sessionToken])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      fetchPredictions(newValue)
    }, 300)
  }

  // Handle prediction selection
  const handleSelect = async (prediction: AddressPrediction) => {
    setInputValue(prediction.description)
    onChange?.(prediction.description)
    setShowDropdown(false)
    setPredictions([])

    // Fetch full address details
    try {
      const res = await fetch("/api/address/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: prediction.place_id,
          session: sessionToken,
        }),
      })
      const data = await res.json()
      if (data.address) {
        onSelect?.(data.address)
      }
    } catch (error) {
      console.error("Address details error:", error)
    }
  }

  // Clear input
  const handleClear = () => {
    setInputValue("")
    onChange?.("")
    setPredictions([])
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{prediction.main_text}</p>
                <p className="text-sm text-gray-500">{prediction.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
