import { createRoot } from 'react-dom/client'
import Tracking from './pages/Tracking'

async function initialize() {
  // Cargar Google Maps
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  document.head.appendChild(script)

  // Renderizar el componente React
  const root = createRoot(document.getElementById('app'))
  root.render(<Tracking />)
}

initialize()
