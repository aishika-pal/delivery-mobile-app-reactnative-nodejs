// SQLite setup for local caching (React Native)
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('instant_delivery.db');

export function initLocalDB() {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );`
    );
  });
}

export function setCache(key, value) {
  db.transaction(tx => {
    tx.executeSql('REPLACE INTO cache (key, value) VALUES (?, ?);', [key, value]);
  });
}

export function getCache(key, callback) {
  db.transaction(tx => {
    tx.executeSql('SELECT value FROM cache WHERE key = ?;', [key], (_, { rows }) => {
      callback(rows.length > 0 ? rows._array[0].value : null);
    });
  });
}

export default db;
