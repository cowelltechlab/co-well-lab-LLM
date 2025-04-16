import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppProvider";
import { WelcomeInputView } from "@/views/WelcomeInputView";
import { ReviewAllView } from "@/views/ReviewAllView";
import { ReviewSectionView } from "@/views/ReviewSectionView";

function App() {
  return (
    <Router>
      <AppProvider>
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<WelcomeInputView />} />
            <Route path="/review-all" element={<ReviewAllView />} />
            <Route
              path="/review-section/:sectionName"
              element={<ReviewSectionView />}
            />
          </Routes>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;
