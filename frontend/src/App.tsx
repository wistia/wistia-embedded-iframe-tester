import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

const branchSuffix = process.env.REACT_APP_BRANCH_DEPLOY_PR_NUMBER ? `-branch-${process.env.REACT_APP_BRANCH_DEPLOY_PR_NUMBER}` : '';
const iframeOrigin = `https://fast${branchSuffix}.wistia.${process.env.REACT_APP_WISTIA_TLD}`;
const searchParams = new URL(document.location.toString()).searchParams;
const serverDomain = process.env.REACT_APP_SERVER_ORIGIN;

// Pass along query params from the test app to the iframe
const constructIframeUrl = () => {
  const baseUrl = `${iframeOrigin}/transcript-edit/embed/?`;
  const params = new URLSearchParams(searchParams);
  return baseUrl + params.toString();
};

// Modal component for the iframe editor
const IframeModal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Iframe Editor Playground</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState<string | undefined>()
  const [showIframe, setShowIframe] = useState<boolean>(true)
  const [iframeRendered, setRendered] = useState<boolean>(false)
  const [iframeBeingEdited, setIframeBeingEdited] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

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

  // Handle token for modal iframe
  useEffect(() => {
    if (showModal && token) {
      // Small delay to ensure iframe is loaded
      const timer = setTimeout(() => {
        const modalIframe = document.querySelector('.modal-iframe') as HTMLIFrameElement;
        if (modalIframe?.contentWindow) {
          modalIframe.contentWindow.postMessage({type: 'token', value: token}, iframeOrigin);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showModal, token]);

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
      <div className="button-container">
        <button type="button" onClick={handleSetShowIframe}>
          {showIframe ? 'Hide editor' : 'Show editor'}
        </button>
        <button type="button" onClick={() => setShowModal(true)} className="modal-button">
          Open Editor in Modal
        </button>
      </div>
      <br />
      {showIframe && <iframe title="embed" src={url} sandbox="allow-scripts allow-same-origin allow-modals" />}
      
      <IframeModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <iframe 
          title="embed-modal" 
          src={url} 
          sandbox="allow-scripts allow-same-origin allow-modals"
          className="modal-iframe"
        />
      </IframeModal>
    </div>
  );
}

export default App;
