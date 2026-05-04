import { useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useNotifications } from "../../contexts/NotificationContext";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

const variantMap: Record<string, ToastVariant> = {
  note_generated: "success",
  exam_created: "success",
  session_completed: "success",
  scan_completed: "info",
  exam_deleted: "warning",
  data_exported: "success",
};

export function NotificationToast() {
  const { add } = useKumoToastManager();
  const { notifications } = useNotifications();
  const shown = useRef<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    for (const n of notifications) {
      if (shown.current.has(n.id)) continue;
      shown.current.add(n.id);

      add({
        title: n.title,
        description: n.description,
        variant: variantMap[n.type] ?? "default",
        timeout: 5000,
      });
    }
  }, [notifications, add]);

  useEffect(() => {
    shown.current.clear();
  }, [location.pathname]);

  return null;
}
