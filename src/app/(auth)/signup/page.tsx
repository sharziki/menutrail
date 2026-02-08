"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Building2,
  User,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Account" },
  { id: 2, title: "Restaurant" },
  { id: 3, title: "Setup" },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Step 1: Account
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Step 2: Restaurant
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantType, setRestaurantType] = useState("")
  const [phone, setPhone] = useState("")

  // Step 3: What do you want to do?
  const [goals, setGoals] = useState<string[]>([])

  const RESTAURANT_TYPES = [
    "Fast Casual",
    "Fine Dining",
    "Cafe & Bakery",
    "Pizza",
    "Asian",
    "Mexican",
    "American",
    "Other",
  ]

  const GOALS = [
    { id: "online-ordering", label: "Accept online orders", icon: "🛒" },
    { id: "menu", label: "Create digital menus", icon: "📋" },
    { id: "delivery", label: "Offer delivery", icon: "🚗" },
    { id: "table-ordering", label: "Table QR ordering", icon: "📱" },
    { id: "analytics", label: "Track sales & analytics", icon: "📊" },
    { id: "marketing", label: "Build customer loyalty", icon: "❤️" },
  ]

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const supabase = createClient()

    // Create account
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantName || !restaurantType) return
    setStep(3)
  }

  const handleStep3 = async () => {
    setIsLoading(true)
    
    // In production, this would create the restaurant in the database
    // For now, we'll just redirect to the dashboard
    
    // TODO: Create restaurant via API
    // await fetch('/api/restaurants', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     name: restaurantName,
    //     type: restaurantType,
    //     phone,
    //     goals,
    //   }),
    // })

    setTimeout(() => {
      router.push("/onboarding")
    }, 1000)
  }

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-bold text-2xl">MenuTrail</span>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition",
                  step > s.id && "bg-green-500 text-white",
                  step === s.id && "bg-orange-500 text-white",
                  step < s.id && "bg-gray-200 text-gray-500"
                )}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2",
                    step > s.id ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600 mb-8">
                Start your 14-day free trial. No credit card required.
              </p>

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="John Smith"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@restaurant.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="8+ characters"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Restaurant */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold mb-2">Tell us about your restaurant</h1>
              <p className="text-gray-600 mb-8">
                We&apos;ll customize MenuTrail for your needs
              </p>

              <form onSubmit={handleStep2} className="space-y-6">
                <div>
                  <Label>Restaurant Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="The Burger Joint"
                      className="pl-10"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Restaurant Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {RESTAURANT_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRestaurantType(type)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition",
                          restaurantType === type
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 h-12"
                    disabled={!restaurantName || !restaurantType}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold mb-2">What do you want to achieve?</h1>
              <p className="text-gray-600 mb-8">
                Select all that apply — you can always change this later
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {GOALS.map(goal => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition flex items-center gap-4",
                      goals.includes(goal.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium">{goal.label}</span>
                    {goals.includes(goal.id) && (
                      <Check className="w-5 h-5 text-orange-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 h-12"
                  onClick={handleStep3}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">
              {step === 1 && "Start Free Today"}
              {step === 2 && "Almost There!"}
              {step === 3 && "You're All Set!"}
            </h2>
            <p className="text-xl text-white/80 max-w-md">
              {step === 1 && "Join 2,000+ restaurants already using MenuTrail"}
              {step === 2 && "We'll customize everything for your restaurant"}
              {step === 3 && "Let's build your digital restaurant"}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}
