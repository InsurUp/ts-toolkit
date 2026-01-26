import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "react-oauth2-code-pkce";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Toaster } from "@/components/ui/sonner";
import { authConfig } from "./config";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider authConfig={authConfig}>
      <BrowserRouter>
        <NuqsAdapter>
          <App />
          <Toaster />
        </NuqsAdapter>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
