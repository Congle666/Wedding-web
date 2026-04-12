import { Modal } from 'antd';

interface ConfirmOptions {
  title: string;
  content: string;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function showConfirm({ title, content, onOk, okText, cancelText, danger }: ConfirmOptions) {
  Modal.confirm({
    title,
    content,
    okText: okText || 'Xác nhận',
    cancelText: cancelText || 'Huỷ',
    okButtonProps: danger ? { danger: true } : { style: { background: '#8B1A1A', borderColor: '#8B1A1A' } },
    onOk,
  });
}
