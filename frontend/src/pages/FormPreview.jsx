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
                const res = await axios.get(`https://bustbrain.onrender.com/api/forms/${id}`);
                setForm(res.data);
            } catch (err) {
                console.error("Failed to fetch form:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchForm();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!form || !form.questions) return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-semibold text-red-800 mt-4">Form Not Found</h3>
                <p className="text-gray-600 mt-2">The requested form could not be loaded or has an invalid structure.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.title}</h1>
                <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
            </div>

            {form.questions.map((question, index) => {
                if (question.type === "cloze") {
                    return <ClozeQuestion key={`${index}-${question.id}`} question={question} />;
                } else if (question.type === "categorize") {
                    return <CategorizeQuestion key={`${index}-${question.id}`} question={question} />;
                } else if (question.type === "comprehension") {
                    return <ComprehensionQuestion key={`${index}-${question.id}`} question={question} />;
                }

                return (
                    <div key={`${index}-${question.id}`} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">{question.header}</h3>
                        <p className="text-orange-500 bg-orange-50 px-3 py-2 rounded-md text-sm">
                            Unsupported question type: {question.type}
                        </p>
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
        <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Comprehension
                </span>
                {header}
            </h3>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">{passage}</p>
            </div>

            <div className="space-y-5">
                {subQuestions.map((subQ, index) => (
                    <div key={subQ.id} className="border-b border-gray-100 pb-5 last:border-0">
                        <p className="font-medium text-gray-800 mb-4 flex items-start">
                            <span className="bg-gray-100 text-gray-800 font-medium rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-1 text-sm">
                                {index + 1}
                            </span>
                            {subQ.text}
                        </p>

                        <div className="space-y-3 ml-8">
                            {subQ.options.map(option => (
                                <div key={option.id} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`${subQ.id}-${option.id}`}
                                        name={`subQ-${subQ.id}`}
                                        checked={answers[subQ.id] === option.id}
                                        onChange={() => handleAnswerChange(subQ.id, option.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor={`${subQ.id}-${option.id}`}
                                        className="ml-3 block text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
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

const ClozeQuestion = ({ question }) => {
    const { header, text, blanks } = question;
    const [draggedOption, setDraggedOption] = useState(null);
    const [answers, setAnswers] = useState({});
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const parts = text.split(/(__)/g).filter(part => part.trim() !== "");

    const handleDragStart = (e, option) => {
        setDraggedOption(option);
        e.dataTransfer.setData("text/plain", option.id);
        e.target.classList.add("opacity-50", "scale-95");
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove("opacity-50", "scale-95");
    };

    const handleDrop = (e, blankIndex) => {
        e.preventDefault();
        if (draggedOption) {
            setAnswers(prev => ({
                ...prev,
                [blankIndex]: draggedOption
            }));
        }
        setDragOverIndex(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Fill in the blanks
                </span>
                {header}
            </h3>

            <div className="flex flex-wrap items-center gap-1 mb-8 p-3 bg-gray-50 rounded-lg">
                {parts.map((part, index) => {
                    if (part === "__") {
                        const answer = answers[index];
                        return (
                            <span
                                key={index}
                                className={`inline-block min-w-[90px] h-10 rounded mx-1 p-2 flex items-center justify-center ${
                                    dragOverIndex === index
                                        ? "bg-blue-100 border-2 border-blue-500 border-dashed"
                                        : "border border-gray-300"
                                } ${
                                    answer
                                        ? "bg-green-50 border-green-500 text-green-700 font-medium"
                                        : "bg-white"
                                }`}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                            >
                                {answer ? answer.text : "____"}
                            </span>
                        );
                    }
                    return <span key={index} className="text-gray-700">{part}</span>;
                })}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="w-full text-sm text-gray-600 mb-2">Drag options to blanks:</p>
                {blanks.map((blank) => {
                    const isUsed = Object.values(answers).some(a => a?.id === blank.id);
                    return (
                        <div
                            key={blank.id}
                            draggable={!isUsed}
                            onDragStart={(e) => handleDragStart(e, blank)}
                            onDragEnd={handleDragEnd}
                            className={`px-4 py-2 rounded-lg transition-all duration-150 ${
                                isUsed
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-blue-400 cursor-grab active:cursor-grabbing active:scale-[0.98]"
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

const CategorizeQuestion = ({ question }) => {
    const { header, categories, options } = question;
    const [categoryItems, setCategoryItems] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCategory, setDragOverCategory] = useState(null);

    const handleDragStart = (e, option) => {
        setDraggedItem(option);
        e.dataTransfer.setData("text/plain", option.id);
        e.target.classList.add("opacity-50", "scale-95");
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove("opacity-50", "scale-95");
    };

    const handleDrop = (e, categoryId) => {
        e.preventDefault();
        if (draggedItem) {
            setCategoryItems(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(key => {
                    newState[key] = newState[key].filter(item => item.id !== draggedItem.id);
                });

                if (!newState[categoryId]) newState[categoryId] = [];
                newState[categoryId].push(draggedItem);

                return newState;
            });
        }
        setDragOverCategory(null);
    };

    const handleDragOver = (e, categoryId) => {
        e.preventDefault();
        setDragOverCategory(categoryId);
    };

    const handleDragLeave = () => {
        setDragOverCategory(null);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Categorize
                </span>
                {header}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className={`border rounded-xl p-4 transition-colors ${
                            dragOverCategory === category.id
                                ? "bg-blue-50 border-blue-500 border-2"
                                : "border-gray-200"
                        }`}
                        onDrop={(e) => handleDrop(e, category.id)}
                        onDragOver={(e) => handleDragOver(e, category.id)}
                        onDragLeave={handleDragLeave}
                    >
                        <h4 className="font-bold text-gray-800 mb-3 text-center bg-gray-100 py-2 rounded-lg">
                            {category.name}
                        </h4>
                        <div className="min-h-[120px] p-3 rounded-lg">
                            {categoryItems[category.id]?.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    className="bg-blue-100 px-4 py-2 rounded-lg mb-2 cursor-move hover:bg-blue-200 transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Drag items to categories:</p>
                <div className="flex flex-wrap gap-3">
                    {options.map(option => {
                        const isPlaced = Object.values(categoryItems).some(
                            items => items.some(item => item.id === option.id)
                        );

                        return (
                            <div
                                key={option.id}
                                draggable={!isPlaced}
                                onDragStart={!isPlaced ? (e) => handleDragStart(e, option) : undefined}
                                onDragEnd={handleDragEnd}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    isPlaced
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-purple-400 cursor-grab active:cursor-grabbing"
                                }`}
                            >
                                {option.text}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FormPreview;