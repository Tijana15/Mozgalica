import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";

let db = null;

const openDatabase = async () => {
  try {
    if (SQLite.openDatabaseAsync) {
      db = await SQLite.openDatabaseAsync("users.db");
      console.log('Baza podataka "users.db" je otvorena (nova sintaksa).');
    } else if (SQLite.openDatabase) {
      db = SQLite.openDatabase("users.db");
      console.log('Baza podataka "users.db" je otvorena (stara sintaksa).');
    } else {
      throw new Error("expo-sqlite modul nije pravilno učitan");
    }
    return db;
  } catch (error) {
    console.error("Greška pri otvaranju baze podataka:", error);
    Alert.alert(
      "Greška",
      "Baza podataka nije dostupna. Molimo pokušajte ponovo."
    );
    return null;
  }
};

export const initDatabase = async () => {
  try {
    if (!db) {
      await openDatabase();
    }

    if (!db) {
      console.error("Konekcija sa bazom podataka nije uspostavljena");
      return;
    }

    if (db.execAsync) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        );
      `);
      console.log('Tabela "users" kreirana uspešno (nova sintaksa).');
    } else {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );`,
          [],
          () =>
            console.log('Tabela "users" kreirana uspešno (stara sintaksa).'),
          (tx, error) =>
            console.log('Greška pri kreiranju tabele "users":', error)
        );
      });
    }
  } catch (error) {
    console.error("Greška pri inicijalizaciji baze:", error);
  }
};

export const registerUser = async (username, password) => {
  try {
    if (!db) {
      await openDatabase();
    }

    if (!db) {
      throw new Error("Baza podataka nije dostupna za registraciju.");
    }

    if (db.runAsync) {
      try {
        const result = await db.runAsync(
          "INSERT INTO users (username, password) VALUES (?, ?);",
          [username, password]
        );
        return result.changes > 0;
      } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new Error("Korisničko ime je već zauzeto.");
        }
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO users (username, password) VALUES (?, ?);",
            [username, password],
            (_, result) => {
              resolve(result.rowsAffected > 0);
            },
            (tx, error) => {
              if (error.message.includes("UNIQUE constraint failed")) {
                reject(new Error("Korisničko ime je već zauzeto."));
              } else {
                reject(error);
              }
            }
          );
        });
      });
    }
  } catch (error) {
    console.error("Greška pri registraciji:", error);
    throw error;
  }
};

export const checkUserCredentials = async (username, password) => {
  try {
    if (!db) {
      await openDatabase();
    }

    if (!db) {
      throw new Error("Baza podataka nije dostupna za proveru kredencijala.");
    }

    if (db.getFirstAsync) {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ? AND password = ?;",
        [username, password]
      );
      return user !== null;
    } else {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM users WHERE username = ? AND password = ?;",
            [username, password],
            (_, { rows }) => {
              resolve(rows.length > 0);
            },
            (tx, error) => reject(error)
          );
        });
      });
    }
  } catch (error) {
    console.error("Greška pri proveri kredencijala:", error);
    throw error;
  }
};
