const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./global.css",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // --- Add this entire 'colors' object ---
      colors: {
        // Primary brand color
        primary: "#10B981", // Tailwind's "Emerald 500"

        // Light theme UI colors
        background: "#F8F8F9", // Off-white for a softer look
        card: "#FFFFFF",
        text: "#1F2937", // Dark gray, not pure black
        "subtle-text": "#6B7280", // Lighter gray for secondary text
        border: "#E5E7EB",

        // Dark theme UI colors (prefixed with 'dark-')
        "dark-background": "#0D0D0D", // A true dark, near-black for a premium feel
        "dark-card": "#171717", // A slightly lighter charcoal for depth and elevation
        "dark-text": "#EAEAEA", // Slightly off-white to reduce eye strain
        "dark-subtle-text": "#A1A1AA", // A softer gray for secondary text (Tailwind's Zinc 400)
        "dark-border": "#262626",

        // Attendance status colors (the pastels you wanted)
        present: "#D1FAE5", // Pastel Green
        absent: "#FEE2E2", // Pastel Red
        holiday: "#FEF3C7", // Pastel Yellow (using this for holiday)
        cancelled: "#FFEED9", // Pastel Orange (using this for cancelled)

        // Dark mode versions of status colors
        "dark-present": "#052e16",
        "dark-absent": "#450a0a",
        "dark-holiday": "#422006",
        "dark-cancelled": "#4f2b09",

        // Text colors for status badges to ensure readability
        "present-text": "#065F46",
        "absent-text": "#991B1B",
        "holiday-text": "#92400E",
        "cancelled-text": "#9a3412",

        "dark-present-text": "#a7f3d0",
        "dark-absent-text": "#fecaca",
        "dark-holiday-text": "#fde68a",
        "dark-cancelled-text": "#fed7aa",
      },
      // --- End of new 'colors' object ---

      borderWidth: {
        hairline: hairlineWidth(),
      },
      // You can add other theme extensions here if needed
    },
  },
  plugins: [],
};
