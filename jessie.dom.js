import { skQueryManager } from "./jessie.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

class TextStreamElement extends HTMLElement {

    constructor() {

        super();

        this.shadow = this.attachShadow({ mode: "open" });
        
    }

    connectedCallback() {

        this.render();
    }

    render() {

        let src = this.attributes?.src?.value || "";

        if (src.length > 0) {

            fetch(src).then((e) => e.text()).then(((text) => {
    
                this.shadow.textContent = text;
    
            }).bind(this)).catch(((err) => {
    
                console.warn(`cannot load file! ${this.src}`);
                console.error(err);
            
            }).bind(this));
        }
    }
}

// q.ready(function main() {

//     customElements.define("text-stream", TextStreamElement);
// })

q.QueueMainActivity.enqueue(function __queue__() {
    
    customElements.define("text-stream", TextStreamElement);
})