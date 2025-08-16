import * as icon from './fontawesome-icons.js';

// Define class.
class ToolBar extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const template = parsedHtml.getElementById('toolbar-template');
        const templateContent = template.content;
        shadowRoot.appendChild(templateContent.cloneNode(true));
    }
    connectedCallback() {
        const shadowRoot = this.shadowRoot;
        const actions = ['hand', 'selection', 'lasso', 'rectangle', 'ellipse', 'arrow', 'line', 'freedraw', 'text', 'eraser', 'laser'];
        const tools = shadowRoot.querySelectorAll('svg');
        for (let i = 0; i < tools.length; i++) {
            tools[i].id = actions[i];
            tools[i].addEventListener('click', dispatchSetTool)
        }
    }
}

function dispatchSetTool(event) {
    const toolName = this.id;
    const writeBoxes = document.querySelectorAll('write-box');
    console.log(writeBoxes)
    for (let box of writeBoxes) {
        box.dispatchEvent(new CustomEvent('setTool', { detail: toolName }));
    }
}

// Helper variables.
const html = `
<template id="toolbar-template">
    <style>
        :host {
            --icon-size: 1.2em;
            --margin-around-icons: 0.2em;
        }
        div#toolbox > svg {
            width: var(--icon-size);
            height: var(--icon-size);
            vertical-align: -0.125em;
            padding: 0.4em;
            margin: var(--margin-around-icons) calc(var(--margin-around-icons)*0.5);
            border-radius: 0.2em;
        }
        div#toolbox > svg:hover {
            background-color: #EAEAEA;
            cursor: pointer;
        }
        div#toolbox {
            background-color: white;
            border: 1px solid gray;
            border-radius: 0.2em;
            padding: 0 calc(var(--margin-around-icons)*0.5);
            display: flex;
            position: fixed;
            z-index: 2000;
        }
        div.toolBoxCenter {
            flex-direction: column;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        div.toolBoxTop {
            flex-direction: row;
            left: 75%;
            top: 5px;
            transform: translate(-50%, 0%);
        }
    </style>
    <div id="toolbox" class="toolBoxTop">
        ${icon.iconHand}
        ${icon.iconHandPoint}
        ${icon.iconDottedRectangle}
        ${icon.iconSquare}
        ${icon.iconCircle}
        ${icon.iconRightArrow}
        ${icon.iconLine}
        ${icon.iconPencil}
        ${icon.iconLetterA}
        ${icon.iconEraser}
        ${icon.iconCrossHair}
    </div>
</template>`;

const parser = new DOMParser();
const parsedHtml = parser.parseFromString(html, "text/html");

// Helper function.
function setTitle(el) {
    const title = el.getAttribute('title');
    const prefix = el.getAttribute('prefix');
    const shadowRoot = el.shadowRoot;
    const headerEl = shadowRoot.querySelector('#title');
    if (prefix && title) {
        headerEl.innerText = `${prefix}: ${title}`;
    } else if (prefix && !title) {
        headerEl.innerText = `${prefix}`;
    } else if (prefix == '' && title) {
        headerEl.innerText = `${title}`;
    } else if (!prefix && title) {
        headerEl.innerText = `Theorem: ${title}`;
    } else if (!prefix && !title) {
        headerEl.innerText = `Theorem`;
    }
}

// Add element to the list of customElements.
customElements.define('tool-bar', ToolBar);