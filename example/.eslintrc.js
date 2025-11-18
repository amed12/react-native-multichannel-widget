module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react-native/no-unused-styles': 'warn',
  },
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      extends: ['@react-native'],
    },
  ],
};
