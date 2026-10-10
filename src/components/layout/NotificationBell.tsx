"use client";

import { Bell } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  NotificationItem,
} from "@/store/api/notificationsApi";

export default function NotificationBell() {
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markRead] = useMarkNotificationReadMutation();

  const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n: NotificationItem) => !n.read);
    await Promise.all(unread.map((n: NotificationItem) => markRead(n.id)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-foreground transition-colors"
          data-testid="notif-btn"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-semibold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-lg">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              className="text-[11px] font-medium text-primary hover:underline"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.slice(0, 10).map((n: NotificationItem) => (
              <div
                key={n.id}
                className={`px-3 py-2.5 text-xs transition-colors ${
                  !n.read ? "bg-muted/40 font-medium" : "text-muted-foreground"
                }`}
                data-testid={`notif-item-${n.id}`}
              >
                <p className="font-semibold text-foreground text-xs">{n.title}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
