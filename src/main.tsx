import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import I18n from "./I18n";
import Wrapper from './Wrapper'
import { 
  SessionProvider
} from "@inrupt/solid-ui-react";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Wrapper>
    <SessionProvider sessionId="some-id">
      <I18n render={(setLocale) => <App onLocaleChanged={setLocale} />} />
    </SessionProvider>
    </Wrapper>
  </React.StrictMode>
)
