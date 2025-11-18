import AuthHelper from '../../utils/auth-helper.js';
import StorySource from '../../data/story-source.js';
import { createStoryCard } from '../../views/templates/story-card.js';

const HomePage = {
  async render() {
    return `
      <header class="app-header">
        <div class="container">
          <h1 class="app-title">Story App</h1>
          <button id="logout-button" class="btn btn-secondary">Logout</button>
        </div>
      </header>
      <main class="container">
        <section class="story-list-header">
          <h2>Daftar Cerita</h2>
          <a href="#/add-story" class="btn btn-primary">Tambah Cerita Baru</a>
        </section>
        <div id="story-list" class="story-list"></div>
      </main>
    `;
  },

  async afterRender() {
    const storyListContainer = document.getElementById('story-list');
    const logoutButton = document.getElementById('logout-button');

    // Logout logic
    logoutButton.addEventListener('click', () => {
      AuthHelper.clearAuthData();
      window.location.hash = '#/auth';
      window.location.reload();
    });

    // Fetch and display stories
    try {
      const stories = await StorySource.getAllStories();
      if (stories.length > 0) {
        storyListContainer.innerHTML = '';
        stories.forEach(story => {
          storyListContainer.innerHTML += createStoryCard(story);
        });
      } else {
        storyListContainer.innerHTML = '<p>Belum ada cerita yang dibagikan.</p>';
      }
    } catch (error) {
      storyListContainer.innerHTML = `<p>Gagal memuat cerita: ${error.message}</p>`;
    }
  },
};

export default HomePage;