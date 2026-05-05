import { X } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    open,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-black text-gray-900">{title}</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        disabled={loading}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 font-medium leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-none border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-none bg-[#a435f0] text-white font-bold hover:bg-[#8710d8] transition-all disabled:opacity-50 shadow-lg"
                    >
                        {loading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}