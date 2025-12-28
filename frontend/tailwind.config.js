// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1F4E79', // VaultLease Navy
                    hover: '#163a5c',
                    light: '#F0F4F8',
                },
                secondary: {
                    DEFAULT: '#F0F4F8', // VaultLease Secondary (Light)
                    hover: '#dbeafe', // Slightly darker for hover if used as btn (though implies light text)
                    brand: '#06B6D4', // Keeping Cyan as an 'accent' or 'brand' color if 'secondary' was critical for buttons
                },
                navy: {
                    900: '#1F4E79'
                },
                background: {
                    DEFAULT: '#F0F4F8', // VaultLease Secondary used as background
                    paper: '#FFFFFF',
                    dark: '#1e293b',
                },
                text: {
                    main: '#1F4E79', // Using primary for main text
                    muted: '#64748b',
                    inverted: '#FFFFFF',
                },
                state: {
                    error: '#ef4444',
                    success: '#10b981',
                    warning: '#f59e0b',
                    info: '#3b82f6',
                },
            },
            fontFamily: {
                heading: ['Poppins', 'Montserrat', 'sans-serif'],
                body: ['Roboto', 'Open Sans', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'soft-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'card': '0 2px 12px rgba(0,0,0,0.08)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}