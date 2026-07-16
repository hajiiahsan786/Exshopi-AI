import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store/useStore";
import { Loader2, Check, AlertCircle } from "lucide-react";

// Accent style helpers
export function getAccentClass(variant: "bg" | "text" | "border" | "ring", hover = false) {
  const color = useStore.getState().accentColor;
  const colors: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    indigo: {
      bg: hover ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600",
      text: "text-indigo-400",
      border: "border-indigo-500/20",
      ring: "focus:ring-indigo-500"
    },
    violet: {
      bg: hover ? "bg-violet-600 hover:bg-violet-500" : "bg-violet-600",
      text: "text-violet-400",
      border: "border-violet-500/20",
      ring: "focus:ring-violet-500"
    },
    emerald: {
      bg: hover ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-600",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      ring: "focus:ring-emerald-500"
    },
    amber: {
      bg: hover ? "bg-amber-600 hover:bg-amber-500" : "bg-amber-600",
      text: "text-amber-400",
      border: "border-amber-500/20",
      ring: "focus:ring-amber-500"
    },
    rose: {
      bg: hover ? "bg-rose-600 hover:bg-rose-500" : "bg-rose-600",
      text: "text-rose-400",
      border: "border-rose-500/20",
      ring: "focus:ring-rose-500"
    },
    slate: {
      bg: hover ? "bg-zinc-700 hover:bg-zinc-600" : "bg-zinc-700",
      text: "text-zinc-400",
      border: "border-zinc-500/20",
      ring: "focus:ring-zinc-500"
    }
  };
  return colors[color]?.[variant] || colors.indigo[variant];
}

export function getRadiusClass() {
  const radius = useStore((state) => state.radius);
  const mappings = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-xl",
    full: "rounded-3xl"
  };
  return mappings[radius] || "rounded-xl";
}

export function getSpacingClass() {
  const spacing = useStore((state) => state.spacing);
  const mappings = {
    compact: "py-1.5 px-3 text-xs gap-1.5",
    comfortable: "py-2.5 px-5 text-sm gap-2",
    spacious: "py-3.5 px-7 text-base gap-3"
  };
  return mappings[spacing] || "py-2.5 px-5 text-sm gap-2";
}

export function getFontClass() {
  const font = useStore((state) => state.fontFamily);
  const mappings = {
    sans: "font-sans",
    mono: "font-mono",
    serif: "font-serif"
  };
  return mappings[font] || "font-sans";
}

// 1. Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className = "",
  ...props
}) => {
  const radius = getRadiusClass();
  const font = getFontClass();
  
  let sizeClass = "py-2 px-4 text-sm gap-2";
  if (size === "sm") sizeClass = "py-1.5 px-3 text-xs gap-1.5";
  if (size === "lg") sizeClass = "py-3 px-6 text-base gap-2.5";

  let variantClass = "";
  if (variant === "primary") {
    variantClass = `${getAccentClass("bg", true)} text-white shadow-lg shadow-indigo-500/10`;
  } else if (variant === "secondary") {
    variantClass = "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50";
  } else if (variant === "outline") {
    variantClass = "bg-transparent border border-zinc-700 hover:bg-zinc-800 text-zinc-300";
  } else if (variant === "ghost") {
    variantClass = "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200";
  } else if (variant === "danger") {
    variantClass = "bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-900/30";
  } else if (variant === "glass") {
    variantClass = "bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60 text-zinc-200 border border-zinc-700/40";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 ${getAccentClass("ring")} disabled:opacity-50 disabled:pointer-events-none ${radius} ${font} ${sizeClass} ${variantClass} ${className}`}
      disabled={loading || props.disabled}
      {...(props as any)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </motion.button>
  );
};

// 2. Card Component
interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  glass = true
}) => {
  const radius = getRadiusClass();
  const glassmorphismEnabled = useStore((state) => state.glassmorphism);

  const baseStyle = "border bg-zinc-900/80 border-zinc-800/80 shadow-md";
  const glassStyle = glassmorphismEnabled && glass
    ? "bg-zinc-900/30 backdrop-blur-md border-zinc-800/60 shadow-xl"
    : "bg-zinc-900 border-zinc-800";

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={`${baseStyle} ${glassStyle} ${radius} overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 3. Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  suffix,
  className = "",
  ...props
}) => {
  const radius = getRadiusClass();
  const font = getFontClass();

  return (
    <div className={`w-full flex flex-col gap-1.5 ${font}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm py-2.5 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800 transition-all ${
            icon ? "pl-10" : "pl-4"
          } ${suffix ? "pr-10" : "pr-4"} ${radius} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 text-zinc-500">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </div>
  );
};

// 4. Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  const radius = getRadiusClass();
  const font = getFontClass();

  return (
    <div className={`w-full flex flex-col gap-1.5 ${font}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm p-4 min-h-[100px] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800 transition-all ${radius} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </div>
  );
};

// 5. Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  ...props
}) => {
  const radius = getRadiusClass();
  const font = getFontClass();

  return (
    <div className={`w-full flex flex-col gap-1.5 ${font}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm p-2.5 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800 transition-all ${radius} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-200">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </div>
  );
};

// 6. Badge Component
interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "accent" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = ""
}) => {
  const font = getFontClass();
  
  let colorClass = "";
  if (variant === "success") {
    colorClass = "bg-emerald-950/40 text-emerald-300 border-emerald-900/30";
  } else if (variant === "warning") {
    colorClass = "bg-amber-950/40 text-amber-300 border-amber-900/30";
  } else if (variant === "error") {
    colorClass = "bg-rose-950/40 text-rose-300 border-rose-900/30";
  } else if (variant === "info") {
    colorClass = "bg-blue-950/40 text-blue-300 border-blue-900/30";
  } else if (variant === "accent") {
    colorClass = `bg-indigo-950/40 ${getAccentClass("text")} border-indigo-900/30`;
  } else if (variant === "neutral") {
    colorClass = "bg-zinc-900/80 text-zinc-400 border-zinc-800";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-2xs font-medium uppercase tracking-wider border rounded ${font} ${colorClass} ${className}`}>
      {children}
    </span>
  );
};

// 7. Switch Component
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 select-none">
      {label && <span className="text-sm font-medium text-zinc-300">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 bg-zinc-800 border border-zinc-700 rounded-full transition-colors ${checked ? "bg-indigo-600 border-indigo-500" : ""}`} />
        <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
    </label>
  );
};

// 8. Tooltip Component
interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top"
}) => {
  const [visible, setVisible] = React.useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 pointer-events-none bg-zinc-950 border border-zinc-800 text-zinc-300 text-2xs px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap ${positions[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 9. Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect"
}) => {
  let roundedClass = "rounded";
  if (variant === "text") roundedClass = "rounded h-3 w-3/4";
  if (variant === "circle") roundedClass = "rounded-full";

  return (
    <div
      className={`animate-pulse bg-zinc-850/80 border border-zinc-800/10 ${roundedClass} ${className}`}
    />
  );
};

// 10. Dialog / Modal Wrapper
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  const radius = getRadiusClass();
  const font = getFontClass();
  const glassmorphismEnabled = useStore((state) => state.glassmorphism);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${font}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full ${sizes[size]} border border-zinc-800/80 shadow-2xl overflow-hidden bg-zinc-900/95 ${
              glassmorphismEnabled ? "backdrop-blur-md bg-zinc-900/85" : "bg-zinc-900"
            } ${radius}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 p-4">
              <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded p-1 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
