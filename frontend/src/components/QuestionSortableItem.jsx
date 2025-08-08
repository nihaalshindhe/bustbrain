import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function QuestionSortableItem({ id, index, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-10 top-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-grab hover:bg-gray-200 active:cursor-grabbing"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            </div>
            {children}
        </div>
    )
}