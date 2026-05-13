import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Save, 
    Layout, 
    BookOpen, 
    Settings as SettingsIcon,
    AlertCircle,
    Upload, 
    X,
    Loader2,
    ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import CurriculumEditor from '../components/CurriculumEditor';

import { useUpload } from '@/features/upload/hooks/useUpload';
import { useCourseDetail, useCourseMutations } from '@/features/courses/hooks/useCourses';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import type { CourseStatus } from '../types';
import type { CourseEditorData } from '../types';


const STATUS_STYLES: Record<CourseStatus, string> = {
    Published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Draft: 'bg-gray-50 text-gray-600 border-gray-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
};

const STATUS_LABELS: Record<CourseStatus, string> = {
    Published: 'Đang hiển thị',
    Draft: 'Bản nháp',
    Pending: 'Đang chờ duyệt',
    Rejected: 'Bị từ chối',
};


export default function CourseEditorPage() {
    const { id } = useParams<{ id: string }>();
    const isNew = id === 'new';
    
    const { data: course, isLoading } = useCourseDetail(isNew ? undefined : id);

    if (isLoading && !isNew) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="size-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <CourseEditorForm 
            key={course?.id || 'new-course'} 
            initialData={course}
            isNew={isNew} 
            courseId={id} 
        />
    );
}

interface CourseEditorFormProps {
    initialData?: CourseEditorData;
    isNew: boolean;
    courseId?: string;
}

function CourseEditorForm({ initialData, isNew, courseId }: CourseEditorFormProps) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    
    const [activeTab, setActiveTab] = useState('info');
    

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        thumbnail: initialData?.thumbnail || '',
    });

    const { uploadImage } = useUpload();
    const { createCourse, updateCourse, deleteCourse, submitCourse } = useCourseMutations();

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề khóa học.');
            setActiveTab('info');
            return;
        }

        if (isNew) {
            createCourse.mutate({ 
                title: formData.title.trim(), 
                description: formData.description, 
                price: formData.price, 
                thumbnail: formData.thumbnail,
                instructorId: user?.id 
            }, {
                onSuccess: (newCourse) => {
                    if (newCourse?.id) {
                        toast.success('Đã tạo khóa học thành công');
                        navigate(`/instructor/courses/${newCourse.id}`, { replace: true });
                    } else {
                        toast.error('Lỗi dữ liệu: Không nhận được ID từ server.');
                    }
                }
            });
        } else if (courseId) {
            updateCourse.mutate(
                { id: courseId, data: formData },
                { onSuccess: () => toast.success('Đã lưu các thay đổi!') }
            );
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadImage.mutateAsync(file);
            setFormData(prev => ({ ...prev, thumbnail: url }));
        } catch{
            toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
        }
    };

    const isSaving = createCourse.isPending || updateCourse.isPending;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate('/instructor/courses')}
                        className="rounded-xl hover:bg-white border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeft className="size-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {isNew ? 'Tạo khóa học mới' : 'Chỉnh sửa khóa học'}
                            </h1>
                            {!isNew && initialData?.status && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${STATUS_STYLES[initialData.status as CourseStatus] ?? STATUS_STYLES['Draft']}`}>
                                    {STATUS_LABELS[initialData.status as CourseStatus] ?? 'Bản nháp'}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                            {isNew ? 'Bắt đầu xây dựng khóa học tuyệt vời của bạn' : `ID: ${courseId}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-black border-gray-200 hover:bg-white transition-all">
                        XEM TRƯỚC
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl shadow-lg shadow-indigo-200 transition-all min-w-40"
                    >
                        {isSaving ? (
                            <Loader2 className="size-5 mr-2 animate-spin" />
                        ) : (
                            <Save className="size-5 mr-2" />
                        )}
                        LƯU THAY ĐỔI
                    </Button>
                </div>
            </div>

            {/* Main Tabs Area */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white p-1 rounded-2xl border border-gray-200 h-auto gap-1 shadow-sm overflow-x-auto flex-nowrap justify-start w-full">
                    <TabsTrigger 
                        value="info" 
                        className="rounded-xl py-3 px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                        <Layout className="size-4 mr-2" />
                        Thông tin chung
                    </TabsTrigger>
                    
                    {!isNew && (
                        <>
                            <TabsTrigger 
                                value="curriculum" 
                                className="rounded-xl py-3 px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all whitespace-nowrap"
                            >
                                <BookOpen className="size-4 mr-2" />
                                Giáo trình
                            </TabsTrigger>
                            <TabsTrigger 
                                value="quiz" 
                                className="rounded-xl py-3 px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all whitespace-nowrap"
                            >
                                <ClipboardList className="size-4 mr-2" />
                                Quiz
                            </TabsTrigger>
                            <TabsTrigger 
                                value="settings" 
                                className="rounded-xl py-3 px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all whitespace-nowrap"
                            >
                                <SettingsIcon className="size-4 mr-2" />
                                Cài đặt
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                <div className="min-h-125">
                    <TabsContent value="info" className="m-0 focus-visible:outline-none">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Tiêu đề khóa học</label>
                                        <input 
                                            type="text" 
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="VD: Lập trình ReactJS từ zero đến hero"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Mô tả ngắn</label>
                                        <textarea 
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Tóm tắt những gì học viên sẽ đạt được..."
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Giá bán (VNĐ)</label>
                                            <input 
                                                type="number"
                                                min="0" 
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                placeholder="0"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Cấp độ (Placeholder)</label>
                                            <select 
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="All Levels">Tất cả trình độ</option>
                                                <option value="Beginner">Sơ cấp</option>
                                                <option value="Intermediate">Trung cấp</option>
                                                <option value="Expert">Cao cấp</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Ảnh thu nhỏ (Thumbnail)</label>
                                        <div className="relative group">
                                            {formData.thumbnail ? (
                                                <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                                    <img 
                                                        src={formData.thumbnail} 
                                                        alt="Course thumbnail" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button 
                                                            variant="destructive" 
                                                            size="icon"
                                                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                                            className="rounded-xl"
                                                        >
                                                            <X className="size-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="aspect-video rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 group hover:bg-gray-100 hover:border-indigo-300 transition-all cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                    {uploadImage.isPending ? (
                                                        <Loader2 className="size-10 text-indigo-600 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                                <Upload className="size-8 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                                            </div>
                                                            <p className="text-sm font-black text-gray-900">Tải ảnh lên hoặc kéo thả</p>
                                                            <p className="text-xs font-bold text-gray-400 mt-1">16:9, JPG/PNG, tối đa 2MB</p>
                                                        </>
                                                    )}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {!isNew && (
                        <>
                            <TabsContent value="curriculum" className="m-0 focus-visible:outline-none">
                                <CurriculumEditor />
                            </TabsContent>

                            <TabsContent value="quiz" className="m-0 focus-visible:outline-none">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Quản lý Quiz</h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Tạo và quản lý bài kiểm tra cho khóa học
                                            </p>
                                        </div>
                                        <Link
                                            to={`/instructor/quiz/${courseId}`}
                                            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                        >
                                            Quản lý Quiz
                                        </Link>
                                    </div>
                                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-6 text-center">
                                        <p className="text-sm text-indigo-700 font-medium">
                                            Nhấn "Quản lý Quiz" để tạo và chỉnh sửa các bài kiểm tra
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="m-0 focus-visible:outline-none">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                                    <div className="max-w-2xl space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                <AlertCircle className="size-5 text-amber-500" />
                                                Trạng thái hiển thị
                                            </h3>
                                            {initialData && (
                                                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                                                    <Badge className={`rounded-lg px-3 py-1 font-black text-xs uppercase tracking-wider border ${
                                                        STATUS_STYLES[initialData.status as CourseStatus] || STATUS_STYLES['Draft']
                                                    }`}>
                                                        {STATUS_LABELS[initialData.status as CourseStatus] || 'Bản nháp'}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {initialData.status === 'Published'
                                                            ? 'Khóa học đang được hiển thị công khai.'
                                                            : initialData.status === 'Pending'
                                                            ? 'Đang chờ admin xét duyệt. Bạn không thể chỉnh sửa.'
                                                            : initialData.status === 'Rejected'
                                                            ? 'Khóa học bị từ chối. Vui lòng chỉnh sửa và nộp lại.'
                                                            : 'Đây là bản nháp. Hoàn thiện giáo trình rồi nộp duyệt.'}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                {initialData?.status === 'Draft' && (
                                                    <Button
                                                        onClick={() => submitCourse.mutate(courseId!)}
                                                        disabled={submitCourse.isPending}
                                                        className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                                                    >
                                                        {submitCourse.isPending && <Loader2 className="size-5 mr-2 animate-spin" />}
                                                        NỘP DUYỆT KHÓA HỌC
                                                    </Button>
                                                )}
                                                {initialData?.status !== 'Published' && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.')) {
                                                                deleteCourse.mutate(courseId!, {
                                                                    onSuccess: () => navigate('/instructor/courses'),
                                                                });
                                                            }
                                                        }}
                                                        disabled={deleteCourse.isPending}
                                                        className="h-12 px-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black"
                                                    >
                                                        {deleteCourse.isPending && <Loader2 className="size-5 mr-2 animate-spin" />}
                                                        XÓA KHÓA HỌC
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </div>
    );
}