import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import formRoutes from './routes/formRoutes.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

app.use(cors())
app.use(express.json())

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected')
}).catch(err => {
    console.error('MongoDB connection error:', err)
})

app.use('/api/forms', formRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
