import AppRouter from "./router/AppRouter";
import AuthContextComponent from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import Footer from "./components/layout/footer/Footer";
import Navbar from "./components/layout/navbar/Navbar";
import MatchResultsModal from "./components/layout/MatchResultsModal";
import BirthdayNotification from "./components/layout/BirthdayNotification";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "sonner";
import theme from "./theme";
import "./styles/globals.css";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthContextComponent>
                  <div className="flex flex-col h-screen overflow-hidden">
                    <Navbar />
                    <main className="flex-1 pt-[120px] overflow-y-auto">
                      <AppRouter />
                    </main>
                    <Footer />
                    <MatchResultsModal />
                    <BirthdayNotification />
                    <Toaster 
                      position="top-right" 
                      richColors 
                      toastOptions={{
                        className: 'sonner-toast-high-z',
                        style: {
                          zIndex: 10000,
                        },
                      }}
                      style={{
                        zIndex: 10000,
                      }}
                    />
                  </div>
        </AuthContextComponent>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
