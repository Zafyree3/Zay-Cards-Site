/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        "card": "679/1000",
        "potrait": "9/16"
      },
      boxShadow: {
        "card": "0 5px 5px rgba(0,0,0,0.3)",
        "popup" : "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
      },
      fontSize: {
        "md": ["1.0625rem", "1.625rem"],
      }, 
      width: {
        "9/20": "45%",
        "1/7vw" : "calc(100vw / 7)",
      },
      height: {
        "1/9": "11.1111111111%",
        "1/15vh" : "calc(100vh / 16)",
      },
      colors: {
        "primary" : "var(--_color-primary)",
        "background" : "var(--_color-background)",
        "text" : "var(--_color-text)",
        "secondary" : "var(--_color-secondary)",
        "gold" : "#d4af37",
      },
      inset : {
        "rarity": "calc(-50% + 2.5rem)",
        "1/24" : "4.1666666667%",
      }
    },
  plugins: [],
  },
}

