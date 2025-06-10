import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { saveGameResult } from "../../utils/database";
import * as SQLite from "expo-sqlite";

const MemoryMatchScreen = ({ navigation, route }) => {
  const { username } = route.params;
  const [db, setDb] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const GRID_SIZE = 4; // 4x4 grid = 16 cards (8 pairs)
  const cardSymbols = ["🎯", "🎮", "🎲", "🎭", "🎨", "🎪", "🎫", "🎬"];

  useEffect(() => {
    async function openAndInitDb() {
      try {
        const database = await SQLite.openDatabaseAsync("mojaNovaBaza.db");
        setDb(database);
        console.log("MemoryMatchScreen: Baza podataka uspješno otvorena.");

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS game_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            game_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            time_taken INTEGER,
            additional_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log(
          'MemoryMatchScreen: Tabela "game_results" kreirana ili već postoji.'
        );
      } catch (error) {
        console.error(
          "MemoryMatchScreen: Greška pri otvaranju ili inicijalizaciji baze:",
          error
        );
        Alert.alert(
          "Greška baze",
          "Nije moguće pristupiti bazi podataka. Pokušajte ponovo."
        );
      } finally {
        setIsLoadingDb(false);
      }
    }

    openAndInitDb();

    return () => {
      if (db) {
        // db.closeAsync(); // SQLite se često ne zatvara eksplicitno, ali je dobra praksa
      }
    };
  }, []);

  useEffect(() => {
    const newCards = generateCards();
    setCards(newCards);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    let interval;
    if (startTime && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const generateCards = () => {
    const pairs = [];
    cardSymbols.forEach((symbol, index) => {
      pairs.push({ id: index * 2, symbol, isFlipped: false, isMatched: false });
      pairs.push({
        id: index * 2 + 1,
        symbol,
        isFlipped: false,
        isMatched: false,
      });
    });
    return pairs.sort(() => Math.random() - 0.5);
  };

  const handleCardPress = (cardId) => {
    if (isLoadingDb || isProcessing || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards((prevCards) =>
      prevCards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);

      setTimeout(() => {
        if (firstCard.symbol === secondCard.symbol) {
          const newMatchedCards = [...matchedCards, firstCardId, secondCardId];
          setMatchedCards(newMatchedCards);

          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isMatched: true }
                : c
            )
          );

          if (newMatchedCards.length === cards.length) {
            setIsGameComplete(true);
            saveGameComplete();
          }
        } else {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isFlipped: false }
                : c
            )
          );
        }

        setFlippedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const saveGameComplete = async () => {
    if (!db) {
      console.error("saveGameComplete: DB instanca nije spremna.");
      Alert.alert(
        "Greška",
        "Baza podataka nije inicijalizovana. Ne mogu sačuvati rezultat."
      );
      return;
    }

    try {
      const timeBonus = Math.max(300 - gameTime, 0);
      const moveBonus = Math.max(200 - moves * 10, 0);
      const totalScore = timeBonus + moveBonus + 100;

      await saveGameResult(
        username,
        "Memory Match",
        totalScore,
        gameTime,
        { date: new Date().toISOString(), moves: moves },
        db
      );

      Alert.alert(
        "Čestitamo!",
        `Igra završena!\nVreme: ${formatTime(
          gameTime
        )}\nPotezi: ${moves}\nSkor: ${totalScore}`,
        [
          { text: "Nova igra", onPress: () => restartGame() },
          { text: "Nazad", onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error("Greška pri čuvanju rezultata:", error);
      Alert.alert(
        "Greška",
        `Nije moguće sačuvati rezultat: ${error.message || error}`
      );
    }
  };

  const restartGame = () => {
    const newCards = generateCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setStartTime(Date.now());
    setGameTime(0);
    setIsGameComplete(false);
    setIsProcessing(false);
  };

  const progress = (matchedCards.length / cards.length) * 100;

  if (isLoadingDb) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f8ff",
        }}
      >
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Učitavanje baze podataka...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Match</Text>
        <Text style={styles.player}>Igrač: {username}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Vreme: {formatTime(gameTime)}</Text>
          <Text style={styles.statsText}>Potezi: {moves}</Text>
          <Text style={styles.statsText}>
            Parovi: {matchedCards.length / 2}/8
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Napredak: {Math.round(progress)}%
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.gameContainer}>
        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                card.isFlipped && styles.flippedCard,
                card.isMatched && styles.matchedCard,
              ]}
              onPress={() => handleCardPress(card.id)}
              disabled={
                isGameComplete ||
                card.isFlipped ||
                card.isMatched ||
                isLoadingDb
              }
            >
              <Text style={styles.cardText}>
                {card.isFlipped || card.isMatched ? card.symbol : "❓"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Kako igrati:</Text>
        <Text style={styles.instructionsText}>
          • Kliknite na karte da ih okrenete{"\n"}• Pronađite parove sa istim
          simbolom{"\n"}• Završite igru u što manje poteza{"\n"}• Brži završetak
          donosi više bodova
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Nazad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={restartGame}>
          <Text style={styles.actionButtonText}>Nova igra</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  header: {
    backgroundColor: "#4a90e2",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  player: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  statsText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  progressContainer: {
    padding: 20,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  gameContainer: {
    padding: 20,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 320,
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: "#6200ee",
    borderRadius: 8,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flippedCard: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
  matchedCard: {
    backgroundColor: "#e8f5e8",
    borderWidth: 2,
    borderColor: "#4caf50",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    margin: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#666",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default MemoryMatchScreen;
