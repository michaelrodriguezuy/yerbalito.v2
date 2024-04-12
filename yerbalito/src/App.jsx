import AppRouter from "./router/AppRouter";
import AuthContextComponent from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import Footer from "./components/layout/footer/Footer";
import Navbar from "./components/layout/navbar/Navbar";

function App() {
  return (
    <BrowserRouter>
      <AuthContextComponent>
        <Navbar />
        <AppRouter />
        <Footer />
      </AuthContextComponent>
    </BrowserRouter>
  );
}

export default App;
