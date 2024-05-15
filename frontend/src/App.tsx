import React from 'react';
import './App.css';

function App() {
  const searchParams = new URL(document.location.toString()).searchParams
  const hashedId = searchParams.get('hashedId') ?? ''

  return (
    <div>
      <h2>Look at my transcript</h2>
      <iframe title="embed" src={`https://embed.wistia.io/transcript-edit/embed/?hashedId=${hashedId}&token=expiring_token_384f92e50a1e264caa985e9e6f7b595a6897fd9d493dd41f916cfafd758673ff`} />
    </div>
  );
}

export default App;
