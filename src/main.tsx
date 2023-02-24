import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { 
  SessionProvider
} from "@inrupt/solid-ui-react";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SessionProvider sessionId="some-id">
      <App />
    </SessionProvider>
  </React.StrictMode>,
)
