import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';

interface SortableItemProps {
    id: string;
    children: (props: { listeners?: DraggableSyntheticListeners }) => ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 9999 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {children({ listeners })}
        </div>
    );
}
