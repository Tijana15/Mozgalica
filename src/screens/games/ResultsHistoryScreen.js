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
import { getGameResults } from "../../utils/database";
import { useTranslation } from "react-i18next";

const ResultsHistoryScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { username, db } = route.params;
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const gameTypes = [
    { key: "allFilter", value: "Sve" },
    { key: "sudoku", value: "Sudoku" },
    { key: "mathQuiz", value: "Matematički kviz" },
    { key: "memoryMatch", value: "Memory Match" },
  ];

  const loadResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const userResults = await getGameResults(db, { username });
      const sortedResults = userResults.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setResults(sortedResults);
    } catch (error) {
      console.error("Greška pri učitavanju rezultata:", error);
      Alert.alert(t("errorTitle"), t("loadResultsError"));
    } finally {
      setIsLoading(false);
    }
  }, [username, db, t]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    let filtered = results;
    if (selectedGame !== "Sve") {
      filtered = filtered.filter((result) => result.game === selectedGame);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((result) => {
        const usernameMatch = result.username.toLowerCase().includes(query);
        const scoreMatch = result.score.toString().includes(query);
        return usernameMatch || scoreMatch;
      });
    }
    setFilteredResults(filtered);
  }, [results, selectedGame, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  }, [loadResults]);

  const handleFilterChange = (game) => {
    setSelectedGame(game);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.gameText}>{t(item.game_name) || item.game}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.usernameText}>{item.username}</Text>
        <Text style={styles.scoreText}>
          {t("result")}: {item.score}
        </Text>
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
        <Text>{t("loadingResults")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("resultHistory")}</Text>

      <View style={styles.filterContainer}>
        {gameTypes.map((game) => (
          <TouchableOpacity
            key={game.key}
            style={[
              styles.filterButton,
              selectedGame === game.value && styles.selectedFilter,
            ]}
            onPress={() => handleFilterChange(game.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedGame === game.value && styles.selectedFilterText,
              ]}
            >
              {t(game.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("filterPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
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
              ? t("noResultsFor", { query: searchQuery })
              : t("noResultsToShow")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7", padding: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  selectedFilter: { backgroundColor: "#bacc81" },
  filterButtonText: { fontSize: 15, color: "#333" },
  selectedFilterText: { color: "#FFFFFF", fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 3,
  },
  searchInput: { flex: 1, height: 45, fontSize: 14, color: "#333" },
  clearButton: { padding: 5, marginLeft: 10 },
  clearButtonText: { fontSize: 18, color: "#888", fontWeight: "bold" },
  listContent: { paddingBottom: 20 },
  resultItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
  usernameText: { fontSize: 16, color: "#478c5c" },
  scoreText: { fontSize: 16, color: "#555" },
  dateText: { fontSize: 12, color: "#888", marginTop: 8, textAlign: "right" },
  noResultsText: { fontSize: 18, color: "#666" },
});

export default ResultsHistoryScreen;
