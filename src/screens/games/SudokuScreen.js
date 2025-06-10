import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { saveGameResult } from "../../utils/database";

const SudokuScreen = ({ navigation, route }) => {
  const { username } = route.params;
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Generisanje osnovne Sudoku tabele
  const generateSudokuPuzzle = () => {
    // Kompletna sudoku tabela sa rešenjem
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

    // Kreiranje puzzle-a uklanjanjem brojeva
    const puzzleGrid = completeGrid.map((row) => [...row]);
    const cellsToRemove = 40; // Broj polja za uklanjanje

    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzleGrid[row][col] !== 0) {
        puzzleGrid[row][col] = 0;
      }
    }

    return puzzleGrid;
  };

  // Inicijalizacija igre
  useEffect(() => {
    const puzzle = generateSudokuPuzzle();
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map((row) => [...row]));
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

  // Proverava da li je broj valjan na određenoj poziciji
  const isValidMove = (grid, row, col, num) => {
    // Provera reda
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
    }

    // Provera kolone
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }

    // Provera 3x3 bloka
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }

    return true;
  };

  // Proverava da li je igra završena
  const checkGameComplete = (grid) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return false;
      }
    }
    return true;
  };

  // Rukovanje klikom na ćeliju
  const handleCellPress = (row, col) => {
    if (originalGrid[row][col] !== 0) return; // Ne može menjati originalne brojeve
    setSelectedCell({ row, col });
  };

  // Unošenje broja
  const handleNumberPress = (num) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const newGrid = [...sudokuGrid];

    if (num === 0 || isValidMove(newGrid, row, col, num)) {
      newGrid[row][col] = num;
      setSudokuGrid(newGrid);

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

  // Čuvanje rezultata
  const saveGameComplete = async () => {
    try {
      await saveGameResult({
        username,
        game: "Sudoku",
        score: Math.max(1000 - gameTime, 100), // Veći skor za brže rešavanje
        time: gameTime,
        date: new Date().toISOString(),
      });

      Alert.alert(
        "Čestitamo!",
        `Rešili ste Sudoku za ${formatTime(gameTime)}!\nVaš skor: ${Math.max(
          1000 - gameTime,
          100
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

  // Novo pokretanje igre
  const restartGame = () => {
    const puzzle = generateSudokuPuzzle();
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map((row) => [...row]));
    setSelectedCell(null);
    setStartTime(Date.now());
    setGameTime(0);
    setIsGameComplete(false);
  };

  // Hint funkcija
  const getHint = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudokuGrid[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(sudokuGrid, i, j, num)) {
              const newGrid = [...sudokuGrid];
              newGrid[i][j] = num;
              setSudokuGrid(newGrid);
              setSelectedCell({ row: i, col: j });

              if (checkGameComplete(newGrid)) {
                setIsGameComplete(true);
                saveGameComplete();
              }
              return;
            }
          }
        }
      }
    }
  };

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
                  originalGrid[rowIndex][colIndex] !== 0 && styles.originalCell,
                  selectedCell?.row === rowIndex &&
                    selectedCell?.col === colIndex &&
                    styles.selectedCell,
                  (rowIndex === 2 || rowIndex === 5) && styles.bottomBorder,
                  (colIndex === 2 || colIndex === 5) && styles.rightBorder,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={isGameComplete}
              >
                <Text
                  style={[
                    styles.cellText,
                    originalGrid[rowIndex][colIndex] !== 0 &&
                      styles.originalCellText,
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
        <Text style={styles.numbersTitle}>Izaberite broj:</Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num)}
              disabled={!selectedCell || isGameComplete}
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
    backgroundColor: "#4a90e2",
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
    margin: 1,
  },
  originalCell: {
    backgroundColor: "#e8e8e8",
  },
  selectedCell: {
    backgroundColor: "#ffeb3b",
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
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  numberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  eraseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
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
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    minWidth: 80,
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

export default SudokuScreen;
