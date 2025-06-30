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
import { useTranslation } from "react-i18next";

const GameDetailsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { gameId, gameTitle, username } = route.params;

  const gameDetails = {
    sudoku: {
      titleKey: "sudoku",
      icon: "🔢",
      descriptionKey: "sudokuDescriptionGame",
      rulesKeys: [
        "sudokuRules1",
        "sudokuRules2",
        "sudokuRules3",
        "sudokuRules4",
      ],
      scoringKey: "scoringRuleSudoku",
      youtubeUrl: "https://www.youtube.com/watch?v=8zRXDsGydeQ",
      color: "#bacc81",
    },
    mathquiz: {
      titleKey: "mathQuiz",
      icon: "🧮",
      descriptionKey: "mathQuizDescriptionGame",
      rulesKeys: [
        "mathQuizRules1",
        "mathQuizRules2",
        "mathQuizRules3",
        "mathQuizRules4",
      ],
      scoringKey: "scoringRuleMathQuiz",
      color: "#478c5c",
    },
    memorymatch: {
      titleKey: "memoryMatch",
      icon: "🧠",
      descriptionKey: "memoryMatchDescriptionGame",
      rulesKeys: [
        "memoryMatchGameRules1",
        "memoryMatchGameRules2",
        "memoryMatchGameRules3",
        "memoryMatchGameRules4",
      ],
      scoringKey: "scoringRuleMemoryMatch",
      youtubeUrl: "https://www.youtube.com/watch?v=oFfYmrGeTPs",
      color: "#013a20",
    },
  };

  const currentGame = gameDetails[gameId];

  const handleOpenYouTube = () => {
    Alert.alert(t("youtubeTitle"), t("youtubePrompt"), [
      { text: t("no"), style: "cancel" },
      {
        text: t("yes"),
        onPress: () => Linking.openURL(currentGame.youtubeUrl),
      },
    ]);
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
        <Text style={styles.title}>{t(currentGame.titleKey)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("gameDescription")}</Text>
          <Text style={styles.description}>
            {t(currentGame.descriptionKey)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("gameRules")}</Text>
          {currentGame.rulesKeys.map((ruleKey, index) => (
            <Text key={index} style={styles.rule}>
              • {t(ruleKey)}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("scoring")}</Text>
          <Text style={styles.scoring}>{t(currentGame.scoringKey)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {currentGame.youtubeUrl && (
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={handleOpenYouTube}
            >
              <Text style={styles.buttonText}>📺 {t("watchYTVideo")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: currentGame.color }]}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>🎮 {t("startGame")}</Text>
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
