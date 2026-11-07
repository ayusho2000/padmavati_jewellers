import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Hero from "./pages/Hero/Hero";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import Products from "./pages/Products/Products";
import Testimonials from "./pages/Testimonials/Testimonials";
import Instagram from "./pages/Instagram/Instagram";
import Contact from "./pages/Contact/Contact";
import Admins from "./pages/Admins/Admins";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import Collections from "./pages/Collections/Collections";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==========================================
                      DEFAULT
        ========================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ==========================================
                        LOGIN
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==========================================
                  PROTECTED ADMIN AREA
        ========================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            element={<DashboardLayout />}
          >

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/dashboard/hero"
              element={<Hero />}
            />

            <Route
              path="/dashboard/products"
              element={<Products />}
            />

            <Route
              path="/dashboard/testimonials"
              element={<Testimonials />}
            />

            <Route
              path="/dashboard/instagram"
              element={<Instagram />}
            />

            <Route
              path="/dashboard/contact"
              element={<Contact />}
            />

            <Route
              path="/dashboard/admins"
              element={<Admins />}
            />

            <Route
              path="/dashboard/change-password"
              element={<ChangePassword />}
            />

            <Route
              path="/dashboard/collections"
              element={<Collections />}
            />

          </Route>

        </Route>

        {/* ==========================================
                      FALLBACK
        ========================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;