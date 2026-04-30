import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./i18n";
import { ReviewProvider } from "./contexts/ReviewContext.tsx";
import { StudySessionProvider } from "./contexts/StudySessionContext.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { router } from "./router.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReviewProvider>
        <StudySessionProvider>
          <RouterProvider router={router} />
        </StudySessionProvider>
      </ReviewProvider>
    </QueryClientProvider>
  </StrictMode>,
);
