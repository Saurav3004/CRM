import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import ContactPage from "./pages/ContactPage";
import CampaignPage from "./pages/CampaignPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingDetails from "./pages/BookingPage";
import IntegrationPage from "./pages/IntegrationPage";
import IntegrateSuccess from "./pages/IntegrateSuccessPage";
import SubscribePage from "./pages/SubscriberPage";
import SubscriptionSuccess from "./pages/SubscriptionSuccessPage";
import EmailVerified from "./pages/EmailVerifiedPage";
import DropPage from "./pages/DropPage";
import DropDetail from "./pages/DropDetail";

export default function App() {
  return (
    <Routes>
      {/* Routes with sidebar layout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="audience" element={<ContactPage />} />
        <Route path="campaign" element={<CampaignPage />} />
        <Route path="user/:id" element={<UserProfilePage />} />
        <Route path="/drops" element={<DropPage />} />
        <Route path="/drops/:id" element={<DropDetail />} />
      <Route path="user/booking/:bookingId" element={<BookingDetails />} />
      </Route>
      <Route path="/integration" element={<IntegrationPage />} />
       <Route path="/integration-success" element={<IntegrateSuccess />} />
       <Route path="/subscribe/:slug" element={<SubscribePage />} />
       <Route path="/subscribe/:slug/success" element={<SubscriptionSuccess />} />
       <Route path="/verify/success" element={<EmailVerified />} />




      {/* Standalone routes without sidebar layout */}
      {/* <Route path="/user/:id" element={<UserProfilePage />} />
      <Route path="/user/booking/:bookingId" element={<BookingDetails />} /> */}
    </Routes>
  );
}
