import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PatientsPage from "./pages/PatientsPage.jsx";
import PatientProfilePage from "./pages/PatientProfilePage.jsx";
import AppointmentsPage from "./pages/AppointmentsPage.jsx";
import ConsultationsPage from "./pages/ConsultationsPage.jsx";
import BillingPage from "./pages/BillingPage.jsx";
import DoctorsPage from "./pages/DoctorsPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientProfilePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
