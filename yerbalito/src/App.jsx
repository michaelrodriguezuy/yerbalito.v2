import AppRouter from "./router/AppRouter";
import AuthContextComponent from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import Footer from "./components/layout/footer/Footer";
import Navbar from "./components/layout/navbar/Navbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthContextComponent>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </AuthContextComponent>
    </BrowserRouter>
  );
}

export default App;
