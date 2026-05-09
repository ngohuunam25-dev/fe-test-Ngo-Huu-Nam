import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBulkDelete?: boolean;
  deleteCount?: number;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  isBulkDelete = false,
  deleteCount = 1,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined
            style={{ color: '#ff7875', fontSize: 20 }}
          />
          <span>Confirm Delete</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={handleConfirm}
          icon={<DeleteOutlined />}
        >
          Delete
        </Button>,
      ]}
      centered
    >
      <div style={{ marginTop: 16 }}>
        <p style={{ color: 'rgba(148, 163, 184, 0.9)', marginBottom: 0 }}>
          {isBulkDelete
            ? `${deleteCount} task${deleteCount > 1 ? 's' : ''} will be removed from the system.`
            : 'The task will be removed from the system.'}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
