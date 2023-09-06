import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',

        './vendor/robsontenorio/mary/src/View/Components/**/*.php',

        './resources/js/nostr/**/*.js',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inconsolata',
                    ...defaultTheme.fontFamily.sans
                ],
                mono: [
                    'Inconsolata',
                    ...defaultTheme.fontFamily.mono
                ],
            },
        },
    },

    plugins: [
        require('daisyui'),
        forms
    ],

    daisyui: {
        themes: [{
            dark: {
                ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
                "--b1": "#1e1e1e",
                "primary": "amber",
                "primary-focus": "mediumamber",
            }
        }], // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
        darkTheme: "dark", // name of one of the included themes for dark mode
        base: true, // applies background color and foreground color for root element by default
        styled: true, // include daisyUI colors and design decisions for all components
        utils: true, // adds responsive and modifier utility classes
        rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
        prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
        logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
    },
};
