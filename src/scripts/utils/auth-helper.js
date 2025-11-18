// file: src/scripts/utils/auth-helper.js

const AUTH_KEY = 'story_app_auth_token';
const USER_KEY = 'story_app_user';

const AuthHelper = {
  // Menyimpan token dan informasi user ke localStorage
  storeAuthData({ token, user }) {
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Mengambil token otorisasi
  getAuthToken() {
    return localStorage.getItem(AUTH_KEY);
  },

  // Mengambil informasi user
  getUserInfo() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Mengecek apakah user sudah login
  isLoggedIn() {
    return !!this.getAuthToken();
  },

  // Menghapus token (Logout)
  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default AuthHelper;