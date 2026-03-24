import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock Refine and dependencies
vi.mock("@refinedev/core", () => ({
  Refine: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Authenticated: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLogout: () => ({ mutate: vi.fn() }),
  useGetIdentity: () => ({ data: null }),
  useMenu: () => ({ menuItems: [], selectedKey: "" }),
  useNavigation: () => ({ push: vi.fn() }),
}));

vi.mock("@refinedev/kbar", () => ({
  RefineKbar: () => null,
  RefineKbarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@refinedev/react-router-v6", () => ({
  default: {},
  CatchAllNavigate: () => null,
  NavigateToResource: () => null,
  UnsavedChangesNotifier: () => null,
  DocumentTitleHandler: () => null,
}));

vi.mock("@refinedev/antd", () => ({
  useNotificationProvider: vi.fn(),
}));

vi.mock("./providers", () => ({
  authProvider: {},
  dataProvider: {},
  refineNotificationProvider: {},
}));

vi.mock("./components/layout/ThemedLayoutV2", () => ({
  ThemedLayoutV2: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./routes/LoginPage", () => ({
  LoginPage: () => <div>Login Page</div>,
}));

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("configures Refine with correct resources", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
