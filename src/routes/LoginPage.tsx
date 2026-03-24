import React from "react";
import { Button, Card, Typography, Space } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { useLogin } from "@refinedev/core";

const { Title, Paragraph } = Typography;

export const LoginPage: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();

  const handleLogin = () => {
    login({});
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, textAlign: "center" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2}>Customer Portal</Title>
          <Paragraph>
            Sign in to access your code analysis dashboard, manage subscriptions, and download
            certificates.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            loading={isLoading}
            block
          >
            Sign In with Auth0
          </Button>
        </Space>
      </Card>
    </div>
  );
};
