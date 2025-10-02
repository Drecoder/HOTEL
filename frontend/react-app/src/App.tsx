// src/App.tsx
import { Routes, Route, } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      {/* Option 1: Dashboard at "/" */}
      <Route path="/" element={<Dashboard />} />

      {/* Option 2: If you prefer /dashboard instead, redirect root */}
      {/* <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} /> */}

      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;