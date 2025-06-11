import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";

let db = null;

const openDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("mozgalica.db");
    console.log('Baza podataka "mozgalica.db" je otvorena.');
    return db;
  } catch (error) {
    console.error("Greška pri otvaranju baze podataka:", error);
    Alert.alert(
      "Greška",
      "Baza podataka nije dostupna. Molimo pokušajte ponovo."
    );
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    if (!db) {
      await openDatabase();
    }

    // transakcija za kreiranje obe tabele
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        game_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        time_taken INTEGER,
        date_played DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
        additional_data TEXT,
        FOREIGN KEY (username) REFERENCES users (username)
      );
    `);
    console.log("Tabele su uspešno kreirane ili već postoje.");
  } catch (error) {
    console.error("Greška pri inicijalizaciji baze:", error);
    throw error;
  }
};

export const registerUser = async (username, password) => {
  try {
    const result = await db.runAsync(
      "INSERT INTO users (username, password) VALUES (?, ?);",
      username,
      password
    );
    return result.changes > 0;
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Korisničko ime je već zauzeto.");
    }
    console.error("Greška pri registraciji:", error);
    throw error;
  }
};

export const checkUserCredentials = async (username, password) => {
  try {
    const user = await db.getFirstAsync(
      "SELECT * FROM users WHERE username = ? AND password = ?;",
      username,
      password
    );
    return user !== null;
  } catch (error) {
    console.error("Greška pri proveri kredencijala:", error);
    throw error;
  }
};

export const saveGameResult = async (
  username,
  gameName,
  score,
  timeTaken = null,
  additionalData = null
) => {
  try {
    const db = await getDb();

    const additionalDataString = additionalData
      ? JSON.stringify(additionalData)
      : null;

    const result = await db.runAsync(
      "INSERT INTO game_results (username, game_name, score, time_taken, additional_data) VALUES (?, ?, ?, ?, ?);",
      [username, gameName, score, timeTaken, additionalDataString]
    );
    console.log("Rezultat igre sačuvan, ID:", result.lastInsertRowId);
    return result.changes > 0;
  } catch (error) {
    console.error("Greška pri čuvanju rezultata:", error);
    throw error;
  }
};

export const getGameResults = async (filters = {}) => {
  try {
    const db = await getDb();

    let query = "SELECT * FROM game_results WHERE 1=1";
    let params = [];

    if (filters.username) {
      query += " AND username = ?";
      params.push(filters.username);
    }
    if (filters.gameName) {
      query += " AND game_name = ?";
      params.push(filters.gameName);
    }

    query += " ORDER BY date_played DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    const results = await db.getAllAsync(query, params);

    return results.map((result) => ({
      ...result,
      game: result.game_name,
      date: result.date_played,
      additional_data: result.additional_data
        ? JSON.parse(result.additional_data)
        : null,
    }));
  } catch (error) {
    console.error("Greška pri dobijanju rezultata:", error);
    throw error;
  }
};

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("mozgalica.db");
  }
  return db;
};
