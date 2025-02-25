/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Poppins", "sans-serif"],
    },
    extend: {
      //colors used in the project
      colors: {
        primary: "#00BCD4",
        secondary: "#EF863E",
      },
      backgroundImage:{
        'login-bg-img': "url('/src/assets/images/Login_background.jpg')",
        'signUp-bg-img': "url('/src/assets/images/SignUp_background.jpg')"
      }
    },
  },
  plugins: [],
}

