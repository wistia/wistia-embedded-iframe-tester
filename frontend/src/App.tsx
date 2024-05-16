import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const searchParams = new URL(document.location.toString()).searchParams
  const hashedId = searchParams.get('hashedId') ?? ''
  const [token, setToken] = useState<string | undefined>()

  useEffect(() => {
    async function setTokenFromServer() {
      const response = await fetch(`http://localhost:5432/expiring_token/${hashedId}`)
      const json = await response.json()
      const tokenFromServer = json.token

      if (typeof tokenFromServer === 'string') {
        setToken(tokenFromServer)
      }
    }

    void setTokenFromServer();
  }, [hashedId])

  if (token === undefined) {
    return null;
  }

  return (
    <div>
      <h2>Look at my transcript</h2>
      <iframe title="embed" src={`https://embed.wistia.io/transcript-edit/embed/?hashedId=${hashedId}&token=${token}`} />
    </div>
  );
}

export default App;
