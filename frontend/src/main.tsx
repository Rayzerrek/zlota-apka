import { Toasty } from "@cloudflare/kumo/components/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "./i18n";
import { StudySessionProvider } from "./contexts/StudySessionContext.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { router } from "./router.tsx";

registerSW({ immediate: true });

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toasty>
        <StudySessionProvider>
          <RouterProvider router={router} />
        </StudySessionProvider>
      </Toasty>
    </QueryClientProvider>
  </StrictMode>,
);
