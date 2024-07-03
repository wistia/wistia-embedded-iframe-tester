import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

const iframeOrigin = `https://fast.wistia.${process.env.REACT_APP_WISTIA_TLD}`;
const searchParams = new URL(document.location.toString()).searchParams;
const serverDomain = process.env.REACT_APP_SERVER_ORIGIN;

// Pass along query params from the test app to the iframe
const constructIframeUrl = () => {
  const baseUrl = `${iframeOrigin}/transcript-edit/embed/?`;
  const params = new URLSearchParams(searchParams);
  return baseUrl + params.toString();
};

function App() {
  const [token, setToken] = useState<string | undefined>()
  const [showIframe, setShowIframe] = useState<boolean>(true)
  const [iframeRendered, setRendered] = useState<boolean>(false)
  const [iframeBeingEdited, setIframeBeingEdited] = useState<boolean>(false)

  useEffect(() => {
    const controller = new AbortController()

    async function setTokenFromServer() {
      const hashedId = searchParams.get('hashedId')
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

      if (data.type === 'editing') {
        console.log(`setting editing to ${!!data.value}`);
        setIframeBeingEdited(!!data.value);
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

  const url = constructIframeUrl();

  const handleSetShowIframe = () => {
    const toggledValue = !showIframe;

    if (toggledValue || !iframeBeingEdited || window.confirm("Iframe is being editted, are you sure you want to continue?")) {
      setShowIframe(toggledValue);

      // We cannot get the final disconnect messages so we need to manually reset
      // values we get from the iframe when we hide it.
      if (!toggledValue) {
        setRendered(false);
        setIframeBeingEdited(false);
      }
    }
  }

  return (
    <div>
      <h1>React in TypeScript embed example</h1>
      <button type="button" onClick={handleSetShowIframe}>{showIframe ? 'Hide editor' : 'Show editor'}</button><br /><br />
      {showIframe && <iframe title="embed" src={url} sandbox="allow-scripts allow-same-origin allow-modals" />}
    </div>
  );
}

export default App;
