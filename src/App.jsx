import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/SupabaseAuthContext.jsx';
import { SOSProvider } from './contexts/SOSContext.jsx';
import useWindowSize from '@/hooks/useWindowSize.js';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import SOSButton from '@/components/SOSButton.jsx';
import '@/styles/android-fixes.css';
import '@/styles/mobile-layout-fixes.css';
import MenuPestanaGalaxy from '@/components/MenuPestanaDerecha';
import MenuLateralGalaxy from '@/components/MenuLateralGalaxy.jsx';
import DesktopSidebar from '@/components/DesktopSidebar.jsx';
import FooterBottomNavigation from '@/components/global/FooterBottomNavigation.jsx';

import ChatRoomPageSimple from '@/pages/ChatRoomPageSimple.jsx';
import VideoIntro from '@/pages/VideoIntro.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import CompleteProfilePage from '@/pages/CompleteProfilePage.jsx';
import PricingPage from '@/pages/PricingPage.jsx';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage.jsx';
import LegalPoliciesPage from '@/pages/LegalPoliciesPage.jsx';

import HomePage from './pages/HomePage.jsx';
import SecurityModule from '@/pages/SecurityModule.jsx';
import SupportDirectoryPage from '@/pages/SupportDirectoryPage.jsx';
import CommunityModule from '@/pages/CommunityModule.jsx';
import CommunityBlog from '@/pages/CommunityBlog.jsx';
import ChatRooms from '@/pages/ChatRooms.jsx';
import ChatRoomPage from '@/pages/ChatRoomPage.jsx';
import LearningModule from '@/pages/LearningModule.jsx';
import PreventionModule from '@/pages/PreventionModule.jsx';
import HolisticZone from '@/pages/HolisticZone.jsx';
import ZinhaLibrary from '@/pages/ZinhaLibrary.jsx';
import BibliotecaPublica from '@/pages/BibliotecaPublica.jsx';
import MisLibros from '@/pages/MisLibros.jsx';
import NuevoLibro from '@/pages/NuevoLibro.jsx';
import LeerLibro from '@/pages/LeerLibro.jsx';
import PodcastPage from '@/pages/PodcastPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import EmprendeEnCasa from '@/pages/EmprendeEnCasa.jsx';
import BienestarCompleto from '@/pages/BienestarCompleto.jsx';
import TherapistDirectoryPage from '@/pages/TherapistDirectoryPage.jsx';
import PersonalAgendaPage from '@/pages/PersonalAgendaPage.jsx';
import ReferralPage from '@/pages/ReferralPage.jsx';
import DiarioPersonal from '@/components/Zinha/DiarioPersonal.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import AdminDashboardCodigos from '@/pages/AdminDashboardCodigos.jsx';
import DebugGeolocation from '@/pages/DebugGeolocation.jsx';
import ZinhaInformaPage from '@/pages/ZinhaInformaPage.jsx';
import DatabaseTest from '@/components/DatabaseTest.jsx';
import EmailConfirmationHelper from '@/components/EmailConfirmationHelper.jsx';
import PublicTracking from '@/pages/PublicTracking.jsx';
// import S3TestPage from '@/pages/S3TestPage.jsx'; // 🛠️ TEMP: Deshabilitado hasta mover S3 al backend

// Componentes de administración
import LoginAdmin from '@/components/LoginAdmin.jsx';
import AdminBypass from '@/components/AdminBypass.jsx';
import AdminRecovery from '@/components/AdminRecovery.jsx';

// --- DEFINICIÓN DE RUTAS ---
const AppRoutes = () => (
  <Routes>
    {/* Rutas administrativas y especiales */}
    <Route path="/admin/login" element={<LoginAdmin />} />
    <Route path="/admin/bypass" element={<AdminBypass />} />
    <Route path="/admin/recovery" element={<AdminRecovery />} />
    
    {/* Rutas de debug */}
    <Route path="/debug/geolocation" element={<DebugGeolocation />} />
    
    {/* Rutas que requieren acceso pagado o código donativo */}
    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
    <Route path="/seguridad" element={<ProtectedRoute><SecurityModule /></ProtectedRoute>} />
    <Route path="/seguridad/apoyo-y-refugios" element={<ProtectedRoute><SupportDirectoryPage /></ProtectedRoute>} />
    <Route path="/comunidad" element={<ProtectedRoute><CommunityModule /></ProtectedRoute>} />
    <Route path="/comunidad/blog" element={<ProtectedRoute><CommunityBlog /></ProtectedRoute>} />
    <Route path="/comunidad/salas" element={<ProtectedRoute><ChatRooms /></ProtectedRoute>} />
    <Route path="/comunidad/sala/:id" element={<ProtectedRoute><ChatRoomPageSimple /></ProtectedRoute>} />
    <Route path="/bienestar" element={<ProtectedRoute><BienestarCompleto /></ProtectedRoute>} />
    {/* Legacy redirects */}
    <Route path="/aprendizaje" element={<Navigate to="/bienestar" replace />} />
    <Route path="/bienestar-completo" element={<Navigate to="/bienestar" replace />} />
    <Route path="/prevencion" element={<ProtectedRoute><PreventionModule /></ProtectedRoute>} />
    <Route path="/holistica" element={<ProtectedRoute><HolisticZone /></ProtectedRoute>} />
    
    {/* Módulo Escribe tu Libro */}
    <Route path="/biblioteca" element={<ProtectedRoute><BibliotecaPublica /></ProtectedRoute>} />
    <Route path="/mis-libros" element={<ProtectedRoute><MisLibros /></ProtectedRoute>} />
    <Route path="/nuevo-libro" element={<ProtectedRoute><NuevoLibro /></ProtectedRoute>} />
    <Route path="/leer/:bookId" element={<ProtectedRoute><LeerLibro /></ProtectedRoute>} />
    
    <Route path="/podcast" element={<ProtectedRoute><PodcastPage /></ProtectedRoute>} />
    <Route path="/diario-emocional" element={<ProtectedRoute><DiarioPersonal /></ProtectedRoute>} />
    <Route path="/emprende" element={<ProtectedRoute><EmprendeEnCasa /></ProtectedRoute>} />
    {/* Legacy: redirección suave desde la ruta antigua */}
    <Route path="/sexualidad" element={<Navigate to="/emprende" replace />} />
    <Route path="/directorio-terapeutas" element={<ProtectedRoute><TherapistDirectoryPage /></ProtectedRoute>} />
    <Route path="/agenda" element={<ProtectedRoute><PersonalAgendaPage /></ProtectedRoute>} />
    <Route path="/referidos" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/codigos" element={<AdminDashboardCodigos />} />
    <Route path="/comunidad/informa" element={<ProtectedRoute><ZinhaInformaPage /></ProtectedRoute>} />
    {/* <Route path="/test-s3" element={<S3TestPage />} /> */} {/* 🛠️ TEMP: Deshabilitado */}
    
    {/* Rutas libres para completar el proceso de registro y pago */}
    <Route path="/perfil" element={<ProfilePage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/payment-success" element={<PaymentSuccessPage />} />
    <Route path="/legal" element={<LegalPoliciesPage />} />
    <Route path="*" element={<Navigate to="/" />} />
    <Route path="/register" element={<RegisterPage />} />
  </Routes>
);

const AuthRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<VideoIntro />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/completar-perfil" element={<CompleteProfilePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/legal" element={<LegalPoliciesPage />} />
        <Route path="/test-db" element={<DatabaseTest />} />
        <Route path="/confirm-email" element={<EmailConfirmationHelper />} />
        {/* 🎯 TRACKING PÚBLICO - Sin autenticación requerida */}
        <Route path="/track/:token" element={<PublicTracking />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL DE LA APP ---
function AppContent() {
  const { session, loading } = useAuth();
  const { width } = useWindowSize(); // Volvemos a usar el hook
  const isMobileView = width < 1024;
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/reset-password', '/pricing', '/legal'].includes(location.pathname);
  const isTrackingPage = location.pathname.startsWith('/track/');
  const isInChatRoom = location.pathname.includes('/comunidad/sala/');

  // Efecto para ocultar botón IA en chat rooms
  useEffect(() => {
    const body = document.body;
    if (isInChatRoom) {
      body.classList.add('ocultar-boton-ia');
    } else {
      body.classList.remove('ocultar-boton-ia');
    }
  }, [isInChatRoom]);

  // Pantalla de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#f5e6ff] via-white to-[#f5e6ff]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // 🎯 TRACKING PÚBLICO: Permite acceso sin sesión
  if (!session) {
    // Si es página de tracking, renderizar con Routes pero sin layout
    if (isTrackingPage) {
      return (
        <Routes>
          <Route path="/track/:token" element={<PublicTracking />} />
        </Routes>
      );
    }
    
    // Si no, mostrar rutas de autenticación normales
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#f5e6ff] via-white to-[#f5e6ff]">
        <AuthRoutes />
      </div>
    );
  }

  // --- LAYOUT DE LA APLICACIÓN AUTENTICADA CON DETECCIÓN MÓVIL/DESKTOP ---
  return (
    <>
      <Helmet>
        <title>KUNNA – Tu espacio seguro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Helmet>

      {/* Pestaña fija al borde derecho - se renderiza directamente en body */}
      <MenuPestanaGalaxy onClick={() => setMenuOpen(true)} />

      {/* Panel lateral que se abre hacia la IZQUIERDA */}
      <MenuLateralGalaxy open={menuOpen} onClose={() => setMenuOpen(false)} />

      {isMobileView ? (
        // --- VISTA MÓVIL CON LAYOUT FIJO REAL ---
        <div className="w-full h-screen flex flex-col" style={{ height: '100dvh' }}>
          <main className="flex-1 bg-gradient-to-br from-[#f5e6ff] via-white to-[#f5e6ff] overflow-y-auto overscroll-none">
            <AppRoutes />
          </main>
          <FooterBottomNavigation />
        </div>
      ) : (
        // --- VISTA ESCRITORIO ---
        <div className="flex h-screen bg-brand-background/30">
          {!isAuthPage && <DesktopSidebar />}
          <main className="flex-1 overflow-y-auto p-8">
            <AppRoutes />
          </main>
          {/* 🔧 TEMPORAL: Footer visible en escritorio para debug */}
          <FooterBottomNavigation />
        </div>
      )}
    </>
  );
}

// --- PUNTO DE ENTRADA FINAL ---
export default function App() {
  return <AppContent />;
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       