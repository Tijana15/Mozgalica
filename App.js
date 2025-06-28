import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initDatabase } from "./src/utils/database";
import LoginScreen from "./src/screens/LoginScreen";
import RegistrationScreen from "./src/screens/RegistrationScreen";
import MathQuizScreen from "./src/screens/games/MathQuizScreen";
import MemoryMatchScreen from "./src/screens/games/MemoryMatchScreen";
import ResultsHistoryScreen from "./src/screens/games/ResultsHistoryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import GameDetailsScreen from "./src/screens/GameDetailsScreen";
import SudokuScreen from "./src/screens/games/SudokuScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
      } catch (e) {
        console.error("Aplikacija se ne može pokrenuti, greška baze:", e);
      }
    };

    initializeApp();
  }, []);

  if (!isDbInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#013a20" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Register"
          component={RegistrationScreen}
          options={{ title: "Registracija" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Mozzgalica",
            headerLeft: null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="GameDetails"
          component={GameDetailsScreen}
          options={{ title: "Detalji igre" }}
        />
        <Stack.Screen
          name="Sudoku"
          component={SudokuScreen}
          options={{ title: "Sudoku" }}
        />
        <Stack.Screen
          name="MathQuiz"
          component={MathQuizScreen}
          options={{ title: "Matematički kviz" }}
        />
        <Stack.Screen
          name="MemoryMatch"
          component={MemoryMatchScreen}
          options={{ title: "Memory Match" }}
        />
        <Stack.Screen
          name="ResultsHistory"
          component={ResultsHistoryScreen}
          options={{ title: "Istorija rezultata" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
