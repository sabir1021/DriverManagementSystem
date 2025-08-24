// Add this useEffect to create the portal div
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Create portal div for date picker if it doesn't exist
      if (!document.getElementById('date-picker-portal')) {
        const portalDiv = document.createElement('div');
        portalDiv.id = 'date-picker-portal';
        document.body.appendChild(portalDiv);
      }
    }
  }, []);
  
  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;


