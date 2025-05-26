import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const app = getApp();
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
};

export default App;
