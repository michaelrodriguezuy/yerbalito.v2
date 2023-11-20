import { BrowserRouter } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AuthContext>
        <AppRouter />
      </AuthContext>
    </BrowserRouter>
  );
}

export default App;
