import React from 'react';
import { Form, Input, Typography } from 'antd';
import type { InputProps } from 'antd';

const { Text } = Typography;

interface FormFieldProps extends Omit<InputProps, 'id'> {
    name: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password';
    error?: string;
    description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    name,
    label,
    required,
    type = 'text',
    error,
    description,
    ...inputProps
}) => {
    const inputId = `field-${name}`;
    const errorId = `${inputId}-error`;
    const descId = `${inputId}-desc`;

    const ariaDescribedBy = [
        description ? descId : '',
        error ? errorId : '',
    ].filter(Boolean).join(' ') || undefined;

    return (
        <Form.Item
            name={name}
            label={<label htmlFor={inputId}>{label}</label>}
            required={required}
            validateStatus={error ? 'error' : undefined}
            help={error ? <span id={errorId}>{error}</span> : undefined}
        >
            <Input
                id={inputId}
                type={type}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={ariaDescribedBy}
                {...inputProps}
            />
            {description && (
                <Text id={descId} type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {description}
                </Text>
            )}
        </Form.Item>
    );
};
