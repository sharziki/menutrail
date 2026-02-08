"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Truck,
  Upload,
  Palette,
  Link2,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Stripe", icon: CreditCard, desc: "Accept payments" },
  { id: 2, title: "Delivery", icon: Truck, desc: "DoorDash setup" },
  { id: 3, title: "Menu", icon: Upload, desc: "Add your items" },
  { id: 4, title: "Branding", icon: Palette, desc: "Customize look" },
  { id: 5, title: "Launch", icon: Link2, desc: "Go live!" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Stripe Keys
  const [stripePublishableKey, setStripePublishableKey] = useState("")
  const [stripeSecretKey, setStripeSecretKey] = useState("")
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("")

  // DoorDash Keys
  const [doordashDeveloperId, setDoordashDeveloperId] = useState("")
  const [doordashKeyId, setDoordashKeyId] = useState("")
  const [doordashSigningSecret, setDoordashSigningSecret] = useState("")
  const [skipDelivery, setSkipDelivery] = useState(false)

  // Branding
  const [primaryColor, setPrimaryColor] = useState("#f97316")
  const [logo, _setLogo] = useState("")
  void _setLogo // TODO: Implement logo upload

  // Restaurant slug (for demo)
  const restaurantSlug = "demo-restaurant"

  const nextStep = () => {
    if (step < STEPS.length) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    // TODO: Save all settings via API
    // await fetch('/api/restaurants/settings', { ... })
    
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-xl">MenuTrail</span>
          </div>
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            Skip for now
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.id} className="flex items-center">
                  <div 
                    className={cn(
                      "flex flex-col items-center",
                      step >= s.id ? "text-orange-600" : "text-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      step > s.id && "bg-green-500 text-white",
                      step === s.id && "bg-orange-500 text-white ring-4 ring-orange-100",
                      step < s.id && "bg-gray-200 text-gray-500"
                    )}>
                      {step > s.id ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-medium mt-2 hidden sm:block">{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "w-full h-1 mx-2 rounded hidden sm:block",
                      step > s.id ? "bg-green-500" : "bg-gray-200"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Stripe */}
          {step === 1 && (
            <motion.div
              key="stripe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Connect Stripe</h2>
                  <p className="text-gray-600">Accept credit card payments</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Don&apos;t have Stripe?</strong>{" "}
                  <a 
                    href="https://dashboard.stripe.com/register" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Create a free account
                  </a>
                  {" "} — takes 2 minutes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Publishable Key</Label>
                  <Input
                    placeholder="pk_live_..."
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in{" "}
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-600">
                      Stripe Dashboard → API Keys
                    </a>
                  </p>
                </div>

                <div>
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    placeholder="sk_live_..."
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Webhook Secret (Optional)</Label>
                  <Input
                    type="password"
                    placeholder="whsec_..."
                    value={stripeWebhookSecret}
                    onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set up webhooks at: <code className="bg-gray-100 px-1 rounded">https://yourdomain.com/api/webhooks/stripe</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => nextStep()}>
                  Skip for now
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={nextStep}
                  disabled={!stripePublishableKey || !stripeSecretKey}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: DoorDash */}
          {step === 2 && (
            <motion.div
              key="doordash"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Truck className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Connect DoorDash Drive</h2>
                  <p className="text-gray-600">Enable delivery for your orders</p>
                </div>
              </div>

              {!skipDelivery ? (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-800 text-sm">
                      <strong>Don&apos;t have DoorDash Drive?</strong>{" "}
                      <a 
                        href="https://developer.doordash.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Sign up here
                      </a>
                      {" "} — it&apos;s free to get started.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Developer ID</Label>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={doordashDeveloperId}
                        onChange={(e) => setDoordashDeveloperId(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Key ID</Label>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={doordashKeyId}
                        onChange={(e) => setDoordashKeyId(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Signing Secret</Label>
                      <Input
                        type="password"
                        placeholder="Your signing secret"
                        value={doordashSigningSecret}
                        onChange={(e) => setDoordashSigningSecret(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="text-sm text-gray-500 hover:text-gray-700 mt-4"
                    onClick={() => setSkipDelivery(true)}
                  >
                    I don&apos;t want to offer delivery right now
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No problem! You can enable delivery anytime from Settings.
                  </p>
                  <Button variant="link" onClick={() => setSkipDelivery(false)}>
                    Actually, I want to set it up now
                  </Button>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={nextStep}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Menu */}
          {step === 3 && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Add Your Menu</h2>
                  <p className="text-gray-600">Import or create your menu items</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition text-center">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Upload CSV</p>
                  <p className="text-sm text-gray-500">Import from spreadsheet</p>
                </button>

                <button 
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition text-center"
                  onClick={nextStep}
                >
                  <Palette className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Use Menu Builder</p>
                  <p className="text-sm text-gray-500">Create from scratch</p>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-medium mb-4">Or start with a template</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {["🍔 Burger Shop", "🍕 Pizzeria", "🍜 Asian Fusion"].map(template => (
                    <button
                      key={template}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 transition text-left"
                    >
                      <span className="text-2xl mb-2 block">{template.split(" ")[0]}</span>
                      <span className="text-sm font-medium">{template.split(" ").slice(1).join(" ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={nextStep}
                >
                  I&apos;ll add items later
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Branding */}
          {step === 4 && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Customize Your Brand</h2>
                  <p className="text-gray-600">Make MenuTrail look like yours</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Upload Logo</Button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}>
                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    Preview: This is how your accent color will look
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={nextStep}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Launch */}
          {step === 5 && (
            <motion.div
              key="launch"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold mb-2">You&apos;re All Set! 🎉</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your restaurant is ready to accept orders. Share your menu link with customers.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center gap-3 max-w-md mx-auto">
                <Input
                  readOnly
                  value={`menutrail.com/menu/${restaurantSlug}`}
                  className="bg-white"
                />
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(`https://menutrail.com/menu/${restaurantSlug}`)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/menu/${restaurantSlug}`} target="_blank">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-gray-600">Menu Items</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{stripeSecretKey ? "✓" : "✗"}</p>
                  <p className="text-sm text-gray-600">Payments</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{doordashDeveloperId ? "✓" : "✗"}</p>
                  <p className="text-sm text-gray-600">Delivery</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-600 px-8"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
