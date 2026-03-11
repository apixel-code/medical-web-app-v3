import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import DepartmentDetailPage from "@/pages/DepartmentDetailPage";
import DoctorsPage from "@/pages/DoctorsPage";
import DoctorProfilePage from "@/pages/DoctorProfilePage";
import ServicesPage from "@/pages/ServicesPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import AppointmentPage from "@/pages/AppointmentPage";
import AuthPage from "@/pages/AuthPage";
import PatientPortal from "@/pages/PatientPortal";
import AdminDashboard from "@/pages/AdminDashboard";

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
          <Route path="/departments" element={<AppLayout><DepartmentsPage /></AppLayout>} />
          <Route path="/departments/:slug" element={<AppLayout><DepartmentDetailPage /></AppLayout>} />
          <Route path="/doctors" element={<AppLayout><DoctorsPage /></AppLayout>} />
          <Route path="/doctors/:id" element={<AppLayout><DoctorProfilePage /></AppLayout>} />
          <Route path="/services" element={<AppLayout><ServicesPage /></AppLayout>} />
          <Route path="/blog" element={<AppLayout><BlogPage /></AppLayout>} />
          <Route path="/blog/:slug" element={<AppLayout><BlogPostPage /></AppLayout>} />
          <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />
          <Route path="/appointment" element={<AppLayout><AppointmentPage /></AppLayout>} />
          <Route path="/auth" element={<AppLayout><AuthPage /></AppLayout>} />
          <Route path="/portal" element={<AppLayout><PatientPortal /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
