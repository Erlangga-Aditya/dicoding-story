import UrlParser from './routes/url-parser.js';
import routes from './routes/routes.js';
import HomePresenter from './presenters/home-presenter.js';
import AddStoryPresenter from './presenters/add-story-presenter.js';

class App {
  constructor({ content, loadingOverlay }) {
    this._content = content;
    this._loadingOverlay = loadingOverlay;
    this._currentPresenter = null;

    this._initialAppShell();
  }

  _initialAppShell() {
    this._showLoading();
    // Tambahkan listener untuk event hashchange (Basic Criteria - Hash Routing)
    window.addEventListener('hashchange', () => this._urlChangeHandler());
    // Tambahkan listener untuk event load pertama kali
    window.addEventListener('load', () => {
        this._urlChangeHandler();
        this._hideLoading();
    });
  }

  async _urlChangeHandler() {
    // 1. Dapatkan URL yang di-request
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url];
    
    // Jika ada presenter aktif dari halaman sebelumnya, panggil method destroy
    if (this._currentPresenter && this._currentPresenter.destroy) {
      this._currentPresenter.destroy();
      this._currentPresenter = null;
    }

    if (page) {
        // Cek apakah browser mendukung View Transitions API (Advance Criteria)
        if (document.startViewTransition) {
            document.startViewTransition(async () => {
                await this._renderPage(page);
            });
        } else {
            // Fallback jika tidak didukung
            await this._renderPage(page);
        }
    } else {
        // Redirect ke halaman 404 atau Home jika route tidak ditemukan
        window.location.hash = '#/';
    }
  }

  async _renderPage(page) {
    this._showLoading();
    
    // 2. Render HTML view
    this._content.innerHTML = await page.render();
    this._content.scrollTop = 0; // Scroll ke atas
    
    // 3. Panggil Presenter untuk logic
    if (page.afterRender) {
      // 4. Inisialisasi Presenter berdasarkan halaman
      if (page.name === 'HomePage') {
        this._currentPresenter = new HomePresenter({ view: page });
      } else if (page.name === 'AddStoryPage') {
        this._currentPresenter = new AddStoryPresenter({ view: page });
      }
      
      // Panggil afterRender setelah Presenter diinisialisasi
      await page.afterRender();
    }
    
    this._hideLoading();
  }

  _showLoading() {
    this._loadingOverlay.classList.add('active');
  }

  _hideLoading() {
    this._loadingOverlay.classList.remove('active');
  }
}

export default App;