"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MenuTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  borderRadius: "none" | "sm" | "md" | "lg" | "xl"
  fontFamily: "default" | "serif" | "mono"
}

interface ThemeEditorProps {
  theme: MenuTheme
  onChange: (theme: MenuTheme) => void
}

const PRESET_COLORS = [
  { name: "Orange", primary: "#f97316", accent: "#ef4444" },
  { name: "Blue", primary: "#3b82f6", accent: "#6366f1" },
  { name: "Green", primary: "#22c55e", accent: "#10b981" },
  { name: "Purple", primary: "#a855f7", accent: "#ec4899" },
  { name: "Rose", primary: "#f43f5e", accent: "#fb7185" },
  { name: "Teal", primary: "#14b8a6", accent: "#06b6d4" },
]

const BACKGROUND_PRESETS = [
  { name: "White", color: "#ffffff" },
  { name: "Cream", color: "#fefce8" },
  { name: "Light Gray", color: "#f9fafb" },
  { name: "Dark", color: "#111827" },
  { name: "Navy", color: "#1e3a5f" },
]

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Color Preset</Label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...theme, primaryColor: preset.primary, accentColor: preset.accent })}
              className={cn(
                "p-3 rounded-lg border-2 transition text-left",
                theme.primaryColor === preset.primary
                  ? "border-gray-900"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex gap-1 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
              </div>
              <p className="text-xs font-medium">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Custom Colors</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">{theme.primaryColor}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-gray-500">{theme.accentColor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Background</Label>
        <div className="flex flex-wrap gap-2">
          {BACKGROUND_PRESETS.map((bg) => (
            <button
              key={bg.name}
              onClick={() => onChange({ 
                ...theme, 
                backgroundColor: bg.color,
                textColor: bg.color === "#111827" || bg.color === "#1e3a5f" ? "#ffffff" : "#111827"
              })}
              className={cn(
                "w-10 h-10 rounded-lg border-2 transition",
                theme.backgroundColor === bg.color
                  ? "border-gray-900 ring-2 ring-offset-2 ring-gray-400"
                  : "border-gray-200"
              )}
              style={{ backgroundColor: bg.color }}
              title={bg.name}
            />
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Corner Style</Label>
        <div className="grid grid-cols-5 gap-2">
          {(["none", "sm", "md", "lg", "xl"] as const).map((radius) => (
            <button
              key={radius}
              onClick={() => onChange({ ...theme, borderRadius: radius })}
              className={cn(
                "p-3 border-2 transition",
                radius === "none" && "rounded-none",
                radius === "sm" && "rounded-sm",
                radius === "md" && "rounded-md",
                radius === "lg" && "rounded-lg",
                radius === "xl" && "rounded-xl",
                theme.borderRadius === radius
                  ? "border-gray-900 bg-gray-100"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div 
                className={cn(
                  "w-full aspect-square bg-gray-300",
                  radius === "none" && "rounded-none",
                  radius === "sm" && "rounded-sm",
                  radius === "md" && "rounded-md",
                  radius === "lg" && "rounded-lg",
                  radius === "xl" && "rounded-xl",
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {theme.borderRadius === "none" ? "Sharp" : theme.borderRadius.toUpperCase()}
        </p>
      </div>

      {/* Font Family */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Font Style</Label>
        <div className="space-y-2">
          {([
            { id: "default", name: "Modern Sans", sample: "Aa Bb Cc", className: "font-sans" },
            { id: "serif", name: "Classic Serif", sample: "Aa Bb Cc", className: "font-serif" },
            { id: "mono", name: "Monospace", sample: "Aa Bb Cc", className: "font-mono" },
          ] as const).map((font) => (
            <button
              key={font.id}
              onClick={() => onChange({ ...theme, fontFamily: font.id })}
              className={cn(
                "w-full p-3 rounded-lg border-2 text-left transition flex items-center gap-3",
                theme.fontFamily === font.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className={cn("text-2xl", font.className)}>{font.sample}</span>
              <span className="text-sm">{font.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
