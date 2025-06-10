import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

const HomeScreen = ({ navigation, route }) => {
  const { username } = route.params || {};

  const games = [
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Logička igra popunjavanja brojeva",
      icon: "🔢",
      color: "#FF6B6B",
    },
    {
      id: "mathquiz",
      title: "Matematički kviz",
      description: "Testiranje matematičkih znanja",
      icon: "🧮",
      color: "#4ECDC4",
    },
    {
      id: "memorymatch",
      title: "Memory Match",
      description: "Igra memorije i koncentracije",
      icon: "🧠",
      color: "#45B7D1",
    },
  ];

  const handleGamePress = (game) => {
    navigation.navigate("GameDetails", {
      gameId: game.id,
      gameTitle: game.title,
      username: username,
    });
  };

  const handleLogout = () => {
    Alert.alert("Odjava", "Da li ste sigurni da se želite odjaviti?", [
      { text: "Ne", style: "cancel" },
      {
        text: "Da",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const handleResultsHistory = () => {
    navigation.navigate("ResultsHistory", { username });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Dobrodošli, {username}!</Text>
        <Text style={styles.subtitle}>
          Izaberite igru koju želite da igrate
        </Text>
      </View>

      <View style={styles.gamesContainer}>
        {games.map((game, index) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { backgroundColor: game.color }]}
            onPress={() => handleGamePress(game)}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleResultsHistory}
        >
          <Text style={styles.buttonText}>📊 Istorija rezultata</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>🚪 Odjavi se</Text>
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
    backgroundColor: "#6200ee",
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
    backgroundColor: "#d32f2f",
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
