import { useMemo } from 'react';
import { BookText, Clock } from 'lucide-react';
import type { ChapterWithLessonsDto } from '../types';
import LessonItem from './LessonItem';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ChapterAccordionProps {
    chapters: ChapterWithLessonsDto[];
}

export default function ChapterAccordion({ chapters }: ChapterAccordionProps) {
    const sorted = useMemo(() => [...chapters].sort((a, b) => a.orderIndex - b.orderIndex), [chapters]);

    return (
        <Accordion type="multiple" defaultValue={[sorted[0]?.id]} className="w-full space-y-6">
            {sorted.map((chapter, index) => {
                const lessons = [...chapter.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
                const totalDuration = lessons.reduce((acc, curr) => acc + curr.durationSeconds, 0);
                const durationMinutes = Math.floor(totalDuration / 60);

                return (
                    <AccordionItem 
                        key={chapter.id} 
                        value={chapter.id}
                        className="border border-gray-100 rounded-[24px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <AccordionTrigger className="hover:no-underline px-6 py-6 group">
                            <div className="flex flex-1 items-center gap-5 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {index + 1}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">{chapter.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <BookText className="size-3.5" />
                                            {lessons.length} bài học
                                        </span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            {durationMinutes} phút
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                            <div className="bg-gray-50/50 rounded-2xl p-2 space-y-1">
                                {lessons.map((lesson, lIndex) => (
                                    <LessonItem key={lesson.id} lesson={lesson} index={lIndex + 1} />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
