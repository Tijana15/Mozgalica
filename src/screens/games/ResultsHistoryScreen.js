import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getGameResults, clearGameResults } from "../../utils/database";

const ResultsHistoryScreen = ({ navigation, route }) => {
  const { username, db } = route.params;
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState("Sve");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const gameTypes = ["Sve", "Sudoku", "Matematički kviz", "Memory Match"];

  const loadResults = useCallback(async () => {
    try {
      setIsLoading(true);

      const userResults = await getGameResults(db, { username });
      console.log("Učitani rezultati:", userResults); // Debug log

      const sortedResults = userResults.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setResults(sortedResults);
      console.log("Sortirani rezultati:", sortedResults); // Debug log
    } catch (error) {
      console.error("Greška pri učitavanju rezultata:", error);
      Alert.alert("Greška", "Nije moguće učitati rezultate.");
    } finally {
      setIsLoading(false);
    }
  }, [username, db]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (selectedGame === "Sve") {
      setFilteredResults(results);
    } else {
      const filtered = results.filter((result) => result.game === selectedGame);
      setFilteredResults(filtered);
    }
  }, [results, selectedGame]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const handleFilterChange = (game) => {
    setSelectedGame(game);
  };

  const renderResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.gameText}>{item.game}</Text>
      <Text style={styles.scoreText}>Rezultat: {item.score}</Text>
      <Text style={styles.dateText}>
        {new Date(item.date).toLocaleDateString("sr-RS", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Učitavanje rezultata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Istorija Rezultata</Text>

      <View style={styles.filterContainer}>
        {gameTypes.map((game) => (
          <TouchableOpacity
            key={game}
            style={[
              styles.filterButton,
              selectedGame === game && styles.selectedFilter,
            ]}
            onPress={() => handleFilterChange(game)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedGame === game && styles.selectedFilterText,
              ]}
            >
              {game}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item.id}-${index}`} // Jedinstveni ključ
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
            />
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noResultsText}>Nema rezultata za prikaz.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    margin: 4,
  },
  selectedFilter: {
    backgroundColor: "#bacc81",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedFilterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scoreText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "right",
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
  },
});

export default ResultsHistoryScreen;
