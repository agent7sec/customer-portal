import React from "react";
import { ProfileForm } from "../components/account/ProfileForm";
import { PasswordChangeForm } from "../components/account/PasswordChangeForm";
import { Card, Space, Typography } from "antd";

const { Title } = Typography;

export const AccountSettingsPage: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Account Settings</Title>
      <Card title="Profile Information">
        <ProfileForm />
      </Card>
      <Card title="Change Password">
        <PasswordChangeForm />
      </Card>
    </Space>
  );
};
