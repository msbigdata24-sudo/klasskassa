import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1E88E5",
        brandDark: "#0D47A1",
        brandLight: "#E3F2FD",
      },
    },
  },
  plugins: [],
};

export default config;
