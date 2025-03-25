// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from "@chakra-ui/react/preset";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* pass system value here */}
    <ChakraProvider value={system}> 

      <App />
    </ChakraProvider>
  </StrictMode>,
)