import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemedLayoutV2 } from "./ThemedLayoutV2";
import { BrowserRouter } from "react-router-dom";

// Mock Refine hooks
vi.mock("@refinedev/core", () => ({
  useLogout: () => ({ mutate: vi.fn() }),
  useGetIdentity: () => ({
    data: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      avatar: "https://example.com/avatar.jpg",
    },
  }),
  useMenu: () => ({
    menuItems: [
      { key: "dashboard", label: "Dashboard", route: "/", meta: { icon: "📊" } },
      { key: "upload", label: "Upload", route: "/upload", meta: { icon: "📤" } },
    ],
    selectedKey: "dashboard",
  }),
  useNavigation: () => ({ push: vi.fn() }),
}));

// Mock Grid hook to simulate desktop view
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Grid: {
      useBreakpoint: () => ({ lg: true, md: true, sm: false, xs: false }),
    },
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ThemedLayoutV2", () => {
  it("renders children correctly", () => {
    renderWithRouter(
      <ThemedLayoutV2>
        <div>Test Content</div>
      </ThemedLayoutV2>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    renderWithRouter(
      <ThemedLayoutV2>
        <div>Content</div>
      </ThemedLayoutV2>
    );

    // Breadcrumb should contain Dashboard link - use getAllByText since it appears in menu and breadcrumb
    const dashboardElements = screen.getAllByText(/Dashboard/);
    expect(dashboardElements.length).toBeGreaterThan(0);
  });

  it("renders footer with copyright", () => {
    renderWithRouter(
      <ThemedLayoutV2>
        <div>Content</div>
      </ThemedLayoutV2>
    );

    expect(screen.getByText(/Secure Code Analysis/)).toBeInTheDocument();
  });

  it("renders user identity information", () => {
    renderWithRouter(
      <ThemedLayoutV2>
        <div>Content</div>
      </ThemedLayoutV2>
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders menu items", () => {
    renderWithRouter(
      <ThemedLayoutV2>
        <div>Content</div>
      </ThemedLayoutV2>
    );

    const dashboardElements = screen.getAllByText("Dashboard");
    const uploadElements = screen.getAllByText("Upload");
    expect(dashboardElements.length).toBeGreaterThan(0);
    expect(uploadElements.length).toBeGreaterThan(0);
  });
});
