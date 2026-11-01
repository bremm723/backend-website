module.exports = {
  // src/data ikut di-scan karena tiap level menyimpan class gradient
  // (mis. "from-sky-400 to-rose-400") sebagai string di quizData.js.
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
    "./src/data/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
