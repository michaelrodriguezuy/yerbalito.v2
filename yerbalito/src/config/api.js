// Configuración centralizada de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/login`,
  USER: `${API_BASE_URL}/user`,
  
  // Jugadores
  SQUAD: `${API_BASE_URL}/squad`,
  SQUAD_ALL: `${API_BASE_URL}/squad/all`,
  SQUAD_SEARCH: `${API_BASE_URL}/squad/search`,
  
  // Categorías
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORIES_ALL: `${API_BASE_URL}/categories/all`,
  CATEGORIES_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  
  // Estados
  ESTADOS: `${API_BASE_URL}/estados`,
  ESTADOS_BY_ID: (id) => `${API_BASE_URL}/estados/${id}`,
  
  // Pagos
  PAYMENTS: `${API_BASE_URL}/payments`,
  PAYMENTS_ANUAL: `${API_BASE_URL}/paymentsAnual`,
  ULTIMO_PAGO: (id) => `${API_BASE_URL}/ultimoPago/${id}`,
  
  // Fondo común
  FC: `${API_BASE_URL}/fc`,
  FC_MULTIPLE: `${API_BASE_URL}/fc/multiple`, // Pagar múltiples cuotas
  FC_ANUAL: `${API_BASE_URL}/fcAnual`,
  FC_X_CUOTAS: `${API_BASE_URL}/fcXcuotas`,
  
  // Cuotas
  CUOTAS_X_CAT: `${API_BASE_URL}/cuotasXcat`,
  
  // Posts/Blog
  POSTS: `${API_BASE_URL}/posts`,
  POSTS_BY_ID: (id) => `${API_BASE_URL}/posts/${id}`,
  BLOG_BY_ID: (id) => `${API_BASE_URL}/blog/${id}`,
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOGS_BY_ID: (id) => `${API_BASE_URL}/blogs/${id}`,
  
  // Noticias
  NOTICIAS: `${API_BASE_URL}/noticias`,
  NOTICIAS_ALL: `${API_BASE_URL}/noticias/all`,
  NOTICIAS_BY_ID: (id) => `${API_BASE_URL}/noticias/${id}`,
  NOTICIAS_CREATE: `${API_BASE_URL}/noticias/create`,
  NOTICIAS_UPDATE: (id) => `${API_BASE_URL}/noticias/update/${id}`,
  NOTICIAS_DELETE: (id) => `${API_BASE_URL}/noticias/delete/${id}`,
  
  // Contacto
  CONTACT: `${API_BASE_URL}/contact`,
  
  // Uploads
  UPLOADS: `${API_BASE_URL}/uploads`,
  
  // Valores de cuotas y fondo de campeonato
  VALORES: `${API_BASE_URL}/valores`,
  
  // Fixture
  FIXTURE: `${API_BASE_URL}/fixture`,
  FIXTURE_CATEGORIAS: `${API_BASE_URL}/fixture/categorias`,
  FIXTURE_BULK: `${API_BASE_URL}/fixture/bulk`,
  
  // Cumpleaños
  CUMPLES: `${API_BASE_URL}/cumples`,
};

export default API_BASE_URL;
