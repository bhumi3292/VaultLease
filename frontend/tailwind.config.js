// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceSlow: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(10px)' },
                },
                textGlow: {
                    '0%, 100%': { 'text-shadow': '0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(0,43,91,0.3)' }, /* Subtle initial white glow, and blue glow */
                    '50%': { 'text-shadow': '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(0,43,91,0.6)' }, /* Brighter white glow, and more prominent blue glow */
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                // Make sure these delay animations are defined correctly for staggering
                'fade-in-up-delay-200': 'fadeInUp 0.8s ease-out 0.2s forwards',
                'fade-in-up-delay-400': 'fadeInUp 0.8s ease-out 0.4s forwards',
                'fade-in-up-delay-600': 'fadeInUp 0.8s ease-out 0.6s forwards',
                'bounce-slow': 'bounceSlow 2s infinite',
                'text-glow-subtle': 'textGlow 2s infinite ease-in-out',
            }
        },
    },
    plugins: [],
}