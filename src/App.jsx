import CyborgDapp from "./cyborg"
import 'semantic-ui-css/semantic.min.css'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className='relative w-screen h-screen'>
      <CyborgDapp />
      <Toaster
          position="top-center"
          reverseOrder={false}
        />
    </div>
  )
}

export default App
