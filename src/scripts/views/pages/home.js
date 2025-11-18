// file: src/scripts/views/pages/home.js

import { createStoryListHTML } from '../templates/story-card.js';
import HomePresenter from '../../presenters/home-presenter.js';

const _initLazyLoad = () => {
  const lazyImages = document.querySelectorAll('img.lazy-load');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy-load');
          self.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      observer.observe(img);
    });
  } else {
    // Fallback for older browsers
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
    });
  }
};

const HomePage = {
  async render() {
    return `
      <div class="container">
        <section class="hero-section">
          <h2 class="hero-title">Jelajahi Cerita dari Seluruh Indonesia 🇮🇩</h2>
          <p class="hero-description">Berbagi pengalaman dan inspirasi bersama komunitas Dicoding</p>
        </section>
        <div class="controls-section">
          <div class="search-filter">
            <input 
              type="text" 
              id="search-input" 
              placeholder="🔍 Cari cerita..." 
              class="search-input"
              aria-label="Cari cerita"
            />
          </div>
          <button id="sync-toggle" class="btn btn-secondary" aria-label="Toggle sinkronisasi list dan peta">
            🔄 Sync List & Map
          </button>
          <button id="show-saved-stories" class="btn btn-secondary" aria-label="Show saved stories">
            Show Saved Stories
          </button>
        </div>
        <section class="map-section" aria-label="Peta lokasi cerita">
          <h3 class="section-title">📍 Peta Lokasi Story</h3>
          <div id="map" class="map-container" role="application" aria-label="Interactive map"></div>
        </section>
        <section class="stories-section" aria-label="Daftar cerita">
          <div class="section-header">
            <h3 class="section-title">📚 Daftar Story</h3>
            <span id="story-count" class="story-count">0 cerita</span>
          </div>
          <div id="stories-container" class="stories-grid" role="list">
            <div class="loading-placeholder">
              <div class="spinner"></div>
              <p>Memuat cerita...</p>
            </div>
          </div>
        </section>
      </div>
    `;
  },
  
  async afterRender() {
    // Dipanggil setelah HTML dirender
  },

  // METHOD VIEWS UNTUK MENGAMBIL ELEMENT (KRITIS)
  getStoriesContainer: () => document.getElementById('stories-container'),
  getStoryCountElement: () => document.getElementById('story-count'),
  getSyncToggleButton: () => document.getElementById('sync-toggle'),
  getSearchInputElement: () => document.getElementById('search-input'),
  getShowSavedButton: () => document.getElementById('show-saved-stories'),
  
  showLoading: () => document.getElementById('loading-overlay').classList.add('active'),
  hideLoading: () => document.getElementById('loading-overlay').classList.remove('active'),
  
  renderStories: (stories) => {
    document.getElementById('stories-container').innerHTML = createStoryListHTML(stories);
    _initLazyLoad();
  },
  
  updateStoryCount: (count) => {
    document.getElementById('story-count').textContent = `${count} cerita`;
  },
  
  showError: (message) => {
    document.getElementById('stories-container').innerHTML = `<div class="empty-state error"><p>❌ ${message}</p></div>`;
  },

  // ⭐ METHOD HIGHLIGHT CARD (KRITIS UNTUK SYNC)
  highlightStoryCard: (storyId) => {
    // Hapus highlight dari semua card
    document.querySelectorAll('.story-card').forEach(card => {
        card.classList.remove('highlight');
    });
    // Tambahkan highlight pada card yang sesuai dengan storyId
    const card = document.querySelector(`[data-story-id="${storyId}"]`);
    if (card) {
        card.classList.add('highlight');
    }
  },

  // ⭐ METHOD SCROLL CARD (KRITIS UNTUK SYNC)
  scrollToStoryCard: (storyId) => {
    const card = document.querySelector(`[data-story-id="${storyId}"]`);
    if (card) {
        card.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  },

  updateSyncToggle: (isEnabled) => {
    const btn = document.getElementById('sync-toggle');
    btn.textContent = isEnabled ? '🔄 Sync List & Map' : '⏸️ Sinkronisasi Mati';
    btn.classList.toggle('btn-primary', isEnabled);
    btn.classList.toggle('btn-secondary', !isEnabled);
  },

  addMapStyles: () => {
    // Logika untuk menambahkan style popup Leaflet secara dinamis
    const style = document.createElement('style');
    style.textContent = `
        .map-popup .popup-image {
            max-width: 150px;
            max-height: 100px;
            height: auto;
            object-fit: cover;
            border-radius: 5px;
            margin-bottom: 5px;
        }
        .map-popup h4 {
            margin-top: 0;
            font-size: 1rem;
            color: #667eea;
        }
        .map-popup p {
            font-size: 0.8rem;
            color: #444; 
        }
    `;
    document.head.appendChild(style);
  }
};

export default HomePage;