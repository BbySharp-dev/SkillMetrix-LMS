import { useParams } from 'react-router-dom';
import {useCourseCurriculum, useCourseDetail} from '@/hooks/useCourses';
import ChapterAccordion from '@/components/ChapterAccordion';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    
    const { data, isLoading, isError, error } = useCourseDetail(id);
    
    const { data: curriculum } = useCourseCurriculum(id);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-52 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">
                Failed to load course detail: {String(error)}
            </div>
        );
    }

    const isFree = data.price <= 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <section className="space-y-6">
                <div className="rounded-2xl overflow-hidden bg-linear-to-br from-indigo-700 to-cyan-600 text-white p-6 md:p-8">
                    <p className="text-indigo-100 text-sm mb-2">Course Detail</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{data.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span>{data.enrollmentCount.toLocaleString()} students</span>
                        <span>{data.chapterCount} chapters</span>
                        <span className="capitalize text-indigo-200">{data.status}</span>
                    </div>

                    <p className="mt-4 text-indigo-100">Instructor: {data.instructorName}</p>
                </div>

                {data.description && (
                    <article className="bg-white border rounded-xl p-5">
                        <h2 className="font-semibold text-lg mb-2">About this course</h2>
                        <p className="text-gray-700 whitespace-pre-line">{data.description}</p>
                    </article>
                )}

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Curriculum</h2>
                    {curriculum ? (
                        <ChapterAccordion chapters={curriculum} />
                    ) : (
                        <div className="text-gray-500 text-sm">Loading curriculum...</div>
                    )}
                </section>
            </section>

            <aside className="lg:sticky lg:top-20">
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <img
                        src={data.thumbnail || 'https://placehold.co/640x360?text=Course+Preview'}
                        alt={data.title || 'Course'}
                        className="w-full h-48 object-cover"
                    />

                    <div className="p-5 space-y-4">
                        <p className="text-2xl font-bold">{isFree ? 'Free' : `$${data.price.toFixed(2)}`}</p>

                        <button className="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
                            Enroll now
                        </button>

                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Full lifetime access</li>
                            <li>• Access on mobile and desktop</li>
                            <li>• Certificate of completion</li>
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
    );
}