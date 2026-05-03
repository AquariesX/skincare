import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import Products from './pages/Products'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'

import UserDashboard from './pages/UserDashboard'
import AnalysisHistory from './pages/AnalysisHistory'
import Profile from './pages/Profile'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageBlogs from './pages/admin/ManageBlogs'
import AddEditBlog from './pages/admin/AddEditBlog'
import ManageProducts from './pages/admin/ManageProducts'
import AddEditProduct from './pages/admin/AddEditProduct'
import ManageRecommendations from './pages/admin/ManageRecommendations'
import UsersList from './pages/admin/UsersList'
import AnalysisRecords from './pages/admin/AnalysisRecords'
import UserLogs from './pages/admin/UserLogs'

const ADMIN_LAYOUT_ROUTES = [
  '/admin',
  '/admin/blogs',
  '/admin/blogs/new',
  '/admin/products',
  '/admin/products/new',
  '/admin/recommendations',
  '/admin/users',
  '/admin/records',
  '/admin/logs',
]

function AppShell({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with Navbar + Footer */}
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/analyze" element={<AppShell><Analyze /></AppShell>} />
      <Route path="/results" element={<AppShell><Results /></AppShell>} />
      <Route path="/products" element={<AppShell><Products /></AppShell>} />
      <Route path="/blog" element={<AppShell><Blog /></AppShell>} />
      <Route path="/blog/:slug" element={<AppShell><BlogDetail /></AppShell>} />
      <Route path="/about" element={<AppShell><About /></AppShell>} />
      <Route path="/login" element={<AppShell><Login /></AppShell>} />
      <Route path="/signup" element={<AppShell><Signup /></AppShell>} />

      {/* User routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><AppShell><UserDashboard /></AppShell></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute><AppShell><AnalysisHistory /></AppShell></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>
      } />

      {/* Admin routes — no outer Footer/Navbar, admin has its own layout */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/blogs" element={
        <AdminRoute><ManageBlogs /></AdminRoute>
      } />
      <Route path="/admin/blogs/new" element={
        <AdminRoute><AddEditBlog /></AdminRoute>
      } />
      <Route path="/admin/blogs/:id/edit" element={
        <AdminRoute><AddEditBlog /></AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute><ManageProducts /></AdminRoute>
      } />
      <Route path="/admin/products/new" element={
        <AdminRoute><AddEditProduct /></AdminRoute>
      } />
      <Route path="/admin/products/:id/edit" element={
        <AdminRoute><AddEditProduct /></AdminRoute>
      } />
      <Route path="/admin/recommendations" element={
        <AdminRoute><ManageRecommendations /></AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute><UsersList /></AdminRoute>
      } />
      <Route path="/admin/records" element={
        <AdminRoute><AnalysisRecords /></AdminRoute>
      } />
      <Route path="/admin/logs" element={
        <AdminRoute><UserLogs /></AdminRoute>
      } />
    </Routes>
  )
}
