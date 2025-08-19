import { useState, useEffect } from 'react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import QuestionSortableItem from '../components/QuestionSortableItem'
import QuestionEditor from '../components/QuestionEditor'
import axios from 'axios'

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

export default function FormBuilder() {
    const [form, setForm] = useState({
        title: 'Untitled Form',
        headerImageUrl: '',
        questions: []
    })

    const [activeQuestion, setActiveQuestion] = useState(null)
    const handleSubmitForm = async () => {
        try {
            const res = await axios.post('https://bustbrain.onrender.com/api/forms', form)
            const formId = res.data._id
            const formLink = `${window.location.origin}/forms/${formId}`
            alert(`✅ Form submitted!\nView your form at:\n${formLink}`)
            window.open(formLink, '_blank')
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('❌ Error submitting form. Please try again.')
        }
    }


    const addQuestion = () => {
        const newQuestion = {
            id: generateId(),
            header: `Question ${form.questions.length + 1}`,
            text: '',
            type: '', // 👈 now user must choose
            imageUrl: '',
            blanks: [],
            categories: [],
            options: [],
            passage: '',
            subQuestions: []
        }
        setForm({
            ...form,
            questions: [...form.questions, newQuestion]
        })
    }



    const updateQuestion = (questionId, newData) => {
        setForm({
            ...form,
            questions: form.questions.map(q =>
                q.id === questionId ? {...q, ...newData} : q
            )
        })
    }


    const removeQuestion = (questionId) => {
        setForm({
            ...form,
            questions: form.questions.filter(q => q.id !== questionId)
        })
    }


    const handleQuestionsDragStart = (event) => {
        const { active } = event
        setActiveQuestion(form.questions.find(q => q.id === active.id))
    }


    const handleQuestionsDragEnd = (event) => {
        const {active, over} = event
        if (!over || active.id === over.id) return

        const oldIndex = form.questions.findIndex(q => q.id === active.id)
        const newIndex = form.questions.findIndex(q => q.id === over.id)

        setForm({
            ...form,
            questions: arrayMove(form.questions, oldIndex, newIndex)
        })

        setActiveQuestion(null)
    }

    const handleDragCancel = () => {
        setActiveQuestion(null)
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-center">Form Builder</h1>
            <div className="mb-6">
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className="text-3xl font-bold w-full p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    placeholder="Form Title"
                />
                <input
                    type="text"
                    value={form.headerImageUrl}
                    onChange={e => setForm({...form, headerImageUrl: e.target.value})}
                    className="w-full p-2 border-b border-gray-200 mt-2"
                    placeholder="Header Image URL"
                />
            </div>

            <DndContext
                onDragStart={handleQuestionsDragStart}
                onDragEnd={handleQuestionsDragEnd}
                onDragCancel={handleDragCancel}
                collisionDetection={closestCenter}
            >
                <SortableContext
                    items={form.questions.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {form.questions.map((question, index) => (
                            <QuestionSortableItem
                                key={question.id}
                                id={question.id}
                                index={index}
                            >
                                <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                                            <input
                                                type="text"
                                                value={question.header}
                                                onChange={e => updateQuestion(question.id, {header: e.target.value})}
                                                className="text-xl font-semibold p-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                                                placeholder="Question Header"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeQuestion(question.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>

                                    <QuestionEditor
                                        question={question}
                                        updateQuestion={updateQuestion}
                                    />
                                </div>
                            </QuestionSortableItem>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeQuestion ? (
                        <div className="p-4 border rounded-lg bg-white shadow-lg opacity-80 cursor-grabbing">
                            <div className="flex items-center mb-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mr-3">
                  {form.questions.findIndex(q => q.id === activeQuestion.id) + 1}
                </span>
                                <h3 className="text-xl font-semibold truncate max-w-xs">
                                    {activeQuestion.header || "Question"}
                                </h3>
                            </div>
                            <p className="text-gray-500 text-sm truncate">
                                {activeQuestion.type} question
                            </p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <button
                onClick={addQuestion}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center mt-6 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                     fill="currentColor">
                    <path fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"/>
                </svg>
                Add Question
            </button>
            <button
                onClick={handleSubmitForm}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center mt-6 transition-colors"
            >
                Submit Form
            </button>
        </div>
    )
}