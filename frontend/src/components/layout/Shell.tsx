import {
  Button,
  DropdownMenu,
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
} from "@cloudflare/kumo";
import {
  CalendarBlankIcon,
  CaretUpDownIcon,
  CardsIcon,
  ChartBarIcon,
  GearSixIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { NavLink, useNavigate } from "react-router";

import { STUDENT_CLASS, STUDENT_INITIAL, STUDENT_NAME } from "../../data/mock";
import { cn } from "../../utils/cn";

import type { ReactNode } from "react";

type PagePath = "/today" | "/calendar" | "/browse" | "/stats";

const NAV: { path: PagePath; label: string; icon: typeof SunIcon }[] = [
  { path: "/today", label: "Dziś", icon: SunIcon },
  { path: "/calendar", label: "Kalendarz", icon: CalendarBlankIcon },
  { path: "/browse", label: "Nauka", icon: CardsIcon },
  { path: "/stats", label: "Postęp", icon: ChartBarIcon },
];

type Props = {
  children: ReactNode;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Shell({ children, theme, onToggleTheme }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Wylogować się?")) {
      navigate("/login");
    }
  };

  return (
    <SidebarProvider collapsible="none" style={{ display: "contents" }}>
      <div className="grid grid-cols-1 h-dvh w-screen overflow-hidden lg:grid-cols-[240px_1fr]">
        <Sidebar className="hidden flex-col relative overflow-hidden px-5 pt-7 pb-6 border-r border-rule bg-linear-to-b from-paper-2 to-paper lg:flex">
          <span
            aria-hidden
            className="absolute right-0 top-0 bottom-0 w-px opacity-30 bg-[linear-gradient(180deg,transparent,var(--color-amber-dim)_20%,var(--color-amber-dim)_80%,transparent)]"
          />
          <SidebarHeader className="px-1 pb-0">
            <div className="flex items-baseline gap-2.5 mb-10 pl-1">
              <span className="display italic font-semibold text-[31px] text-amber leading-none tracking-[-0.02em]">
                Nazwa
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <NavLink key={item.path} to={item.path}>
                      {({ isActive }) => (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate(item.path)}
                            active={isActive}
                            icon={
                              <item.icon
                                size={18}
                                weight={isActive ? "fill" : "regular"}
                              />
                            }
                            className={cn(
                              "relative flex items-center gap-3.5 p-2.5 bg-transparent text-[18px] font-medium text-left rounded-sm transition-colors duration-200",
                              isActive
                                ? "text-ink before:content-[''] before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-0.75 before:h-5.5 before:bg-amber"
                                : "text-ink-muted hover:text-ink",
                            )}
                          >
                            {item.label}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-1">
            <div className="mt-auto pt-5 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenu.Trigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Menu konta"
                      className="flex items-center gap-3 p-2 bg-transparent border-0 rounded-[5px] cursor-pointer flex-1 min-w-0 text-left transition-colors duration-200"
                    />
                  }
                >
                  <div className="w-8.5 h-8.5 rounded-sm bg-amber text-paper grid place-items-center display italic font-bold text-base shrink-0">
                    {STUDENT_INITIAL}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-medium text-ink">
                      {STUDENT_NAME}
                    </div>
                    <div className="mono text-[13px] text-ink-faint tracking-[0.08em]">
                      {STUDENT_CLASS}
                    </div>
                  </div>
                  <CaretUpDownIcon
                    size={14}
                    className="text-ink-faint shrink-0"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="menu-shadow min-w-50 p-1.5 bg-paper-2 border border-rule-strong rounded-[3px] outline-none z-60"
                    sideOffset={8}
                    align="start"
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 bg-transparent border-0 rounded-sm text-ink-muted text-sm text-left cursor-pointer transition-all duration-150 hover:bg-paper-3 hover:text-ink focus-visible:bg-paper-3 focus-visible:text-ink focus-visible:outline-none"
                      onClick={() => navigate("/profile")}
                    >
                      <UserCircleIcon size={16} />
                      Pokaż profil
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 bg-transparent border-0 rounded-sm text-ink-muted text-sm text-left cursor-pointer transition-all duration-150 hover:bg-paper-3 hover:text-ink focus-visible:bg-paper-3 focus-visible:text-ink focus-visible:outline-none"
                      onClick={() => navigate("/settings")}
                    >
                      <GearSixIcon size={16} />
                      Ustawienia
                    </DropdownMenu.Item>
                    <div className="h-px bg-rule my-1" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 bg-transparent border-0 rounded-sm text-rating-1 text-sm text-left cursor-pointer transition-all duration-150 hover:bg-rating-1/8 hover:text-rating-1 focus-visible:bg-rating-1/8 focus-visible:text-rating-1 focus-visible:outline-none"
                      onClick={handleLogout}
                    >
                      <SignOutIcon size={16} />
                      Wyloguj
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu>
              <Button
                variant="ghost"
                icon={
                  theme === "dark" ? (
                    <SunIcon size={16} />
                  ) : (
                    <MoonIcon size={16} />
                  )
                }
                aria-label="Zmień motyw"
                onClick={onToggleTheme}
              />
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="overflow-y-auto relative pb-22.5 lg:pb-0">
          <div className="max-w-275 px-5 pt-6 pb-16 mx-auto md:px-12 md:pt-12 md:pb-20">
            {children}
          </div>
        </main>

        <nav
          aria-label="Nawigacja"
          className="dock-frost fixed left-3 right-3 bottom-[calc(12px+env(safe-area-inset-bottom))] flex justify-stretch p-1.5 border border-rule rounded-sm z-40 lg:hidden"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 px-1 py-2 bg-transparent border-0 rounded-sm mono text-[13px] tracking-widest uppercase cursor-pointer transition-colors duration-200",
                  isActive ? "text-amber" : "text-ink-faint hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} weight={isActive ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            aria-label="Profil"
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 px-1 py-2 bg-transparent border-0 rounded-sm mono text-[13px] tracking-widest uppercase cursor-pointer transition-colors duration-200",
                isActive ? "text-amber" : "text-ink-faint hover:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                <UserCircleIcon
                  size={22}
                  weight={isActive ? "fill" : "regular"}
                />
                <span>Profil</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </SidebarProvider>
  );
}
