import type { ReactNode } from "react";
import { CalendarBlankIcon, CardsIcon, ChartBarIcon, SunIcon } from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  Link,
} from "@cloudflare/kumo";
import type { PagePath } from "../app/router";
import { CARDS, SESSIONS, STUDENT_CLASS, STUDENT_INITIAL, STUDENT_NAME, TODAY } from "../data/mock";

const NAV: { path: PagePath; label: string; icon: typeof SunIcon }[] = [
  { path: "/today", label: "Dziś", icon: SunIcon },
  { path: "/calendar", label: "Kalendarz", icon: CalendarBlankIcon },
  { path: "/browse", label: "Nauka", icon: CardsIcon },
  { path: "/stats", label: "Postęp", icon: ChartBarIcon },
];

type Props = {
  path: PagePath;
  children: ReactNode;
};

export function Shell({ path, children }: Props) {
  const todayCount = CARDS.filter((c) => c.dueISO === TODAY).length;
  const calCount = SESSIONS.filter((s) => s.dateISO >= TODAY && !s.done).length;

  return (
    <SidebarProvider collapsible="none" style={{ display: "contents" }}>
      <div className="shell">
        <Sidebar className="sidebar">
          <SidebarHeader className="px-1 pb-0">
            <div className="flex items-baseline gap-2.5 mb-10 pl-1">
              <span className="brand-mark">Powtórki</span>
              <span className="brand-sub">№ 04</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const count =
                      item.path === "/today"
                        ? todayCount
                        : item.path === "/calendar"
                          ? calCount
                          : 0;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          href={`#${item.path}`}
                          active={path === item.path}
                          icon={
                            <item.icon size={18} weight={path === item.path ? "fill" : "regular"} />
                          }
                          className="nav-item"
                        >
                          {item.label}
                        </SidebarMenuButton>
                        {count > 0 && (
                          <SidebarMenuBadge className="counter">{count}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-1">
            <div className="mt-auto pt-5 border-t border-[var(--rule)] flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-sm bg-[var(--amber)] text-[var(--paper)] grid place-items-center display italic font-bold text-base shrink-0">
                {STUDENT_INITIAL}
              </div>
              <div>
                <div className="text-[13px] font-medium">{STUDENT_NAME}</div>
                <div className="mono text-[10px] text-[var(--ink-faint)] tracking-[0.08em]">
                  {STUDENT_CLASS}
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="overflow-y-auto relative pb-[90px] lg:pb-0">
          <div className="max-w-[1100px] px-5 pt-6 pb-16 mx-auto md:px-12 md:pt-12 md:pb-20">
            {children}
          </div>
        </main>

        <nav className="dock" aria-label="Nawigacja">
          {NAV.map((item) => (
            <Link
              key={item.path}
              href={`#${item.path}`}
              variant="current"
              className="dock-item"
              data-active={path === item.path}
              aria-label={item.label}
            >
              <item.icon size={22} weight={path === item.path ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </SidebarProvider>
  );
}
