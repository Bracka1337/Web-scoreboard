import type { Config } from "tailwindcss";
import { PluginAPI } from 'tailwindcss/types/config'; // Import the type

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
      colors: {
        background: {
          DEFAULT: "#101010",
          primary: "#D9D9D9",
          secondary: "#919191",
        },
        primary: {
          DEFAULT: "#FFFFFF",
          black: "#000000",
          grey: "#D2D2D2",
        }
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: PluginAPI['addUtilities'] }) {
      addUtilities(
        {
          '.clip-trapezoid-bg': {
            clipPath: 'polygon(1.7% 0, 98.3% 0, 100% 100%, 0% 100%)',
          },
          '.clip-trapezoid-bg-inverted': {
            clipPath: 'polygon(0 0, 100% 0, 98.3% 100%, 1.7% 100%)',
          },
          '.clip-trapezoid-name-l': {
            clipPath: 'polygon(0 0, 65% 0, 100% 100%, 0% 100%)',
          },
          '.clip-trapezoid-name-r': {
            clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)',
          },
        },
        { variants: ['responsive', 'hover'] } as { variants?: string[] } & Partial<{
          respectPrefix: boolean;
          respectImportant: boolean;
        }>
      )
    },
  ],
} satisfies Config;
