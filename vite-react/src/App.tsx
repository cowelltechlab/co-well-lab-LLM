import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { WelcomeInputView } from "@/views/WelcomeInputView";
import { ReviewAllView } from "@/views/ReviewAllView";

function App() {
  return (
    <Router>
      <AppProvider>
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<WelcomeInputView />} />
            <Route path="/review-all" element={<ReviewAllView />} />
          </Routes>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;
