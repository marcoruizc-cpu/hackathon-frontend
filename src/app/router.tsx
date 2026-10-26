import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute, PublicOnlyRoute } from "../auth/components/PrivateRoute";
import { LoginPage } from "../auth/pages/LoginPage";
import { AppLayout } from "../common/components/AppLayout";
import { DashboardPage } from "../dashboard/pages/DashboardPage";
import { NotFoundPage } from "../notfound/pages/NotFoundPage";
import { SectorListPage } from "../sector/pages/SectorListPage";
import { SectorStoryPage } from "../sector/pages/SectorStoryPage";
import { SignalDetailPanel } from "../signal/pages/SignalDetailPanel";
import { SignalFeedPage } from "../signal/pages/SignalFeedPage";
import { TropelDetailPage } from "../tropel/pages/TropelDetailPage";
import { TropelListPage } from "../tropel/pages/TropelListPage";

// Tabla de rutas (equivalente a los @RequestMapping de los controllers).
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tropels" element={<TropelListPage />} />
          <Route path="/tropels/:id" element={<TropelDetailPage />} />
          {/* El detalle es ruta HIJA: se pinta sobre el feed sin desmontarlo (conserva posicion). */}
          <Route path="/signals" element={<SignalFeedPage />}>
            <Route path=":id" element={<SignalDetailPanel />} />
          </Route>
          <Route path="/sectors" element={<SectorListPage />} />
          <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
