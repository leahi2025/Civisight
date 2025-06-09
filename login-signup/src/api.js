import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;

// include the CSRF token on mutating requests
// (Django will set a 'csrftoken' cookie on your first GET)
//axios.defaults.headers.common['X-CSRFToken'] = Cookies.get('csrftoken');

// optional: set a base URL so you don’t repeat it everywhere
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

axios.interceptors.request.use(config => {
  const csrftoken = Cookies.get('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
});


export default axios;