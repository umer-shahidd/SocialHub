// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

import { Provider } from 'react-redux';
import store from './src/store'; // Redux store'  
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  /* 🔐  keep listening for auth changes */
  useEffect(() => {
    const app  = getApp();
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, usr => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;          // cleanup on unmount
  }, [initializing]);

  if (initializing) return null; // optional splash / loader

  return (
    <Provider store={store}>     {/* ← Redux available everywhere */}
      <NavigationContainer>
        <AppNavigator user={user} />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
