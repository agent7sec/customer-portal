# Phase 14: Accessibility Specification

## Overview

Implement WCAG 2.1 AA compliance with semantic HTML, ARIA attributes, and keyboard navigation.

## Status: ⏳ NOT STARTED

---

## 14.1 Skip Links Component

### src/components/shared/SkipLinks.tsx

```typescript
import React from 'react';
import './SkipLinks.css';

export const SkipLinks: React.FC = () => (
  <nav aria-label="Skip links" className="skip-links">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <a href="#main-navigation" className="skip-link">Skip to navigation</a>
  </nav>
);
```

### src/components/shared/SkipLinks.css

```css
.skip-links {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  background: #1890ff;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 10px;
  left: 10px;
}
```

---

## 14.2 Accessible Form Component

### src/components/shared/FormField.tsx

```typescript
import React from 'react';
import { Form, Input, Typography } from 'antd';

const { Text } = Typography;

interface FormFieldProps {
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
}) => {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  return (
    <Form.Item
      name={name}
      label={<label htmlFor={inputId}>{label}</label>}
      required={required}
      validateStatus={error ? 'error' : undefined}
      help={error}
    >
      <Input
        id={inputId}
        type={type}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${description ? descId : ''} ${error ? errorId : ''}`.trim() || undefined}
      />
      {description && (
        <Text id={descId} type="secondary" style={{ fontSize: 12 }}>{description}</Text>
      )}
    </Form.Item>
  );
};
```

---

## 14.3 Focus Management Hook

### src/hooks/useFocusManagement.ts

```typescript
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useFocusOnRouteChange = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return mainRef;
};

export const useAnnounce = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  return { announce };
};
```

---

## 14.4 Screen Reader Styles

### src/styles/accessibility.css

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

*:focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}
```

---

## 14.5 Accessible Table Component

### src/components/shared/AccessibleTable.tsx

```typescript
import React from 'react';
import { Table, TableProps } from 'antd';

interface AccessibleTableProps<T> extends TableProps<T> {
  caption: string;
  summary?: string;
}

export function AccessibleTable<T extends object>({
  caption,
  summary,
  ...props
}: AccessibleTableProps<T>) {
  return (
    <div role="region" aria-label={caption}>
      <Table
        {...props}
        title={() => <span className="sr-only">{caption}</span>}
        summary={summary ? () => <caption className="sr-only">{summary}</caption> : undefined}
      />
    </div>
  );
}
```

---

## Verification

```bash
# Lighthouse accessibility audit
npm run build && npx serve dist
# Run axe-core tests
npm run test:a11y
```
