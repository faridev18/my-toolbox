import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ScreenshotFramer from './pages/ScreenshotFramer'
import TripleFramer from './pages/TripleFramer'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/screenshot-framer" element={<ScreenshotFramer />} />
      <Route path="/triple-framer" element={<TripleFramer />} />
    </Routes>
  )
}

export default App
