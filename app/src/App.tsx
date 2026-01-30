import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './providers/WalletProvider'
import HomePage from './pages/HomePage'
import Terminal from './pages/Terminal'
import Portfolio from './pages/Portfolio'
import History from './pages/History'
import Profile from './pages/Profile'
import Docs from './pages/Docs'

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App
