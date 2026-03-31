/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            primary: "#8b5cf6", // Lavender 500
            secondary: "#2563eb", // Royal Blue 600
            accent: "#0ea5e9", // Sky Blue 500
            pink: "#ec4899", // Pink 500 for subtle accents
          },
          dark: {
            bg: "#020617", // Midnight Navy (Pure, deep contrast)
            surface: "#0f172a", // Slate 900
            border: "#1e293b", // Slate 800
            indigo: "#312e81", // Indigo 900 for section washes
          },
          light: {
            bg: "#f8fafc", // Slate 50
            surface: "#ffffff", // Pure White
            border: "#e2e8f0", // Slate 200
            lavender: "#f5f3ff", // Ultra-light Lavender wash
            blue: "#eff6ff", // Ultra-light Blue wash
          },
        }
      },
    },
    plugins: [
      function({ addUtilities }) {
        addUtilities({
          '.glass': {
            'backdrop-filter': 'blur(12px)',
            'background-color': 'rgba(255, 255, 255, 0.1)',
            'border': '1px solid rgba(255, 255, 255, 0.1)',
          },
          '.glass-dark': {
            'backdrop-filter': 'blur(12px)',
            'background-color': 'rgba(15, 23, 42, 0.7)',
            'border': '1px solid rgba(255, 255, 255, 0.05)',
          }
        })
      }
    ],
}