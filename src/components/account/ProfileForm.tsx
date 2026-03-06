import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, notification, Spin, Avatar, Upload, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons';
import { accountService } from '../../services/AccountService';
import type { UserProfile, UpdateProfileData } from '../../types/account.types';

export const ProfileForm: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await accountService.getUserProfile();
            setProfile(data);
            form.setFieldsValue({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                company: data.company,
                jobTitle: data.jobTitle,
            });
        } catch (error) {
            notification.error({
                title: 'Error',
                message: 'Failed to load profile',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: UpdateProfileData) => {
        setSaving(true);
        try {
            const updated = await accountService.updateProfile(values);
            setProfile(updated);
            notification.success({
                title: 'Success',
                message: 'Profile updated successfully',
            });
        } catch (error) {
            notification.error({
                title: 'Error',
                message: 'Failed to update profile',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Card title="Profile Information" style={{ maxWidth: 600 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={80} src={profile?.picture} icon={<UserOutlined />} />
                <div style={{ marginTop: 8 }}>
                    <Upload showUploadList={false}>
                        <Button size="small">Change Photo</Button>
                    </Upload>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, title: 'First name is required' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="John" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, title: 'Last name is required' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Doe" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="phone" label="Phone Number">
                    <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 000-0000" />
                </Form.Item>

                <Form.Item name="company" label="Company">
                    <Input prefix={<BankOutlined />} placeholder="Acme Inc." />
                </Form.Item>

                <Form.Item name="jobTitle" label="Job Title">
                    <Input prefix={<IdcardOutlined />} placeholder="Software Engineer" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving}>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
