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

        // Set up tools.
        const actions = ['hand', 'selection', 'lasso', 'rectangle', 'ellipse', 'arrow', 'line', 'freedraw', 'highlighter', 'text', 'eraser', 'laser'];
        const tools = shadowRoot.querySelectorAll('#tools > svg');
        for (let i = 0; i < tools.length; i++) {
            tools[i].id = actions[i];
            tools[i].addEventListener('click', dispatchSetTool);
        }

        // Set up save and load.
        const parser = new DOMParser();
        const saveIconHtml = parser.parseFromString(icon.iconSave, "text/html");
        const loadIconHtml = parser.parseFromString(icon.iconFolder, "text/html");
        const toolbar = shadowRoot.querySelector('#tools');
        toolbar.appendChild(saveIconHtml.body.children[0]);
        const saveIcon = shadowRoot.querySelector('#tools > svg:last-child');
        toolbar.appendChild(loadIconHtml.body.children[0]);
        const loadIcon = shadowRoot.querySelector('#tools > svg:last-child');
        saveIcon.addEventListener('click', dispatchSave);
        loadIcon.addEventListener('click', loadFile);

        // Set up confirmation before leaving page.
        window.addEventListener('beforeunload', function(e){
            // Check if anything has been updated since last save.

            // If changed since last save, then warn before leaving page.
            //e.preventDefault(); // asks user if they are sure they want to leave
        });

        // Set up stroke colors.
        const strokeColors = ['#000000', '#cc0000', '#00cc00', '#0077ff', '#ff8800', '#ffff00'];
        const strokeColorsContainer = shadowRoot.querySelector('#strokeColors');
        for (let i = 0; i < strokeColors.length; i++) {
            const newColorInner = document.createElement('div');
            newColorInner.classList.add('color');
            newColorInner.style.backgroundColor = strokeColors[i];
            const newColorOuter = document.createElement('div');
            newColorOuter.classList.add('colorOuter');
            newColorOuter.setAttribute('data-color', strokeColors[i]);
            newColorOuter.appendChild(newColorInner);
            newColorOuter.addEventListener('click', dispatchChangeStrokeColor);
            strokeColorsContainer.appendChild(newColorOuter);
        }

        // Set up background colors.
        const backgroundColors = ['#000000', '#cc0000', '#00cc00', '#0077ff', '#ff8800', 'transparent'];
        const backgroundColorsContainer = shadowRoot.querySelector('#backgroundColors');
        for (let i = 0; i < backgroundColors.length; i++) {
            const newColorInner = document.createElement('div');
            newColorInner.classList.add('color');
            if (backgroundColors[i] != 'transparent') {
                newColorInner.style.backgroundColor = backgroundColors[i];
            } else {
                newColorInner.style.background = 'repeating-conic-gradient(#00000000 0% 25%, #999999ff 0% 50%) 50% / 51% 51%';
            }
            const newColorOuter = document.createElement('div');
            newColorOuter.classList.add('colorOuter');
            newColorOuter.setAttribute('data-color', backgroundColors[i]);
            newColorOuter.appendChild(newColorInner);
            newColorOuter.addEventListener('click', dispatchChangeBackgroundColor);
            backgroundColorsContainer.appendChild(newColorOuter);
        }
    }
}

function dispatchSetTool(event) {
    const shadowRoot = document.querySelector('tool-bar').shadowRoot;
    const toolName = this.id;

    // Set which tool is selected.
    const tools = shadowRoot.querySelectorAll('#tools > svg');
    tools.forEach((tool, idx, arr) => {tool.classList.remove('checked')});
    shadowRoot.querySelector(`#tools > #${toolName}`).classList.add('checked');

    // Set the tool in each write-box.
    const writeBoxes = document.querySelectorAll('write-box');
    for (let box of writeBoxes) {
        box.dispatchEvent(new CustomEvent('setTool', { detail: toolName }));
    }
}

function dispatchSave(event) {
    const writeBoxes = document.querySelectorAll('write-box');

    // Set up the save function for the write-boxes to call.
    window.removeEventListener('saveToFile', saveToFile);
    window.writeBoxes = new Array(writeBoxes.length);
    window.writeBoxesUpdated = new Array(writeBoxes.length).fill(false);
    window.addEventListener('saveToFile', saveToFile);

    // Dispatch to each write-box.
    for (let i = 0; i < writeBoxes.length; i++) {
        writeBoxes[i].dispatchEvent(new CustomEvent('saveBox', { detail: i }));
    }
}

function saveToFile(event) {
    // Update with the new data.
    const obj = event.detail;
    window.writeBoxes[obj.idx] = { height: obj.height, sceneData: obj.sceneData };
    window.writeBoxesUpdated[obj.idx] = true;

    // If all write-boxes have returned their data, then save to file.
    if (window.writeBoxesUpdated.every(el => el === true)) {
        const textToSave = JSON.stringify({ writeboxes: window.writeBoxes });
        const downloadElement = document.createElement('a');
        downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToSave));
        downloadElement.setAttribute('download', 'notes ' + dateAndTime() + '.json');
        downloadElement.style.display = 'none';
        //document.body.appendChild(downloadElement);
        downloadElement.click();
        //document.body.removeChild(downloadElement);
    }

    function dateAndTime() {
        const twoDigits = (num) => {
            let s = String(num);
            if (s.length == 1) {
                s = '0' + s;
            }
            return s;
        }
        const date = new Date();
        return date.getFullYear() + '-' + twoDigits(date.getMonth()+1) + '-' + twoDigits(date.getDate()) + ' ' + twoDigits(date.getHours()) + '.' + twoDigits(date.getMinutes());
    }
}

function loadFile(event) {
    const inputNode = document.createElement('input');
    inputNode.setAttribute('type', 'file');
    inputNode.style.display = 'none';
    inputNode.addEventListener('change', onFileChosen)
    //document.body.appendChild(inputNode);
    inputNode.click();
    //document.body.removeChild(inputNode);
}

function onFileChosen(event) {
    const reader = new FileReader();
    reader.onload = dispatchLoad;
    reader.readAsText(event.target.files[0]);
}

function dispatchLoad(event) {
    const obj = JSON.parse(event.target.result);
    if (Object.hasOwn(obj, 'writeboxes')) {
        // Load into each write-box.
        const writeBoxes = document.querySelectorAll('write-box');
        const savedBoxes = obj.writeboxes;
        if (savedBoxes.length > writeBoxes.length) {
            alert('Load failed. There are more saved boxes in this file than there are boxes in these notes. You probably tried to open the notes for a different chapter.')
        }
        else {
            for (let i = 0; i < savedBoxes.length; i++) {
                writeBoxes[i].dispatchEvent(new CustomEvent('loadBox', { detail: savedBoxes[i] }));
            }
        }
    }
    else {
        alert('The selected file does not appear to be saved notes.')
    }
}

function dispatchChangeStrokeColor(event) {
    const shadowRoot = document.querySelector('tool-bar').shadowRoot;
    const color =  this.getAttribute("data-color");

    // Set which stroke color is selected.
    const colorEls = shadowRoot.querySelectorAll('#strokeColors > div');
    colorEls.forEach((el, idx, arr) => {el.classList.remove('checked')});
    shadowRoot.querySelector(`#strokeColors > div[data-color="${color}"]`).classList.add('checked');

    // Set the stroke color in each write-box.
    const writeBoxes = document.querySelectorAll('write-box');
    for (let box of writeBoxes) {
        box.dispatchEvent(new CustomEvent('changeStrokeColor', { detail: color }));
    }
}

function dispatchChangeBackgroundColor(event) {
    const shadowRoot = document.querySelector('tool-bar').shadowRoot;
    const color =  this.getAttribute("data-color");

    // Set which stroke color is selected.
    const colorEls = shadowRoot.querySelectorAll('#backgroundColors > div');
    colorEls.forEach((el, idx, arr) => {el.classList.remove('checked')});
    shadowRoot.querySelector(`#backgroundColors > div[data-color="${color}"]`).classList.add('checked');

    // Set the stroke color in each write-box.
    const writeBoxes = document.querySelectorAll('write-box');
    for (let box of writeBoxes) {
        box.dispatchEvent(new CustomEvent('changeBackgroundColor', { detail: color }));
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
        div#tools {
            display: flex;
        }
        div#colorsContainer {
            display: flex;
        }
        div#strokeColors {
            display: flex;
        }
        div#backgroundColors {
            display: flex;
        }
        div#tools > svg {
            width: var(--icon-size);
            height: var(--icon-size);
            vertical-align: -0.125em;
            padding: 0.4em;
            margin: var(--margin-around-icons) calc(var(--margin-around-icons)*0.5);
            border-radius: 0.2em;
        }
        div#tools > svg:hover {
            background-color: #EAEAEA;
            cursor: pointer;
        }
        div#tools > svg.checked {
            background-color: #DDDDDD;
        }
        div#strokeColors > .checked {
            background-color: #DDDDDD;
        }
        div#backgroundColors > .checked {
            background-color: #DDDDDD;
        }
        div#toolbar {
            background-color: white;
            border: 1px solid gray;
            border-radius: 0.2em;
            padding: 0 calc(var(--margin-around-icons)*0.5);
            display: flex;
            position: fixed;
            z-index: 2000;
        }
        div.color {
            width: var(--icon-size);
            height: var(--icon-size);
            border-radius: 0.2em;
        }
        div.colorOuter {
            padding: 0.4em;
            margin: var(--margin-around-icons) calc(var(--margin-around-icons)*0.5);
            border-radius: 0.2em;
        }
        div.colorOuter:hover {
            background-color: #EAEAEA;
            cursor: pointer;
        }
        #colorDivider {
            background-color: #999999;
            width: 1px;
            margin: 0.4em 0.4em;
        }
        div.toolBoxCenter {
            flex-direction: column;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        div.toolBoxTop {
            flex-direction: column;
            left: 75%;
            top: 5px;
            transform: translate(-50%, 0%);
        }
    </style>
    <div id="toolbar" class="toolBoxTop">
        <div id="tools">
            ${icon.iconHand}
            ${icon.iconHandPoint}
            ${icon.iconDottedRectangle}
            ${icon.iconSquare}
            ${icon.iconCircle}
            ${icon.iconRightArrow}
            ${icon.iconLine}
            ${icon.iconPencil}
            ${icon.iconMarker}
            ${icon.iconLetterA}
            ${icon.iconEraser}
            ${icon.iconCrossHair}
        </div>
        <div id="colorsContainer">
            <div id="strokeColors"></div>
            <div id="colorDivider"></div>
            <div id="backgroundColors"></div>
        </div>
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