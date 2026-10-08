/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF5',
          black: '#121212',
          yellow: '#FFDE59',
          yellowDark: '#E5C438',
          pink: '#FF6584',
          cyan: '#38D9A9',
          blue: '#4DABF7',
          orange: '#FF922B',
          purple: '#9775FA',
          lime: '#A9E34B',
          gray: '#E9ECEF',
          muted: '#868E96'
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px #121212',
        'neo-sm': '2px 2px 0px #121212',
        'neo-lg': '6px 6px 0px #121212',
        'neo-xl': '8px 8px 0px #121212',
        'neo-hover': '1px 1px 0px #121212',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      fontFamily: {
        display: ['Impact', 'Trebuchet MS', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        comic: ['"Bangers"', '"Comic Sans MS"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
