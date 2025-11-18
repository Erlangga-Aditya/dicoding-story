import StorySource from '../data/story-source.js';
import MapHelper from '../utils/map-helper.js';
import { IdbHelper } from '../utils/idb-helper.js';

class HomePresenter {
  constructor({ view }) {
    this._view = view;
    this._storySource = StorySource;
    this._mapHelper = new MapHelper('map'); // Inisialisasi MapHelper dengan ID container map
    this._stories = [];
    this._activeStoryId = null;
    this._isSyncEnabled = true;
    this._showOnlySaved = false;

    this._setupViewElements(); // Memanggil setup
    this._setupMap();
    this._loadStories();
  }

  _setupViewElements() {
    this._storiesContainer = this._view.getStoriesContainer();
    this._storyCountElement = this._view.getStoryCountElement();
    this._syncToggleButton = this._view.getSyncToggleButton();
    this._searchInputElement = this._view.getSearchInputElement();
    this._showSavedButton = this._view.getShowSavedButton();

    this._showSavedButton.addEventListener('click', () => {
      this._showOnlySaved = !this._showOnlySaved;
      this._loadStories();
      this._showSavedButton.textContent = this._showOnlySaved ? 'Show All Stories' : 'Show Saved Stories';
    });

    // ⭐ FIX/AKTIVASI: Event listener untuk tombol sinkronisasi
    this._syncToggleButton.addEventListener('click', () => {
      this._isSyncEnabled = !this._isSyncEnabled;
      this._view.updateSyncToggle(this._isSyncEnabled);
      console.log('Sync Enabled:', this._isSyncEnabled);
      
      // Matikan highlight saat mode sync berubah
      this._view.highlightStoryCard(null); 
      this._mapHelper.highlightMarker(null);
    });

    // ⭐ FIX/AKTIVASI: Event listener untuk input pencarian (Filter)
    this._searchInputElement.addEventListener('input', () => {
      this._filterStories(this._searchInputElement.value);
    });

    // Event listener untuk klik pada story card (Delegation)
    this._storiesContainer.addEventListener('click', async (event) => {
      const card = event.target.closest('.story-card');
      if (event.target.matches('.btn-save')) {
        const storyId = event.target.dataset.storyId;
        const story = this._stories.find((s) => s.id === storyId);
        if (story) {
          await IdbHelper.putStory(story);
          alert('Story saved offline!');
          this._loadStories();
        }
      } else if (event.target.matches('.btn-delete')) {
        const storyId = event.target.dataset.storyId;
        await IdbHelper.deleteStory(storyId);
        alert('Story deleted from offline storage!');
        this._loadStories();
      } else if (card) {
        this._handleStoryCardClick(card.dataset.storyId);
      }
    });
  }

  _setupMap() {
    this._mapHelper.initMap();
    this._view.addMapStyles();
  }

  async _loadStories() {
    try {
      this._view.showLoading();
      
      if (this._showOnlySaved) {
        const cached = await IdbHelper.getAllStories();
        if (cached && cached.length) {
          this._stories = cached;
          this._view.renderStories(this._stories);
          this._view.updateStoryCount(this._stories.length);
          this._mapHelper.addStoryMarkers(this._stories, (story) => {
            this._handleMarkerClick(story.id);
          });
        } else {
          this._view.showError('No saved stories found.');
          this._stories = [];
          this._view.renderStories(this._stories);
          this._view.updateStoryCount(0);
        }
        return;
      }

      // Try network first
      const response = await this._storySource.getAllStories();
      
      // LOGIKA PENANGANAN MODE TAMU
      if (response && response.error) {
          this._stories = []; 
          this._view.renderStories(this._stories); 
          this._view.showError('🔒 Cerita tidak dapat dimuat. Silakan Login untuk melihat data.');
          this._view.updateStoryCount(0);
          return; 
      }

      this._stories = Array.isArray(response) ? response : [];
      
      this._view.renderStories(this._stories);
      this._view.updateStoryCount(this._stories.length);
      
      // Tampilkan marker di peta (dipanggil saat inisialisasi)
      this._mapHelper.addStoryMarkers(this._stories, (story) => {
        this._handleMarkerClick(story.id);
      });

    } catch (error) {
      // Fallback to IndexedDB when offline
      try {
        const cached = await IdbHelper.getAllStories();
        if (cached && cached.length) {
          this._stories = cached;
          this._view.renderStories(this._stories);
          this._view.updateStoryCount(this._stories.length);
          this._mapHelper.addStoryMarkers(this._stories, (story) => {
            this._handleMarkerClick(story.id);
          });
          this._view.showError('Mode offline: menampilkan data tersimpan.');
        } else {
          this._view.showError('Gagal memuat cerita karena masalah jaringan.');
        }
      } catch (e) {
        this._view.showError('Gagal memuat cerita karena masalah jaringan.');
      }
    } finally {
      this._view.hideLoading();
    }
  }

  // ⭐ FIX/AKTIVASI: FUNGSI FILTERING
  _filterStories(query) {
    const lowerCaseQuery = query.toLowerCase().trim();
    
    // Jika query kosong, tampilkan semua stories
    if (lowerCaseQuery === '') {
        this._view.renderStories(this._stories);
        this._mapHelper.addStoryMarkers(this._stories, (story) => {
            this._handleMarkerClick(story.id);
        });
        this._view.updateStoryCount(this._stories.length);
        return;
    }
    
    const filteredStories = this._stories.filter(story => 
      story.name.toLowerCase().includes(lowerCaseQuery) ||
      story.description.toLowerCase().includes(lowerCaseQuery)
    );
    
    this._view.renderStories(filteredStories);
    this._view.updateStoryCount(filteredStories.length);
    
    // Perbarui marker di peta sesuai hasil filter
    this._mapHelper.addStoryMarkers(filteredStories, (story) => {
      this._handleMarkerClick(story.id);
    });
  }

  // ⭐ FIX/AKTIVASI: FUNGSI SINKRONISASI (Card -> Map)
  _handleStoryCardClick(storyId) {
    if (this._isSyncEnabled) {
      this._mapHelper.highlightMarker(storyId);
      this._view.highlightStoryCard(storyId);
      this._view.scrollToStoryCard(storyId);
    }
  }

  // ⭐ FIX/AKTIVASI: FUNGSI SINKRONISASI (Map -> Card)
  _handleMarkerClick(storyId) {
    if (this._isSyncEnabled) {
      this._view.highlightStoryCard(storyId);
      // Peta otomatis meng-highlight marker yang diklik (sudah ada di map-helper)
      this._view.scrollToStoryCard(storyId);
    }
  }

  async refreshStories() {
    await this._loadStories();
  }

  destroy() {
    this._mapHelper.destroy();
  }
}

export default HomePresenter;