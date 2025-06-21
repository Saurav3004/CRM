import { Route, Routes } from "react-router-dom";
import ContactPage from "./pages/ContactPage";
import UserProfilePage from "./pages/UserProfilePage";

export default function App(){
    return (
        <Routes>
            <Route path="/contact" element={<ContactPage />}  />
            <Route path="/user/:id" element={<UserProfilePage />} />
        </Routes>
    )
}