// file: src/scripts/presenters/auth-presenter.js (GANTI TOTAL)

import StorySource from '../data/story-source.js';
import AuthHelper from '../utils/auth-helper.js';

class AuthPresenter {
  constructor({ view }) {
    this._view = view;
    this._storySource = StorySource;

    this._setupForm();
  }

  _setupForm() {
    this._form = this._view.getFormElement();
    this._nameInput = this._view.getNameInput ? this._view.getNameInput() : null; // Cek jika ada input name
    this._emailInput = this._view.getEmailInput();
    this._passwordInput = this._view.getPasswordInput();
    
    this._form.addEventListener('submit', this._handleSubmit.bind(this));
  }

  _validateForm() {
    // Kita cek URL untuk tahu apakah ini Register atau Login
    const isRegister = window.location.hash.includes('#/register'); 
    const email = this._emailInput.value;
    const password = this._passwordInput.value;
    
    let isValid = true;

    // Validasi Nama (hanya untuk Register)
    if (isRegister) {
        if (!this._nameInput.value || this._nameInput.value.length < 3) {
            this._view.showInputError('name', 'Nama minimal 3 karakter.');
            isValid = false;
        } else {
            this._view.hideInputError('name');
        }
    }

    // Validasi Email
    if (!email || !email.includes('@')) {
      this._view.showInputError('email', 'Format email tidak valid.');
      isValid = false;
    } else {
      this._view.hideInputError('email');
    }

    // Validasi Password
    if (!password || password.length < 6) {
      this._view.showInputError('password', 'Password minimal 6 karakter.');
      isValid = false;
    } else {
      this._view.hideInputError('password');
    }

    return isValid;
  }

  async _handleSubmit(event) {
    event.preventDefault();

    if (!this._validateForm()) {
      this._view.showAuthMessage('danger', '❌ Mohon periksa input Anda.');
      return;
    }

    const isRegister = window.location.hash.includes('#/register');
    const email = this._emailInput.value;
    const password = this._passwordInput.value;
    const name = this._nameInput ? this._nameInput.value : null;

    try {
      this._view.showLoading();
      this._view.disableSubmitButton(true);

      if (isRegister) {
          // PROSES REGISTER
          await this._storySource.register(name, email, password);
          this._view.showAuthMessage('success', '✅ Registrasi Berhasil! Silakan Login.');
          
          setTimeout(() => {
              window.location.hash = '#/auth';
          }, 2000);
          
      } else {
          // PROSES LOGIN
          const loginResult = await this._storySource.login(email, password);
          
          AuthHelper.storeAuthData({ 
            token: loginResult.token, 
            user: { name: loginResult.name, userId: loginResult.userId } 
          });
          
          this._view.showAuthMessage('success', '✅ Login Berhasil! Mengalihkan...');
          
          setTimeout(() => {
            const appInstance = window.__appInstance;
            if (appInstance && typeof appInstance.requestHomeRefresh === 'function') {
              appInstance.requestHomeRefresh();
            } else {
              window.location.hash = '#/';
            }
          }, 1000);
      }

    } catch (error) {
      this._view.showAuthMessage('danger', `❌ Gagal ${isRegister ? 'Registrasi' : 'Login'}: ${error.message}`);
    } finally {
      this._view.hideLoading();
      this._view.disableSubmitButton(false);
    }
  }
}

export default AuthPresenter;