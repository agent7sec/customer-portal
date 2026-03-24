import React, { Suspense, lazy } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerBindings, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ConfigProvider, Spin, App as AntdApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { authProvider, dataProvider, refineNotificationProvider } from "./providers";
import { ThemedLayoutV2 } from "./components/layout/ThemedLayoutV2";
import { LoginPage } from "./routes/LoginPage";
import { refineQueryConfig, refineOptions } from "./config/refine";

// Lazy load pages for code splitting
const DashboardPage = lazy(() =>
  import("./routes/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const AnalysisDetailsPage = lazy(() =>
  import("./routes/AnalysisDetailsPage").then((m) => ({ default: m.AnalysisDetailsPage }))
);
const UploadPage = lazy(() =>
  import("./routes/UploadPage").then((m) => ({ default: m.UploadPage }))
);
const CertificatesPage = lazy(() =>
  import("./routes/CertificatesPage").then((m) => ({ default: m.CertificatesPage }))
);
const SubscriptionPage = lazy(() =>
  import("./routes/SubscriptionPage").then((m) => ({ default: m.SubscriptionPage }))
);
const AccountSettingsPage = lazy(() =>
  import("./routes/AccountSettingsPage").then((m) => ({ default: m.AccountSettingsPage }))
);

const LoadingFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Spin size="large" />
  </div>
);

// Create query client with configured defaults
const queryClient = new QueryClient(refineQueryConfig);

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <RefineKbarProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1890ff",
              },
            }}
          >
            <AntdApp>
              <Refine
                authProvider={authProvider}
                dataProvider={dataProvider}
                routerProvider={routerBindings}
                notificationProvider={refineNotificationProvider}
                resources={[
                  {
                    name: "analyses",
                    list: "/",
                    show: "/analyses/:id",
                    meta: {
                      label: "Dashboard",
                      icon: "📊",
                    },
                  },
                  {
                    name: "upload",
                    list: "/upload",
                    meta: {
                      label: "Upload Code",
                      icon: "📤",
                    },
                  },
                  {
                    name: "certificates",
                    list: "/certificates",
                    meta: {
                      label: "Certificates",
                      icon: "📜",
                    },
                  },
                  {
                    name: "subscription",
                    list: "/subscription",
                    meta: {
                      label: "Subscription",
                      icon: "💳",
                    },
                  },
                  {
                    name: "account",
                    list: "/account",
                    meta: {
                      label: "Account Settings",
                      icon: "⚙️",
                    },
                  },
                ]}
                options={refineOptions}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-layout"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2>
                          <Suspense fallback={<LoadingFallback />}>
                            <Outlet />
                          </Suspense>
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="/analyses/:id" element={<AnalysisDetailsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/certificates" element={<CertificatesPage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/account" element={<AccountSettingsPage />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated key="authenticated-auth" fallback={<Outlet />}>
                        <NavigateToResource resource="analyses" />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<LoginPage />} />
                  </Route>

                  <Route path="*" element={<CatchAllNavigate to="/" />} />
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
            </AntdApp>
          </ConfigProvider>
        </RefineKbarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
