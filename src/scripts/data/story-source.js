import API_CONFIG from '../config/api-config.js';
import AuthHelper from '../utils/auth-helper.js';

class StorySource {
  // Get all stories with location data
  static async getAllStories() {
    const token = AuthHelper.getAuthToken();
    
    // Siapkan header. Jika token ada, sertakan Authorization.
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      // API Dicoding Stories bisa diakses publik (tanpa token) untuk GET
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_STORIES}?location=1`, {
        method: 'GET',
        headers: headers,
      });

      const responseJson = await response.json();

      // Jika ada error 401, anggap saja ini mode publik/tamu dan tidak throw error
      if (response.status === 401) {
          console.warn('Gagal memuat stories: Token tidak valid atau kadaluarsa. Menganggap mode Tamu.');
          // Kembalikan objek yang mengindikasikan kegagalan token
          return { error: true, message: 'Token invalid, data mungkin tidak lengkap.' };
      }

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson.listStory;
      
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  // Get story detail by ID (Dengan token opsional)
  static async getStoryDetail(id) {
    const token = AuthHelper.getAuthToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_STORY_DETAIL}/${id}`, {
        method: 'GET',
        headers: headers,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.story;
    } catch (error) {
      console.error('Error fetching story detail:', error);
      throw error;
    }
  }

  // Add new story (Wajib Token)
  static async addStory(formData) {
    const token = AuthHelper.getAuthToken();
    if (!token) {
        throw new Error('Anda harus login untuk menambah cerita.');
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_STORY}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, 
        },
        body: formData,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  // Register new user
  static async register(name, email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      if (!responseJson.loginResult) {
         throw new Error('Login failed: Token not received.');
      }
      return responseJson.loginResult;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
}

export default StorySource;