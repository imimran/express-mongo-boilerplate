module.exports = {
  env: {
    jest: true,
  },
  parser: "babel-eslint",
  extends: ["airbnb-base", "prettier"],
  rules: {
    quotes: [2, "double", { avoidEscape: true }],
    "comma-dangle": 0,
    "no-underscore-dangle": 0,
    "no-param-reassign": 0,
    "no-return-assign": 0,
    "no-shadow": 0,
    "no-plusplus": 0,
    "no-await-in-loop": 0,
    "no-dupe-keys": 0,
    "prefer-const": 0,
    "no-unused-vars": 0,
    "global-require": 0,
    "no-continue": 0,
    "no-restricted-syntax": 0,
    "max-classes-per-file": 0,
    "no-useless-escape": 0,
    "no-console": 0,
    camelcase: 0,
  },
};
