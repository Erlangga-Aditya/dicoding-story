const API_CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  ENDPOINTS: {
    REGISTER: '/register',
    LOGIN: '/login',
    ADD_STORY: '/stories',
    ADD_STORY_GUEST: '/stories/guest',
    GET_STORIES: '/stories',
    GET_STORY_DETAIL: '/stories',
  },
  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;