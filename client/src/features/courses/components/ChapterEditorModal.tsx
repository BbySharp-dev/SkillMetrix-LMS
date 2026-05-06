import { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChapterEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { title: string }) => void;
    initialData?: { title: string };
}

export default function ChapterEditorModal({ open, onOpenChange, onSave, initialData }: ChapterEditorModalProps) {
    const [title, setTitle] = useState(initialData?.title || '');

    const [prevOpen, setPrevOpen] = useState(open);
    const [prevData, setPrevData] = useState(initialData);

    if (open !== prevOpen || initialData !== prevData) {
        setPrevOpen(open);
        setPrevData(initialData);
        
        if (open) {
            setTitle(initialData?.title || '');
        }
    }

    const handleSave = () => {
        onSave({ title });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125 rounded-3xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                        {initialData ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            Tiêu đề chương
                        </label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Tổng quan về dự án"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
                
                <DialogFooter className="gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)} 
                        className="h-12 px-6 rounded-xl font-black border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        HỦY BỎ
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!title.trim()}
                        className="h-12 px-8 rounded-xl bg-gray-900 font-black hover:bg-gray-800 transition-colors"
                    >
                        LƯU THAY ĐỔI
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}