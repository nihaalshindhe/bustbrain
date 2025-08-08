import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FormBuilder from './pages/FormBuilder'
import FormPreview from './pages/FormPreview'

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<FormBuilder />} />
          <Route path="/forms/:id" element={<FormPreview />} />
        </Routes>
      </Router>
  )
}

export default App
