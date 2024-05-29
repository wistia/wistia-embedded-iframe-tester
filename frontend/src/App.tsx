import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const searchParams = new URL(document.location.toString()).searchParams
  const hashedId = searchParams.get('hashedId') ?? ''
  const [token, setToken] = useState<string | undefined>()
  const [iframeRendered, setRendered] = useState<boolean>()
  const iframeOrigin = 'https://embed.wistia.io'

  useEffect(() => {
    const controller = new AbortController()

    async function setTokenFromServer() {
      const response = await fetch(`http://localhost:5432/expiring_token/${hashedId}`, { signal: controller.signal })
      const json = await response.json()
      const tokenFromServer = json.token

      if (typeof tokenFromServer === 'string') {
        setToken(tokenFromServer)
      }
    }

    // Fire off immediately and than every five seconds after that
    if (!token) {
      void setTokenFromServer().catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        throw error;
      });
    }
    const id = setInterval(setTokenFromServer, 5000)

    return () => {
      clearInterval(id);
      controller.abort();
    }
  }, [hashedId, token])

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
      <h2>Look at my transcript</h2>
      <iframe title="embed" src={`${iframeOrigin}/transcript-edit/embed/?hashedId=${hashedId}`} sandbox="allow-scripts allow-same-origin allow-modals" />
    </div>
  );
}

export default App;
