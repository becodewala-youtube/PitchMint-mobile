module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-vector-icons)?|@react-native-vector-icons)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-nitro-.*|nitro-core)',
  ],
  setupFilesAfterEnv: [],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  testTimeout: 15000,
};
