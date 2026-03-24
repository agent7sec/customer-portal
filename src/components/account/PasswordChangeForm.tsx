import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useForm } from '@refinedev/antd';
import { accountService } from '../../services/AccountService';
import type { ChangePasswordData } from '../../types/account.types';

const passwordRules = [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' },
    { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter' },
    { pattern: /[a-z]/, message: 'Password must contain a lowercase letter' },
    { pattern: /[0-9]/, message: 'Password must contain a number' },
    { pattern: /[!@#$%^&*]/, message: 'Password must contain a special character' },
];

export const PasswordChangeForm: React.FC = () => {
    const [success, setSuccess] = useState(false);

    const { formProps, saveButtonProps, form } = useForm<ChangePasswordData>({
        action: 'create',
        onMutationSuccess: () => {
            setSuccess(true);
            form.resetFields();
            notification.success({
                message: 'Success',
                description: 'Password changed successfully',
            });
        },
        onMutationError: (error: any) => {
            setSuccess(false);
            const message = error?.response?.data?.message || error?.message || 'Failed to change password';
            notification.error({
                message: 'Error',
                description: message,
            });
        },
    });

    const handleSubmit = async (values: ChangePasswordData) => {
        try {
            await accountService.changePassword(values);
        } catch (error: any) {
            throw error;
        }
    };

    return (
        <Card title="Change Password" style={{ maxWidth: 500 }}>
            {success && (
                <Alert
                    type="success"
                    message="Password changed successfully"
                    style={{ marginBottom: 16 }}
                    closable
                    onClose={() => setSuccess(false)}
                />
            )}

            <Form
                {...formProps}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
            >
                <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Current password is required' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter current password"
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={passwordRules}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter new password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm new password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" {...saveButtonProps}>
                        Change Password
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
