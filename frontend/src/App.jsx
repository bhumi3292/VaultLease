// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routers/AppRouter.jsx";
import Navbar from "./layouts/Navbar.jsx";
import Footer from "./layouts/Footer.jsx";
import AuthContextProvider from "./auth/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css"; // Your main application CSS
import Chatbot from "./components/Chatbot.jsx"; // Import your Chatbot component
import { MessageSquare } from 'lucide-react'; // Import icon for FAB

// Create a single instance of the QueryClient to be used throughout the app.
const queryClient = new QueryClient();

function App() {
    const [showChatbot, setShowChatbot] = useState(false);

    const toggleChatbot = () => {
        setShowChatbot(!showChatbot);
    };

    return (
        <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Navbar />
                    {/* Main content area, pushed down by fixed Navbar */}
                    <div className="pt-[70px] min-h-screen flex flex-col">
                        <div className="flex-grow"> {/* Allows content to push footer down */}
                            <AppRoutes />
                        </div>
                        <Footer />
                    </div>

                    {/* Floating Action Button (FAB) for Chatbot */}
                    <button
                        onClick={toggleChatbot}
                        className="fixed bottom-4 right-4 z-[1001] bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-hover transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label={showChatbot ? "Close chatbot" : "Open chatbot"}
                    >
                        <MessageSquare size={28} />
                    </button>

                    {/* Conditionally render the Chatbot component */}
                    {showChatbot && <Chatbot onClose={toggleChatbot} />}

                    {/* ToastContainer remains at the bottom-right */}
                    <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </Router>
            </AuthContextProvider>
        </QueryClientProvider>
    );
}

export default App;