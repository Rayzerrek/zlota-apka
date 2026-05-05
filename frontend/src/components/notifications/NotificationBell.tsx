import { Popover } from "@cloudflare/kumo/components/popover";
import { BellIcon, BellRingingIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { useNotifications } from "../../contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isFetched,
    markAsRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  return (
    <Popover>
      <Popover.Trigger
        render={
          <button
            type="button"
            aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytane)` : ""}`}
            className="relative flex items-center justify-center w-10 h-10 rounded-sm text-ink-muted hover:text-ink hover:bg-paper-3 transition-colors bg-transparent border-0 cursor-pointer"
          />
        }
      >
        {unreadCount > 0 ? (
          <BellRingingIcon size={20} weight="fill" className="text-amber" />
        ) : (
          <BellIcon size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber text-paper text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="end"
        sideOffset={8}
        className="menu-shadow w-[340px] max-h-[420px] border border-rule-strong rounded-[3px] bg-paper-2 p-0 outline-none"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-rule shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-ink">
              Powiadomienia
            </h3>
            {unreadCount > 0 && (
              <span className="mono text-[11px] text-amber">
                {unreadCount} nowe
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-[12px] text-amber hover:text-[#ffcc4a] transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Oznacz jako przeczytane
                </button>
              )}
              <button
                type="button"
                onClick={() => void clearAll()}
                className="text-[12px] text-ink-faint hover:text-ink-muted transition-colors bg-transparent border-0 cursor-pointer"
              >
                Wyczyść wszystko
              </button>
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[340px]">
          {!isFetched ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
              <BellIcon size={28} className="text-ink-faint" />
              <p className="text-[13px] text-ink-muted">Ładowanie...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
              <BellIcon size={28} className="text-ink-faint" />
              <p className="text-[13px] text-ink-muted">Brak powiadomień</p>
              <p className="text-[12px] text-ink-faint">
                Powiadomienia o wygenerowanych notatkach, zaplanowanych sesjach
                i innych wydarzeniach pojawią się tutaj.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onNavigate={(url) => {
                    void markAsRead(n.id);
                    navigate({ to: url });
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
}
