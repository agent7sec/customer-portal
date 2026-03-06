import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Alert, Modal, Typography } from 'antd';
import { LockOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { accountService } from '../../services/AccountService';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

export const DeleteAccountForm: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const { signOut } = useAuth();

    const handleSubmit = async (values: { password: string }) => {
        setConfirmVisible(true);
    };

    const handleConfirmDelete = async () => {
        const password = form.getFieldValue('password');
        setLoading(true);

        try {
            await accountService.deleteAccount(password);
            notification.success({
                title: 'Account Deleted',
                message: 'Your account has been permanently deleted.',
            });
            await signOut();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete account';
            notification.error({
                title: 'Error',
                message: message,
            });
        } finally {
            setLoading(false);
            setConfirmVisible(false);
        }
    };

    return (
        <>
            <Card title="Delete Account" style={{ maxWidth: 500 }}>
                <Alert
                    type="error"
                    message="Danger Zone"
                    description={
                        <div>
                            <Text>Deleting your account will:</Text>
                            <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                <li>Permanently delete all your data</li>
                                <li>Cancel any active subscriptions</li>
                                <li>Remove access to all analyses and certificates</li>
                            </ul>
                            <Text strong>This action cannot be undone.</Text>
                        </div>
                    }
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                >
                    <Form.Item
                        name="password"
                        label="Confirm Password"
                        rules={[{ required: true, title: 'Password is required to delete your account' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter your password to confirm"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" danger htmlType="submit" loading={loading}>
                            Delete My Account
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Modal
                title={
                    <span>
                        <ExclamationCircleFilled style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Confirm Account Deletion
                    </span>
                }
                open={confirmVisible}
                onOk={handleConfirmDelete}
                onCancel={() => setConfirmVisible(false)}
                okText="Yes, Delete My Account"
                okButtonProps={{ danger: true, loading }}
                cancelText="Cancel"
            >
                <p>Are you absolutely sure you want to delete your account?</p>
                <p><Text strong>This action is permanent and cannot be undone.</Text></p>
            </Modal>
        </>
    );
};
