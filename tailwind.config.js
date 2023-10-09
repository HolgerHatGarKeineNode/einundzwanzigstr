import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {

    presets: [
        require('./vendor/wireui/wireui/tailwind.config.js'),
    ],

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',

        './app/Livewire/**/*.php',
        './app/Traits/**/*.php',

        './resources/js/nostr/**/*.js',

        './vendor/wireui/wireui/resources/**/*.blade.php',
        './vendor/wireui/wireui/ts/**/*.ts',
        './vendor/wireui/wireui/src/View/**/*.php'
    ],

    theme: {
        extend: {
            screens: {
                'laptop': '1440px',
            },
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
        forms
    ],

};
