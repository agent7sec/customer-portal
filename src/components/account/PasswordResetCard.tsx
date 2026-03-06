import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, notification, Alert } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { auth0Config } from '../../config/auth0';
import { accountService } from '../../services/AccountService';

const { Text, Paragraph } = Typography;

export const PasswordResetCard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        const loadEmail = async () => {
            try {
                const profile = await accountService.getUserProfile();
                setEmail(profile.email);
            } catch {
                // Will show empty email, button still works if user's email is known
            }
        };
        loadEmail();
    }, []);

    const handleResetPassword = async () => {
        if (!email) {
            notification.error({
                title: 'Error',
                message: 'Unable to determine your email address.',
            });
            return;
        }

        setLoading(true);
        setSent(false);

        try {
            await fetch(`https://${auth0Config.domain}/dbconnections/change_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: auth0Config.clientId,
                    email,
                    connection: 'Username-Password-Authentication',
                }),
            });

            // Auth0 always returns 200 for this endpoint regardless of whether the email exists
            setSent(true);
            notification.success({
                title: 'Email Sent',
                message: 'A password reset email has been sent. Please check your inbox.',
            });
        } catch {
            notification.error({
                title: 'Error',
                message: 'Failed to send password reset email. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Change Password" style={{ maxWidth: 500 }}>
            {sent && (
                <Alert
                    type="success"
                    message="Password reset email sent"
                    description="Please check your inbox and follow the link to reset your password."
                    style={{ marginBottom: 16 }}
                />
            )}

            <Paragraph>
                To change your password, we'll send a password reset link to your email address.
                Click the link in the email to set a new password.
            </Paragraph>

            {email && (
                <Paragraph>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text strong>{email}</Text>
                </Paragraph>
            )}

            <Button
                type="primary"
                icon={<LockOutlined />}
                loading={loading}
                onClick={handleResetPassword}
                disabled={!email}
            >
                Send Password Reset Email
            </Button>
        </Card>
    );
};
