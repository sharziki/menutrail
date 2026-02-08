"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Check, 
  Smartphone, 
  Zap, 
  DollarSign, 
  Layout, 
  ShoppingBag, 
  BarChart3,
  ChefHat,
  Star,
  Menu,
  X,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

const LAYOUTS = [
  { name: "Grid", icon: "🎨", desc: "Instagram-style visual feast" },
  { name: "List", icon: "📋", desc: "Classic scannable format" },
  { name: "Cards", icon: "🃏", desc: "Swipeable card experience" },
  { name: "Tabs", icon: "📑", desc: "Organized by category" },
  { name: "Hero", icon: "🖼️", desc: "Full-page immersive" },
  { name: "Compact", icon: "📄", desc: "Text-dense traditional" },
]

const PRICING = [
  {
    name: "Starter",
    price: 0,
    desc: "Perfect for trying things out",
    features: [
      "1 location",
      "Basic menu layouts",
      "QR code menus",
      "Up to 50 items",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: 49,
    desc: "For growing restaurants",
    features: [
      "Unlimited locations",
      "All 6 premium layouts",
      "Online ordering",
      "Unlimited items",
      "Custom branding",
      "Analytics dashboard",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 149,
    desc: "For restaurant groups",
    features: [
      "Everything in Pro",
      "Multi-brand support",
      "API access",
      "Kitchen Display System",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    quote: "Switched from Owner.com and our online orders increased 40% in the first month.",
    author: "Maria Chen",
    role: "Owner, Sakura Sushi",
    rating: 5,
  },
  {
    quote: "The menu layouts are gorgeous. Our customers actually browse now instead of just ordering the usual.",
    author: "James Wilson",
    role: "Manager, The Burger Joint",
    rating: 5,
  },
  {
    quote: "Finally a platform that doesn't take 15% of our hard-earned revenue.",
    author: "Ahmed Hassan",
    role: "Owner, Mediterranean Grill",
    rating: 5,
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-xl">MenuTrail</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#layouts" className="text-gray-600 hover:text-gray-900 transition">Layouts</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <Link href="/demo">
                <Button variant="outline">View Demo</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 py-4"
          >
            <div className="flex flex-col gap-4 px-4">
              <a href="#features" className="text-gray-600 py-2">Features</a>
              <a href="#layouts" className="text-gray-600 py-2">Layouts</a>
              <a href="#pricing" className="text-gray-600 py-2">Pricing</a>
              <Link href="/demo">
                <Button variant="outline" className="w-full">View Demo</Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Stop paying 15% to delivery apps
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Your menu, your brand,
              <span className="block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                your customers.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Beautiful digital menus and direct online ordering. No commission fees. 
              Join 2,000+ restaurants who ditched the middlemen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  See Live Demo
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mt-6"
            >
              No credit card required · Free 14-day trial · Cancel anytime
            </motion.p>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-50">
              <div className="h-8 bg-gray-100 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Interactive Demo Preview</p>
                  <Link href="/demo">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600">
                      Launch Demo <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">2,000+</p>
              <p className="text-gray-500">Restaurants</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-gray-500">Commission Fees</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">4.9★</p>
              <p className="text-gray-500">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">5 min</p>
              <p className="text-gray-500">Setup Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by restaurant owners, for restaurant owners. Every feature is designed to make your life easier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: "6 Stunning Layouts",
                desc: "From Instagram-style grids to classic lists. Pick what fits your brand.",
              },
              {
                icon: ShoppingBag,
                title: "Direct Ordering",
                desc: "Take orders directly. No middlemen. No commissions. Keep 100% of your revenue.",
              },
              {
                icon: Smartphone,
                title: "Mobile-First",
                desc: "Gorgeous on every device. QR codes that actually work.",
              },
              {
                icon: DollarSign,
                title: "Flat Pricing",
                desc: "One monthly fee. No surprises. No percentage of sales.",
              },
              {
                icon: ChefHat,
                title: "Kitchen Display",
                desc: "Real-time order management. No more lost tickets.",
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                desc: "Know what's selling, when, and to whom. Data-driven decisions.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Layouts Section */}
      <section id="layouts" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              6 layouts that actually look different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Not just CSS tweaks. Completely different experiences for different vibes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LAYOUTS.map((layout, i) => (
              <motion.div
                key={layout.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition cursor-pointer group"
              >
                <div className="text-4xl mb-4">{layout.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{layout.name}</h3>
                <p className="text-gray-600">{layout.desc}</p>
                <Link href="/demo" className="inline-flex items-center gap-1 text-orange-600 mt-4 opacity-0 group-hover:opacity-100 transition">
                  Try it <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/demo">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600">
                See All Layouts in Action
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why restaurants switch to MenuTrail
            </h2>
            <p className="text-xl text-gray-600">
              See how we compare to the big guys
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-4"></th>
                  <th className="text-center py-4 px-4">
                    <div className="inline-flex items-center gap-2 text-orange-600 font-bold">
                      MenuTrail
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-gray-400">Owner.com</th>
                  <th className="text-center py-4 px-4 text-gray-400">UberEats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: "Commission fee", us: "0%", owner: "0%", uber: "15-30%" },
                  { feature: "Monthly price", us: "From $0", owner: "$300+", uber: "$500+" },
                  { feature: "Setup time", us: "5 minutes", owner: "1-2 days", uber: "1 week" },
                  { feature: "Menu layouts", us: "6 unique", owner: "1 basic", uber: "1 basic" },
                  { feature: "Own your data", us: true, owner: true, uber: false },
                  { feature: "Direct customer relationship", us: true, owner: true, uber: false },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 pr-4 text-gray-600">{row.feature}</td>
                    <td className="py-4 px-4 text-center font-medium text-gray-900">
                      {typeof row.us === 'boolean' ? (
                        row.us ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.us}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500">
                      {typeof row.owner === 'boolean' ? (
                        row.owner ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.owner}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500">
                      {typeof row.uber === 'boolean' ? (
                        row.uber ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.uber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by restaurant owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-xl text-gray-600">
              Flat monthly fees. No commissions. No hidden costs. Ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "rounded-2xl p-8 border-2 transition relative",
                  plan.popular 
                    ? "border-orange-500 bg-gradient-to-b from-orange-50 to-white shadow-xl" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={cn(
                    "w-full",
                    plan.popular 
                      ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700" 
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to own your customer relationship?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Join 2,000+ restaurants who stopped paying commissions and started keeping their profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 h-14">
                  See Demo First
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-xl text-white">MenuTrail</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-sm">© 2026 MenuTrail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
