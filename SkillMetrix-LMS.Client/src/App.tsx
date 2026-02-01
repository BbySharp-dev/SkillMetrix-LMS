import { Outlet } from 'react-router-dom'
import './style.css'

function App() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default App
