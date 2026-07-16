import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Card, Button, Input, Select, Badge, Switch, Tooltip, Skeleton, getAccentClass, getRadiusClass, getSpacingClass, getFontClass } from "./UI";
import { Sliders, Copy, Check, Type, SquareDot, LayoutGrid, Heart } from "lucide-react";

export const DesignSystemVisualizer: React.FC = () => {
  const {
    theme,
    setTheme,
    radius,
    setRadius,
    spacing,
    setSpacing,
    fontFamily,
    setFontFamily,
    accentColor,
    setAccentColor,
    glassmorphism,
    setGlassmorphism
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [inputText, setInputText] = useState("Exshopi Platform Foundation");

  const radiusValues = ["none", "sm", "md", "lg", "full"];
  const spacingValues = ["compact", "comfortable", "spacious"];
  const fonts = ["sans", "mono", "serif"];
  const colors = ["indigo", "violet", "emerald", "amber", "rose", "slate"];

  // Helper to generate the copyable configuration
  const getTailwindCode = () => {
    return `<!-- Tailwind Config Tokens Applied -->
<div className="${getRadiusClass()} ${getFontClass()} p-6 bg-zinc-900 border border-zinc-800 shadow-xl">
  <button className="${getAccentClass("bg")} text-white ${getRadiusClass()} px-4 py-2 hover:opacity-90">
    Interactive Tokenized Button
  </button>
</div>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getTailwindCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Design Token Sidebar Editor */}
      <Card className="p-6 lg:col-span-1 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <span className={`p-1.5 rounded-lg ${getAccentClass("bg")} text-white`}>
            <Sliders className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Design System Customizer</h4>
            <p className="text-3xs text-zinc-500">Tune tokens and witness live updates across pages</p>
          </div>
        </div>

        {/* Theme select */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Theme Mode Selection</span>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`py-2 text-xs rounded-lg border font-medium capitalize cursor-pointer transition-colors ${
                  theme === t
                    ? `${getAccentClass("border")} ${getAccentClass("text")} bg-zinc-900`
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Accent select */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Active Accent Accent Color</span>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((c: any) => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className={`py-2 text-xs rounded-lg border font-medium capitalize cursor-pointer transition-colors ${
                  accentColor === c
                    ? "border-zinc-500 text-zinc-200 bg-zinc-900"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius select */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Radius border token</span>
          <div className="grid grid-cols-5 gap-1">
            {radiusValues.map((r: any) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`py-2 text-2xs rounded border font-mono font-medium capitalize cursor-pointer transition-colors ${
                  radius === r
                    ? "border-zinc-500 text-zinc-200 bg-zinc-900"
                    : "border-zinc-855 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing Layout Model select */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Spacing Density Scale</span>
          <div className="grid grid-cols-3 gap-2">
            {spacingValues.map((s: any) => (
              <button
                key={s}
                onClick={() => setSpacing(s)}
                className={`py-2 text-xs rounded-lg border font-medium capitalize cursor-pointer transition-colors ${
                  spacing === s
                    ? "border-zinc-500 text-zinc-200 bg-zinc-900"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Typography fonts select */}
        <div className="space-y-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block">Font Typography</span>
          <div className="grid grid-cols-3 gap-2">
            {fonts.map((f: any) => (
              <button
                key={f}
                onClick={() => setFontFamily(f)}
                className={`py-2 text-xs rounded-lg border font-medium capitalize cursor-pointer transition-colors ${
                  fontFamily === f
                    ? "border-zinc-500 text-zinc-200 bg-zinc-900"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Glassmorphism switch */}
        <div className="pt-2 border-t border-zinc-800">
          <Switch checked={glassmorphism} onChange={setGlassmorphism} label="Enable Glassmorphic Backdrop blur" />
        </div>
      </Card>

      {/* Interactive Playground Components Container */}
      <Card className="p-6 lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Atomic Component Sandbox Playground</h4>
            <p className="text-3xs text-zinc-500">Witness state updates instantly with no build cycles</p>
          </div>
          <Button variant="outline" size="sm" icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={handleCopyCode}>
            {copied ? "Copied Variables!" : "Copy CSS Classes"}
          </Button>
        </div>

        {/* Typography Sandbox Grid */}
        <div className="space-y-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 block">Typography Scaling</span>
          <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Display Heading 2XL</h1>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">Interactive Section Header</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              This is the default body scale. Exshopi AI maintains strict WCAG-compliant off-white readability values for enterprise applications.
            </p>
            <pre className="text-2xs font-mono text-zinc-500 bg-zinc-950 p-2 rounded">
              const scaleValue = "0.75rem"; // 12px Mono caption
            </pre>
          </div>
        </div>

        {/* Button Primitives Sandbox */}
        <div className="space-y-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 block">Button variants</span>
          <div className="flex flex-wrap gap-2.5 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Critical Danger</Button>
            <Button variant="glass">Glass Action</Button>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <Button variant="primary" loading>Awaiting response...</Button>
            <Button variant="outline" size="sm">Small size</Button>
            <Button variant="outline" size="md">Comfortable</Button>
            <Button variant="outline" size="lg">Spacious size</Button>
          </div>
        </div>

        {/* Input Elements */}
        <div className="space-y-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 block">Input Primitives</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Standard Text Input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Exshopi AI"
            />
            <Input
              label="Erroneous Text Input"
              value="Invalid format"
              error="SOC-2: This input token holds an unscoped parameter reference"
              onChange={() => {}}
            />
          </div>
        </div>

        {/* Selection toggles */}
        <div className="space-y-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 block">Toggle elements and badges</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl">
            <div className="space-y-2.5">
              <Switch checked={toggleChecked} onChange={setToggleChecked} label="Dynamic state control toggle" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Hover trigger:</span>
                <Tooltip content="Tooltip renders overlay beautifully on hover.">
                  <span className={`text-xs underline cursor-help ${getAccentClass("text")}`}>Interactive Tooltip</span>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="neutral">Neutral State</Badge>
              <Badge variant="accent">Accent Color</Badge>
              <Badge variant="success">Cleared Batch</Badge>
              <Badge variant="warning">Awaiting Audit</Badge>
              <Badge variant="error">Anomaly Threat</Badge>
              <Badge variant="info">Info Vector</Badge>
            </div>
          </div>
        </div>

        {/* Shimmer Shaders */}
        <div className="space-y-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 block">Skeletons and loaders</span>
          <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-3 w-1/3" />
                <Skeleton variant="text" className="h-2 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
