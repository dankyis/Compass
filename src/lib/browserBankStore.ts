// Browser BankStore: IndexedDB when available, in-memory otherwise.
// Keeps the on-device cache behind the same seam the domain tests use.

import { BankStore } from "@/domain/bankCache";

const DB_NAME = "compass";
const DB_VERSION = 1;
const STORE_NAME = "bank";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** A store that keeps everything in memory; used when IndexedDB is missing. */
export function createMemoryBankStore(): BankStore {
  const map = new Map<string, string>();
  return {
    async read(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async write(key, value) {
      map.set(key, value);
    },
  };
}

/** The on-device bank cache: IndexedDB in the browser, memory as a fallback. */
export function createBrowserBankStore(): BankStore {
  if (typeof indexedDB === "undefined") return createMemoryBankStore();

  return {
    async read(key) {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const request = db
          .transaction(STORE_NAME, "readonly")
          .objectStore(STORE_NAME)
          .get(key);
        request.onsuccess = () =>
          resolve(typeof request.result === "string" ? request.result : null);
        request.onerror = () => reject(request.error);
      });
    },
    async write(key, value) {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
  };
}
