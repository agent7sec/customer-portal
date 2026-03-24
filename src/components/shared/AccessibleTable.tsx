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
      {summary && <p className="sr-only">{summary}</p>}
      <Table
        {...props}
        title={() => <span className="sr-only">{caption}</span>}
      />
    </div>
  );
}
