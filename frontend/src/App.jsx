
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Landing from './Pages/Landing'
import Main from './Pages/Main'
import "../src/index.css"
import About from './Components/about'
function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/main" element={<Main/>}/>
        <Route path="/about" element={<About/>}/>
      </Routes>
    </Router>
  )
}

export default App
