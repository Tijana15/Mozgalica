import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";

const GameDetailsScreen = ({ navigation, route }) => {
  const { gameId, gameTitle, username } = route.params;

  const gameDetails = {
    sudoku: {
      title: "Sudoku",
      icon: "🔢",
      description:
        "Sudoku je logička igra popunjavanja brojeva. Cilj je da popunite 9x9 mrežu brojevima od 1 do 9, tako da se svaki broj pojavi tačno jednom u svakom redu, koloni i 3x3 kvadratu.",
      rules: [
        "Popunite sve prazne ćelije brojevima 1-9",
        "Svaki broj se može pojaviti samo jednom u redu",
        "Svaki broj se može pojaviti samo jednom u koloni",
        "Svaki broj se može pojaviti samo jednom u 3x3 kvadratu",
      ],
      scoring:
        "Bodovi se dodjeljuju na osnovu brzine rješavanja i broja grešaka. Maksimalno 1000 bodova.",
      youtubeUrl: "https://www.youtube.com/watch?v=8zRXDsGydeQ",
      color: "#bacc81",
    },
    mathquiz: {
      title: "Matematički kviz",
      icon: "🧮",
      description:
        "Testiranje matematičkih znanja kroz različite tipove zadataka. Odgovorite na što više pitanja u ograničenom vremenu.",
      rules: [
        "Odgovorite na matematička pitanja",
        "Imate ograničeno vreme za svako pitanje",
        "Odgovorite tačno da biste osvojili bodove",
        "Pogrešan odgovor ne oduzima bodove",
      ],
      scoring:
        "Svaki tačan odgovor donosi 10 bodova. Bonus bodovi za brzinu odgovora.",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      color: "#478c5c",
    },
    memorymatch: {
      title: "Memory Match",
      icon: "🧠",
      description:
        "Igra memorije gde trebate da pronađete parove identičnih kartica. Testirajte svoju memoriju i koncentraciju.",
      rules: [
        "Okrenite kartice da vidite šta se krije ispod",
        "Pronađite parove identičnih kartica",
        "Kartice ostaju okrenute kad nađete par",
        "Cilj je da pronađete sve parove",
      ],
      scoring:
        "Bodovi se dodeljuju na osnovu broja poteza i vremena. Manje poteza = više bodova.",
      youtubeUrl: "https://www.youtube.com/watch?v=oFfYmrGeTPs",
      color: "#013a20",
    },
  };

  const currentGame = gameDetails[gameId];

  const handleOpenYouTube = () => {
    Alert.alert(
      "Otvaranje YouTube-a",
      "Da li želite da otvorite YouTube video?",
      [
        { text: "Ne", style: "cancel" },
        {
          text: "Da",
          onPress: () => Linking.openURL(currentGame.youtubeUrl),
        },
      ]
    );
  };

  const handleStartGame = () => {
    const screenName =
      gameId === "sudoku"
        ? "Sudoku"
        : gameId === "mathquiz"
        ? "MathQuiz"
        : "MemoryMatch";
    navigation.navigate(screenName, { username });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: currentGame.color }]}>
        <Text style={styles.icon}>{currentGame.icon}</Text>
        <Text style={styles.title}>{currentGame.title}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis igre</Text>
          <Text style={styles.description}>{currentGame.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pravila igre</Text>
          {currentGame.rules.map((rule, index) => (
            <Text key={index} style={styles.rule}>
              • {rule}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bodovanje</Text>
          <Text style={styles.scoring}>{currentGame.scoring}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.youtubeButton}
            onPress={handleOpenYouTube}
          >
            <Text style={styles.buttonText}>📺 Pogledaj YouTube video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: currentGame.color }]}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>🎮 Započni igru</Text>
          </TouchableOpacity>
        </View>
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
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  icon: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  rule: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    lineHeight: 22,
  },
  scoring: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
  youtubeButton: {
    backgroundColor: "#cdd193",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GameDetailsScreen;
