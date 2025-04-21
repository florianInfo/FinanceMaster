import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: false,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      /* custom classes go here */
    },
  },
  plugins: [],
}

export default config
