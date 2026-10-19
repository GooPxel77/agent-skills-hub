import { lazy, Suspense } from "react";
import { useCompare } from "./hooks/useCompare";
import SkillMascot from "./mascot/Mascot";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./i18n/I18nContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Home } from "./pages/Home";
const SkillDetailPage = lazy(() => import("./pages/SkillDetailPage").then(module => ({ default: module.SkillDetailPage })));
const ComparePage = lazy(() => import("./pages/ComparePage").then(module => ({ default: module.ComparePage })));
import { CompareBar } from "./components/CompareBar";
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then(module => ({default:module.AdminLayout})));
const CategoryPage = lazy(() => import("./pages/CategoryPage").then(module => ({ default: module.CategoryPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(module => ({ default: module.AboutPage })));

function SkillMascotMount() {
  const { pathname } = useLocation();
  const { items } = useCompare();
  return pathname.startsWith("/admin") || items.length > 0 ? null : <SkillMascot />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <BrowserRouter>
              <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-screen" />} >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/skill/:id" element={<SkillDetailPage />} />
                <Route path="/skill/:owner/:repo" element={<SkillDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/admin/*" element={<AdminLayout />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
              <CompareBar />
              <SkillMascotMount />
            </BrowserRouter>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
