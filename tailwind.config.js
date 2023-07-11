/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

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
				card: "679/1000",
				potrait: "9/16",
			},
			boxShadow: {
				card: "0 5px 5px var(--_color-card-shadow)",
				popup:
					"rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
				sideBar: "rgba(var(--_color-card-shadowRGB), 0.4) 5px 0 3px;",
			},
			fontSize: {
				md: ["1.0625rem", "1.625rem"],
			},
			width: {
				"9/20": "45%",
				"1/8": "12.5%",
				"1/7vw": "calc(100vw / 7)",
				"1/12vw": "calc(100vw / 12)",
				"1/2vw": "calc(100vw / 2)",
				"2/3vw": "calc(100vw / 3 * 2)",
			},
			height: {
				"1/9": "11.1111111111%",
				"1/15": "6.6666666667%",
				"1/15vh": "calc(100vh / 15)",
				"1/10vh": "calc(100vh / 10)",
				sideBar: "calc(100vh - 7rem)",
				sideBarContent: "calc(100vh - 7rem - 3rem)",
			},
			flexBasis: {
				"1/15": "6.6666666667%",
			},
			colors: {
				primary: "var(--_color-primary)",
				background: "var(--_color-background)",
				text: "var(--_color-text)",
				secondary: "var(--_color-secondary)",
				"card-bg": "var(--_color-card-background)",
				"card-shadow": "var(--_color-card-shadow)",
				gold: "#d4af37",
			},
			inset: {
				rarity: "calc(-50% + 2.5rem)",
				"1/24": "4.1666666667%",
				"1/24vw": "calc(100vw / 24)",
			},
			borderWidth: {
				1: "1px",
				3: "3px",
			},
			transitionProperty: {
				position: "top, left, right, bottom",
				"template-rows": "grid-template-rows",
				accordian: "height margin",
			},
			gridTemplateRows: {
				0: "0fr",
				1: "1fr",
			},
			data: {
				open: "state=open",
			},
			transitionDuration: {
				400: "400ms",
			},
			screens: {},
		},
		plugins: [],
	},
};
