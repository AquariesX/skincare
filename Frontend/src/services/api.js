import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// ── Prediction ────────────────────────────────────────────────
export const predictSkin = (imageFile) => {
  const form = new FormData()
  form.append('image', imageFile)
  return api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ── User ──────────────────────────────────────────────────────
export const getProfile = () => api.get('/user/profile')
export const updateProfile = (data) => api.put('/user/profile', data)
export const getUserHistory = (page = 1) =>
  api.get(`/user/analysis-history?page=${page}&per_page=10`)

// ── Analysis ──────────────────────────────────────────────────
export const getAnalysis = (id) => api.get(`/analysis/${id}`)

// ── Skin Types ────────────────────────────────────────────────
export const getSkinTypes = () => api.get('/skin-types')
export const adminCreateSkinType = (data) => api.post('/admin/skin-types', data)
export const adminUpdateSkinType = (id, data) => api.put(`/admin/skin-types/${id}`, data)
export const adminDeleteSkinType = (id) => api.delete(`/admin/skin-types/${id}`)

// ── Recommendations ───────────────────────────────────────────
export const getRecommendations = () => api.get('/recommendations')
export const getRecommendation = (skinTypeId) =>
  api.get(`/recommendations/${skinTypeId}`)
export const adminCreateRecommendation = (data) =>
  api.post('/admin/recommendations', data)
export const adminUpdateRecommendation = (id, data) =>
  api.put(`/admin/recommendations/${id}`, data)
export const adminDeleteRecommendation = (id) =>
  api.delete(`/admin/recommendations/${id}`)

// ── Products ──────────────────────────────────────────────────
export const getProducts = (skinTypeId = null) => {
  const params = skinTypeId ? `?skin_type_id=${skinTypeId}` : ''
  return api.get(`/products${params}`)
}
export const getProduct = (id) => api.get(`/products/${id}`)
export const getProductsBySkinType = (skinTypeId) =>
  api.get(`/products/skin-type/${skinTypeId}`)
export const adminCreateProduct = (formData) =>
  api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const adminUpdateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`)

// ── Blogs ─────────────────────────────────────────────────────
export const getBlogs = () => api.get('/blogs')
export const getBlog = (slug) => api.get(`/blogs/${slug}`)
export const adminCreateBlog = (formData) =>
  api.post('/admin/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const adminUpdateBlog = (id, formData) =>
  api.put(`/admin/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const adminDeleteBlog = (id) => api.delete(`/admin/blogs/${id}`)

// ── Admin ─────────────────────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard')
export const getAdminStats = () => api.get('/admin/stats')
export const getAdminUsers = (page = 1) =>
  api.get(`/admin/users?page=${page}&per_page=20`)
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data)
export const getAdminAnalysisRecords = (page = 1) =>
  api.get(`/admin/analysis-records?page=${page}&per_page=20`)
export const getAdminUserLogs = (page = 1) =>
  api.get(`/admin/user-logs?page=${page}&per_page=30`)

// ── Health ────────────────────────────────────────────────────
export const checkHealth = () => api.get('/health')

export default api
