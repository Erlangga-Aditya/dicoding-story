// file: src/scripts/views/pages/auth-page.js

const AuthPage = {
  async render() {
    return `
      <div class="container">
        <section class="form-section login-section">
          <div class="form-header">
            <h2 class="form-title">👋 Selamat Datang </h2>
            <p class="form-description">Silakan Login untuk berbagi cerita</p>
          </div>
          
          <form id="login-form" class="story-form" novalidate>
            <div class="form-group">
              <label for="login-email" class="form-label">Email</label>
              <input type="email" id="login-email" name="email" class="form-input" placeholder="contoh@dicoding.com" required aria-required="true" />
              <span class="error-message" id="email-error"></span>
            </div>
            
            <div class="form-group">
              <label for="login-password" class="form-label">Password</label>
              <input type="password" id="login-password" name="password" class="form-input" placeholder="Masukkan password Anda" required aria-required="true" />
              <span class="error-message" id="password-error"></span>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-large" id="login-btn">
                ➡️ Login
              </button>
            </div>
          </form>
          
          <div id="auth-message" class="form-message" style="display: none;"></div>

          <div class="form-footer">
            <p>Belum punya akun? <a href="#/register" id="register-link">Daftar di sini</a></p>
          </div>
        </section>
      </div>
    `;
  },
  
  async afterRender() {
    // Dipanggil setelah HTML dirender
  },
  
  // Method View untuk AuthPage
  getFormElement: () => document.getElementById('login-form'),
  getEmailInput: () => document.getElementById('login-email'),
  getPasswordInput: () => document.getElementById('login-password'),
  
  showLoading: () => document.getElementById('loading-overlay').classList.add('active'),
  hideLoading: () => document.getElementById('loading-overlay').classList.remove('active'),
  
  showInputError: (inputName, message) => {
    document.getElementById(`${inputName}-error`).textContent = message;
  },

  hideInputError: (inputName) => {
    document.getElementById(`${inputName}-error`).textContent = '';
  },
  
  showAuthMessage: (type, message) => {
    const msgElement = document.getElementById('auth-message');
    msgElement.className = `form-message ${type}`;
    msgElement.textContent = message;
    msgElement.style.display = 'block';
  },

  disableSubmitButton: (state) => {
    document.getElementById('login-btn').disabled = state;
  },
};

export default AuthPage;