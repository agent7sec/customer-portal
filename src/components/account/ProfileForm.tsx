import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, notification, Spin, Avatar, Upload, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons';
import { useForm } from '@refinedev/antd';
import { accountService } from '../../services/AccountService';
import type { UserProfile, UpdateProfileData } from '../../types/account.types';

export const ProfileForm: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const { formProps, saveButtonProps, form } = useForm<UpdateProfileData>({
        action: 'edit',
        onMutationSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Profile updated successfully',
            });
        },
        onMutationError: (error: any) => {
            notification.error({
                message: 'Error',
                description: error?.message || 'Failed to update profile',
            });
        },
    });

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
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error?.message || 'Failed to load profile',
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSubmit = async (values: UpdateProfileData) => {
        try {
            const updated = await accountService.updateProfile(values);
            setProfile(updated);
            form.setFieldsValue({
                firstName: updated.firstName,
                lastName: updated.lastName,
                phone: updated.phone,
                company: updated.company,
                jobTitle: updated.jobTitle,
            });
        } catch (error: any) {
            throw error;
        }
    };

    if (loadingProfile) {
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
                {...formProps}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: 'First name is required' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="John" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: 'Last name is required' }]}
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
                    <Button type="primary" htmlType="submit" {...saveButtonProps}>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
