import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [routes, setRoutes] = useState("Home");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  setRoutes("Login");
                  return;
                }

            } catch (e) {
                console.log('Erro ao obter token:', e.message);
            }
        })();

        return () => { mounted = false; };
    }, [])
    
    console.log('Rota inicial:', routes);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={routes}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
