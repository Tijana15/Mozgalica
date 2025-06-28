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

const SudokuScreen = ({ navigation, route }) => {
  // SVI HOOK-OVI MORAJU BITI NA VRHU KOMPONENTE
  const { username } = route.params;

  // Svi useState pozivi
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [db, setDb] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Svi useEffect pozivi
  // 1. Hook za otvaranje baze (PREMEŠTEN NA ISPRAVNO MESTO)
  useEffect(() => {
    async function openAndInitDb() {
      try {
        const database = await SQLite.openDatabaseAsync("mojaNovaBaza.db");
        setDb(database);
        console.log("SudokuScreen: Baza podataka uspješno otvorena.");
      } catch (error) {
        console.error(
          "SudokuScreen: Greška pri otvaranju ili inicijalizaciji baze:",
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
  }, []);

  // 2. Hook za inicijalizaciju igre
  useEffect(() => {
    const puzzle = generateSudokuPuzzle();
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map((row) => [...row])); // Deep copy
    setStartTime(Date.now());
  }, []);

  // 3. Hook za tajmer
  useEffect(() => {
    let interval;
    if (startTime && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameComplete]);

  // OBIČNE FUNKCIJE IDU POSLE SVIH HOOK-OVA
  const generateSudokuPuzzle = () => {
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

    const puzzleGrid = completeGrid.map((row) => [...row]); // Deep copy
    const cellsToRemove = 40;

    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzleGrid[row][col] !== 0) {
        puzzleGrid[row][col] = 0;
      }
    }
    return puzzleGrid;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isValidMove = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
    }
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }
    return true;
  };

  const checkGameComplete = (grid) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return false;
      }
    }
    return true;
  };

  const handleCellPress = (row, col) => {
    if (originalGrid[row][col] !== 0) return;
    setSelectedCell({ row, col });
    setHighlightedNumber(null);
  };

  const handleNumberPress = (num) => {
    if (!selectedCell) {
      setHighlightedNumber(highlightedNumber === num ? null : num);
      return;
    }

    const { row, col } = selectedCell;
    const newGrid = sudokuGrid.map((r) => [...r]); // Pravilno kopiranje 2D niza

    if (num === 0 || isValidMove(newGrid, row, col, num)) {
      newGrid[row][col] = num;
      setSudokuGrid(newGrid);

      if (num !== 0) {
        setHighlightedNumber(num);
      } else {
        setHighlightedNumber(null);
      }

      if (checkGameComplete(newGrid)) {
        setIsGameComplete(true);
        saveGameComplete();
      }
    } else {
      Alert.alert(
        "Nevaljan potez",
        "Ovaj broj nije dozvoljen na ovoj poziciji!"
      );
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
    const score = Math.max(1000 - gameTime, 100);
    try {
      // ISPRAVLJEN POZIV FUNKCIJE
      await saveGameResult(
        username,
        "Sudoku",
        score,
        gameTime,
        { details: `Finished in ${gameTime}s` }, // Primer dodatnih podataka
        db // Prosleđivanje DB instance
      );

      Alert.alert(
        "Čestitamo!",
        `Rešili ste Sudoku za ${formatTime(gameTime)}!\nVaš skor: ${score}`,
        [
          { text: "Nova igra", onPress: () => restartGame() },
          { text: "Nazad", onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error("Greška pri čuvanju rezultata:", error);
      Alert.alert("Greška", `Nije moguće sačuvati rezultat: ${error.message}`);
    }
  };

  const restartGame = () => {
    const puzzle = generateSudokuPuzzle();
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map((row) => [...row]));
    setSelectedCell(null);
    setHighlightedNumber(null);
    setStartTime(Date.now());
    setGameTime(0);
    setIsGameComplete(false);
  };

  const getHint = () => {
    // ...
  };

  const shouldHighlightCell = (row, col) => {
    if (!highlightedNumber) return false;
    return sudokuGrid[row][col] === highlightedNumber;
  };

  // JSX počinje tek posle svih funkcija i hook-ova
  if (isLoadingDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#bacc81" />
        <Text style={{ marginTop: 10 }}>Učitavanje baze podataka...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.player}>Igrač: {username}</Text>
        <Text style={styles.timer}>Vreme: {formatTime(gameTime)}</Text>
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
          {selectedCell ? "Izaberite broj:" : "Pritisni broj da ga označiš:"}
        </Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                highlightedNumber === num && styles.selectedNumberButton,
              ]}
              onPress={() => handleNumberPress(num)}
              disabled={isGameComplete}
            >
              <Text
                style={[
                  styles.numberText,
                  highlightedNumber === num && styles.selectedNumberText,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.eraseButton}
          onPress={() => handleNumberPress(0)}
          disabled={!selectedCell || isGameComplete}
        >
          <Text style={styles.eraseText}>Obriši</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={getHint}
          disabled={isGameComplete}
        >
          <Text style={styles.actionButtonText}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={restartGame}>
          <Text style={styles.actionButtonText}>Nova igra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Nazad</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#bacc81",
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
    marginBottom: 5,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  gridContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#333",
    padding: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  originalCell: {
    backgroundColor: "#e8e8e8",
  },
  selectedCell: {
    backgroundColor: "#ecf87f",
  },
  highlightedCell: {
    backgroundColor: "#a8d8a8",
  },
  bottomBorder: {
    borderBottomWidth: 3,
    borderBottomColor: "#333",
  },
  rightBorder: {
    borderRightWidth: 3,
    borderRightColor: "#333",
  },
  cellText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196f3",
  },
  originalCellText: {
    color: "#333",
  },
  highlightedCellText: {
    color: "#2e7d32",
    fontWeight: "900",
  },
  numbersContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
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
    elevation: 3,
  },
  selectedNumberButton: {
    backgroundColor: "#478c5c",
    borderWidth: 2,
    borderColor: "#2e7d32",
  },
  numberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  selectedNumberText: {
    color: "#fff",
    fontWeight: "900",
  },
  eraseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#013a20",
    borderRadius: 5,
    elevation: 3,
  },
  eraseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
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
    elevation: 3,
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

export default SudokuScreen;
