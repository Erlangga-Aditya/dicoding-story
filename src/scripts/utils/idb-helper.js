import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 2;
const STORE_STORIES = 'stories';
const STORE_OUTBOX = 'outbox';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_STORIES)) {
      db.createObjectStore(STORE_STORIES, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
      db.createObjectStore(STORE_OUTBOX, { keyPath: 'localId', autoIncrement: true });
    }
  },
});

export const IdbHelper = {
  // STORIES CACHE
  async putStory(story) {
    try {
      if (!story || !story.id) return;
      return (await dbPromise).put(STORE_STORIES, story);
    } catch (error) {
      console.error('Failed to put story into IndexedDB:', error);
    }
  },
  async getStory(id) {
    try {
      return (await dbPromise).get(STORE_STORIES, id);
    } catch (error) {
      console.error('Failed to get story from IndexedDB:', error);
      return null;
    }
  },
  async getAllStories() {
    return (await dbPromise).getAll(STORE_STORIES);
  },
  async deleteStory(id) {
    try {
      return (await dbPromise).delete(STORE_STORIES, id);
    } catch (error) {
      console.error('Failed to delete story from IndexedDB:', error);
    }
  },

  // OUTBOX (OFFLINE QUEUE)
  async addToOutbox(entry) {
    try {
      return (await dbPromise).add(STORE_OUTBOX, entry);
    } catch (error) {
      console.error('Failed to add to outbox:', error);
    }
  },
  async getOutboxAll() {
    try {
      return (await dbPromise).getAll(STORE_OUTBOX);
    } catch (error) {
      console.error('Failed to get outbox data:', error);
      return [];
    }
  },
  async removeFromOutbox(localId) {
    try {
      return (await dbPromise).delete(STORE_OUTBOX, localId);
    } catch (error) {
      console.error('Failed to remove from outbox:', error);
    }
  },
};