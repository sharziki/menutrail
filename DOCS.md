# MenuTrail Developer Documentation

A modern restaurant ordering platform with online menus, delivery integration, and table management.

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Components](#components)
- [Integrations](#integrations)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

The app runs on `http://localhost:3002` by default.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework (App Router) |
| **TypeScript** | Type safety |
| **Prisma** | Database ORM |
| **PostgreSQL** | Database (via Supabase) |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **Zustand** | State management (cart) |
| **Stripe** | Payment processing |
| **DoorDash Drive** | Delivery integration |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── address/       # Address autocomplete
│   │   ├── checkout/      # Stripe checkout
│   │   ├── dashboard/     # Dashboard data APIs
│   │   ├── delivery/      # DoorDash integration
│   │   ├── giftcards/     # Gift card management
│   │   ├── integrations/  # GHL integration
│   │   ├── orders/        # Order management
│   │   ├── settings/      # Restaurant settings
│   │   └── webhooks/      # Stripe/DoorDash webhooks
│   ├── (auth)/            # Auth pages (login/signup)
│   ├── builder/           # Menu builder
│   ├── checkout/          # Customer checkout
│   ├── dashboard/         # Admin dashboard
│   │   ├── orders/        # Order management
│   │   ├── settings/      # Settings page
│   │   └── tables/        # Table management
│   ├── demo/              # Demo restaurant page
│   ├── giftcards/         # Gift card purchase
│   ├── menu/[slug]/       # Public menu page
│   ├── onboarding/        # Restaurant setup wizard
│   ├── order/             # Order confirmation pages
│   └── track/[orderId]/   # Order tracking
├── components/
│   ├── builder/           # Menu builder components
│   ├── menu/              # Menu display components
│   │   └── layouts/       # Layout variants (grid, list, etc.)
│   └── ui/                # Reusable UI components
├── lib/
│   ├── integrations/      # Third-party integrations
│   ├── store/             # Zustand stores
│   ├── supabase/          # Supabase client
│   └── utils.ts           # Utility functions
├── types/
│   └── menu.ts            # TypeScript types
└── prisma/
    └── schema.prisma      # Database schema
```

---

## Database Schema

### Core Models

#### Restaurant
The main tenant model. Each restaurant has its own data.

```prisma
model Restaurant {
  id            String    @id
  name          String
  slug          String    @unique  // URL-friendly name
  description   String?
  phone         String?
  email         String?
  
  // Branding
  logo          String?
  coverImage    String?
  primaryColor  String    @default("#f97316")
  
  // Address
  street        String?
  city          String?
  state         String?
  zip           String?
  latitude      Float?
  longitude     Float?
  
  // API Keys (store encrypted in production)
  stripeSecretKey       String?
  stripePublishableKey  String?
  doordashDeveloperId   String?
  doordashKeyId         String?
  
  // Settings
  taxRate       Float     @default(0.08)
  
  // Relations
  menus         Menu[]
  menuItems     MenuItem[]
  categories    Category[]
  orders        Order[]
  customers     Customer[]
}
```

#### MenuItem
Menu items with modifier support.

```prisma
model MenuItem {
  id            String
  name          String
  description   String?
  price         Float
  comparePrice  Float?     // For showing discounts
  image         String?
  images        String[]   // Multiple images for hover
  calories      Int?
  tags          String[]   // popular, new, spicy
  dietaryTags   String[]   // vegetarian, vegan, gluten-free
  isAvailable   Boolean    @default(true)
  
  // Relations
  category      Category
  modifierGroups MenuItemModifierGroup[]
}
```

#### Order
Customer orders with full tracking.

```prisma
model Order {
  id            String
  orderNumber   String
  status        OrderStatus  // PENDING, CONFIRMED, PREPARING, READY, etc.
  orderType     OrderType    // DINE_IN, PICKUP, DELIVERY
  
  // Customer info
  customerName  String
  customerPhone String
  
  // Delivery address
  deliveryStreet       String?
  deliveryCity         String?
  deliveryInstructions String?
  
  // Pricing
  subtotal      Float
  tax           Float
  deliveryFee   Float
  tip           Float
  total         Float
  
  // Payment
  paymentStatus PaymentStatus
  stripePaymentIntentId String?
  
  // DoorDash tracking
  doordashDeliveryId    String?
  doordashTrackingUrl   String?
  
  // Relations
  items         OrderItem[]
  customer      Customer?
  table         Table?
}
```

---

## API Routes

### Dashboard APIs

| Route | Method | Description |
|-------|--------|-------------|
| `/api/dashboard/stats` | GET | Today's revenue, orders, customers |
| `/api/dashboard/recent-orders` | GET | Last 10 orders |
| `/api/dashboard/top-items` | GET | Best selling items (30 days) |
| `/api/dashboard/top-customers` | GET | Top customers by spending |

### Order APIs

| Route | Method | Description |
|-------|--------|-------------|
| `/api/orders` | GET | List orders with filters |
| `/api/orders` | POST | Create new order |
| `/api/orders/[id]` | PATCH | Update order status |

### Checkout

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhooks |

### Address Autocomplete

| Route | Method | Description |
|-------|--------|-------------|
| `/api/address/autocomplete?input=...` | GET | Search addresses |
| `/api/address/autocomplete` | POST | Get full address from place_id |

### Delivery (DoorDash)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/delivery/doordash` | POST | Create delivery |
| `/api/delivery/doordash/sandbox` | POST | Test delivery (sandbox) |
| `/api/webhooks/doordash` | POST | Handle delivery updates |

### Gift Cards

| Route | Method | Description |
|-------|--------|-------------|
| `/api/giftcards` | POST | Purchase gift card |
| `/api/giftcards?code=...` | GET | Check balance |
| `/api/giftcards/redeem` | POST | Redeem gift card |

### Integrations

| Route | Method | Description |
|-------|--------|-------------|
| `/api/integrations/ghl` | POST | Sync order to Go High Level CRM |
| `/api/settings` | GET/PUT | Restaurant settings |

---

## Components

### Menu Layouts

Six built-in layout options in `src/components/menu/layouts/`:

1. **GridLayout** - Instagram-style photo grid
2. **ListLayout** - Classic scannable list
3. **CardLayout** - Swipeable cards (mobile)
4. **TabsLayout** - Horizontal category tabs
5. **HeroLayout** - Full-page hero images
6. **CompactLayout** - Text-dense traditional style

### Menu Item Card

`src/components/menu/MenuItemCard.tsx`

Features:
- Multiple image hover cycling
- Dietary tag display
- Quick add to cart
- Responsive variants

### Cart Store

`src/lib/store/cart.ts`

```typescript
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  modifiers?: { name: string; price: number }[]
  notes?: string
}

// Usage
const { items, addItem, removeItem, getTotal } = useCartStore()
```

### Address Autocomplete

`src/components/ui/address-autocomplete.tsx`

```tsx
<AddressAutocomplete
  value={address}
  onSelect={(parsed) => {
    // parsed: { street, city, state, zip, lat, lng }
  }}
  placeholder="Enter your address..."
/>
```

---

## Integrations

### Stripe

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard > Developers
3. Set up webhook endpoint for `/api/webhooks/stripe`
4. Add keys to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### DoorDash Drive

1. Apply for DoorDash Drive at https://developer.doordash.com
2. Create an application and get credentials
3. Add to `.env`:
   ```
   DOORDASH_DEVELOPER_ID=...
   DOORDASH_KEY_ID=...
   DOORDASH_SIGNING_SECRET=...
   ```

**Sandbox Mode**: Toggle in Settings to test deliveries without real charges.

### Go High Level

1. Get API key from GHL Settings > API
2. Get Location ID from Settings > Business Info
3. Configure in Dashboard > Settings > Integrations

When enabled, every order automatically:
- Creates/updates contact in GHL
- Adds order details as notes
- Tags repeat customers ("Repeat Customer", "Loyal Customer", "VIP")

### Google Places (Address Autocomplete)

1. Create project at https://console.cloud.google.com
2. Enable Places API
3. Create API key with Places API restriction
4. Add to `.env`:
   ```
   GOOGLE_PLACES_API_KEY=...
   ```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Supabase (Auth)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DoorDash
DOORDASH_DEVELOPER_ID=...
DOORDASH_KEY_ID=...
DOORDASH_SIGNING_SECRET=...

# Google Places
GOOGLE_PLACES_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- (Optional) DoorDash Drive account
- (Optional) Google Cloud account

### Steps

1. **Clone and install**
   ```bash
   git clone https://github.com/sharziki/menutrail.git
   cd menutrail
   npm install
   ```

2. **Set up database**
   ```bash
   # Create database and run migrations
   npx prisma db push
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Start**
   ```bash
   npm start
   ```

### VPS Deployment (PM2)

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name menutrail -- start

# Save process list
pm2 save

# Set up startup script
pm2 startup
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

---

## Common Tasks

### Adding a New Menu Item Field

1. Update Prisma schema (`prisma/schema.prisma`)
2. Run `npx prisma db push`
3. Update TypeScript types (`src/types/menu.ts`)
4. Update ItemEditor component
5. Update MenuItemCard display

### Adding a New Order Status

1. Update enum in Prisma schema
2. Run `npx prisma db push`
3. Update `STATUS_CONFIG` in orders dashboard
4. Update order flow logic

### Creating a New Layout

1. Create component in `src/components/menu/layouts/`
2. Export from `src/components/menu/layouts/index.ts`
3. Add to `LAYOUT_CONFIG` in `src/types/menu.ts`
4. Add case in `MenuDisplay.tsx`

---

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Database connection failed"
- Check `DATABASE_URL` format
- Ensure database server is running
- Check firewall/network access

### "Stripe webhook failing"
- Verify webhook secret matches
- Check webhook endpoint URL is correct
- Use Stripe CLI for local testing:
  ```bash
  stripe listen --forward-to localhost:3002/api/webhooks/stripe
  ```

### "DoorDash delivery not working"
- Check sandbox mode is enabled for testing
- Verify credentials are correct
- Check address is within delivery zone

---

## Support

- GitHub Issues: https://github.com/sharziki/menutrail/issues
- Email: support@menutrail.com

---

*Last updated: February 2026*
