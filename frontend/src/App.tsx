import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./i18n/I18nContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Home } from "./pages/Home";
import { SkillDetailPage } from "./pages/SkillDetailPage";
import { ComparePage } from "./pages/ComparePage";
import { CompareBar } from "./components/CompareBar";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { CategoryPage } from "./pages/CategoryPage";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/skill/:id" element={<SkillDetailPage />} />
                <Route path="/skill/:owner/:repo" element={<SkillDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/admin/*" element={<AdminLayout />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <CompareBar />
            </HashRouter>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
