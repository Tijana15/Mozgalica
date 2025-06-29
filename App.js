import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";

import { initDatabase } from "./src/utils/database";
import LoginScreen from "./src/screens/LoginScreen";
import RegistrationScreen from "./src/screens/RegistrationScreen";
import MathQuizScreen from "./src/screens/games/MathQuizScreen";
import MemoryMatchScreen from "./src/screens/games/MemoryMatchScreen";
import ResultsHistoryScreen from "./src/screens/games/ResultsHistoryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import GameDetailsScreen from "./src/screens/GameDetailsScreen";
import SudokuScreen from "./src/screens/games/SudokuScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import "./src/utils/i18n";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#013a20" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegistrationScreen}
          options={{ title: t("registerTitle") }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t("homeTitle"),
            headerLeft: null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="GameDetails"
          component={GameDetailsScreen}
          options={{ title: t("gameDetails") }}
        />
        <Stack.Screen
          name="Sudoku"
          component={SudokuScreen}
          options={{ title: t("sudoku") }}
        />
        <Stack.Screen
          name="MathQuiz"
          component={MathQuizScreen}
          options={{ title: t("mathQuiz") }}
        />
        <Stack.Screen
          name="MemoryMatch"
          component={MemoryMatchScreen}
          options={{ title: t("memoryMatch") }}
        />
        <Stack.Screen
          name="ResultsHistory"
          component={ResultsHistoryScreen}
          options={{ title: t("resultHistory") }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t("settingsTitle") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
      } catch (e) {
        Alert.alert(
          "Greška",
          "Aplikacija se ne može pokrenuti, greška baze:" + e
        );
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

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
