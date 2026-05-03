import { lazy, Suspense } from "react";
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
import { PageBlocksProvider } from "@/contexts/PageBlocksContext";
import RequireRole from "@/components/auth/RequireRole";
import GlobalEditorMount from "@/components/editor/GlobalEditorMount";

// Landing page is the LCP-critical entry — keep eager so first paint has no
// chunk waterfall. Every other route is lazy-loaded so its JS only ships
// when the user navigates there. This is the main lever for the Lighthouse
// "Reduce unused JavaScript" finding.
import LandingPage from "./pages/LandingPage";

const HomePage = lazy(() => import("./pages/HomePage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogReaderPage = lazy(() => import("./pages/BlogReaderPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const HealthPage = lazy(() => import("./pages/HealthPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Empty fallback — chunks load fast enough that a spinner causes more
// visual noise than blank space. Background already matches site theme.
const RouteFallback = () => <div className="min-h-screen bg-background" />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <VisualEditorProvider>
              <PageBlocksProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<RouteFallback />}>
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
                      <Route path="/admin/health" element={<RequireRole role="admin"><HealthPage /></RequireRole>} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/:id" element={<ProfilePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <GlobalEditorMount />
                </BrowserRouter>
              </TooltipProvider>
              </PageBlocksProvider>
            </VisualEditorProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
