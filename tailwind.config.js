import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        './resources/**/*.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
                display: ['Baloo 2', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                ink: '#070707',
                panel: '#111111',
                line: '#2d2d2d',
                mist: '#fff8e7',
                brand: {
                    mint: '#25f2a0',
                    cyan: '#29cfff',
                    violet: '#a34dff',
                    gold: '#ffd327',
                    coral: '#ff7a59',
                    cream: '#fff3dc',
                    pink: '#ff66d6',
                },
            },
            boxShadow: {
                glow: '0 0 0 1px rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.35)',
                card: '0 14px 40px rgba(12, 14, 24, 0.14)',
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
};
