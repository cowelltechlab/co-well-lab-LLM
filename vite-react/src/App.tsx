import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { WelcomeInputView } from "@/views/WelcomeInputView";
import { ReviewSectionView } from "@/views/ReviewSectionView";

function App() {
  return (
    <AppProvider>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
        <Router>
          <Routes>
            <Route path="/" element={<WelcomeInputView />} />
            <Route path="/chatbot" element={<ReviewSectionView />} />
          </Routes>
        </Router>
      </div>
    </AppProvider>
  );
}

export default App;