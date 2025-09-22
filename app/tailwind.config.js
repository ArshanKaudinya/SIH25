/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Include your app directory if using Expo Router
    // Add other paths where you use Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require('nativewind/preset')], // Add NativeWind preset
};