import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

// Define class.
class WriteBox extends HTMLElement {
    static observedAttributes = ['height'];
    constructor() {
        super();
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
        let height = this.getAttribute('height');
        if (!height) {
            height = '3in';
        }
        const container = document.createElement('div');
        container.style.height = height;
        const flexboxContainer = document.createElement('div');
        flexboxContainer.style.position = 'relative';
        flexboxContainer.style.setProperty('height', 'calc(100% - 2px)');
        const flexbox = document.createElement('div');
        flexbox.style.setProperty('height', '100%');
        flexbox.style.width = '100%';
        flexbox.style.display = 'flex';
        const excalidrawContainer = document.createElement('div');
        excalidrawContainer.style.setProperty('height', '100%');
        excalidrawContainer.style.setProperty('width', 'calc(100% - 2px)');
        const root = createRoot(excalidrawContainer);
        root.render(<this.ExcalidrawWrapper />);
        const resizer = document.createElement('div');
        resizer.style.height = '0.25cm';
        resizer.style.width = '0.75cm';
        resizer.style.position = 'relative';
        resizer.style.setProperty('left', 'calc(50% - 1cm)');
        resizer.style.cursor = 'ns-resize';
        resizer.style.setProperty('touch-action', 'none');
        const resizerBarTop = document.createElement('div');
        resizerBarTop.style.height = '1px';
        resizerBarTop.style.backgroundColor = '#CCCCCC';
        resizerBarTop.style.width = '100%';
        resizerBarTop.style.top = '3px';
        resizerBarTop.style.position = 'absolute';
        const resizerBarBottom = document.createElement('div');
        resizerBarBottom.style.height = '1px';
        resizerBarBottom.style.backgroundColor = '#CCCCCC';
        resizerBarBottom.style.width = '100%';
        resizerBarBottom.style.position = 'absolute';
        resizerBarBottom.style.bottom = '3px';
        resizer.appendChild(resizerBarTop);
        resizer.appendChild(resizerBarBottom);
        const leftBar = document.createElement('div');
        leftBar.style.height = '0.3cm';
        leftBar.style.width = '1px';
        leftBar.style.backgroundColor = '#DDDDDD';
        const rightBar = document.createElement('div');
        rightBar.style.height = '0.3cm';
        rightBar.style.width = '1px';
        rightBar.style.backgroundColor = '#DDDDDD';
        rightBar.style.position = 'absolute';
        rightBar.style.bottom = '0px';
        rightBar.style.right = '0px';
        const topBar = document.createElement('div');
        topBar.style.width = '0.3cm';
        topBar.style.height = '1px';
        topBar.style.backgroundColor = '#DDDDDD';
        const bottomBar = document.createElement('div');
        bottomBar.style.width = '0.3cm';
        bottomBar.style.height = '1px';
        bottomBar.style.backgroundColor = '#DDDDDD';
        bottomBar.style.setProperty('margin-left', 'calc(100% - 0.3cm)');
        flexbox.appendChild(leftBar);
        flexbox.appendChild(excalidrawContainer);
        flexbox.appendChild(rightBar);
        flexboxContainer.appendChild(flexbox);
        container.appendChild(topBar);
        container.appendChild(flexboxContainer);
        container.appendChild(bottomBar);
        this.appendChild(container);
        this.appendChild(resizer);

        resizer.addEventListener('mousedown', this.startDrag)
        resizer.addEventListener('touchstart', this.startTouchDrag)
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (this.firstChild) { // If element is already rendered (attributeChangedCallback gets called before the element is rendered as well).
            if (name == 'height') {
                this.firstChild.style.height = newValue;
            }
        }
    }

    // Functions for resizing the box.
    startDrag = (event) => {
        this.startY = event.clientY;
        const rect = this.firstChild.getBoundingClientRect();
        this.originalHeight = rect.bottom - rect.top;
        document.addEventListener('mousemove', this.resizeBox);
        document.addEventListener('mouseup', this.stopDrag);
    }
    resizeBox = (event) => {
        this.setAttribute('height', Math.max(0, this.originalHeight + event.clientY - this.startY) + 'px');
    }
    stopDrag = (event) => {
        document.removeEventListener('mousemove', this.resizeBox);
        document.removeEventListener('mouseup', this.stopDrag);

        // Update the new locations of all write-boxes.
        const writeboxes = document.querySelectorAll('write-box');
        for (let box of writeboxes) {
            box.dispatchEvent(new CustomEvent('refreshCoords'));
        }
    }
    startTouchDrag = (event) => {
        const {touches} = event;
        if (touches && touches.length == 1) {
            this.startY = touches[0].clientY;
            const rect = this.firstChild.getBoundingClientRect();
            this.originalHeight = rect.bottom - rect.top;
            document.addEventListener('touchmove', this.resizeBoxTouch);
            document.addEventListener('touchend', this.stopTouchDrag);
        }
    }
    resizeBoxTouch = (event) => {
        this.setAttribute('height', Math.max(0, this.originalHeight + event.touches[0].clientY - this.startY) + 'px');
    }
    stopTouchDrag = (event) => {
        document.removeEventListener('touchmove', this.resizeBoxTouch);
        document.removeEventListener('touchend', this.stopTouchDrag);
        
        // Update the new locations of all write-boxes.
        const writeboxes = document.querySelectorAll('write-box');
        for (let box of writeboxes) {
            box.dispatchEvent(new CustomEvent('refreshCoords'));
        }
    }

    /* This wrapper allows us to use the excalidrawAPI.  The api can only be accessed
    * from inside this function, so any external code that wishes to affect the api
    * must call something in here via an event. */
    ExcalidrawWrapper = () => {
        const setTool = (event) => {
            let tool = event.detail;
            let strokeWidth, opacity;
            switch (tool) {
                case 'freedraw':
                    strokeWidth = 0.5;
                    opacity = 100;
                    break;
                case 'highlighter':
                    strokeWidth = 6;
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

        const saveBox = (event) => {
            const idx = event.detail;
            const appState = excalidrawAPI.getAppState();
            const appStateLessInfo = {
                "gridSize": appState.gridSize,
                "gridStep": appState.gridStep,
                "gridModeEnabled": appState.gridModeEnabled,
                "viewBackgroundColor": appState.viewBackgroundColor,
            }
            const elements = excalidrawAPI.getSceneElements();
            const sceneData = {"appState": appStateLessInfo, "elements": elements};
            const toReturn = { detail: {idx: idx, sceneData: sceneData} };
            window.dispatchEvent(new CustomEvent('saveToFile', { detail: {idx: idx, height: this.getAttribute('height'), sceneData: sceneData} }));
        };

        const loadBox = (event) => {
            const { sceneData, height } = event.detail;
            sceneData.captureUpdate = 'IMMEDIATELY';
            this.setAttribute('height', height)
            excalidrawAPI.updateScene(sceneData);
        };

        const changeStrokeColor = (event) => {
            const color = event.detail;

            // Get the selected elements.
            const selectedIds = Object.keys(excalidrawAPI.getAppState().selectedElementIds);
            const selectedEls = excalidrawAPI.getSceneElementsIncludingDeleted().filter((el) => selectedIds.indexOf(el.id) != -1);
            const nonSelectedEls = excalidrawAPI.getSceneElementsIncludingDeleted().filter((el) => selectedIds.indexOf(el.id) == -1);
            
            // Change the colors of the selected elements.
            // (I'm not sure why both steps seem to be needed, but if I do it this way, it works.)
            const newEls = new Array(selectedEls.length);
            for (let i = 0; i < selectedEls.length; i++) {
                newEls[i] = { ...selectedEls[i] }; // creates a copy of the object
            }
            for (let el of newEls) {
                excalidrawAPI.mutateElement(el, { strokeColor: color });
            }

            // Update the current stroke color.
            excalidrawAPI.updateScene({
                elements: [...nonSelectedEls, ...newEls],
                appState: {
                    currentItemStrokeColor: color,
                },
                captureUpdate: 'IMMEDIATELY'
            });
        };

        const changeBackgroundColor = (event) => {
            const color = event.detail;

            // Get the selected elements.
            const selectedIds = Object.keys(excalidrawAPI.getAppState().selectedElementIds);
            const selectedEls = excalidrawAPI.getSceneElementsIncludingDeleted().filter((el) => selectedIds.indexOf(el.id) != -1);
            const nonSelectedEls = excalidrawAPI.getSceneElementsIncludingDeleted().filter((el) => selectedIds.indexOf(el.id) == -1);
            
            // Change the colors of the selected elements.
            // (I'm not sure why both steps seem to be needed, but if I do it this way, it works.)
            const newEls = new Array(selectedEls.length);
            for (let i = 0; i < selectedEls.length; i++) {
                newEls[i] = { ...selectedEls[i] }; // creates a copy of the object
            }
            for (let el of newEls) {
                excalidrawAPI.mutateElement(el, { backgroundColor: color });
            }

            // Update the current stroke color.
            excalidrawAPI.updateScene({
                elements: [...nonSelectedEls, ...newEls],
                appState: {
                    currentItemBackgroundColor: color,
                },
                captureUpdate: 'IMMEDIATELY'
            });
        };

        /* This function refreshes the coordinates of the write-box inside of excalidraw.
         * This is normally called when the page scrolls. But we need it for when we change 
         * the size of a different write-box because then all the write-boxes below get 
         * shifted, but excalidraw doesn't know about that unless we call this function. */
        const refreshCoords = () => {
            excalidrawAPI.refresh();
        }

        // Set up the excalidrawAPI.
        const [excalidrawAPI, setExcalidrawAPI] = useState(null);

        // Set up the event listeners.
        React.useEffect(() => {
            this.addEventListener("setTool", setTool);
            return () => {
                this.removeEventListener("setTool", setTool);
            }
        }, [excalidrawAPI]);

        React.useEffect(() => {
            this.addEventListener("saveBox", saveBox);
            return () => {
                this.removeEventListener("saveBox", saveBox);
            }
        }, [excalidrawAPI]);

        React.useEffect(() => {
            this.addEventListener("loadBox", loadBox);
            return () => {
                this.removeEventListener("loadBox", loadBox);
            }
        }, [excalidrawAPI]);

        React.useEffect(() => {
            this.addEventListener("changeStrokeColor", changeStrokeColor);
            return () => {
                this.removeEventListener("changeStrokeColor", changeStrokeColor);
            }
        }, [excalidrawAPI]);

        React.useEffect(() => {
            this.addEventListener("changeBackgroundColor", changeBackgroundColor);
            return () => {
                this.removeEventListener("changeBackgroundColor", changeBackgroundColor);
            }
        }, [excalidrawAPI]);

        React.useEffect(() => {
            this.addEventListener("refreshCoords", refreshCoords);
            return () => {
                this.removeEventListener("refreshCoords", refreshCoords);
            }
        }, [excalidrawAPI]);

        return <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
    }
}



// Add element to the list of customElements.
customElements.define('write-box', WriteBox);
if (!window.chewyCustomElements) {
    window.chewyCustomElements = {};
}
window.chewyCustomElements['write-box'] = { isInline: false }