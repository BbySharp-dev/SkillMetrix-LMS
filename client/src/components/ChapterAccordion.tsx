import { useMemo, useState } from 'react';
import type { ChapterWithLessonsDto } from '@/types/course';
import LessonItem from './LessonItem';

interface ChapterAccordionProps {
    chapters: ChapterWithLessonsDto[];
}

export default function ChapterAccordion({ chapters }: ChapterAccordionProps) {
    
    const sorted = useMemo(() => [...chapters].sort((a, b) => a.orderIndex - b.orderIndex), [chapters]);

    
    const [openIds, setOpenIds] = useState<string[]>(() => (sorted[0] ? [sorted[0].id] : []));

    const toggle = (id: string) => {
        setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    return (
        <div>
            {sorted.map((chapter) => {
                const isOpen = openIds.includes(chapter.id);
                const lessons = [...chapter.lessons].sort((a, b) => a.orderIndex - b.orderIndex);

                return (
                    <section key={chapter.id}>
                        <button onClick={() => toggle(chapter.id)}>{chapter.title}</button>
                        {isOpen && (
                            <div>
                                {lessons.map((lesson) => (
                                    <LessonItem key={lesson.id} lesson={lesson} />
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}