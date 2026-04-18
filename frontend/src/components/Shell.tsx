import type { ReactNode } from "react";
import { CalendarBlankIcon, CardsIcon, ChartBarIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import {
  Button,
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
  Link,
} from "@cloudflare/kumo";
import type { PagePath } from "../app/router";
import { STUDENT_CLASS, STUDENT_INITIAL, STUDENT_NAME } from "../data/mock";

const NAV: { path: PagePath; label: string; icon: typeof SunIcon }[] = [
  { path: "/today", label: "asd", icon: SunIcon },
  { path: "/calendar", label: "Kalendarz", icon: CalendarBlankIcon },
  { path: "/browse", label: "Nauka", icon: CardsIcon },
  { path: "/stats", label: "Postęp", icon: ChartBarIcon },
];

type Props = {
  path: PagePath;
  children: ReactNode;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Shell({ path, children, theme, onToggleTheme }: Props) {
  return (
    <SidebarProvider collapsible="none" style={{ display: "contents" }}>
      <div className="shell">
        <Sidebar className="sidebar">
          <SidebarHeader className="px-1 pb-0">
            <div className="flex items-baseline gap-2.5 mb-10 pl-1">
              <span className="brand-mark">Nazwa</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
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
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-1">
            <div className="mt-auto pt-5 flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-sm bg-[var(--amber)] text-[var(--paper)] grid place-items-center display italic font-bold text-base shrink-0">
                {STUDENT_INITIAL}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{STUDENT_NAME}</div>
                <div className="mono text-[10px] text-[var(--ink-faint)] tracking-[0.08em]">
                  {STUDENT_CLASS}
                </div>
              </div>
              <Button
                variant="ghost"
                icon={theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                aria-label="Zmień motyw"
                onClick={onToggleTheme}
              />
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
              className="dock-item"
              data-active={path === item.path}
              aria-label={item.label}
            >
              <item.icon size={22} weight={path === item.path ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button className="dock-item" aria-label="Zmień motyw" onClick={onToggleTheme}>
            {theme === "dark" ? <SunIcon size={22} /> : <MoonIcon size={22} />}
            <span>{theme === "dark" ? "Jasny" : "Ciemny"}</span>
          </button>
        </nav>
      </div>
    </SidebarProvider>
  );
}
