import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

const iframeOrigin = `https://fast.wistia.${process.env.REACT_APP_WISTIA_TLD}`;
const searchParams = new URL(document.location.toString()).searchParams;
const hashedId = searchParams.get('hashedId') ?? '';
const serverDomain = process.env.REACT_APP_SERVER_ORIGIN;

function App() {
  const [token, setToken] = useState<string | undefined>()
  const [iframeRendered, setRendered] = useState<boolean>()

  useEffect(() => {
    const controller = new AbortController()

    async function setTokenFromServer() {
      const response = await fetch(`${serverDomain}/expiring_token/${hashedId}`, { signal: controller.signal })
      const json = await response.json()
      const tokenFromServer = json.token

      if (typeof tokenFromServer === 'string') {
        setToken(tokenFromServer)
      }
    }

    // Fire off immediately and than every five seconds after that
    void setTokenFromServer().catch((error) => {
      if (error.name === 'AbortError') {
        return;
      }

      throw error;
    });
    const id = setInterval(setTokenFromServer, 5000)

    return () => {
      clearInterval(id);
      controller.abort();
    }
  }, [])

  useEffect(() => {
    const iframeMessageListener = (event: MessageEvent) => {
      const { data } = event as { data: { type?: string; value?: boolean } };

      if (event.origin !== iframeOrigin) {
        return;
      }

      if (data.type === 'listening') {
        setRendered(!!data.value);
      }
    };

    window.addEventListener('message', iframeMessageListener);

    return () => {
      window.removeEventListener('message', iframeMessageListener);
    };
  }, [])

  useEffect(() => {
    if (iframeRendered) {
      document.querySelector('iframe')?.contentWindow?.postMessage({type: 'token', value: token}, iframeOrigin)
    }
  }, [token, iframeRendered]);

  return (
    <div>
      <h1>React in TypeScript embed example</h1>
      <iframe title="embed" src={`${iframeOrigin}/transcript-edit/embed/?hashedId=${hashedId}`} sandbox="allow-scripts allow-same-origin allow-modals" />
    </div>
  );
}

export default App;
