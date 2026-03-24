import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccountSettingsPage } from '../../routes/AccountSettingsPage';

vi.mock('@refinedev/antd', async () => {
    const actual = await vi.importActual('@refinedev/antd');
    return {
        ...actual,
        useForm: () => ({
            formProps: { form: undefined },
            saveButtonProps: { loading: false },
            form: { setFieldsValue: vi.fn(), resetFields: vi.fn() },
        }),
    };
});

describe('AccountSettingsPage', () => {
    it('renders account settings page with menu', () => {
        render(<AccountSettingsPage />);

        expect(screen.getByText('Account Settings')).toBeInTheDocument();
        expect(screen.getAllByText('Profile Information')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Change Password')[0]).toBeInTheDocument();
    });
});
