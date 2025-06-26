import { Route, Routes } from "react-router-dom";
import ContactPage from "./pages/ContactPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingDetails from "./pages/BookingPage";

export default function App(){
    return (
        <Routes>
            <Route path="/contact" element={<ContactPage />}  />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/user/booking/:bookingId" element={<BookingDetails />} />
        </Routes>
    )
}