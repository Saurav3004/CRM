import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import ContactPage from "./pages/ContactPage";
import CampaignPage from "./pages/CampaignPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingDetails from "./pages/BookingPage";
import IntegrationPage from "./pages/IntegrationPage";
import IntegrateSuccess from "./pages/IntegrateSuccessPage";

export default function App() {
  return (
    <Routes>
      {/* Routes with sidebar layout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="audience" element={<ContactPage />} />
        <Route path="campaign" element={<CampaignPage />} />
        <Route path="user/:id" element={<UserProfilePage />} />
      <Route path="user/booking/:bookingId" element={<BookingDetails />} />
      </Route>
      <Route path="/integration" element={<IntegrationPage />} />
       <Route path="/integration-success" element={<IntegrateSuccess />} />

      {/* Standalone routes without sidebar layout */}
      {/* <Route path="/user/:id" element={<UserProfilePage />} />
      <Route path="/user/booking/:bookingId" element={<BookingDetails />} /> */}
    </Routes>
  );
}
