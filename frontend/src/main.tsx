import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import MainPage from './pages/MainPage'
import ExamplePage from './pages/Example'
import ExampleViewer from './pages/ExampleViewer'
import RoadmapEditorPage from './pages/RoadmapEditorPage'
import RoadmapViewerPage from './pages/RoadmapViewerPage'
import { ScrollToTop, PageTransition } from './components/ScrollToTop'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PageTransition><MainPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/example" element={<PageTransition><ExamplePage /></PageTransition>} />
        <Route path="/example-viewer" element={<PageTransition><ExampleViewer /></PageTransition>} />
        <Route path="/roadmap-editor" element={<PageTransition><RoadmapEditorPage /></PageTransition>} />
        <Route path="/roadmap-viewer" element={<PageTransition><RoadmapViewerPage /></PageTransition>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
