# MenuTrail

> **Mission:** Kill Owner.com. Build the restaurant management platform that makes owners switch the day they see it.

---

## The Problem

Restaurant owners are stuck between:
1. **Third-party apps (DoorDash, UberEats)** — 30% commission eating their margins
2. **Legacy software (Toast, Aloha, Micros)** — expensive, clunky, requires training
3. **Modern alternatives (Owner.com, ChowNow)** — better but still have major issues

**Pain points we found:**
- Menu builders are tedious and ugly — no design flexibility
- Setup takes days/weeks instead of minutes
- Hidden fees and confusing pricing
- Data privacy concerns (Owner.com uses customer data as sales tool — Trustpilot 2.8/5)
- One-size-fits-all templates that make every restaurant look the same
- Mobile experience is an afterthought

---

## Market Research

### Competitor Analysis

| Competitor | Pricing | Strengths | Weaknesses | Our Advantage |
|------------|---------|-----------|------------|---------------|
| **Owner.com** | Flat fee (undisclosed) + 5% customer charge | SEO focus, mobile app, 24/7 support, month-to-month | 2.8/5 Trustpilot, data privacy concerns, limited customization, generic templates | 6 unique menu layouts, full design control, transparent pricing |
| **Toast** | $0-165/mo + 2.49-2.99% processing | Full POS, hardware, established | Expensive, complex setup, contracts, overkill for small restaurants | Simpler, faster setup, no hardware required |
| **Square for Restaurants** | $0-165/mo + 2.6% + 10¢ | Trusted brand, good hardware, free tier | Generic ordering experience, limited menu customization | Superior menu builder, restaurant-specific UX |
| **ChowNow** | $149-299/mo | Direct ordering focus, integrations | Dated UI, slow setup, expensive | Modern UX, 6 layout options, faster time-to-live |
| **GloriaFood** | Free (premium add-ons) | Free tier, quick setup | Limited customization, basic templates, feels cheap | Professional quality, premium feel at competitive price |

### What Customers Hate (from reviews)

1. **"Menu updates take forever"** — we'll make it instant with live preview
2. **"My restaurant looks like everyone else"** — 6 unique layouts solve this
3. **"Setup took weeks"** — we target under 10 minutes
4. **"Hidden fees surprised me"** — transparent pricing, no gotchas
5. **"Mobile ordering is clunky"** — mobile-first design
6. **"I can't customize anything"** — full theme control (colors, fonts, layout)
7. **"They use my data to sell to competitors"** — strict data privacy, your data stays yours

### Market Size

- 1M+ restaurants in US alone
- ~$25B restaurant tech market
- Growing shift from third-party apps to direct ordering (restaurants keeping margins)
- Post-COVID permanent shift to online ordering

---

## Our Unique Angle

### "The Canva of Restaurant Menus"

**Menu Builder is the differentiator.** While competitors offer one boring template, we offer:

1. **Grid Layout** — Photos forward, Instagram-style, perfect for trendy spots
2. **List Layout** — Classic, scannable, fast for diners/delis
3. **Card Stack** — Swipeable on mobile, modern feel
4. **Category Tabs** — Horizontal scroll, good for large menus
5. **Full-Page Hero** — One item at a time, luxury/high-end restaurants
6. **Compact Layout** — Text-dense, traditional diners

**Live preview while editing.** Drag-drop reordering. See exactly what customers see.

### Speed to Live

**10 minutes from signup to accepting orders.** Not days. Not weeks. Minutes.

### Transparent Pricing

- No hidden fees
- No customer surcharges (unlike Owner's 5%)
- Simple flat monthly rate
- Month-to-month, cancel anytime

### Data Privacy

- Your data stays yours
- We never share restaurant data
- No using your numbers to sell to competitors
- Trust badge: "Your data, your business"

---

## Success Metrics

- [ ] Signup → menu live → accepting orders in **under 10 minutes**
- [ ] Menu builder feels like **Canva** (visual, intuitive, fun)
- [ ] **6 layout options** that make every restaurant look unique
- [ ] **Mobile-first** (owners manage from phone)
- [ ] **Core Web Vitals green** (fast loads)
- [ ] **0% customer fees** (unlike Owner's 5%)

---

## MVP Scope

### Phase 1: Menu Builder (THE HOOK)
- [ ] 6 layout templates with live preview
- [ ] Drag-drop item reordering
- [ ] Modifiers/add-ons with pricing
- [ ] Item photos with auto-crop/optimize
- [ ] Dietary tags (vegan, GF, spicy, etc.)
- [ ] Scheduled availability (lunch vs dinner)
- [ ] Theme customization (colors, fonts, logo)
- [ ] Mobile-responsive preview

### Phase 2: Online Ordering
- [ ] Pickup + delivery options
- [ ] Real-time order status
- [ ] Cart persistence
- [ ] Guest checkout + account creation
- [ ] Order scheduling (future orders)
- [ ] Stripe payments integration

### Phase 3: Operations
- [ ] Kitchen Display System (KDS)
- [ ] Order management dashboard
- [ ] Ticket printer support (ESC/POS)
- [ ] Customer database + order history

### Phase 4: Integrations & Analytics
- [ ] DoorDash Drive / UberEats / GrubHub delivery
- [ ] Google Maps for delivery radius
- [ ] Sales by day/week/month
- [ ] Popular items report
- [ ] Peak hours heatmap
- [ ] Customer lifetime value

### Out of Scope (for MVP)
- Multi-location management (v2)
- Loyalty/rewards program (v2)
- Table reservations (v2)
- Marketing automation (v2)
- Mobile app for customers (v2)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animation** | Framer Motion + GSAP |
| **Components** | ReactBits + 21st.dev |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Payments** | Stripe |
| **Email** | Resend |
| **File Storage** | Uploadthing or S3 |
| **Hosting** | Vercel |

---

## User Flows

### Flow 1: Onboarding (Target: < 10 min)
1. Sign up (email/Google)
2. Enter restaurant name, address
3. Choose menu layout template
4. Add items (guided wizard OR import from PDF/existing menu)
5. Customize theme (colors, logo)
6. Preview on mobile
7. Connect Stripe
8. Go live!

### Flow 2: Customer Ordering
1. Customer lands on restaurant's MenuTrail page
2. Browses menu with chosen layout
3. Adds items to cart (with modifiers)
4. Enters delivery/pickup info
5. Pays with Stripe
6. Gets confirmation + real-time status updates
7. Restaurant sees order on KDS

### Flow 3: Restaurant Managing Orders
1. Order comes in → notification (sound + push)
2. View on KDS or dashboard
3. Accept/modify/reject
4. Mark as preparing → ready → completed
5. Customer gets status updates
6. Order history saved for analytics

---

## Competitive Positioning

```
                    CUSTOMIZATION
                         ↑
                         |
     GloriaFood          |         MenuTrail ★
     (free but basic)    |    (visual + flexible)
                         |
    ─────────────────────┼─────────────────────→ EASE OF USE
                         |
     Toast/Square        |         Owner.com
     (powerful but       |    (easy but limited
      complex)           |     customization)
                         |
                         ↓
```

**We sit in the top-right quadrant:** Easy to use AND highly customizable.

---

## Design Principles

1. **Visual-first** — Show, don't tell. Live previews everywhere.
2. **Mobile-first** — Owners live on their phones. Design for thumb.
3. **Speed** — Every interaction should feel instant.
4. **Delight** — Micro-animations that make editing fun.
5. **Confidence** — Clear feedback on every action.

---

## Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| M1 | Day 1-2 | Project setup, design system, component library |
| M2 | Day 3-5 | Menu Builder with all 6 layouts |
| M3 | Day 6-8 | Online ordering flow |
| M4 | Day 9-10 | KDS + order management |
| M5 | Day 11-12 | Polish, E2E tests, staging deploy |

---

## For Zippy

### Autonomous Work Rules
1. Research done ✓ — now build
2. Menu builder is priority #1 (the hook)
3. Use 21st.dev / ReactBits before building custom
4. Framer Motion for animations, GSAP for complex stuff
5. Playwright tests throughout
6. Update PROGRESS.md every 15-20 min

### Ping Master Sharziki When
- Research complete ✓ (this doc)
- Menu builder done (all 6 layouts working)
- Ordering flow done
- KDS/operations done
- Staging ready to test

### DO NOT Ping For
- Progress updates
- Small decisions
- Bug fixes
- Code style choices
