import { describe, it, expect, vi } from 'vitest';
import { Modal } from 'antd';
import { showConfirmModal, showDeleteConfirm } from './ConfirmModal';

vi.mock('antd', () => ({
  Modal: {
    confirm: vi.fn(),
  },
}));

describe('ConfirmModal', () => {
  describe('showConfirmModal', () => {
    it('should call Modal.confirm with correct parameters', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      showConfirmModal({
        title: 'Confirm Action',
        content: 'Are you sure?',
        onConfirm,
        onCancel,
        okText: 'Yes',
        cancelText: 'No',
      });

      expect(Modal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Confirm Action',
          content: 'Are you sure?',
          okText: 'Yes',
          cancelText: 'No',
          okType: 'primary',
        })
      );
    });

    it('should use danger okType when danger is true', () => {
      const onConfirm = vi.fn();

      showConfirmModal({
        title: 'Delete',
        content: 'Delete this item?',
        onConfirm,
        danger: true,
      });

      expect(Modal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          okType: 'danger',
        })
      );
    });
  });

  describe('showDeleteConfirm', () => {
    it('should show delete confirmation with correct text', () => {
      const onConfirm = vi.fn();

      showDeleteConfirm('Analysis', onConfirm);

      expect(Modal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete Analysis?',
          content: 'Are you sure you want to delete this analysis? This action cannot be undone.',
          okText: 'Delete',
        })
      );
    });
  });
});
