import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminPage from './pages/AdminPage'
import ConfirmEmail from './pages/ConfirmEmail'
import EmailConfirmed from './pages/EmailConfirmed'
import MainPage from './pages/MainPage'
import RoadmapEditorPage from './pages/RoadmapEditorPage'
import RoadmapViewerPage from './pages/RoadmapViewerPage'
import { ScrollToTop, PageTransition } from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PageTransition><MainPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
          <Route path="/confirm-email" element={<PageTransition><ConfirmEmail /></PageTransition>} />
          <Route path="/email-confirmed" element={<PageTransition><EmailConfirmed /></PageTransition>} />
          <Route path="/roadmap-editor" element={<PageTransition><ProtectedRoute><RoadmapEditorPage /></ProtectedRoute></PageTransition>} />
          <Route path="/roadmap-viewer" element={<PageTransition><ProtectedRoute><RoadmapViewerPage /></ProtectedRoute></PageTransition>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
