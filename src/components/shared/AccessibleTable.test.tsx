import { render, screen } from '@testing-library/react';
import { AccessibleTable } from './AccessibleTable';

describe('AccessibleTable', () => {
  const mockData = [
    { key: '1', name: 'John', age: 30 },
    { key: '2', name: 'Jane', age: 25 },
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
  ];

  it('renders table with caption', () => {
    render(
      <AccessibleTable
        caption="User list"
        dataSource={mockData}
        columns={columns}
      />
    );

    expect(screen.getByText('User list')).toBeInTheDocument();
  });

  it('has region role with aria-label', () => {
    const { container } = render(
      <AccessibleTable
        caption="User list"
        dataSource={mockData}
        columns={columns}
      />
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-label', 'User list');
  });

  it('renders summary when provided', () => {
    render(
      <AccessibleTable
        caption="User list"
        summary="Table showing user information"
        dataSource={mockData}
        columns={columns}
      />
    );

    expect(screen.getByText('Table showing user information')).toBeInTheDocument();
  });
});
