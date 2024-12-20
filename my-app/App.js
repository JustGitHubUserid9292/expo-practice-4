import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import HomeScreen from './screens/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CartScreen from './screens/CartScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
  <NavigationContainer>
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
  </Tab.Navigator>
  </NavigationContainer>
  );
}

