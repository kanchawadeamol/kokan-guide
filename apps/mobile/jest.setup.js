// SafeAreaProvider waits for native inset measurements, which never arrive in Jest, so it
// would render nothing. Use the library's official mock (zero insets, renders children).
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
