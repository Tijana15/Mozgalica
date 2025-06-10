import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { saveGameResult } from "../../utils/database";

const MathQuizScreen = ({ navigation, route }) => {
  const { username } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const TOTAL_QUESTIONS = 10;

  // Generiranje matematičkih pitanja
  const generateQuestions = () => {
    const newQuestions = [];
    const operations = ["+", "-", "*", "/"];

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const operation =
        operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, correctAnswer;

      switch (operation) {
        case "+":
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          correctAnswer = num1 + num2;
          break;
        case "-":
          num1 = Math.floor(Math.random() * 50) + 25;
          num2 = Math.floor(Math.random() * 25) + 1;
          correctAnswer = num1 - num2;
          break;
        case "*":
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          correctAnswer = num1 * num2;
          break;
        case "/":
          num2 = Math.floor(Math.random() * 10) + 2;
          correctAnswer = Math.floor(Math.random() * 15) + 1;
          num1 = num2 * correctAnswer;
          break;
        default:
          num1 = 1;
          num2 = 1;
          correctAnswer = 2;
      }

      // Generiranje pogrešnih odgovora
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        let wrongAnswer;
        if (operation === "/") {
          wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
        } else {
          wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
        }

        if (
          wrongAnswer !== correctAnswer &&
          wrongAnswer > 0 &&
          !wrongAnswers.includes(wrongAnswer)
        ) {
          wrongAnswers.push(wrongAnswer);
        }
      }

      // Mešanje odgovora
      const allAnswers = [correctAnswer, ...wrongAnswers];
      const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

      newQuestions.push({
        question: `${num1} ${operation} ${num2} = ?`,
        answers: shuffledAnswers,
        correctAnswer: correctAnswer,
        difficulty: operation === "*" || operation === "/" ? "hard" : "easy",
      });
    }

    return newQuestions;
  };

  // Inicijalizacija igre
  useEffect(() => {
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setStartTime(Date.now());
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (startTime && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameComplete]);

  // Formatiranje vremena
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Rukovanje odgovorom
  const handleAnswerPress = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const points = questions[currentQuestion].difficulty === "hard" ? 20 : 10;
      setScore((prevScore) => prevScore + points);
    }

    // Prikaži rezultat na 1.5 sekunde
    setTimeout(() => {
      if (currentQuestion + 1 < TOTAL_QUESTIONS) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Kraj igre
        setIsGameComplete(true);
        saveGameComplete(
          score +
            (isCorrect
              ? questions[currentQuestion].difficulty === "hard"
                ? 20
                : 10
              : 0)
        );
      }
    }, 1500);
  };

  // Čuvanje rezultata
  const saveGameComplete = async (finalScore) => {
    try {
      await saveGameResult({
        username,
        game: "Matematički kviz",
        score: finalScore,
        time: gameTime,
        date: new Date().toISOString(),
      });

      const percentage = Math.round(
        (finalScore / (TOTAL_QUESTIONS * 15)) * 100
      );

      Alert.alert(
        "Igra završena!",
        `Vaš rezultat: ${finalScore} bodova\nTačnost: ${percentage}%\nVreme: ${formatTime(
          gameTime
        )}`,
        [
          { text: "Nova igra", onPress: () => restartGame() },
          { text: "Nazad", onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error("Greška pri čuvanju rezultata:", error);
    }
  };

  // Nova igra
  const restartGame = () => {
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStartTime(Date.now());
    setGameTime(0);
    setIsGameComplete(false);
  };

  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Učitavanje pitanja...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matematički kviz</Text>
        <Text style={styles.player}>Igrač: {username}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Pitanje: {currentQuestion + 1}/{TOTAL_QUESTIONS}
          </Text>
          <Text style={styles.statsText}>Skor: {score}</Text>
          <Text style={styles.statsText}>Vreme: {formatTime(gameTime)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {questions[currentQuestion]?.question}
        </Text>

        <View style={styles.difficultyContainer}>
          <Text
            style={[
              styles.difficultyText,
              {
                color:
                  questions[currentQuestion]?.difficulty === "hard"
                    ? "#f44336"
                    : "#4caf50",
              },
            ]}
          >
            {questions[currentQuestion]?.difficulty === "hard"
              ? "20 bodova"
              : "10 bodova"}
          </Text>
        </View>
      </View>

      <View style={styles.answersContainer}>
        {questions[currentQuestion]?.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              selectedAnswer === answer && styles.selectedAnswer,
              isAnswered &&
                answer === questions[currentQuestion].correctAnswer &&
                styles.correctAnswer,
              isAnswered &&
                selectedAnswer === answer &&
                answer !== questions[currentQuestion].correctAnswer &&
                styles.wrongAnswer,
            ]}
            onPress={() => handleAnswerPress(answer)}
            disabled={isAnswered}
          >
            <Text
              style={[
                styles.answerText,
                selectedAnswer === answer && styles.selectedAnswerText,
                isAnswered &&
                  answer === questions[currentQuestion].correctAnswer &&
                  styles.correctAnswerText,
              ]}
            >
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isAnswered && (
        <View style={styles.feedbackContainer}>
          <Text
            style={[
              styles.feedbackText,
              {
                color:
                  selectedAnswer === questions[currentQuestion].correctAnswer
                    ? "#4caf50"
                    : "#f44336",
              },
            ]}
          >
            {selectedAnswer === questions[currentQuestion].correctAnswer
              ? "Bravo! Tačan odgovor!"
              : "Netačno! Pokušajte ponovo."}
          </Text>
        </View>
      )}

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
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    backgroundColor: "#6200ee",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
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
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  questionContainer: {
    padding: 20,
    alignItems: "center",
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  difficultyContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  answersContainer: {
    padding: 20,
  },
  answerButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedAnswer: {
    borderColor: "#6200ee",
    backgroundColor: "#f3e5f5",
  },
  correctAnswer: {
    borderColor: "#4caf50",
    backgroundColor: "#e8f5e8",
  },
  wrongAnswer: {
    borderColor: "#f44336",
    backgroundColor: "#ffebee",
  },
  answerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  selectedAnswerText: {
    color: "#6200ee",
  },
  correctAnswerText: {
    color: "#4caf50",
  },
  feedbackContainer: {
    padding: 20,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#6200ee",
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

export default MathQuizScreen;
