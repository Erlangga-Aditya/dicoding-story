// file: src/scripts/routes/routes.js (GANTI TOTAL)
import HomePage from '../views/pages/home.js'; 
import AddStoryPage from '../views/pages/add-story.js';
import AboutPage from '../views/pages/about.js';
import LoginPage from '../views/pages/login-page.js'; // ⭐ FIXED: Import Login
import RegisterPage from '../views/pages/register-page.js'; // ⭐ FIXED: Import Register

const routes = {
  '/': HomePage,
  '/add': AddStoryPage,
  '/about': AboutPage,
  '/auth': LoginPage,     
  '/register': RegisterPage, 
};

export default routes;