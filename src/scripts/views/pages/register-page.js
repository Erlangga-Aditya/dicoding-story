// file: src/scripts/views/pages/register-page.js (NEW FILE)

const RegisterPage = {
  async render() {
    return `
      <div class="container">
        <section class="form-section login-section">
          <div class="form-header">
            <h2 class="form-title">✍️ Daftar Akun Baru</h2>
            <p class="form-description">Buat akun untuk mulai berbagi cerita</p>
          </div>
          
          <form id="register-form" class="story-form" novalidate>
            <div class="form-group">
              <label for="register-name" class="form-label">Nama Lengkap</label>
              <input type="text" id="register-name" name="name" class="form-input" placeholder="Masukkan Nama Anda" required aria-required="true" minlength="3" />
              <span class="error-message" id="name-error"></span>
            </div>
            
            <div class="form-group">
              <label for="register-email" class="form-label">Email</label>
              <input type="email" id="register-email" name="email" class="form-input" placeholder="contoh@dicoding.com" required aria-required="true" />
              <span class="error-message" id="email-error"></span>
            </div>
            
            <div class="form-group">
              <label for="register-password" class="form-label">Password</label>
              <input type="password" id="register-password" name="password" class="form-input" placeholder="Password minimal 8 karakter" required aria-required="true" minlength="8" />
              <span class="error-message" id="password-error"></span>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-large" id="register-btn">
                ✅ Daftar
              </button>
            </div>
          </form>
          
          <div id="auth-message" class="form-message" style="display: none;"></div>

          <div class="form-footer">
            <p>Sudah punya akun? <a href="#/auth" id="login-link">Login di sini</a></p>
          </div>
        </section>
      </div>
    `;
  },
  
  async afterRender() {
    // Logic afterRender tetap sama
  },
  
  // Metode View untuk Register
  getFormElement: () => document.getElementById('register-form'),
  getNameInput: () => document.getElementById('register-name'),
  getEmailInput: () => document.getElementById('register-email'),
  getPasswordInput: () => document.getElementById('register-password'),

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
    document.getElementById('register-btn').disabled = state;
  },
};

export default RegisterPage;