import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function OptionSortableItem({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = { transform: CSS.Transform.toString(transform), transition }
    return (
        <div ref={setNodeRef} style={style} className="bg-gray-100 p-2 rounded mb-2">
            <div className="flex items-start">
                <span {...attributes} {...listeners} className="cursor-move text-gray-400 mr-2 mt-1">⠿</span>
                <div className="w-full">{children}</div>
            </div>
        </div>
    )
}