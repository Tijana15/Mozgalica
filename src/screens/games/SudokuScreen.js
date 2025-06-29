import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { saveGameResult } from "../../utils/database";
import * as SQLite from "expo-sqlite";
import { useTranslation } from "react-i18next";

const SudokuScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { username } = route.params;

  // --- STATE ---
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]);
  const [solutionGrid, setSolutionGrid] = useState([]); // NOVO: Čuvamo rešenje za hint
  const [selectedCell, setSelectedCell] = useState(null);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [db, setDb] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [hintCount, setHintCount] = useState(0);

  // --- USE EFFECT HOOKS ---
  useEffect(() => {
    async function openAndInitDb() {
      try {
        const database = await SQLite.openDatabaseAsync("mojaNovaBaza.db");
        setDb(database);
      } catch (error) {
        Alert.alert(t("dbErrorTitle"), t("dbErrorLoad"));
      } finally {
        setIsLoadingDb(false);
      }
    }
    openAndInitDb();
  }, [t]);

  // Inicijalizacija igre
  useEffect(() => {
    restartGame();
  }, []);

  // Tajmer
  useEffect(() => {
    let interval;
    if (startTime && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameComplete]);

  // --- FUNKCIJE ZA GENERISANJE IGRE ---
  const generateSudokuPuzzle = () => {
    // Fiksno rešenje kao osnova
    const completeGrid = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    const puzzleGrid = completeGrid.map((row) => [...row]);
    let cellsToRemove = 40; // Težina igre
    let attempts = 0;
    while (cellsToRemove > 0 && attempts < 1000) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzleGrid[row][col] !== 0) {
        puzzleGrid[row][col] = 0;
        cellsToRemove--;
      }
      attempts++;
    }
    return { puzzle: puzzleGrid, solution: completeGrid };
  };

  // --- FUNKCIJE ZA IGRU ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isValidMove = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++)
      if (grid[row][i] === num && i !== col) return false;
    for (let i = 0; i < 9; i++)
      if (grid[i][col] === num && i !== row) return false;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (grid[i][j] === num && (i !== row || j !== col)) return false;
      }
    }
    return true;
  };

  const checkGameComplete = (grid) => !grid.some((row) => row.includes(0));

  // --- HANDLERI ZA KORISNIČKE AKCIJE ---
  const handleCellPress = (row, col) => {
    const clickedNumber = sudokuGrid[row][col];

    if (originalGrid[row][col] !== 0) {
      // ✅ IZMENA: Ako se klikne na originalni broj, highlight-uj ga
      setSelectedCell(null); // Deselektuj bilo koju praznu ćeliju
      setHighlightedNumber(clickedNumber);
    } else {
      // Ako se klikne na praznu ćeliju, selektuj je
      setSelectedCell({ row, col });
      setHighlightedNumber(null); // Ukloni highlight
    }
  };

  const handleNumberPress = (num) => {
    // ✅ IZMENA: Ova funkcija sada služi samo za unos broja
    if (!selectedCell) {
      Alert.alert(t("selectCellFirstTitle"), t("selectCellFirstMessage"));
      return;
    }
    const { row, col } = selectedCell;
    if (originalGrid[row][col] !== 0) return;

    const newGrid = sudokuGrid.map((r) => [...r]);
    newGrid[row][col] = num; // Postavi broj (ili 0 za brisanje)

    // Proveri validnost samo ako nije brisanje
    if (num !== 0 && !isValidMove(sudokuGrid, row, col, num)) {
      Alert.alert(t("invalidMoveTitle"), t("invalidMoveMessage"));
      return; // Ne dozvoli unos nevalidnog broja
    }

    setSudokuGrid(newGrid);

    if (checkGameComplete(newGrid)) {
      setIsGameComplete(true);
      saveGameComplete(newGrid);
    }
  };

  // ✅ IZMENA: Implementirana getHint funkcija
  const getHint = () => {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudokuGrid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) {
      Alert.alert(t("hint"), t("noEmptyCells"));
      return;
    }

    setHintCount((prevCount) => prevCount + 1);
    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    const correctNumber = solutionGrid[row][col];

    const newGrid = sudokuGrid.map((r) => [...r]);
    newGrid[row][col] = correctNumber;

    setSudokuGrid(newGrid);
    setGameTime((prevTime) => prevTime + 30); // Opciono: Kazna od 30 sekundi za hint

    if (checkGameComplete(newGrid)) {
      setIsGameComplete(true);
      saveGameComplete(newGrid);
    }
  };

  const saveGameComplete = async (finalGrid) => {
    // ... (logika za čuvanje ostaje ista, samo prima finalGrid)
    if (!db) {
      Alert.alert(t("errorTitle"), t("dbNotReady"));
      return;
    }

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (finalGrid[i][j] !== solutionGrid[i][j]) {
          Alert.alert(t("errorTitle"), t("solutionIncorrect"));
          setIsGameComplete(false); // Dozvoli korisniku da ispravi
          return;
        }
      }
    }
    const hintPenalty = hintCount * 50;
    const score = Math.max(1000 - gameTime - hintPenalty, 100);
    try {
      await saveGameResult(username, t("sudoku"), score, gameTime, {}, db);
      Alert.alert(
        t("congratsTitle"),
        t("congratsMessageSudoku", {
          time: formatTime(gameTime),
          score: score,
          hintCount: hintCount,
          penalty: hintPenalty,
        }),
        [
          { text: t("newGame"), onPress: restartGame },
          { text: t("back"), onPress: navigation.goBack },
        ]
      );
    } catch (error) {
      Alert.alert(t("errorTitle"), t("saveError"));
    }
  };

  const restartGame = () => {
    const { puzzle, solution } = generateSudokuPuzzle();
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map((row) => [...row]));
    setSolutionGrid(solution);
    setSelectedCell(null);
    setHighlightedNumber(null);
    setStartTime(Date.now());
    setGameTime(0);
    setIsGameComplete(false);
    setHintCount(0);
  };

  const shouldHighlightCell = (row, col) => {
    if (!highlightedNumber) return false;
    return sudokuGrid[row][col] === highlightedNumber;
  };

  if (isLoadingDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#bacc81" />
        <Text style={{ marginTop: 10 }}>{t("loadingDb")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("sudoku")}</Text>
        <Text style={styles.player}>
          {t("player")} {username}
        </Text>
        <Text style={styles.timer}>
          {t("time")}: {formatTime(gameTime)}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {sudokuGrid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  originalGrid[rowIndex]?.[colIndex] !== 0 &&
                    styles.originalCell,
                  selectedCell?.row === rowIndex &&
                    selectedCell?.col === colIndex &&
                    styles.selectedCell,
                  shouldHighlightCell(rowIndex, colIndex) &&
                    styles.highlightedCell,
                  (rowIndex === 2 || rowIndex === 5) && styles.bottomBorder,
                  (colIndex === 2 || colIndex === 5) && styles.rightBorder,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={isGameComplete}
              >
                <Text
                  style={[
                    styles.cellText,
                    originalGrid[rowIndex]?.[colIndex] !== 0 &&
                      styles.originalCellText,
                    shouldHighlightCell(rowIndex, colIndex) &&
                      styles.highlightedCellText,
                  ]}
                >
                  {cell !== 0 ? cell : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.numbersContainer}>
        <Text style={styles.numbersTitle}>
          {selectedCell ? t("selectNumber") : t("selectNumberPrompt")}
        </Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num)}
              disabled={isGameComplete}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.eraseButton}
          onPress={() => handleNumberPress(0)}
          disabled={!selectedCell || isGameComplete}
        >
          <Text style={styles.eraseText}>{t("delete")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={getHint}
          disabled={isGameComplete}
        >
          <Text style={styles.actionButtonText}>{t("hint")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={restartGame}>
          <Text style={styles.actionButtonText}>{t("newGame")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>{t("back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  header: { alignItems: "center", padding: 20, backgroundColor: "#bacc81" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 5 },
  player: { fontSize: 16, color: "white", marginBottom: 5 },
  timer: { fontSize: 18, fontWeight: "bold", color: "white" },
  gridContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#333",
    padding: 2,
  },
  row: { flexDirection: "row" },
  cell: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  originalCell: { backgroundColor: "#e8e8e8" },
  selectedCell: {
    backgroundColor: "#ecf87f",
    borderWidth: 2,
    borderColor: "#aa00ff",
  },
  highlightedCell: { backgroundColor: "#a8d8a8" },
  bottomBorder: { borderBottomWidth: 3, borderBottomColor: "#333" },
  rightBorder: { borderRightWidth: 3, borderRightColor: "#333" },
  cellText: { fontSize: 18, fontWeight: "bold", color: "#2196f3" },
  originalCellText: { color: "#333" },
  highlightedCellText: { color: "#2e7d32", fontWeight: "900" },
  numbersContainer: { alignItems: "center", marginBottom: 20 },
  numbersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  numbersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bacc81",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  eraseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#013a20",
    borderRadius: 5,
  },
  eraseText: { fontSize: 16, fontWeight: "bold", color: "white" },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#478c5c",
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  backButton: { backgroundColor: "#666" },
  actionButtonText: { fontSize: 16, fontWeight: "bold", color: "white" },
});

export default SudokuScreen;
