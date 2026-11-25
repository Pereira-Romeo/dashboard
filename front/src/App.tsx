import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Account } from "./pages/Account";
import { Profile } from "./pages/Profile";
import { SignUp } from "./pages/SignUp";

function RequireSession() {
  const { user, loading } = useSession();

  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<RequireSession />}>
            <Route path="/account" element={<Account />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
