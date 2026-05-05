import { cn } from "../../utils/cn";
import { timeAgo } from "../../utils/date";

import type { AppNotification } from "../../contexts/NotificationContext";

export function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onNavigate: (url: string) => void;
}) {
  const handleClick = () => {
    if (notification.actionUrl) {
      onNavigate(notification.actionUrl);
    } else {
      void onMarkRead(notification.id);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full px-4 py-3 text-left bg-transparent border-0 border-b border-rule/50 cursor-pointer transition-colors hover:bg-paper-3",
          !notification.read && "bg-amber-wash/50",
        )}
      >
        <div className="flex items-start gap-3">
          {!notification.read && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-amber shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-[13px] leading-snug",
                notification.read ? "text-ink-muted" : "text-ink font-medium",
              )}
            >
              {notification.title}
            </p>
            {notification.description && (
              <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-2">
                {notification.description}
              </p>
            )}
            <p className="text-[11px] text-ink-faint mt-1.5">
              {timeAgo(notification.timestamp)}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}
