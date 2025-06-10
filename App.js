import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initDatabase } from "./src/utils/database";
import LoginScreen from "./src/screens/LoginScreen";
import RegistrationScreen from "./src/screens/RegistrationScreen";
// Trebate kreirati HomeScreen komponentu
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#6200ee",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Prijava" }}
        />
        <Stack.Screen
          name="Register"
          component={RegistrationScreen}
          options={{ title: "Registracija" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Početna" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
