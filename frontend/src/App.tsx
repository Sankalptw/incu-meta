// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { StartupAuthProvider } from "@/contexts/StartupAuthContext";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StartupProtectedRoute } from "@/components/StartupProtectedRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Startups from "@/pages/Startups";
import Announcements from "@/pages/Announcements";
import Events from "@/pages/Events";
import Meetings from "@/pages/Meetings";
import RecordMOM from "@/pages/RecordMOM";
import Requests from "@/pages/Requests";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import StartupDetails from "@/pages/StartupDetails";
import Schedules from "@/pages/Schedules";
import ScheduleDetails from "@/pages/ScheduleDetails";
import Apply from "@/pages/Apply";
import StartupDashboard from "@/pages/Startups/StartupDashboard";
import StartupLogin from "@/pages/StartupLogin";
import { StartupLayout } from "./components/layouts/StartupLayout";
import StartupEvents from "./pages/Startups/StartupEvents";
import StartupAnnouncements from "./pages/Startups/StartupAnnouncements";
import StartupSchedules from "./pages/Startups/StartupSchedules";
import StartupProfileSetup from './pages/Startups/StartupProfileSetup'; // ← Add import
import MatchingRequest from './pages/Startups/MatchingRequest';
import MatchingRequests from './pages/Admin/MatchingRequests';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StartupAuthProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/startup/login" element={<StartupLogin />} />

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/startups" element={<Startups />} />
                <Route path="/admin/startups/:id" element={<StartupDetails />} />
                <Route path="/admin/announcements" element={<Announcements />} />
                <Route path="/admin/events" element={<Events />} />
                <Route path="/admin/meetings" element={<Meetings />} />
                <Route path="/admin/record-mom" element={<RecordMOM />} />
                <Route path="/admin/requests" element={<Requests />} />
                <Route path="/admin/schedules" element={<Schedules />} />
                <Route path="/admin/matching-requests" element={<MatchingRequests />} />


                <Route path="/admin/schedule/:id" element={<ScheduleDetails />} />
              </Route>

              {/* Startup Protected Routes */}
              <Route element={<StartupProtectedRoute />}>

                {/* <Route element={<StartupLayout/>}> */}
                  <Route path="/startup/dashboard" element={<StartupDashboard />} />
                  <Route path="/startup/announcements" element={<StartupAnnouncements/>} />
                  <Route path="/startup/events" element={<StartupEvents />} />
                  <Route path="/startup/schedules" element={<StartupSchedules/>} />
                  <Route path="/startup/profile-setup" element={<StartupProfileSetup />} />
                  <Route path="/startup/matching" element={<MatchingRequest />} />


                {/* </Route> */}
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StartupAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
