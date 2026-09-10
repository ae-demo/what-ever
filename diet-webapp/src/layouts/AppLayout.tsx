import {
  AppShell,
  Header,
  Sidebar,
  Footer,
  UserMenu,
  ColorSchemeToggle,
  Divider,
} from "@wso2/oxygen-ui";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
  Scale,
  Users,
  LogOut,
  User as UserIcon,
} from "@wso2/oxygen-ui-icons-react";
import { Outlet, Link, useLocation } from "react-router";
import type { JSX } from "react";
import { useAuth } from "../AuthContext";
import { signOut } from "../auth";

const DIETER_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard /> },
  { id: "recipes", label: "Recipes", to: "/recipes", icon: <UtensilsCrossed /> },
  { id: "meal-plan", label: "Meal Plan", to: "/meal-plan", icon: <CalendarDays /> },
  { id: "food-log", label: "Food Log", to: "/food-log", icon: <ClipboardList /> },
  { id: "weight", label: "Weight", to: "/weight", icon: <Scale /> },
  { id: "coaches", label: "Coaches", to: "/coaches", icon: <Users /> },
];

const COACH_ITEMS = [{ id: "dieters", label: "Dieters", to: "/dieters", icon: <Users /> }];

export default function AppLayout(): JSX.Element {
  const { pathname } = useLocation();
  const { displayName, email, role } = useAuth();
  const items = role === "Coach" ? COACH_ITEMS : DIETER_ITEMS;
  const active = items.find((i) => pathname.startsWith(i.to))?.id ?? items[0]?.id;

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>Diet Manager</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={displayName} showName />
              <UserMenu.Header name={displayName} email={email} role={role ?? undefined} />
              <UserMenu.Item icon={<UserIcon />} label="Profile" onClick={() => {}} />
              <UserMenu.Logout
                icon={<LogOut />}
                label="Sign out"
                onClick={() => {
                  void signOut();
                }}
              />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {items.map((item) => (
                <Sidebar.Item key={item.id} id={item.id} link={<Link to={item.to} />}>
                  <Sidebar.ItemIcon>{item.icon}</Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{item.label}</Sidebar.ItemLabel>
                </Sidebar.Item>
              ))}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
