import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CreateMystery from './pages/CreateMystery.jsx'
import InvestigationRoom from './pages/InvestigationRoom.jsx'
import Accusation from './pages/Accusation.jsx'
import Results from './pages/Results.jsx'

function App() {
  return (
    <div className="min-h-screen bg-stone-900 text-amber-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateMystery />} />
        <Route path="/case/:id" element={<InvestigationRoom />} />
        <Route path="/case/:id/accuse" element={<Accusation />} />
        <Route path="/case/:id/result" element={<Results />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App