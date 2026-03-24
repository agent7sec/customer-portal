import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps {
  title: string;
  content: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger' | 'default';
  danger?: boolean;
}

/**
 * Reusable confirmation modal for destructive actions with accessibility support
 */
export const showConfirmModal = ({
  title,
  content,
  onConfirm,
  onCancel,
  okText = 'Confirm',
  cancelText = 'Cancel',
  okType = 'primary',
  danger = false,
}: ConfirmModalProps) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined aria-hidden="true" />,
    content,
    okText,
    cancelText,
    okType: danger ? 'danger' : okType,
    onOk: async () => {
      await onConfirm();
    },
    onCancel,
    modalRender: (modal) => (
      <div role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
        {modal}
      </div>
    ),
  });
};

/**
 * Shorthand for delete confirmation
 */
export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmModal({
    title: `Delete ${itemName}?`,
    content: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
    onConfirm,
    okText: 'Delete',
    danger: true,
  });
};

// Export default component for consistency
export const ConfirmModal = {
  show: showConfirmModal,
  showDelete: showDeleteConfirm,
};
