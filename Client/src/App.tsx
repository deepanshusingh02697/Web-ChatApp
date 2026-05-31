import { Route, Routes } from "react-router-dom";
import LoginSignup from "./component/LoginSignup/LoginSignup";
import PublicRoute from "./PublicProtectedRoute/PublicRoute";
import ProtectedRoute from "./PublicProtectedRoute/ProtectedRoute";
import ChatPage from "./Pages/ChatPage/ChatPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/register"
        element={
          <PublicRoute>
            <LoginSignup />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
