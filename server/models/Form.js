import mongoose from 'mongoose'

const OptionSchema = new mongoose.Schema({
    id: String,
    text: String,
    categoryId: String,
    isCorrect: Boolean,
})

const CategorySchema = new mongoose.Schema({
    id: String,
    name: String,
})

const SubQuestionSchema = new mongoose.Schema({
    id: String,
    text: String,
    options: [OptionSchema],
})
const BlankSchema = new mongoose.Schema({
    id: String,
    text: String,
})

const QuestionSchema = new mongoose.Schema({
    id: String,
    header: { type: String, default: '' },
    text: String,
    type: String,
    imageUrl: String,
    blanks: [BlankSchema],
    categories: [CategorySchema],
    options: [OptionSchema],
    passage: String,
    subQuestions: [SubQuestionSchema],
    position: { type: Number, default: 0 },
})

const FormSchema = new mongoose.Schema({
    title: String,
    headerImageUrl: String,
    questions: [QuestionSchema],
}, { timestamps: true })

export default mongoose.model('Form', FormSchema)
