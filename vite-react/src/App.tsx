import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppProvider";
import { AdminProvider } from "@/context/AdminProvider";
import { WelcomeInputView } from "@/views/WelcomeInputView";
import { ControlProfileView } from "@/views/ControlProfileView";
import { BulletRefinementView } from "@/views/BulletRefinementView";
import { AlignedProfileView } from "@/views/AlignedProfileView";
import { ProfileComparisonView } from "@/views/ProfileComparisonView";
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
              <Route path="/control-profile" element={<ControlProfileView />} />
              <Route path="/bullet-refinement" element={<BulletRefinementView />} />
              <Route path="/aligned-profile" element={<AlignedProfileView />} />
              <Route path="/comparison" element={<ProfileComparisonView />} />
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
