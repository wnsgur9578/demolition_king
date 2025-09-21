import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import "./styles/App.css";
import { AnimatePresence } from "framer-motion";

// pages
import StartPage from "./pages/StartPage";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";
import StoryPage from "./pages/StoryPage";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import EventPage from "./pages/EventPage";
import PasswordPage from "./pages/PasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SingleTestPage from "./pages/SingleTestPage";
import MultiLobbyPage from "./pages/MultiLobbyPage";
import MultiPlayPage from "./pages/MultiPlayPage";
import MultiModeEntryPage from "./pages/MultiModeEntryPage";
import EventGamePage from "./pages/EventGamePage";
import MultiResultPage from "./pages/MultiResultPage";
import AdminPage from "./pages/AdminPage";


// components
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AudioProvider } from "./context/AudioContext";  // AudioProvider 임포트

function AppRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public */}
                <Route path="/" element={<AppLayout><StartPage /></AppLayout>} />
                <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
                <Route path="/signup" element={<AppLayout><SignupPage /></AppLayout>} />
                <Route path="/password" element={<AppLayout><PasswordPage /></AppLayout>} />
                <Route path="/resetpassword" element={<AppLayout><ResetPasswordPage /></AppLayout>} />
                <Route path="/multiplay" element={<MultiPlayPage />} />

                {/* Protected */}
                <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
                <Route path="/game" element={<ProtectedRoute><AppLayout><GamePage /></AppLayout></ProtectedRoute>} />
                <Route path="/story" element={<AppLayout><StoryPage /></AppLayout>} />
                <Route path="/event" element={<ProtectedRoute><AppLayout><EventPage /></AppLayout></ProtectedRoute>} />
                <Route path="/eventgame" element={<ProtectedRoute><AppLayout><EventGamePage /></AppLayout></ProtectedRoute>} />
                <Route path="/singletest" element={<ProtectedRoute><SingleTestPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />


                {/* ✅ 표준 로비(전체화면: AppLayout X) */}
                <Route
                    path="/lobby/:roomId"
                    element={
                        <ProtectedRoute>
                            <MultiLobbyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                path="/multilobby"
                element={
                <ProtectedRoute>
                    <MultiModeEntryPage />
                    </ProtectedRoute>
                }
                />
                <Route
                    path="/multi-result"
                    element={
                        <ProtectedRoute>
                            <MultiResultPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <AudioProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AudioProvider>
    );
}
