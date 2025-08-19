import express from 'express'
import Form from '../models/Form.js'

const router = express.Router()
router.get('/all',async (req, res) => {
    try {
        const forms = await Form.find({createdAt:{$gt:11}})
        if (!forms) {
            return res.status(404).json(
            {
                error : 'Server error'
            })
        }
        res.status(201).json(forms)
    } catch (err){
        res.status(500)
    }
})
router.post('/', async (req, res) => {
    try {
        const newForm = new Form(req.body)
        const savedForm = await newForm.save()
        res.status(201).json(savedForm)
    } catch (err) {
        console.error('Error creating form:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id)
        if (!form) return res.status(404).json({ error: 'Form not found' })
        res.json(form)
    } catch (err) {
        console.error('Error fetching form:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router
