/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // iOS system-inspired greens (mint → deep)
        brand: {
          50: "#EAFBF1",
          100: "#D0F5DE",
          200: "#A5EBC0",
          300: "#6DDB9C",
          400: "#34C759", // iOS system green
          500: "#28A745",
          600: "#1F8A39",
          700: "#176E2D",
          800: "#115823",
          900: "#0C431B",
        },
        ink: {
          50: "#F7F8FA",
          100: "#F2F2F7", // iOS light bg
          200: "#E5E5EA", // iOS separator
          300: "#D1D1D6",
          400: "#C7C7CC",
          500: "#AEAEB2",
          600: "#8E8E93", // iOS secondary label
          700: "#636366",
          800: "#3A3A3C",
          900: "#1C1C1E", // iOS dark surface
          950: "#0B0B0F",
        },
      },
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "SF Pro Display",
          "-apple-system",
          "InterVariable",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter2: "-0.022em",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "ios-sm": "0 1px 2px rgba(16,24,40,0.04), 0 1px 1px rgba(16,24,40,0.03)",
        "ios":    "0 4px 16px -4px rgba(16,24,40,0.08), 0 2px 4px rgba(16,24,40,0.04)",
        "ios-lg": "0 20px 50px -15px rgba(16,24,40,0.18), 0 10px 20px -10px rgba(16,24,40,0.08)",
        "glow":   "0 10px 40px -12px rgba(52,199,89,0.45)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(1000px 500px at 85% -10%, #D0F5DE 0%, transparent 60%), radial-gradient(800px 400px at -10% 110%, #E3F0FF 0%, transparent 50%)",
        "mesh-dark":
          "radial-gradient(1000px 500px at 85% -10%, rgba(52,199,89,0.12) 0%, transparent 60%), radial-gradient(800px 400px at -10% 110%, rgba(52,125,235,0.10) 0%, transparent 50%)",
        "hero-green":
          "linear-gradient(135deg, #34C759 0%, #1F8A39 100%)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
