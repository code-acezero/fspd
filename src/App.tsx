import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { VisualEditorProvider } from "@/contexts/VisualEditorContext";
import RequireRole from "@/components/auth/RequireRole";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import BlogListPage from "./pages/BlogListPage";
import BlogReaderPage from "./pages/BlogReaderPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MembersPage from "./pages/MembersPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <VisualEditorProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogReaderPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:slug" element={<EventDetailPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:slug" element={<CourseDetailPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                </BrowserRouter>
              </TooltipProvider>
            </VisualEditorProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
