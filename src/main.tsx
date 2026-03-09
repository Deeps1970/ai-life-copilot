import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTheme } from "./components/settings/AppearanceSettings";

initTheme();

createRoot(document.getElementById("root")!).render(<App />);
