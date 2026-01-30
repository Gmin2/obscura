import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Terminal from './pages/Terminal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/terminal" element={<Terminal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
