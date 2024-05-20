import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const searchParams = new URL(document.location.toString()).searchParams
  const hashedId = searchParams.get('hashedId') ?? ''
  const [token, setToken] = useState<string | undefined>()

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

    if (!token) {
      void setTokenFromServer();
    }

    return () => controller.abort();
  }, [hashedId, token])

  if (token === undefined) {
    return null;
  }

  return (
    <div>
      <h2>Look at my transcript</h2>
      <iframe title="embed" src={`https://embed.wistia.io/transcript-edit/embed/?hashedId=${hashedId}&token=${token}`} sandbox="allow-scripts allow-same-origin" />
    </div>
  );
}

export default App;
