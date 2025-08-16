import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

let thisElement;

// Define class.
class WriteBox extends HTMLElement {
    static observedAttributes = ['title', 'prefix'];
    constructor() {
        super();
        thisElement = this;
        /* Use this when I convert to using the shadowDOM.
        const shadowRoot = this.attachShadow({ mode: 'open' });
        let styleSheet = document.createElement('link');
        styleSheet.rel = 'stylesheet';
        styleSheet.href = new URL('./components/excalidraw-styles.css', import.meta.url);
        shadowRoot.appendChild(styleSheet);
        console.log(shadowRoot.innerHTML)
        shadowRoot.appendChild(document.createElement('div'));*/
    }
    connectedCallback() {
        /* Use this when I convert to using the shadowDOM.
        const shadowRoot = this.shadowRoot;
        const root = createRoot(shadowRoot.querySelector('div'));
        root.render(<div style={{ height: "600px" }}><Excalidraw /></div>);*/
        const root = createRoot(this);
        let height = this.getAttribute('height');
        if (!height) {
            height = '600px';
        }
        root.render(<div style={{ height: height }}><ExcalidrawWrapper /></div>);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        
    }
}

function ExcalidrawWrapper() {
    const setTool = (event) => {
        console.log('setTool', event)
        excalidrawAPI.setActiveTool({ type: event.detail, locked: true });
    }
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    React.useEffect(() => {
        console.log('setting event listener')
        thisElement.addEventListener("setTool", setTool);
        return () => {
            thisElement.removeEventListener("setTool", setTool);
        }
    }, [excalidrawAPI]);

    return <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
}

// Add element to the list of customElements.
customElements.define('write-box', WriteBox);
if (!window.chewyCustomElements) {
    window.chewyCustomElements = {};
}
window.chewyCustomElements['write-box'] = { isInline: false }