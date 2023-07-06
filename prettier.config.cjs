/** @type {import("prettier").Config} */
module.exports = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  plugins: [
    require.resolve('prettier-plugin-organize-imports'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
};
