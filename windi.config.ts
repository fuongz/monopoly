import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

export default defineConfig({
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: '"Inter",system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif',
      },
      colors: {
        primary: colors.pink,
        gray: colors.trueGray,
      },
    },
  },
})
