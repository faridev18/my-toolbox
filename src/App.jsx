import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ScreenshotFramer from './pages/ScreenshotFramer'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/screenshot-framer" element={<ScreenshotFramer />} />
    </Routes>
  )
}

export default App
