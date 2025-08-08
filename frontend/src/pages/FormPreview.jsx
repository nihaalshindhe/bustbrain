import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const FormPreview = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
                setForm(res.data);
            } catch (err) {
                console.error("Failed to fetch form:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchForm();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!form || !form.questions) return <p>Form not found or invalid structure</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">{form.title}</h2>

            {form.questions.map((question, index) => {
                if (question.type === "cloze") {
                    return <ClozeQuestion key={`${index}-${question.id}`} question={question} />;
                } else if (question.type === "categorize") {
                    return <CategorizeQuestion key={`${index}-${question.id}`} question={question} />;
                }else if (question.type === "comprehension") {
                    return <ComprehensionQuestion key={`${index}-${question.id}`} question={question} />;
                }

                return (
                    <div key={`${index}-${question.id}`} className="border p-4 rounded mb-4">
                        <h3 className="text-lg font-semibold mb-2">{question.header}</h3>
                        <p>Unsupported question type: {question.type}</p>
                    </div>
                );
            })}
        </div>
    );
};
const ComprehensionQuestion = ({ question }) => {
    const { header, passage, subQuestions } = question;
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (subQId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [subQId]: optionId
        }));
    };

    return (
        <div className="border p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-4">{header}</h3>

            <div className="mb-6 p-3 bg-gray-50 rounded">
                <p className="text-gray-700">{passage}</p>
            </div>

            <div className="space-y-4">
                {subQuestions.map((subQ, index) => (
                    <div key={subQ.id} className="border-b pb-4">
                        <p className="font-medium mb-3">
                            {index + 1}. {subQ.text}
                        </p>

                        <div className="space-y-2">
                            {subQ.options.map(option => (
                                <div key={option.id} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`${subQ.id}-${option.id}`}
                                        name={`subQ-${subQ.id}`}
                                        checked={answers[subQ.id] === option.id}
                                        onChange={() => handleAnswerChange(subQ.id, option.id)}
                                        className="mr-2"
                                    />
                                    <label
                                        htmlFor={`${subQ.id}-${option.id}`}
                                        className="cursor-pointer"
                                    >
                                        {option.text}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// Component for Cloze questions
const ClozeQuestion = ({ question }) => {
    const { header, text, blanks } = question;
    const [draggedOption, setDraggedOption] = useState(null);
    const [answers, setAnswers] = useState({});

    // Split text to identify blank positions
    const parts = text.split(/(__)/g).filter(part => part.trim() !== "");

    const handleDragStart = (e, option) => {
        setDraggedOption(option);
        e.dataTransfer.setData("text/plain", option.id);
    };

    const handleDrop = (e, blankIndex) => {
        e.preventDefault();
        if (draggedOption) {
            setAnswers(prev => ({
                ...prev,
                [blankIndex]: draggedOption
            }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="border p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-4">{header}</h3>

            <div className="flex flex-wrap items-center gap-1 mb-6">
                {parts.map((part, index) => {
                    if (part === "__") {
                        const answer = answers[index];
                        return (
                            <span
                                key={index}
                                className="inline-block min-w-[80px] h-10 border-2 border-dashed rounded mx-1 p-2"
                                onDrop={(e) => handleDrop(e, index)}
                                onDragOver={handleDragOver}
                            >
                                {answer ? answer.text : "____"}
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>

            <div className="flex flex-wrap gap-2">
                {blanks.map((blank) => {
                    const isUsed = Object.values(answers).some(a => a?.id === blank.id);
                    return (
                        <div
                            key={blank.id}
                            draggable={!isUsed}
                            onDragStart={!isUsed ? (e) => handleDragStart(e, blank) : undefined}
                            className={`px-3 py-2 border rounded ${
                                isUsed
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100 cursor-move"
                            }`}
                        >
                            {blank.text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Component for Categorize questions
const CategorizeQuestion = ({ question }) => {
    const { header, categories, options } = question;
    const [categoryItems, setCategoryItems] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);

    const handleDragStart = (e, option) => {
        setDraggedItem(option);
        e.dataTransfer.setData("text/plain", option.id);
    };

    const handleDrop = (e, categoryId) => {
        e.preventDefault();
        if (draggedItem) {
            setCategoryItems(prev => {
                // Remove from previous category
                const newState = { ...prev };
                Object.keys(newState).forEach(key => {
                    newState[key] = newState[key].filter(item => item.id !== draggedItem.id);
                });

                // Add to new category
                if (!newState[categoryId]) newState[categoryId] = [];
                newState[categoryId].push(draggedItem);

                return newState;
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="border p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-4">{header}</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {categories.map(category => (
                    <div key={category.id} className="border rounded p-3">
                        <h4 className="font-bold mb-3 text-center bg-gray-100 py-2 rounded">
                            {category.name}
                        </h4>
                        <div
                            className="min-h-[120px] border-2 border-dashed border-gray-300 rounded p-3"
                            onDrop={(e) => handleDrop(e, category.id)}
                            onDragOver={handleDragOver}
                        >
                            {categoryItems[category.id]?.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    className="bg-blue-100 px-3 py-2 rounded mb-2 cursor-move hover:bg-blue-200"
                                >
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isPlaced = Object.values(categoryItems).some(
                        items => items.some(item => item.id === option.id)
                    );

                    return (
                        <div
                            key={option.id}
                            draggable={!isPlaced}
                            onDragStart={!isPlaced ? (e) => handleDragStart(e, option) : undefined}
                            className={`px-3 py-2 border rounded ${
                                isPlaced
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100 cursor-move"
                            }`}
                        >
                            {option.text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormPreview;