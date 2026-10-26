import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../auth/context/AuthContext";
import { ErrorBoundary } from "../common/components/ErrorBoundary";
import { AppRoutes } from "./router";

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
