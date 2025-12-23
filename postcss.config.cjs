/** Minimal PostCSS config kept intentionally simple so TypeScript/ESLint skip type-project resolution. */
module.exports = {
  plugins: [
    "@tailwindcss/postcss",
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        autoprefixer: {
          flexbox: "no-2009",
        },
        features: {
          "custom-properties": false,
        },
        stage: 3,
      },
    ],
  ],
};
