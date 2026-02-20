interface PaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
  }
  interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    actionType?: "switchOn" | "switchOff";
    disabled?: boolean;
  }