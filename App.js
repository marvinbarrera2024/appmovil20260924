import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import CategoryScreen from './src/components/CategoryScreen';
import LoginScreen from './src/components/LoginScreen';
import ProjectScreen from './src/components/ProjectScreen';
import TaskScreen from './src/components/TaskScreen';
import WelcomeScreen from './src/components/WelcomeScreen';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState('');

  const handleLogin = (newToken) => {
    setToken(newToken);
    setScreen('welcome');
  };

  const handleLogout = () => {
    setToken('');
    setScreen('login');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={setScreen} onLogout={handleLogout} />;
      case 'tasks':
        return <TaskScreen token={token} onBack={() => setScreen('welcome')} />;
      case 'projects':
        return <ProjectScreen token={token} onBack={() => setScreen('welcome')} />;
      case 'categories':
        return <CategoryScreen token={token} onBack={() => setScreen('welcome')} />;
      case 'login':
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
