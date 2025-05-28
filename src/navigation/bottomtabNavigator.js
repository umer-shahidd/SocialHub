// src/navigation/bottomtabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; 
import { Plus } from 'react-native-feather';

// Screens
import Home from '../screens/Home';
import Setting from '../screens/Setting';
import UserProfile from '../screens/UserProfile';
import CreatePost from '../screens/createPost';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 22; // Default icon size

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Setting') {
            iconName = focused ? 'cog' : 'cog'; 
          } else if (route.name === 'UserProfile') {
            iconName = focused ? 'user-alt' : 'user'; 
          }

          
          return iconName ? (
            <FontAwesome5 name={iconName} size={iconSize} color={color} solid={focused} />
          ) : null;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />

      {/* Center Tab Button for CreatePost */}
      <Tab.Screen
        name="CreatePost"
        component={CreatePost}
        options={{
          tabBarIcon: () => (
            <View style={styles.fab}>
              <Plus stroke="#fff" width={24} height={24} />
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.fabWrapper}>
              <View style={styles.fab}>
                <Plus stroke="#fff" width={24} height={24} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen name="UserProfile" component={UserProfile} />
      <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  fabWrapper: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});