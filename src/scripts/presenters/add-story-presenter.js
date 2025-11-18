import StorySource from '../data/story-source.js';
import MapHelper from '../utils/map-helper.js'; 
import CameraHelper from '../utils/camera-helper.js'; 
import { IdbHelper } from '../utils/idb-helper.js';

class AddStoryPresenter {
  constructor({ view }) {
    this._view = view; 
    this._storySource = StorySource;
    this._mapHelper = new MapHelper('add-story-map');
    this._cameraHelper = new CameraHelper();
    this._capturedPhotoBlob = null; // Menyimpan foto dari kamera
    
    this._setupForm();
    this._setupMap();
  }

  _setupForm() {
    // Mengambil elemen dari View (MVP Pattern)
    this._form = this._view.getFormElement();
    this._nameInput = this._view.getNameInput();
    this._descriptionInput = this._view.getDescriptionInput();
    this._photoInput = this._view.getPhotoInput();
    this._removePhotoBtn = this._view.getRemovePhotoBtn();
    this._cameraVideo = this._view.getCameraVideoElement();
    this._cameraCanvas = this._view.getCameraCanvasElement();
    this._captureBtn = this._view.getCaptureBtn();
    this._closeCameraBtn = this._view.getCloseCameraBtn();
    this._uploadBtn = this._view.getUploadBtn();
    this._cameraBtn = this._view.getCameraBtn();
    
    // Event listeners
    this._form.addEventListener('submit', this._handleSubmit.bind(this));
    this._photoInput.addEventListener('change', this._handleFileChange.bind(this));
    this._removePhotoBtn.addEventListener('click', this._handleRemovePhoto.bind(this));
    
    // Camera Handlers
    this._cameraBtn.addEventListener('click', this._handleStartCamera.bind(this));
    this._closeCameraBtn.addEventListener('click', this._handleCloseCamera.bind(this));
    this._captureBtn.addEventListener('click', this._handleCapturePhoto.bind(this));
    this._uploadBtn.addEventListener('click', this._handleUploadClick.bind(this));

    // Validasi saat input berubah (Real-time Validation)
    [this._nameInput, this._descriptionInput].forEach(input => {
      input.addEventListener('input', () => this._validateInput(input));
    });
  }

  _setupMap() {
    this._mapHelper.initMap([-2.5489, 118.0149], 5); // Init peta Indonesia
    
    // Aktifkan klik peta untuk mendapatkan lokasi
    this._mapHelper.enableClickForLocation((lat, lon) => {
      this._view.updateLocationDisplay(lat, lon);
      this._validateLocation(); 
    });
  }
  
  // LOGIKA VALIDASI
  _validateInput(inputElement) {
    const inputName = inputElement.name;

    // Validasi Name
    if (inputName === 'name' && inputElement.value.length < 3) {
      this._view.showInputError(inputName, 'Nama minimal 3 karakter.');
      return false;
    }
    // Validasi Description
    if (inputName === 'description' && inputElement.value.length < 10) {
      this._view.showInputError(inputName, 'Deskripsi minimal 10 karakter.');
      return false;
    }
    
    this._view.hideInputError(inputName); 
    return true;
  }
  // END LOGIKA VALIDASI

  _validateLocation() {
    const location = this._mapHelper.getSelectedLocation();
    if (!location) {
      this._view.showInputError('location', 'Lokasi wajib dipilih.');
      return false;
    }
    this._view.hideInputError('location');
    return true;
  }
  
  _validatePhoto() {
    if (!this._photoInput.files[0] && !this._capturedPhotoBlob) {
      this._view.showInputError('photo', 'Foto wajib diunggah atau diambil.');
      return false;
    }
    this._view.hideInputError('photo');
    return true;
  }
  
  _validateForm() {
    const isNameValid = this._validateInput(this._nameInput);
    const isDescriptionValid = this._validateInput(this._descriptionInput);
    const isLocationValid = this._validateLocation();
    const isPhotoValid = this._validatePhoto();
    
    return isNameValid && isDescriptionValid && isLocationValid && isPhotoValid;
  }
  
  // LOGIKA CAMERA
  async _handleStartCamera() {
    try {
        this._view.showLoading();
        this._photoInput.value = ''; 
        this._capturedPhotoBlob = null;
        this._view.hidePhotoPreview();
        this._view.showCameraSection();
        await this._cameraHelper.startCamera(this._cameraVideo);
        this._view.hideLoading();
    } catch (error) {
        this._view.showFormMessage('danger', 'Gagal akses kamera.');
        this._view.hideCameraSection();
        this._view.hideLoading();
    }
  }

  _handleCloseCamera() {
    this._cameraHelper.stopCamera();
    this._view.hideCameraSection();
  }

  async _handleCapturePhoto() {
    try {
        this._view.showLoading();
        const photoBlob = await this._cameraHelper.capturePhoto(this._cameraCanvas);
        this._capturedPhotoBlob = photoBlob;
        
        this._view.showPhotoPreview(URL.createObjectURL(photoBlob));
        this._handleCloseCamera();
        this._validatePhoto(); 
        this._view.hideLoading();
    } catch (error) {
        this._view.showFormMessage('danger', 'Gagal ambil foto.');
        this._view.hideLoading();
    }
  }

  _handleUploadClick() {
    this._photoInput.click();
    this._handleCloseCamera();
  }

  _handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      this._capturedPhotoBlob = null; 
      this._view.showPhotoPreview(URL.createObjectURL(file));
      this._validatePhoto();
    }
  }

  _handleRemovePhoto() {
    this._photoInput.value = ''; 
    this._capturedPhotoBlob = null; 
    this._view.hidePhotoPreview();
    this._validatePhoto();
  }
  // END LOGIKA CAMERA

  async _handleSubmit(event) {
    event.preventDefault();

    if (!this._validateForm()) {
      this._view.showFormMessage('danger', '❌ Mohon periksa kembali input Anda.');
      return;
    }

    const location = this._mapHelper.getSelectedLocation();
    const photoFile = this._capturedPhotoBlob || this._photoInput.files[0];

    // Buat FormData untuk POST request
    const formData = new FormData();
    formData.append('description', this._descriptionInput.value);
    
    // ⭐ PERBAIKAN KRITIS: Hapus formData.append('name', this._nameInput.value); 
    // Karena API /stories (dengan token) tidak mengizinkan field "name".
    formData.append('photo', photoFile, 'story-photo.jpeg'); 
    
    if (location) {
        formData.append('lat', location.lat);
        formData.append('lon', location.lon);
    }

    try {
      this._view.showLoading();
      this._view.disableSubmitButton(true);

      // Panggil API addStory (dengan token)
      await this._storySource.addStory(formData); 
      
      this._view.showFormMessage('success', '🎉 Story berhasil dibagikan!');
      this._view.resetForm();
      this._mapHelper.destroy(); 
      
      // Redirect ke home setelah 2 detik
      setTimeout(() => {
        const appInstance = window.__appInstance;
        if (appInstance && typeof appInstance.requestHomeRefresh === 'function') {
          appInstance.requestHomeRefresh();
        } else {
          window.location.hash = '#/';
        }
      }, 2000);

    } catch (error) {
      // Offline: queue to outbox for later sync
      if (!navigator.onLine) {
        await IdbHelper.addToOutbox({
          type: 'add-story',
          createdAt: Date.now(),
          payload: {
            description: this._descriptionInput.value,
            photoBase64: this._capturedPhotoBlob ? await blobToBase64(this._capturedPhotoBlob) : null,
            photoFileName: 'story-photo.jpeg',
            location,
          },
        });
        this._view.showFormMessage('success', '📦 Disimpan offline. Akan diunggah saat online.');
        this._view.resetForm();
        setTimeout(() => {
          const appInstance = window.__appInstance;
          if (appInstance && typeof appInstance.requestHomeRefresh === 'function') {
            appInstance.requestHomeRefresh();
          } else {
            window.location.hash = '#/';
          }
        }, 1500);
      } else {
        this._view.showFormMessage('danger', `❌ Gagal membagikan story: ${error.message}`);
      }
    } finally {
      this._view.hideLoading();
      this._view.disableSubmitButton(false);
    }
  }
  
  // Clean up
  destroy() {
    this._mapHelper.destroy();
    this._cameraHelper.stopCamera();
  }
}

export default AddStoryPresenter;