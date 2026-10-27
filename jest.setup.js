jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const Picker = ({ children }) => React.createElement(View, null, children);
  Picker.Item = ({ label }) => React.createElement(Text, null, label);

  return { Picker };
});