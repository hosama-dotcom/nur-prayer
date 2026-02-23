import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initLanguage } from "./lib/i18n";

// Apply language/RTL before first render to avoid flash
initLanguage();

createRoot(document.getElementById("root")!).render(<App />);
