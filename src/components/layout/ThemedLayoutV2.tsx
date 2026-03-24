import React, { useState } from "react";
import { useLogout, useGetIdentity, useMenu, useNavigation } from "@refinedev/core";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Button,
  Breadcrumb,
  Grid,
  Drawer,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";
import { SkipLinks } from "../shared/SkipLinks";
import { useFocusOnRouteChange } from "../../hooks/useFocusManagement";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface ThemedLayoutV2Props {
  children: React.ReactNode;
}

export const ThemedLayoutV2: React.FC<ThemedLayoutV2Props> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity();
  const { menuItems, selectedKey } = useMenu();
  const { push } = useNavigation();
  const location = useLocation();
  const screens = useBreakpoint();
  const mainRef = useFocusOnRouteChange();

  const isMobile = !screens.lg;

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Account Settings",
      onClick: () => push("/account"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const renderBreadcrumb = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);

    const breadcrumbItems = [
      {
        title: (
          <Link to="/" aria-label="Go to Dashboard">
            <HomeOutlined aria-hidden="true" /> Dashboard
          </Link>
        ),
      },
      ...pathSnippets.map((snippet, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSnippets.length - 1;

        const label = snippet.charAt(0).toUpperCase() + snippet.slice(1);

        return {
          title: isLast ? label : <Link to={url}>{label}</Link>,
        };
      }),
    ];

    return (
      <Breadcrumb 
        items={breadcrumbItems} 
        style={{ margin: "16px 0" }}
        aria-label="Breadcrumb navigation"
      />
    );
  };

  const menuContent = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems.map((item) => ({
        key: item.key,
        icon: <span aria-hidden="true">{item.meta?.icon}</span>,
        label: item.label,
        onClick: () => {
          push(item.route || "/");
          if (isMobile) {
            setMobileDrawerOpen(false);
          }
        },
      }))}
      style={{ borderRight: 0 }}
      aria-label="Main navigation"
    />
  );

  return (
    <>
      <SkipLinks />
      <Layout style={{ minHeight: "100vh" }}>
        {/* Desktop Sider */}
        {!isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            width={250}
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
            }}
            aria-label="Sidebar navigation"
          >
            <div
              style={{
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: collapsed ? 16 : 20,
                fontWeight: "bold",
                color: "#1890ff",
                borderBottom: "1px solid #f0f0f0",
              }}
              role="banner"
            >
              {collapsed ? "CP" : "Customer Portal"}
            </div>
            <nav id="main-navigation" aria-label="Main navigation">
              {menuContent}
            </nav>
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            title="Customer Portal"
            placement="left"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            bodyStyle={{ padding: 0 }}
            aria-label="Mobile navigation menu"
          >
            <nav id="main-navigation" aria-label="Main navigation">
              {menuContent}
            </nav>
          </Drawer>
        )}

        <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 250, transition: "all 0.2s" }}>
          <Header
            style={{
              padding: "0 24px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 4px rgba(0,21,41,.08)",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
            role="banner"
          >
            <Space>
              {isMobile ? (
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setMobileDrawerOpen(true)}
                  style={{ fontSize: 16 }}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileDrawerOpen}
                />
              ) : (
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: 16 }}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-expanded={!collapsed}
                />
              )}
            </Space>

            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight" 
              trigger={["click"]}
            >
              <Button
                type="text"
                style={{ cursor: "pointer", height: "auto", padding: "4px 8px" }}
                aria-label={`User menu for ${identity?.name || "User"}`}
                aria-haspopup="true"
              >
                <Space>
                  <Avatar
                    size="default"
                    src={identity?.avatar}
                    icon={!identity?.avatar && <UserOutlined />}
                    alt={identity?.name || "User avatar"}
                  />
                  {!isMobile && (
                    <Space direction="vertical" size={0}>
                      <Text strong>{identity?.name || "User"}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {identity?.email}
                      </Text>
                    </Space>
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Header>

          <Content style={{ margin: "0 16px" }}>
            {renderBreadcrumb()}
            <main
              id="main-content"
              ref={mainRef}
              tabIndex={-1}
              style={{
                padding: 24,
                minHeight: 360,
                background: "#fff",
                borderRadius: 8,
                outline: "none",
              }}
              role="main"
              aria-label="Main content"
            >
              {children}
            </main>
          </Content>

          <Layout.Footer style={{ textAlign: "center" }} role="contentinfo">
            Customer Portal ©{new Date().getFullYear()} - Secure Code Analysis
          </Layout.Footer>
        </Layout>
      </Layout>
    </>
  );
};
