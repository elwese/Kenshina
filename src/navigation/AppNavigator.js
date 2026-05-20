import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// Pantallas
import HomeScreen from '../screens/HomeScreen';
import CustomDrawer from './CustomDrawer';
import AccountMain from '../screens/AccountMain';
import CreacionMain from '../screens/CreacionMain'; 
import CreacionPersonaje from '../screens/CreacionPersonaje';
import HubMain from '../screens/HubMain';
import CreacionEquipo from '../screens/CreacionEquipo';
import WikiMain from '../screens/WikiMain';

// Placeholders


const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false, 
          drawerStyle: { width: '80%' },
          drawerType: 'front',
        }}
        initialRouteName="Home"
      >
        {/* --- PANTALLAS VISIBLES EN EL MENÚ --- */}
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="CreacionMain" component={CreacionMain} />
        <Drawer.Screen name="WikiMain" component={WikiMain} />
        <Drawer.Screen name="AccountMain" component={AccountMain} />

        {/* --- Pantallas ocultas del drawer pero navegables --- */}
        <Drawer.Screen name="CreacionPersonaje" component={CreacionPersonaje} />
        <Drawer.Screen name="CreacionEquipo" component={CreacionEquipo} />
        <Drawer.Screen name="HubMain" component={HubMain} />

      </Drawer.Navigator>
    </NavigationContainer>
  );
}