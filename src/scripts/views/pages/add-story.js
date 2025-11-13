const AddStoryPage = {
  async render() {
    return `
      <div class="container">
        <section class="form-section">
          <div class="form-header">
            <h2 class="form-title">📝 Tambah Story Baru</h2>
            <p class="form-description">Bagikan cerita dan pengalaman Anda dengan komunitas</p>
          </div>
          <form id="add-story-form" class="story-form" novalidate>
            <div class="form-group">
              <label for="name-input" class="form-label">Nama Anda *</label>
              <input 
                type="text" 
                id="name-input" 
                name="name"
                class="form-input"
                placeholder="Masukkan nama Anda"
                required
                minlength="3"
                aria-required="true"
              />
              <span class="error-message" id="name-error"></span>
            </div>
            <div class="form-group">
              <label for="description-input" class="form-label">Cerita Anda *</label>
              <textarea 
                id="description-input" 
                name="description"
                class="form-textarea"
                placeholder="Ceritakan pengalaman Anda..."
                required
                minlength="10"
                rows="5"
                aria-required="true"
              ></textarea>
              <span class="error-message" id="description-error"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Foto Story *</label>
                            <div class="photo-options">
                <button type="button" id="upload-btn" class="btn btn-secondary">
                  📁 Upload Foto
                </button>
                <button type="button" id="camera-btn" class="btn btn-secondary">
                  📷 Ambil dari Kamera
                </button>
              </div>
              <input 
                type="file" 
                id="photo-input" 
                name="photo"
                accept="image/*"
                class="file-input"
                required
                aria-required="true"
                style="display: none;"
              />
              <div id="camera-section" class="camera-section" style="display: none;">
                <video id="camera-video" class="camera-video" autoplay playsinline aria-label="Camera preview"></video>
                <div class="camera-controls">
                  <button type="button" id="capture-btn" class="btn btn-primary">📸 Ambil Foto</button>
                  <button type="button" id="close-camera-btn" class="btn btn-danger">❌ Tutup Kamera</button>
                </div>
                <canvas id="camera-canvas" style="display: none;"></canvas>
              </div>
              <div id="photo-preview" class="photo-preview" style="display: none;">
                <img id="preview-image" src="" alt="Preview foto" class="preview-image" />
                <button type="button" id="remove-photo-btn" class="btn btn-danger btn-sm">❌ Hapus Foto</button>
              </div>
              <span class="error-message" id="photo-error"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Lokasi Story *</label>
              <p class="form-hint">Klik pada peta untuk memilih lokasi</p>
                            <div id="location-display" class="location-display">
                <span id="location-text">📍 Belum ada lokasi dipilih</span>
              </div>
              <div id="add-story-map" class="map-container-small" role="application" aria-label="Pilih lokasi pada peta"></div>
                            <span class="error-message" id="location-error"></span>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-large" id="submit-btn">
                ✨ Bagikan Story
              </button>
            </div>
          </form>
          <div id="form-message" class="form-message" style="display: none;"></div>
        </section>
      </div>
    `;
  },
  
  async afterRender() {
    // Dipanggil setelah HTML dirender
    // Presenter akan diinisialisasi di app.js
  },

  // METHOD BARU UNTUK MENDAPATKAN ELEMEN DOM (VIEW METHOD)
  getFormElement: () => document.getElementById('add-story-form'),
  getNameInput: () => document.getElementById('name-input'),
  getDescriptionInput: () => document.getElementById('description-input'),
  getPhotoInput: () => document.getElementById('photo-input'),
  getPhotoPreviewElement: () => document.getElementById('photo-preview'),
  getRemovePhotoBtn: () => document.getElementById('remove-photo-btn'),
  getCameraVideoElement: () => document.getElementById('camera-video'),
  getCameraCanvasElement: () => document.getElementById('camera-canvas'),
  getCameraSection: () => document.getElementById('camera-section'),
  getCaptureBtn: () => document.getElementById('capture-btn'),
  getCloseCameraBtn: () => document.getElementById('close-camera-btn'),
  getUploadBtn: () => document.getElementById('upload-btn'),
  getCameraBtn: () => document.getElementById('camera-btn'),
  getSubmitBtn: () => document.getElementById('submit-btn'),

  // Method untuk fungsionalitas View (tampilkan/sembunyikan pesan, dll)
  showLoading: () => document.getElementById('loading-overlay').classList.add('active'),
  hideLoading: () => document.getElementById('loading-overlay').classList.remove('active'),
  
  updateLocationDisplay: (lat, lon) => {
    document.getElementById('location-text').textContent = `📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (Lokasi dipilih)`;
  },
  
  showPhotoPreview: (url) => {
    document.getElementById('preview-image').src = url;
    document.getElementById('photo-preview').style.display = 'block';
  },

  hidePhotoPreview: () => {
    document.getElementById('preview-image').src = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('location-text').textContent = '📍 Belum ada lokasi dipilih';
  },
  
  showCameraSection: () => {
    document.getElementById('camera-section').style.display = 'block';
  },

  hideCameraSection: () => {
    document.getElementById('camera-section').style.display = 'none';
  },

  showFormMessage: (type, message) => {
    const msgElement = document.getElementById('form-message');
    msgElement.className = `form-message ${type}`;
    msgElement.textContent = message;
    msgElement.style.display = 'block';
  },
  
  showInputError: (inputName, message) => {
    document.getElementById(`${inputName}-error`).textContent = message;
  },

  hideInputError: (inputName) => {
    document.getElementById(`${inputName}-error`).textContent = '';
  },

  disableSubmitButton: (state) => {
    document.getElementById('submit-btn').disabled = state;
  },

  resetForm: () => {
    document.getElementById('add-story-form').reset();
    document.getElementById('form-message').style.display = 'none';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('location-text').textContent = '📍 Belum ada lokasi dipilih';
  },
};

export default AddStoryPage;