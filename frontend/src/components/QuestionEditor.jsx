import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import OptionSortableItem from './OptionSortableItem'
import { useState } from 'react'

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

export default function QuestionEditor({ question, updateQuestion }) {
    const [activeDragId, setActiveDragId] = useState(null)

    const handleChange = (field, value) => updateQuestion(question.id, { ...question, [field]: value })

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id)
    }
    const handleDragEnd = (event) => {
        setActiveDragId(null)
        const { active, over } = event
        if (!over || active.id === over.id) return

        if (question.type === 'categorize') {
            const oldIndex = question.options.findIndex(opt => opt.id === active.id)
            const newIndex = question.options.findIndex(opt => opt.id === over.id)
            handleChange('options', arrayMove(question.options, oldIndex, newIndex))
        }

        if (question.type === 'categorize' && active.id.startsWith('category-')) {
            const oldIndex = question.categories.findIndex(cat => `category-${cat.id}` === active.id)
            const newIndex = question.categories.findIndex(cat => `category-${cat.id}` === over.id)
            handleChange('categories', arrayMove(question.categories, oldIndex, newIndex))
        }

        if (question.type === 'comprehension' && active.id.startsWith('subopt-')) {
            const [subqIndex] = active.id.split(':')[1].split('-').map(Number)
            const optionId = active.id.split(':')[0].replace('subopt-', '')

            const subq = question.subQuestions[subqIndex]
            const oldIndex = subq.options.findIndex(opt => opt.id === optionId)
            const newIndex = subq.options.findIndex(opt => opt.id === over.id.replace('subopt-', ''))

            if (oldIndex !== newIndex) {
                const newOptions = arrayMove(subq.options, oldIndex, newIndex)
                const newSubQuestions = [...question.subQuestions]
                newSubQuestions[subqIndex] = { ...subq, options: newOptions }
                handleChange('subQuestions', newSubQuestions)
            }
        }

        if (question.type === 'cloze') {
            const oldIndex = question.blanks.findIndex(opt => opt.id === active.id)
            const newIndex = question.blanks.findIndex(opt => opt.id === over.id)
            handleChange('blanks', arrayMove(question.blanks, oldIndex, newIndex))
        }
    }

    return (
        <div className="p-4 border rounded">
            <select
                value={question.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="mb-2 border p-1 w-full"
            >
                <option value="" disabled hidden>Choose question type</option>
                <option value="cloze">Cloze</option>
                <option value="comprehension">Comprehension</option>
                <option value="categorize">Categorize</option>
            </select>


            {question.type === 'cloze' && (
                <>
        <textarea
            value={question.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Sentence with __ for blanks"
            className="w-full border p-3 text-lg mb-4"
        />

                    <DndContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        collisionDetection={closestCenter}
                    >
                        <SortableContext
                            items={(question.blanks || []).map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <h4 className="font-semibold text-lg mb-2">Blanks:</h4>
                            {(question.blanks || []).map((blank, index) => (
                                <OptionSortableItem
                                    key={blank.id}
                                    id={blank.id}
                                    className={activeDragId === blank.id ? 'opacity-50' : ''}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <span className="text-xl">⬜</span>
                                        <input
                                            type="text"
                                            value={blank.text}
                                            onChange={e => {
                                                const newBlanks = [...question.blanks]
                                                newBlanks[index] = {...blank, text: e.target.value}
                                                handleChange('blanks', newBlanks)
                                            }}
                                            className="flex-1 border p-3 text-base"
                                            placeholder={`Blank ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const newBlanks = [...question.blanks]
                                                newBlanks.splice(index, 1)
                                                handleChange('blanks', newBlanks)
                                            }}
                                            className="text-red-600 hover:text-red-800 text-2xl"
                                            title="Delete Blank"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </OptionSortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button
                        onClick={() =>
                            handleChange('blanks', [
                                ...(question.blanks || []),
                                {id: generateId(), text: `Blank ${(question.blanks?.length || 0) + 1}`}
                            ])
                        }
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-base"
                    >
                        + Add Blank
                    </button>
                </>
            )}

            {question.type === 'categorize' && (
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    collisionDetection={closestCenter}
                >
                    <div className="mb-4">
                        <h3 className="font-medium mb-2">Categories</h3>
                        <SortableContext
                            items={(question.categories || []).map(cat => `category-${cat.id}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            {(question.categories || []).map((cat, index) => (
                                <OptionSortableItem
                                    key={`category-${cat.id}`}
                                    id={`category-${cat.id}`}
                                    className={activeDragId === `category-${cat.id}` ? 'opacity-50' : ''}
                                >
                                    <div className="flex items-center w-full gap-4">
                                        <span className="text-xl">📋</span>
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={(e) => {
                                                const newCategories = [...question.categories]
                                                newCategories[index] = {...cat, name: e.target.value}
                                                handleChange('categories', newCategories)
                                            }}
                                            className="flex-1 border p-3 text-base"
                                            placeholder={`Category ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const newCategories = [...question.categories]
                                                newCategories.splice(index, 1)
                                                handleChange('categories', newCategories)
                                            }}
                                            className="text-red-600 hover:text-red-800 text-2xl"
                                            title="Delete Category"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>

                                </OptionSortableItem>
                            ))}
                        </SortableContext>
                        <button
                            onClick={() => handleChange('categories', [
                                ...(question.categories || []),
                                {id: generateId(), name: `Category ${(question.categories?.length || 0) + 1}`}
                            ])}
                            className="mt-2 bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                            + Add Category
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-medium mb-2">Items</h3>
                        <SortableContext
                            items={(question.options || []).map(opt => opt.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {(question.options || []).map((opt, index) => (
                                <OptionSortableItem
                                    key={opt.id}
                                    id={opt.id}
                                    className={activeDragId === opt.id ? 'opacity-50' : ''}
                                >
                                    <div className="flex items-center w-full gap-4">
                                        <span className="text-xl">✏️</span>
                                        <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => {
                                                const newOptions = [...question.options]
                                                newOptions[index] = {...opt, text: e.target.value}
                                                handleChange('options', newOptions)
                                            }}
                                            className="flex-1 border p-3 text-base"
                                            placeholder={`Item ${index + 1}`}
                                        />
                                        <select
                                            value={opt.categoryId || ''}
                                            onChange={(e) => {
                                                const newOptions = [...question.options]
                                                newOptions[index] = {...opt, categoryId: e.target.value || null}
                                                handleChange('options', newOptions)
                                            }}
                                            className="border p-3 min-w-[140px] text-base"
                                        >
                                            <option value="">Uncategorized</option>
                                            {(question.categories || []).map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const newOptions = [...question.options]
                                                newOptions.splice(index, 1)
                                                handleChange('options', newOptions)
                                            }}
                                            className="text-red-600 hover:text-red-800 text-2xl"
                                            title="Delete Item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>

                                </OptionSortableItem>
                            ))}
                        </SortableContext>
                        <button
                            onClick={() => handleChange('options', [
                                ...(question.options || []),
                                {
                                    id: generateId(),
                                    text: `Item ${(question.options?.length || 0) + 1}`,
                                    categoryId: null
                                }
                            ])}
                            className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        >
                            + Add Item
                        </button>
                    </div>
                </DndContext>
            )}

            {question.type === 'comprehension' && (
                <>
          <textarea
              value={question.passage}
              onChange={(e) => handleChange('passage', e.target.value)}
              placeholder="Passage text"
              className="w-full border p-2 mb-2"
          />

                    {(question.subQuestions || []).map((sq, sqIndex) => (
                        <div key={sq.id || sqIndex} className="mb-4 p-3 border rounded">
                            <div className="mb-3">
                                <input
                                    type="text"
                                    value={sq.text || ''}
                                    onChange={e => {
                                        const arr = [...question.subQuestions]
                                        arr[sqIndex] = {...arr[sqIndex], text: e.target.value}
                                        handleChange('subQuestions', arr)
                                    }}
                                    placeholder="Sub-question text"
                                    className="w-full border p-2 mb-2"
                                />

                                <DndContext
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    collisionDetection={closestCenter}
                                >
                                    <SortableContext
                                        items={(sq.options || []).map(opt => `subopt-${opt.id}:${sqIndex}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <h4 className="font-medium mb-2">Options:</h4>
                                        {(sq.options || []).map((opt, optIndex) => (
                                            <OptionSortableItem
                                                key={opt.id}
                                                id={`subopt-${opt.id}:${sqIndex}`}
                                                className={activeDragId === `subopt-${opt.id}:${sqIndex}` ? 'opacity-50' : ''}
                                            >
                                                <div className="flex items-center w-full gap-4">
                                                    <span className="text-xl">•</span>
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        onChange={e => {
                                                            const arr = [...question.subQuestions]
                                                            const options = [...arr[sqIndex].options]
                                                            options[optIndex] = {...opt, text: e.target.value}
                                                            arr[sqIndex] = {...arr[sqIndex], options}
                                                            handleChange('subQuestions', arr)
                                                        }}
                                                        className="flex-1 border p-3 text-base"
                                                        placeholder={`Option ${optIndex + 1}`}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        checked={opt.isCorrect || false}
                                                        onChange={e => {
                                                            const arr = [...question.subQuestions]
                                                            const options = [...arr[sqIndex].options]
                                                            options[optIndex] = {...opt, isCorrect: e.target.checked}
                                                            arr[sqIndex] = {...arr[sqIndex], options}
                                                            handleChange('subQuestions', arr)
                                                        }}
                                                        className="h-5 w-5"
                                                    />
                                                    <span className="text-sm">Correct?</span>
                                                    <button
                                                        onClick={() => {
                                                            const arr = [...question.subQuestions]
                                                            const options = [...arr[sqIndex].options]
                                                            options.splice(optIndex, 1)
                                                            arr[sqIndex] = {...arr[sqIndex], options}
                                                            handleChange('subQuestions', arr)
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-2xl"
                                                        title="Delete Option"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                                                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                        </svg>
                                                    </button>
                                                </div>

                                            </OptionSortableItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>

                                <button
                                    onClick={() => {
                                        const arr = [...question.subQuestions]
                                        arr[sqIndex] = {
                                            ...arr[sqIndex],
                                            options: [
                                                ...(arr[sqIndex].options || []),
                                                {
                                                    id: generateId(),
                                                    text: `Option ${(arr[sqIndex].options?.length || 0) + 1}`
                                                }
                                            ]
                                        }
                                        handleChange('subQuestions', arr)
                                    }}
                                    className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                >
                                    + Add Option
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    const arr = [...question.subQuestions]
                                    arr.splice(sqIndex, 1)
                                    handleChange('subQuestions', arr)
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                            >
                                Remove Sub-question
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => handleChange('subQuestions', [
                            ...(question.subQuestions || []),
                            {
                                id: generateId(),
                                text: '',
                                options: [{id: generateId(), text: 'Option 1'}]
                            }
                        ])}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                        + Add Sub-question
                    </button>
                </>
            )}

            <input
                type="text"
                placeholder="Image URL (optional)"
                value={question.imageUrl || ''}
                onChange={e => handleChange('imageUrl', e.target.value)}
                className="w-full border p-2 mt-4"
            />
        </div>
    )
}