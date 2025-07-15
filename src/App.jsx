import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import AuthHandler from './components/AuthHandler';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Testimonials from './pages/Testimonials';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './pages/AdminLogin';

// Componentes de protección de rutas
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProtectedUserRoute from './components/ProtectedUserRoute';

// Páginas de administración
import UserManagement from './pages/admin/UserManagement';
import EventManagement from './pages/admin/EventManagement';
import Statistics from './pages/admin/Statistics';
import Configuration from './pages/admin/Configuration';
import AddAdmin from './pages/admin/AddAdmin';
import BookManagement from './pages/admin/BookManagement';
import PhotoManagement from './pages/admin/PhotoManagement';
import VideoManagement from './pages/admin/VideoManagement';
import EventAttendanceManagement from './pages/admin/EventAttendanceManagement';
import MessageManagement from './pages/admin/MessageManagement';
import TestimonialManagement from './pages/admin/TestimonialManagement';

// Páginas públicas de biblioteca multimedia
import BookList from './pages/BookList';
import VideoList from './pages/VideoList';
import MediaLibrary from './pages/MediaLibrary';

// Componente de Debug (solo en desarrollo)
import AuthDebug from './components/AuthDebug';

import './App.css';

function App() {
  // Verificar si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Header />
          <main className="main-content">
            <AuthHandler>
              <Routes>
                {/* ============================================ */}
              {/* RUTAS PÚBLICAS (Sin autenticación requerida) */}
              {/* ============================================ */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/library" element={<MediaLibrary />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/videos" element={<VideoList />} />
            <Route path="/testimonials" element={<Testimonials />} />
            
            {/* ============================================ */}
            {/* RUTAS DE AUTENTICACIÓN */}
            {/* ============================================ */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* ============================================ */}
            {/* RUTAS PROTEGIDAS PARA USUARIOS REGULARES */}
            {/* ============================================ */}
            <Route 
              path="/profile" 
              element={
                <ProtectedUserRoute>
                  <Profile />
                </ProtectedUserRoute>
              } 
            />
            
            {/* ============================================ */}
            {/* RUTAS PROTEGIDAS PARA ADMINISTRADORES */}
            {/* ============================================ */}
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <Admin />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <UserManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <AdminProtectedRoute>
                  <EventManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/statistics" 
              element={
                <AdminProtectedRoute>
                  <Statistics />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/configuration" 
              element={
                <AdminProtectedRoute>
                  <Configuration />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add-admin" 
              element={
                <AdminProtectedRoute>
                  <AddAdmin />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/books" 
              element={
                <AdminProtectedRoute>
                  <BookManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/photos" 
              element={
                <AdminProtectedRoute>
                  <PhotoManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/videos" 
              element={
                <AdminProtectedRoute>
                  <VideoManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/event-attendance" 
              element={
                <AdminProtectedRoute>
                  <EventAttendanceManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/messages" 
              element={
                <AdminProtectedRoute>
                  <MessageManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <AdminProtectedRoute>
                  <TestimonialManagement />
                </AdminProtectedRoute>
              }
            />
            </Routes>
            </AuthHandler>
          </main>
          {/* Componente de Debug - Solo en desarrollo */}
          {isDevelopment && <AuthDebug />}
          
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="rounded-lg shadow-lg"
          />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;