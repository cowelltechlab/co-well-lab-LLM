import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppProvider";
import { AdminProvider } from "@/context/AdminProvider";
import { WelcomeInputView } from "@/views/WelcomeInputView";
import { ReviewAllView } from "@/views/ReviewAllView";
import { ReviewSectionView } from "@/views/ReviewSectionView";
import { CoverLetterComparisonView } from "@/views/CoverLetterComparisonView";
import { AdminLoginView } from "@/views/AdminLoginView";
import { AdminDashboardView } from "@/views/AdminDashboardView";
import { EnterTokenView } from "@/views/EnterTokenView";

function App() {
  return (
    <Router>
      <AdminProvider>
        <AppProvider>
          <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
            <Routes>
              <Route path="/" element={<WelcomeInputView />} />
              <Route path="/review-all" element={<ReviewAllView />} />
              <Route
                path="/review-section/:sectionName"
                element={<ReviewSectionView />}
              />
              <Route
                path="/cover-letter-comparison"
                element={<CoverLetterComparisonView />}
              />
              <Route path="/admin/login" element={<AdminLoginView />} />
              <Route path="/admin" element={<AdminDashboardView />} />
              <Route path="/enter" element={<EnterTokenView />} />
            </Routes>
          </div>
        </AppProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
