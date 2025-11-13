// Simple IndexedDB helper without external libs
const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_STORIES = 'stories';
const STORE_OUTBOX = 'outbox';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_STORIES)) {
        db.createObjectStore(STORE_STORIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        db.createObjectStore(STORE_OUTBOX, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

export const IdbHelper = {
  // STORIES CACHE
  async putStory(story) {
    if (!story.id) return;
    await withStore(STORE_STORIES, 'readwrite', (store) => {
      store.put(story);
    });
  },
  async getStory(id) {
    return withStore(STORE_STORIES, 'readonly', (store) => {
      return store.get(id);
    });
  },
  async getAllStories() {
    return withStore(STORE_STORIES, 'readonly', (store) => {
      return store.getAll();
    });
  },
  async deleteStory(id) {
    return withStore(STORE_STORIES, 'readwrite', (store) => store.delete(id));
  },

  // OUTBOX (OFFLINE QUEUE)
  async addToOutbox(entry) {
    return withStore(STORE_OUTBOX, 'readwrite', (store) => store.add(entry));
  },
  async getOutboxAll() {
    return withStore(STORE_OUTBOX, 'readonly', (store) => store.getAll());
  },
  async removeFromOutbox(localId) {
    return withStore(STORE_OUTBOX, 'readwrite', (store) => store.delete(localId));
  },
};


