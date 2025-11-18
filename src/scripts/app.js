// file: src/scripts/app.js (GANTI TOTAL)
import UrlParser from './routes/url-parser.js';
import routes from './routes/routes.js';
import HomePresenter from './presenters/home-presenter.js';
import AddStoryPresenter from './presenters/add-story-presenter.js';
import AuthPresenter from './presenters/auth-presenter.js'; 
import AuthHelper from './utils/auth-helper.js';

class App { // Pastikan Class App ada
  constructor({ content, loadingOverlay, navContainer }) {
    this._content = content;
    this._loadingOverlay = loadingOverlay;
    this._navContainer = navContainer; 
    this._currentPresenter = null;
    this._pendingHomeRefresh = false;

    window.__appInstance = this;

    this._initialAppShell();
  }

  _initialAppShell() {
    this._showLoading();
    this._renderNavigation();
    
    window.addEventListener('hashchange', () => {
        this._urlChangeHandler();
        this._renderNavigation(); 
    });
    
    window.addEventListener('load', () => {
      this._urlChangeHandler();
      this._hideLoading();
    });
  }
  
  _renderNavigation() {
    const isLoggedIn = AuthHelper.isLoggedIn();
    const userInfo = AuthHelper.getUserInfo();

    let navHTML = '';

    if (isLoggedIn) {
        navHTML = `
            <ul class="nav-list">
                <li><a href="#/" class="nav-link">Home</a></li>
                <li><a href="#/add" class="nav-link">Tambah Story</a></li>
                <li class="user-info">Halo, ${userInfo.name}</li>
                <li><button id="logout-btn" class="nav-link btn-danger" aria-label="Logout">Logout</button></li>
            </ul>
        `;
    } else {
        navHTML = `
            <ul class="nav-list">
                <li><a href="#/" class="nav-link">Home</a></li>
                <li><a href="#/about" class="nav-link">About</a></li>
                <li><a href="#/auth" class="nav-link btn-primary" aria-label="Halaman Login">Login</a></li>
            </ul>
        `;
    }
    
    this._navContainer.innerHTML = navHTML;
    
    if (isLoggedIn) {
        document.getElementById('logout-btn').addEventListener('click', this._handleLogout.bind(this));
    }
  }
  
  async _handleLogout() {
    AuthHelper.logout();
    this._renderNavigation();
    await this.requestHomeRefresh();
  }

  async _urlChangeHandler() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    let page = routes[url];

    if (url === '/add' && !AuthHelper.isLoggedIn()) {
        window.location.hash = '#/auth'; 
        return;
    }

    if (!page) {
        page = routes['/']; 
        window.location.hash = '#/';
    }
    
    if (this._currentPresenter && this._currentPresenter.destroy) {
      this._currentPresenter.destroy();
      this._currentPresenter = null;
    }

    if (page) {
      if (document.startViewTransition) {
          document.startViewTransition(async () => {
              await this._renderPage(page, url);
          });
      } else {
          await this._renderPage(page, url);
      }
    }
  }

  async _renderPage(page, url) {
    this._showLoading();
    
    this._content.innerHTML = await page.render();
    this._content.scrollTop = 0; 

    if (page.afterRender) {
      
      if (url === '/') {
        this._currentPresenter = new HomePresenter({ view: page });
      } else if (url === '/add') {
        this._currentPresenter = new AddStoryPresenter({ view: page });
      } else if (url === '/auth' || url === '/register') {
        this._currentPresenter = new AuthPresenter({ view: page });
      }

      await page.afterRender();
    }
    
    await this._maybeRefreshHomePresenter();
    
    this._hideLoading();
  }

  _showLoading() {
    this._loadingOverlay.classList.add('active');
  }

  _hideLoading() {
    this._loadingOverlay.classList.remove('active');
  }

  async requestHomeRefresh() {
    this._pendingHomeRefresh = true;
    const currentRoute = UrlParser.parseActiveUrlWithCombiner();
    if (currentRoute !== '/') {
      if (window.location.hash !== '#/') {
        window.location.hash = '#/';
      } else {
        await this._maybeRefreshHomePresenter();
      }
    } else {
      await this._maybeRefreshHomePresenter();
    }
  }

  async _maybeRefreshHomePresenter() {
    if (this._pendingHomeRefresh && this._currentPresenter && typeof this._currentPresenter.refreshStories === 'function') {
      await this._currentPresenter.refreshStories();
      this._pendingHomeRefresh = false;
    }
  }
}

export default App; // ⭐ FIXED: Memastikan Class App diexport