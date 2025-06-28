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
  TextInput,
} from "react-native";
import { getGameResults, clearGameResults } from "../../utils/database";

const ResultsHistoryScreen = ({ navigation, route }) => {
  const { username, db } = route.params;
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Kombinovana logika za filtriranje i pretragu
  useEffect(() => {
    let filtered = results;

    // Prvo filtriranje po igri
    if (selectedGame !== "Sve") {
      filtered = filtered.filter((result) => result.game === selectedGame);
    }

    // Zatim pretraga po korisničkom imenu ili broju poena
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((result) => {
        // Pretraga po korisničkom imenu
        const usernameMatch = result.username.toLowerCase().includes(query);

        // Pretraga po broju poena (konvertuj u string)
        const scoreMatch = result.score.toString().includes(query);

        return usernameMatch || scoreMatch;
      });
    }

    setFilteredResults(filtered);
  }, [results, selectedGame, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const handleFilterChange = (game) => {
    setSelectedGame(game);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.gameText}>{item.game}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.usernameText}>{item.username}</Text>
        <Text style={styles.scoreText}>Rezultat: {item.score}</Text>
      </View>
      <Text style={styles.dateText}>
        {new Date(item.date).toLocaleDateString("sr-RS", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
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
      <Text style={styles.title}>Istorija rezultata</Text>

      {/* Filter dugmići */}
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

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraga po korisničkom imenu ili broju poena..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
          fontSize="14"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
          <Text style={styles.noResultsText}>
            {searchQuery.trim() !== ""
              ? `Nema rezultata za "${searchQuery}"`
              : "Nema rezultata za prikaz."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 10,
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
    marginBottom: 15,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 23,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    margin: 4,
  },
  selectedFilter: {
    backgroundColor: "#bacc81",
  },
  filterButtonText: {
    fontSize: 15,
    color: "#333",
  },
  selectedFilterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  // Novi stilovi za search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#888",
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
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usernameText: {
    fontSize: 16,
    color: "#478c5c",
  },
  scoreText: {
    fontSize: 16,
    color: "#555",
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
