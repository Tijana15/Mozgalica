import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";

const HomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { username } = route.params || {};

  const games = [
    {
      id: "sudoku",
      titleKey: "sudoku",
      descriptionKey: "sudokuDescription",
      icon: "🔢",
      color: "#bacc81",
    },
    {
      id: "mathquiz",
      titleKey: "mathQuiz",
      descriptionKey: "mathQuizDescription",
      icon: "🧮",
      color: "#478c5c",
    },
    {
      id: "memorymatch",
      titleKey: "memoryMatch",
      descriptionKey: "memoryMatchDescription",
      icon: "🧠",
      color: "#013a20",
    },
  ];

  const handleGamePress = (game) => {
    navigation.navigate("GameDetails", {
      gameId: game.id,
      gameTitle: t(game.titleKey),
      username: username,
    });
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleResultsHistory = () => {
    navigation.navigate("ResultsHistory", { username });
  };

  const handleSettings = () => {
    navigation.navigate("Settings", { username });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          {t("welcome")}, {username}!
        </Text>
        <Text style={styles.subtitle}>{t("favoriteExcersize")}</Text>
      </View>

      <View style={styles.gamesContainer}>
        {games.map((game, index) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { backgroundColor: game.color }]}
            onPress={() => handleGamePress(game)}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={styles.gameTitle}>{t(game.titleKey)}</Text>
            <Text style={styles.gameDescription}>{t(game.descriptionKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleResultsHistory}
        >
          <Text style={styles.buttonText}>📊 {t("resultHistory")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <Text style={styles.buttonText}>⚙️ {t("settingsTitle")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>🚪 {t("signOut")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  gamesContainer: {
    paddingHorizontal: 20,
  },
  gameCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  historyButton: {
    backgroundColor: "#bbafe0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsButton: {
    backgroundColor: "#9c88cc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: "#bacc81",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
