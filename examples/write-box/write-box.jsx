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
        root.render(<div id="container" style={{ height: height }}><ExcalidrawWrapper /></div>);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        
    }
}

/* This wrapper allows us to use the excalidrawAPI.  The api can only be accessed
 * from inside this function, so any external code that wishes to affect the api
 * must call something in here via an event. */
function ExcalidrawWrapper() {
    const setTool = (event) => {
        console.log('setTool', event)
        let tool = event.detail;
        let strokeWidth, opacity;
        switch (tool) {
            case 'freedraw':
                strokeWidth = 0.5;
                opacity = 100;
                break;
            case 'highlighter':
                strokeWidth = 5;
                opacity = 40;
                tool = 'freedraw';
                break;
            default:
                strokeWidth = 2;
                opacity = 100;
        }
        excalidrawAPI.updateScene({
            appState: {
                currentItemStrokeWidth: strokeWidth,
                currentItemOpacity: opacity,
            }
        });
        excalidrawAPI.setActiveTool({ type: tool, locked: true });
    };

    const changeStrokeColor = (event) => {
        console.log('app state', excalidrawAPI.getAppState())
        console.log('elements', excalidrawAPI.getSceneElements())
        console.log('elements inc del', excalidrawAPI.getSceneElementsIncludingDeleted())
        excalidrawAPI.updateScene( {
            appState: {
                currentItemStrokeColor: event.detail,
            }
        });
    };

    const changeBackgroundColor = (event) => {
        excalidrawAPI.updateScene( {
            appState: {
                currentItemBackgroundColor: event.detail,
            }
        });
    };

    // Set up the excalidrawAPI.
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    // Set up the event listeners.
    React.useEffect(() => {
        thisElement.addEventListener("setTool", setTool);
        return () => {
            thisElement.removeEventListener("setTool", setTool);
        }
    }, [excalidrawAPI]);

    React.useEffect(() => {
        thisElement.addEventListener("changeStrokeColor", changeStrokeColor);
        return () => {
            thisElement.removeEventListener("changeStrokeColor", changeStrokeColor);
        }
    }, [excalidrawAPI]);

    React.useEffect(() => {
        thisElement.addEventListener("changeBackgroundColor", changeBackgroundColor);
        return () => {
            thisElement.removeEventListener("changeBackgroundColor", changeBackgroundColor);
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