/*
    sk: skulluglify
*/

if (typeof self == "undefined") self = globalThis;

export class skQueryEvent extends Event {

    constructor() {

        super("Query");

        this.detail = new Object;

    }
}

export class skQueryReadyEvent extends Event {

    constructor() {

        super("QueryReady");

        this.detail = new Object;

    }
}

export class DOMTokenListTrace extends Array {

    constructor() {

        super();

    }

    add(...tokens) { 

        for (let i = 0; i < tokens.length; i++) {

            let token = tokens[i];
            if (!this.includes(token)) this.push(token);
        }
    }
    
    remove(...tokens) { 

        for (let i = 0; i < tokens.length; i++) {

            let token = tokens[i];
            if (this.includes(token)) this.splice(this.indexOf(token), 1);
        }
    }
    
    contains(token) { 

        return this.includes(token);
    }

    replace(token, newToken) {

        if (this.includes(token)) {

            this.splice(this.indexOf(token), 1, newToken);
        }
    }

    toggle(token, force = null) {

        // force?
        if (force == null) {

            force = !this.contains(token);
        }

        if (force) {
    
            this.add(token);
        
        } else {
            
            this.remove(token);
    
        }

        return force;
    }

    // entries() { arguments } // Array Iterator
    get value() { 

        if (this.length > 0) return this.join(" ");

        return "";
    }
}

export class ElementTrace extends Object {

    constructor() {

        super();

        this.classList = new DOMTokenListTrace;

    }

    setAttribute() { }
    getAttribute() { }

}

export class skQuery extends EventTarget {

    constructor(target = null) {

        super();

        this.target = target;
        this.event = new skQueryEvent;
        // this.uuid = this.GENERATE_RAND_UUID;

        this.dispatchEvent(this.event);
    }

    get GENERATE_RAND_UUID() {
        return "10000000-1000-1000-1000-100000000000".replace(/[0|1]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    isArray(obj) {
        return !!(obj && typeof obj == "object" && (typeof obj?.length == "number") && (!"isArray" in Array ? Array.prototype.isPrototypeOf(obj) : Array.isArray(obj)));
    }

    isRegex(obj) {
        return !!(obj && typeof obj == "object" && RegExp.prototype.isPrototypeOf(obj));
    }

    onceCall(fn, context) {
        let returns;
        return function () {
            if (fn) {
                returns = fn.apply(this || context, ...arguments);
                fn = null;
            }
            return returns;
        }
    }

    readyState(fn, context) {
        let returns;
        return function () {
            if (fn && document.readyState == "complete") {
                returns = fn.apply(this || context, ...arguments);
                fn = null;
            }
            return returns;
        }
    }

    unSpaceText(context) {

        let puts, caches, n, start;
        n = context?.length || 0;
        start = false;
        caches = "";

        for (let i = 0; i < n; i++) {
            puts = context[i];
            if (puts == " " && !start) continue;
            caches += puts;
            start = true;
        }

        n = caches.length;
        start = false;
        context = "";

        if (caches[n - 1] != " ") return caches;

        for (let i = 0; i < n; i++) {
            puts = caches[n - 1 - i];
            if (puts == " " && !start) continue;
            context = puts + context;
            start = true;
        }

        return context;
    }

    // ex: q.unQuote("name=\"ahmad asy syafiq\"&class=\"devil\"", [ /\&/i, "=" ])
    unQuote(context, options = null, separate = !1, keepquotes = !1) {
        let caches, contexts, end, isregex, quotes, slashkeys, cacheQueue;

        caches = "";
        contexts = new Array;
        end = "";
        isregex = this.isRegex(options);
        quotes = "";
        slashkeys = !1;
        cacheQueue = new Array;

        if (this.isArray(options)) {

            end = options[options.length - 1];
            for (let option of options) {
                if (contexts.length == 0) {
                    contexts = this.unQuote(context, option, !0, !0)
                    continue;
                }
                for (let context of contexts) {
                    if (end != option) {
                        for (let cache of this.unQuote(context, option, !0, !0)) {
                            cacheQueue.push(cache);
                        }
                    } else {
                        cacheQueue.push(this.unQuote(context, option, !0, !1));
                    }
                }
                contexts = cacheQueue;
                cacheQueue = new Array;
            }

            // for (let i = 0; i < contexts.length; i++) {
            //     cacheQueue.push([contexts[i], this.unQuote(contexts[i+1])]);
            //     i++;
            // }

            // contexts = cacheQueue;
            // cacheQueue = new Array;

            return contexts;
        }

        for (let puts of context) {

            if (slashkeys) {
                caches += puts;
                slashkeys = !1;
                continue;
            };


            if (puts == "\\") {
                slashkeys = !0;
                if (!keepquotes) continue;
            }

            if (quotes.length < 2) {

                if ("\'\"".includes(puts) && (quotes.length > 0 ? quotes[0] == puts : true) && !slashkeys) {
                    if (keepquotes) caches += puts;
                    quotes += puts;
                    continue;
                }

            } else {

                if (caches.length > 0) contexts.push(caches);
                caches = "";
                quotes = "";

            }


            if (quotes.length == 0) {
                if (separate && (!isregex ? options == puts : options.test(puts))) {

                    if (caches.length > 0) contexts.push(caches);
                    caches = "";

                    continue;

                }
            }

            caches += puts;
        }


        if (caches.length > 0) contexts.push(caches);

        if (separate) return contexts;
        return contexts[0];
    }

    urlSearchStringify(obj) {
        let context = "?";
        if (typeof obj == "object") {
            for (let key in obj) {
                context += `${key}=${obj[key]}&`;
            }
        }
        return context.slice(0, context.length - 1).replaceAll(" ", "+");
    }

    parseUrlSearch(urls) {
        let obj = new Object
        if (urls.startsWith("?")) urls = urls.slice(1, urls.length);
        this.unQuote(urls.replaceAll("+", " "), [/&/i, "="], true).map(e => {
            if (e.length > 0) {
                if (e.length > 1) obj[e[0]] = e[1];
                else obj[e[0]] = null;
            }
        });
        return obj;
    }

    createSelectorText(elementTrace) {

        if (elementTrace && typeof elementTrace == "object" && !this.isArray(elementTrace)) {
            if (ElementTrace.prototype.isPrototypeOf(elementTrace)) {

                let nodeName = elementTrace?.nodeName || "";
                let nodeId = elementTrace?.id || "";
                let nodeClassLists = Array.from(elementTrace?.classList || []);
                let nodeAttributes = elementTrace?.attributes || {};
                let nodeAttributeKeys = Object.keys(nodeAttributes);

                let text = elementTrace?.text || "";
        
                let attributes = "";
                let classLists = "";
        
                nodeClassLists = nodeClassLists.join(".");
        
                if (nodeClassLists.length > 0) {
        
                    classLists = "." + nodeClassLists;
                }
                
                if (nodeId.length > 0) {
        
                    nodeId = "#" + nodeId;
                }
        
                nodeName = nodeName.toLowerCase();
        
                if (nodeAttributeKeys.length > 0) {
        
                    attributes = nodeAttributeKeys.map((key) => {
            
                        let attr = nodeAttributes[key];

                        if (attr.length > 0) {

                            attr = attr.replaceAll(" ", "");

                            return `${key}=${attr}`;
                        
                        }
            
                        return key;
            
                    }).join("&");
        
                    attributes = `[${attributes}]`;
                }
        
                if (text.length > 0) {

                    return `${nodeName}${attributes}${nodeId}${classLists} << ${text}`;
                
                } else {
                    
                    return `${nodeName}${attributes}${nodeId}${classLists}`;
                }

            } else
            if (Element.prototype.isPrototypeOf(elementTrace)) {

                let element = elementTrace;

                let nodeName = element.nodeName.toLowerCase();

                let n = element.attributes.length;

                let nodeId = "";
                let nodeClassLists = new Array;

                let nodeAttributes = new Array;

                let text = element.textContent;

                for (let i = 0; i < n; i++) {

                    let attribute = element.attributes[i];

                    switch (attribute.name) {

                        case "id":

                            nodeId = attribute.value;
                            break;
                        
                        case "class":

                            attribute.value.split(" ").forEach((cls) => {

                                nodeClassLists.push(cls);
                            })

                            break;
                        
                        default:

                            nodeAttributes.push([

                                attribute.name, attribute.value
                            ]);

                            break;
                    }
                }

                let attributes = nodeAttributes.map((attr) => {

                    let [ key, value ] = attr;
                    
                    value = value.replaceAll(" ", "");

                    return `${key}=${value}`;

                }).join("&");

                let classLists = nodeClassLists.join(".");

                if (attributes.length > 0) {

                    attributes = `[${attributes}]`;
                }

                if (classLists.length > 0) {

                    classLists = "." + classLists;
                }

                if (nodeId.length > 0) {

                    nodeId = "#" + nodeId;
                }

                if (text.length > 0) {

                    return `${nodeName}${attributes}${nodeId}${classLists} << ${text}`;
                
                } else {
                    
                    return `${nodeName}${attributes}${nodeId}${classLists}`;
                }
            }
        }

        return "";
    }

    similarly_elements(a, b) {

        return this.createSelectorText(a) == this.createSelectorText(b);
    }

    // ex: let [ elementTrace, context ] = q.createQuery("div[style=background-color: limegreen; width: 20%; height: 20%; margin: 4%;]#test.smallGroup.union", false);
    createQuery(context, create = true) {

        let attrs, brackets, caches, element, idString, idSession, classlist, classSessions, classCaches, cacheAttrs, obj;

        attrs = new Array;
        brackets = "";
        caches = "";
        element = null;
        idString = "";
        idSession = false;
        obj = new ElementTrace;
        classlist = obj.classList;
        classSessions = false;
        classCaches = "";
        cacheAttrs = "";

        if (context && typeof context == "object" && !this.isArray(context)) {
            if (ElementTrace.prototype.isPrototypeOf(context)) {
                if (context?.nodeName) {
                    caches = context?.nodeName?.toLowerCase();
                    element = document.createElement(context?.nodeName);
                    if (context?.id) {
                        element.setAttribute("id", context?.id);
                        caches += "\#" + context?.id;
                    }
                    if (context?.classList) {
                        if (context?.classList?.length > 0) {
                            element.classList.add(...context?.classList);
                            context?.classList?.forEach(c => {
                                caches += "\." + c;
                            });
                        }
                    }
                    if (context?.attributes) {
                        for (let attr in context?.attributes) {
                            element.setAttribute(attr, context?.attributes[attr]);
                        }
                    }
                    if (context?.content) element.textContent = context?.content;
                    if (context?.textContent) element.textContent = context?.textContent;
                    if (context?.text) element.innerText = context?.text;
                    if (context?.innerText) element.innerText = context?.innerText;
                    if (context?.html) element.innerHTML = context?.html;
                    if (context?.innerHTML) element.innerHTML = context?.innerHTML;
                    if (context?.cstyle) {

                        let specify = !1;

                        switch (context?.specify || "no") {

                            case "yes":
                                specify = !0;
                                break;
                            
                            case "no":
                                specify = !1;
                                break;
                        }

                        let selector = context?.nodeName?.toLowerCase() || "";

                        if (specify) {
                            if (context?.id) {
                                selector += `\#${context?.id}`;
                            }
                        }

                        if (context?.classList) {
                            if (context?.classList?.length > 0) {
                                for (let cls of context?.classList) {
                                    selector += `\.${cls}`;
                                }
                            }
                        }

                        if (context?.cstyle?.length > 0) {
                            let styleSheetHandler = new skStyleSheetHandler;
                            styleSheetHandler.setAttribute(selector, context?.cstyle);
                        }
                    }
                    context = caches;
                    caches = "";

                    if (create) return element;
                    return context;
                }
            }
            return [new ElementTrace, new String];
        }

        function classlist_push() {
            if (classCaches.length > 0) {
                classlist.push(classCaches);
                classSessions = false;
                classCaches = "";
            }
        }

        function attrs_push() {
            if (cacheAttrs.length > 0) {
                attrs = this.unQuote(cacheAttrs, [/\&|\,/i, "="])
                cacheAttrs = "";
            }
        }

        attrs_push = attrs_push.bind(this);

        for (let puts of context) {

            if (brackets.length < 2) {

                if (brackets.length == 0 ? puts == "\[" : puts == "\]") {
                    brackets += puts;
                    classlist_push();
                    idSession = false;
                    classSessions = false;
                    continue;
                }

                if (brackets.length > 0) {
                    cacheAttrs += puts;
                    continue;
                }

            } else {

                attrs_push();
                brackets = "";
            }

            if (puts == "\#") {
                classlist_push();
                idSession = true;
                classSessions = false;
                idString = "";
                continue;
            }


            if (puts == "\.") {
                classlist_push();
                classSessions = true;
                idSession = false;
                continue;
            }

            if (idSession) {
                idString += puts;
                continue;
            }

            if (classSessions) {
                classCaches += puts;
                continue;
            }

            caches += puts;
        }

        attrs_push();
        classlist_push();

        context = caches;
        caches = "";

        if (!(context.length > 0)) return [new ElementTrace, new String];

        obj["nodeName"] = context.toUpperCase();
        if (create) element = document.createElement(context);

        if (idString.length > 0) {
            if (create) element.setAttribute("id", idString);
            obj["id"] = idString;
            context += "\#" + idString;
        }

        if (classlist.length > 0) {
            if (create) element.classList.add(...classlist);
            // obj["classList"] = classlist;
            classlist.forEach(cls => {
                context += "\." + cls;
            });
        }

        if (attrs.length > 0) {
            obj["attributes"] = new Object;
            for (let attr of attrs) {
                if (attr.length > 1) { // array key, value
                    if (create) element.setAttribute(attr[0], attr[1]);
                    obj["attributes"][attr[0]] = attr[1];
                } else {
                    if (create) element.setAttribute(attr[0], "");
                    obj["attributes"][attr[0]] = ""
                }
            }
        }

        if (create) return [element, context]
        return [obj, context];
    }

    parseBool(check = null) {

        if (!(check && typeof check == "string")) return null;

        return ["true", "1", "!0"].includes(check) ? true : (["false", "0", "!1"].includes(check) ? false : null);
    }

    parseQueries(queries) {

        const target = this.target || document;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target) {
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).parseQueries(queries));
        }

        switch (typeof queries) {
            case "string":

                if (queries.startsWith("!")) {

                    queries = queries.slice(1);

                    return new skQueryClone(this.createQuery(queries)[0]);

                } else
                    if (queries.endsWith("*")) {

                        queries = queries.slice(0, queries.length - 1);

                        let almost_an_element = this.createQuery(queries, false);
                        let elements = target.querySelectorAll(almost_an_element[1]);

                        if (elements) return new skQueryClone(Array.from(elements)
                            .map(t => new skQueryClone(t?.target || t)));
                        return new skQueryClone;

                    } else {

                        let almost_an_element = this.createQuery(queries, false);
                        let element = target.querySelector(almost_an_element[1]);

                        if (!element) return new skQueryClone(this.createQuery(almost_an_element[0])[0]);
                        return new skQueryClone(element);
                    }

            // break; useless

            case "object":

                
                if (skQueryClone.prototype.isPrototypeOf(queries)) queries = queries?.target || queries;
                
                if (this.isArray(queries)) {

                    return new skQueryClone(queries.map(q => this.parseQueries(q)));
                } else
                if (Element.prototype.isPrototypeOf(queries) ||
                    Document.prototype.isPrototypeOf(queries) ||
                    DocumentFragment.prototype.isPrototypeOf(queries) ||
                    Window.prototype.isPrototypeOf(queries)) {

                    return new skQueryClone(queries);
                }

                break;

        }

        return null;
    }

    ready(fn) {
        let callback = this.readyState(fn, new skQueryReadyEvent);
        let target = this.target || document;
        target.addEventListener("readystatechange", _ => {
            return callback();
        }, true)
        window.addEventListener("DOMContentLoaded", _ => {
            return callback();
        }, true)
        target.addEventListener("load", _ => {
            return callback();
        }, true)
        window.addEventListener("load", _ => {
            return callback();
        }, true)
        callback();
        return null;
    }

    classList(...cls) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (cls.length > 0) {
            if (target) {
                if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).classList(...cls));
                cls.forEach((c => {
                    if (!target?.classList?.contains(c)) target?.classList?.add(c);
                }).bind(this));
            }
        }
        return target?.classList;
    }

    classListRemove(...cls) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (cls.length > 0) {
            if (target) {
                if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).classListRemove(...cls));
                cls.forEach((c => {
                    if (target?.classList?.contains(c)) target?.classList?.remove(c);
                }).bind(this));
            }
        }
        return target?.classList;
    }

    ignoreTransformStyle(transforms, ignore) {

        let caches, isarray, isregex;
        caches = "";
        isregex = this.isRegex(ignore);
        isarray = this.isArray(ignore);

        // if(this.isArray(ignore)) {
        //     caches = transforms;
        //     ignore?.forEach((e => {
        //         caches = this.ignoreTransformStyle(caches, e);
        //     }).bind(this));
        //     return caches;
        // }

        if (transforms && typeof transforms == "string") this.unQuote(transforms, "\)", !0, !0).forEach((transform => {
            let test, continues;

            test = "";
            continues = false;

            for (let puts of transform) {
                if (puts == "\(") break;
                if (puts == " ") continue;
                test += puts;
            }

            if (!isarray) {
            
                if (!isregex ? transform && !test?.startsWith(ignore) : transform && !ignore?.test(test)) {
            
                    caches += (!caches ? transform : " " + transform) + "\)";
            
                }
            
            } else {
            
                continues = false;
            
                ignore?.forEach((e => {
            
                    if (!this.isRegex(e) ? transform && test?.startsWith(e) : transform && e?.test(test)) {
            
                        continues = true;
            
                    }
            
                }).bind(this));
            
                if (!continues) {
                    
                    caches += (!caches ? transform : " " + transform) + "\)";
                
                }
            }

        }).bind(this));

        return this.unSpaceText(caches);
    }

    rotate(degrees) {

        if (degrees && typeof degrees == "number") degrees = `${degrees}deg`

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const transforms = this.ignoreTransformStyle(target?.style?.transform || "", "rotate");
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).rotate(degrees));
            
            if ("style" in target) target.style.transform = `rotate(${degrees})${transforms ? " " + transforms : ''}`;
        }

        return transforms;
    }

    scale(w, h) {

        if (typeof w == "string") w = parseInt(w);
        if (typeof h == "string") h = parseInt(h);

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const transforms = this.ignoreTransformStyle(target?.style?.transform || "", "scale");
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).scale(w, h));
            
            if ("style" in target) target.style.transform = `scale(${w}, ${h})${transforms ? " " + transforms : ''}`;
        }

        return transforms;
    }

    translate(x, y) {

        // if (typeof x == "number") x = `${x}px`;
        // if (typeof y == "number") y = `${y}px`;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        // const transforms = this.ignoreTransformStyle(target?.style?.transform || "", [ "translate", "translateX", "translateY" ]);
        const transforms = this.ignoreTransformStyle(target?.style?.transform || "", ["translateX", "translateY"]);
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).translate(x, y));
            // if ("style" in target) target.style.transform = `translate(${x}, ${y})${transforms? " " + transforms : ''}`;
            this.translateX(x);
            this.translateY(y);
        }

        return transforms;
    }

    translateX(x) {

        if (typeof x == "number") x = `${x}px`;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        // const transforms = this.ignoreTransformStyle(target?.style?.transform || "", [ "translate", "translateX" ]);
        const transforms = this.ignoreTransformStyle(target?.style?.transform || "", "translateX");
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).translateX(x));
            
            if ("style" in target) target.style.transform = `translateX(${x})${transforms ? " " + transforms : ''}`;
        }

        return transforms;
    }

    translateY(y) {

        if (typeof y == "number") y = `${y}px`;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        // const transforms = this.ignoreTransformStyle(target?.style?.transform || "", [ "translate", "translateY" ]);
        const transforms = this.ignoreTransformStyle(target?.style?.transform || "", "translateY");
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).translateY(y));
            
            if ("style" in target) target.style.transform = `translateY(${y})${transforms ? " " + transforms : ''}`;
        }

        return transforms;
    }

    borderRadius(value) {

        if (typeof value == "number") value = `${value}px`;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).borderRadius(value));
            
            if ("style" in target) {

                target.style.borderTopLeftRadius = value;
                target.style.borderTopRightRadius = value;
                target.style.borderBottomRightRadius = value;
                target.style.borderBottomLeftRadius = value;

            }
        }

        return value;
    }

    textSize(value) {

        if (typeof value == "number") value = `${value}px`;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target) {
            
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).textSize(value));
            
            if ("style" in target) {

                target.style.fontSize = value;

            }
        }

        return value;
    }

    append(element) {

        if (element && typeof element == "object") {

            element = element?.target || element;
        }

        if (!Element.prototype.isPrototypeOf(element)) return null;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (element && typeof element == "object" && Element.prototype.isPrototypeOf(element)) {

            if (target) {
                
                if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).append(element.cloneNode()));
                
                target.append(element);
            }
        }

        return null;
    }

    remove(element) {

        if (element && typeof element == "object") {

            element = element?.target || element;
        }

        if (!Element.prototype.isPrototypeOf(element)) return null;

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (element && typeof element == "object" && Element.prototype.isPrototypeOf(element)) {

            if (target) {
                
                if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).remove(element));

                for (let childElement of Array.from(target.children)) {

                    // if (Element.prototype.isPrototypeOf(childElement))
                    if (this.similarly_elements(childElement, element)) {

                        childElement.remove();
                        break;
                    }
                }
            }
        }

        return null;
    }

    toCircle() {

        return this.borderRadius("50\%");
    }

    hide() {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const display = target?.style?.display || "";
        const isarray = this.isArray(target);

        if (target) {

            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).hide());

            // save current display style
            target.__style_display__ = display;
            if ("style" in target) target.style.display = "none";
        }

        return target?.style?.display || display;
    }

    show() {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const display = target?.style?.display || "";
        const isarray = this.isArray(target);

        if (target) {
            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).show());
            if ("style" in target) target.style.display = target?.__style_display__ || "block";
        }

        return target?.style?.display || display;
    }

    on(type, callback, options = true) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target && type && typeof type == "string") {

            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).on(type, callback, options));

            let listen = false;
            // save current listeners
            if (!(this.isArray(target?.__listeners__))) target.__listeners__ = new Array;
            if (!(target?.__listeners__.includes(callback))) {
                target.__listeners__.push(callback);
                listen = true;
            }

            if (typeof callback == "function" && listen) {
            
                target.addEventListener(type, callback, options);
            
            }

        }

        return options;
    }

    hover(obj, options = true) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target && obj && !this.isArray(obj)) {

            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).hover(obj));

            let listen = false;
            // save current listeners
            if (!(this.isArray(target?.__hover_listeners__))) target.__hover_listeners__ = new Array;
            if (!(target?.__hover_listeners__.includes(obj))) {
                target.__hover_listeners__.push(obj);
                listen = true;
            }

            let focus = obj?.focus || null;
            let leave = null;

            function __focus__() {

                return function __wrapper__(e) {

                    if (focus && !leave) {

                        if (obj?.focus && typeof obj.focus == "function") obj.focus.bind(this, ...arguments).call(e);
                        leave = obj?.leave || null;
                        setTimeout(() => {

                            focus = null;

                            // leave for limit time
                            __leave__()(e);

                        }, 100);
                    
                    }
                }
            }


            function __leave__() {

                return function __wrapper__(e) {

                    if (leave && !focus) {

                        if (obj?.leave && typeof obj.leave == "function") obj.leave.bind(this, ...arguments).call(e);
                        focus = obj?.focus || null;
                        setTimeout(() => {

                            leave = null;

                        }, 100);
                        
                    }
                }
            }

            if (obj?.focus && typeof obj.focus == "function") {
                    
                if (target?.ontouchstart) {

                    target.addEventListener("touchstart", __focus__(), true);
                }

                target.addEventListener("mouseover", __focus__(), true);
                
            }
            
            
            if (obj?.leave && typeof obj.leave == "function") {

                if (target?.ontouchend) {

                    target.addEventListener("touchend", __leave__(), true);
                }

                target.addEventListener("mouseleave", __leave__(), true);
            }

        }

        return null;
    }

    getSource(selector = null) {

        if (!selector) selector = "source";

        selector += ".jessie-get-source";

        let target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (!Element.prototype.isPrototypeOf(target)) {

            if (!Window.prototype.isPrototypeOf(target)) return null;
        };

        if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).getSource(selector));

        target = target?.target || target;

        let sourceElement = target.querySelector(selector);

        if (Element.prototype.isPrototypeOf(sourceElement)) {

            return {
                src: sourceElement.attributes?.src?.value || null,
                type: sourceElement.attributes?.type?.value || null
            }
        }

        return null;
    }

    getSourceAll(selector = null) {

        if (!selector) selector = "source.jessie-get-source";

        selector += ".jessie-get-source";

        let target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (!Element.prototype.isPrototypeOf(target)) {

            if (!Window.prototype.isPrototypeOf(target)) return null;
        };

        if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).getSource(selector));

        target = target?.target || target;

        let sourceElements = Array.from(target.querySelectorAll(selector));

        let sourceList = sourceElements.map((element) => {

            if (Element.prototype.isPrototypeOf(element)) {

                return {
                    src: element.attributes?.src?.value || null,
                    type: element.attributes?.type?.value || null
                }
            }
    
            return null;
        });

        return sourceList || null;
    }

    resize(callback) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (!Element.prototype.isPrototypeOf(target)) {

            if (!Window.prototype.isPrototypeOf(target)) return null;
        };

        if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).resize(callback));

        let query = (p) => new skQueryClone(p?.target || p);

        let wrapper = (() => {

            let point = {};
            let percent = {};

            let vw = 0;
            let vh = 0;

            return ((e, callback) => {

                let body = document?.body || null;

                if (!body) return null;

                let cw = body.clientWidth;
                let ch = body.clientHeight;

                if (vw < cw) vw = cw;
                if (vh < ch) vh = ch;

                percent.w = cw / vw;
                percent.h = ch / vh;

                point.vw = vw;
                point.vh = vh;
                point.cw = cw;
                point.ch = ch;
                point.percent = percent;
                point.pointer = e;
                
                if (callback && typeof callback == "function") {

                    callback(point);
                }

            }).bind(this);
        }).bind(this);

        let wp = wrapper();

        let main = (e) => {


            if (callback && typeof callback == "function") {

                wp(e, callback);

            }

            return null;
        };

        query(target).on("resize", main);

        return main(null);
    }

    removeEvent(type, listener, options) {

        const target = this.target || document?.body;
        const skQueryClone = skQuery;
        const isarray = this.isArray(target);

        if (target && type && typeof type == "string") {

            if (isarray) return target.map(t => (new skQueryClone(t?.target || t)).removeEvent(type, listener, options));

            let listen = true;
            // save current listeners
            if (this.isArray(target?.__listeners__) && target?.__listeners__.includes(listener)) {
                target.__listeners__.splice(target.__listeners__.indexOf(listener), 1);
                listen = false;
            }

            if (["hover:focus", "hover:leave"].includes(type)) {

                // __hover_listeners__

                // obj.focus obj.leave

                listen = false;
            }

            if (typeof listener == "function" && !listen) {
                
                if (["hover:focus", "hover:leave"].includes(type)) {

                    if (type == "hover:focus") {

                        if (target?.ontouchstart) {

                            target.removeEventListener("touchstart", listener, true);
                        }

                        target.removeEventListener("mouseover", listener, true);
                    }

                    if (type == "hover:leave") {

                        if (target?.ontouchend) {

                            target.removeEventListener("touchend", listener, true);
                        }
                        
                        target.removeEventListener("mouseleave", listener, true);
                    }
                    

                } else {

                    target.removeEventListener(type, listener, options);
                }
            
            }

        }

        return options;
    }

}

// Queue Main isReady

export class skQueueMainActivity extends skQuery {

    constructor(...args) {

        super();

        this.listeners = new Array;
        this.params = this.parseUrlSearch(location.search);

        this.init();

    }

    init() {

        this.ready((e => {

            this.listeners.forEach((listener => {

                listener.bind(this).call(this.params);

            }).bind(this))

            this.listeners = new Array;

        }).bind(this));

    }

    fallback() {

        // reinit
        this.init();
    }

    enqueue(fn) {
        if (!this.listeners.includes(fn)) this.listeners.push(fn);
        return null;
    }

    dequeue() {
        if (this.listeners.length > 0) return this.listeners.shift();
        return null;
    }
}

export class skBytes extends Object {

    constructor() {

        super();


    }

    encode(value, radix = 16) {

        if (value?.toString && value?.toString?.length > 0) return value.toString(radix);

        let context, caches;
        context = "0123456789abcdef";
        caches = [];

        if (value && typeof value == "object" && Array.isArray(value)) {

            return value.map((v => this.encode(v, radix)[0]).bind(this));
        }

        if (value && typeof value == "string") {
            for (let puts of value) {
                caches.push(this.encode(puts.codePointAt(), radix));
            }
            return caches;
        }

        if (typeof value != "number" || isNaN(value)) return "";

        let maxint, b;

        maxint = radix;
        b = 0;

        let i, c, m;
        m = maxint;
        i = 0;
        c = 0;

        // while (c <= m) {
        //     c += 2 ** i;
        //     i++;
        // }

        // m = m -1;
        // i = i -1;

        while (c <= m) {

            c += c * 2;
            c = (c == 0 ? 1 : c);
            i++

        }

        m = m - 1;

        let x;
        x = maxint;

        while (x < value) {
            x += x;
        }

        b = x / 2;

        if (b > m) {

            let j;
            j = 1;

            while (true) {
                if (b > (((m + 1) ** j) - 1)) return this.encode(value >> (i * j), radix) + this.encode(value & (((m + 1) ** j) - 1), radix)
            }
        }

        // if (b > m) return this.encode(value >> i, radix) + this.encode(value & m, radix);

        return context[value];
    }

    hex(value) {

        return this.encode(value, 16);
    }

    oct(value) {

        return this.encode(value, 8);
    }

    decode(contexts, radix = 16) {

        if (window?.parseInt && window?.parseInt?.length > 1) return parseInt(contexts, radix);

        if (contexts && Array.isArray(contexts)) {

            return contexts.map((v => {

                return String.fromCodePoint(this.decode(v, radix));

            }).bind(this));
        }

        if (typeof contexts != "string" || !contexts) return 0;

        contexts = contexts.toLowerCase();

        let puts, c, context, n, x;

        context = "0123456789abcdef";

        c = 0;
        n = 0;
        x = 0;

        n = contexts.length;

        for (let i = 0; i < n; i++) {

            puts = contexts[i];

            x = context.indexOf(puts);

            if (-1 < x) c += (radix ** (n - 1 - i)) * x;

        }

        return c;
    }

    fromhex(value) {

        return this.decode(value, 16);
    }

    fromoct(value) {

        return this.decode(value, 8);
    }

}

export class skBufferText extends Object {

    constructor(...args) {

        super();

        // this.buffer = null;
        this.buffer = new Uint8Array;

    }

    encode(context, unicode = true, caches = false) {

        let buffer;
        buffer = new Uint8Array;

        if (typeof context != "string" || !context) return null;

        if (unicode) buffer = new Uint32Array(Array.from(context).map(e => e.codePointAt()));
        else buffer = new Uint8Array(Array.from(context).map(e => e.codePointAt()));
        if (unicode) buffer = new Uint8Array(buffer?.buffer || buffer);

        if (caches) this.buffer = buffer;

        return buffer;
    }

    decode(buffer = null, unicode = true) {

        if (!buffer) buffer = this.buffer;

        if (!buffer || buffer?.length == 0 || !Uint8Array.prototype.isPrototypeOf(buffer)) return new Array;

        if (unicode) buffer = new Uint32Array(buffer?.buffer || buffer);

        if (!buffer) this.buffer = new Uint8Array;

        return Array.from(buffer).map(e => String.fromCodePoint(e));
    }
}

export class skStyleSheetTrace extends CSSStyleSheet {

    constructor() {

        super();

    }

}

export class skStyleSheetHandler extends Object {

    constructor() {
        super();

        this.styleSheets = null;

        // bypass document.styleSheets
        this.init();

    }

    init() {
        if (Array.from(document?.head?.children).filter(elem => elem?.nodeName == "STYLE").length == 0) {
            let style = document.createElement("style");
            document.head.append(style);
            this.styleSheets = [
                style.sheet
            ];
            return null;
        }

        this.styleSheets = Array.from(document.styleSheets);

        // fault tolerance
        // if (this.styleSheets.length == 0) this.styleSheets = [
        //     new class CSS extends CSSStyleSheet {
        //         constructor () {
        //             super();
        //         }
        //     }
        // ];

        return null;
    }

    convertArrayToObject(array) {
        let obj;
        obj = new Object;
        array.forEach(attr => {
            if (attr && Array.isArray(attr)) {
                if (attr?.length > 1) obj[attr[0]] = attr[1];
                else if (attr?.length > 0) obj[attr[0]] = null;
            } else
                if (attr && typeof attr == "string") obj[attr] = null;
        });
        return obj;
    }

    convertStyleAttrLikeJs(attr) {

        if (attr && Array.isArray(attr)) return attr.map((attribute => {
            return this.convertStyleAttrLikeJs(attribute);
        }).bind(this));

        let caches, upper;
        upper = false
        caches = "";
        for (let puts of attr) {
            if (puts == "\-") {
                upper = true;
                continue;
            };
            if (upper) {
                caches += puts.toUpperCase();
                upper = false;
                continue;
            }
            caches += puts;
        }
        return caches;
    }

    convertStyleLikeJs(selector, rule) {

        let style, styleSheet, selectorText;
        // render test
        // fake CSSStyleSheet
        styleSheet = new skStyleSheetTrace;
        styleSheet?.insertRule(`${selector} \{ ${rule} \}`);
        style = Array.from(styleSheet?.cssRules).shift();
        selectorText = style?.selectorText;
        style = style.style;
        style = Array.from(style).map((attr => [this.convertStyleAttrLikeJs(attr), style[attr]]).bind(this))
        // compare
        // return
        return [selectorText, this.convertArrayToObject(style)];
    }

    getAllStyleSheets() {

        return Array.from(this.styleSheets).map((styleSheet => {

            let selectorText;
            // let style, selectorText;
            // style = Array.from(styleSheet?.cssRules).shift();

            return Array.from(styleSheet?.cssRules).map((style => {
                selectorText = style?.selectorText;
                style = style.style;
                style = Array.from(style).map((attr => [this.convertStyleAttrLikeJs(attr), style[attr]]).bind(this))
                return [selectorText, this.convertArrayToObject(style)];
            }).bind(this));

        }).bind(this));
    }

    // ex: q.styleSheetHandler.contains(".circle", "border-radius: 50%; margin: 12px;");
    contains(selector, rule) {

        let a, b, c;

        c = false;

        if (!(this.styleSheets && Array.isArray(this.styleSheets))) return false;
        if (this.styleSheets?.length == 0 || this.styleSheets[0]?.cssRules?.length == 0) return false;

        a = this.convertStyleLikeJs(selector, rule);
        b = this.getAllStyleSheets();

        for (let rules of b) {

            for (let compare of rules) {

                if (!(compare && Array.isArray(compare) && compare.length > 1)) return false;
                if (compare[0] != a[0]) {
                    c = true;
                    continue;
                }

                let value;
                c = false;
                value = "";

                // from a to compare
                for (let attr in a[1]) {
                    value = a[1][attr];
                    if (c) continue;
                    if (attr in compare[1]) {
                        if (compare[1][attr] != value) {
                            c = true;
                        }
                    } else {
                        c = true;
                    }
                }

                // from compare to a
                for (let attr in compare[1]) {
                    value = compare[1][attr];
                    if (c) continue;
                    // if (attr in a[1]) {
                    //     if (a[1][attr] != value) {
                    //         c = true;
                    //     }
                    // } else {
                    //     c = true;
                    // }
                    if (!(attr in a[1])) {
                        c = true;
                        break;
                    }
                }

                if (!c) break;
            }

            if (!c) break;
        }

        return !c;
    }

    setAttribute(selector, rule, options = false) {

        if (typeof selector != "string" || !selector) return options;
        if (typeof rule != "string" || !rule) return options;

        if (!this.contains(selector, rule)) {
            if (options) {
                this.styleSheets.forEach(styleSheet => {
                    styleSheet?.insertRule(`${selector} \{ ${rule} \}`, 0);
                })
            } else {
                if (this.styleSheets.length > 0) {
                    this.styleSheets[0]?.insertRule(`${selector} \{ ${rule} \}`, 0);
                }
            }
        }

        return options;
    }

    getAttribute(selector, options = false) {

        let a, b;

        a = this.getAllStyleSheets();

        b = new Array;

        for (let rules of a) {

            for (let compare of rules) {

                if (!(compare && Array.isArray(compare) && compare.length > 1)) return null;

                let caches;
                caches = "";

                for (let puts of compare[0]) {

                    if (puts == " ") {
                        if (caches == selector) {
                            b.push(compare[1]);
                            break;
                        }
                        caches = "";
                        continue;
                    }

                    caches += puts;
                }

                if (caches.length > 0) {
                    if (caches == selector) {
                        b.push(compare[1]);
                    }
                }

                if (b.length > 0 && !options) break;
            }

            if (b.length > 0 && !options) break;
        }

        if (!options && b.length > 0) return b[0];
        return b;
    }

    convertObjectStyleToDeclaration(obj) {

        if (typeof obj != "object" && !obj) return "";

        let caches, value, prop;
        caches = "";
        value = "";
        prop = "";

        let contexts, n;
        contexts = Object.getOwnPropertyNames(obj);
        n = contexts.length;

        for (let i = 0; i < n; i++) {

            prop = contexts[i];

            value = obj[prop];
            if (value && typeof value == "string") caches += `${prop.replace(/[A-Z]/g, e => "\-" + e.toLowerCase())}: ${value};${i + 1 == n ? "" : " "}`
        }

        return caches;
    }

    elementTraceStyle(et) {
        if (et && ElementTrace.prototype.isPrototypeOf(et)) {

            // attributes?.style to style
            // Object.defineProperty(et, "style", {
            //     get: (function() {
            //         let style = et?.attributes?.style;
            //         if (style && typeof style == "string") return this.convertStyleLikeJs("none", style)[1];
            //         return null;
            //     }).bind(this),
            //     configurable: false,
            //     enumerable: false
            // });

            // todos
            // style to attributes?.style
            // object to string
            // Object.getOwnPropertyNames

            let style = et?.attributes?.style;
            if (style) {
                et.style = this.convertStyleLikeJs("none", style)[1];
                Object.defineProperty(et.attributes, "style", {
                    get: (function () {
                        return this.convertObjectStyleToDeclaration(et?.style);
                    }).bind(this),
                    configurable: true,
                    enumerable: true
                })
            }
        }
        return null;
    }

}

export class skSurface extends skQuery {

    constructor(...args) {

        super();

        let q = new skQuery;

        this.target = q.parseQueries("!div[style=background-color: limegreen; width: 20vw; height: 20vw; margin: 0; padding: 0;]").target;

    }
}

export class skSurfaceCircle extends skSurface {

    constructor(...args) {

        super();

        this.toCircle();

    }
}

export class skSurfaceTriangle extends skSurface {

    constructor() {

        super();

        this.data = new Object;

        this.init();

        this.topArrow();


    }

    init() {

        if (typeof this?.data != "object" || !this?.data) this.data = new Object;

        this.data.w = this.target.style.width;
        this.data.h = this.target.style.height;
        this.data.bg = this.target.style.backgroundColor;
        this.target.style.backgroundColor = "";
        this.target.style.borderStyle = "solid";
        this.target.style.boxSizing = "border-box";
    }

    topArrow() {
        let { w, h, bg } = this.data;
        this.target.style.borderColor = `transparent transparent ${bg} transparent`;
        this.target.style.borderWidth = `calc(${h} * 1/3) calc(${w}/2) calc(${h} * 2/3) calc(${w}/2)`;
    }

    rightArrow() {
        let { w, h, bg } = this.data;
        this.target.style.borderColor = `transparent transparent transparent ${bg}`;
        this.target.style.borderWidth = `calc(${h}/2) calc(${w} * 1/3) calc(${h}/2) calc(${w} * 2/3)`;
    }

    bottomArrow() {
        let { w, h, bg } = this.data;
        this.target.style.borderColor = `${bg} transparent transparent transparent`;
        this.target.style.borderWidth = `calc(${h} * 2/3) calc(${w}/2) calc(${h} * 1/3) calc(${w}/2)`;
    }

    leftArrow() {
        let { w, h, bg } = this.data;
        this.target.style.borderColor = `transparent ${bg} transparent transparent`;
        this.target.style.borderWidth = `calc(${h}/2) calc(${w} * 2/3) calc(${h}/2) calc(${w} * 1/3)`;
    }
}

export class skQueryManager extends skQuery {

    constructor() {

        super();

        this.QueueMainActivity = new skQueueMainActivity;
        this.Bytes = new skBytes;
        this.StyleSheetHandler = new skStyleSheetHandler;
        this.BufferText = new skBufferText;

        // customizable
        this.Surface = skSurface;
        this.SurfaceTriangle = skSurfaceTriangle;
        this.SurfaceCircle = skSurfaceCircle;
    }

    get Query() {

        return function __query__(queries) {

            let query = new skQuery;

            return query.parseQueries(queries);
        };
    }

    set Query(value) { } // writable no - permission
}

// export default function $ (context) {
//     let q = new skQuery;
//     return  q.parseQueries.bind(q).apply(this || context, arguments);
// };

// export function Q() {

//     let q = new skQuery;

//     q.QueueMainActivity = new skQueueMainActivity;
//     q.Bytes = new skBytes;
//     q.StyleSheetHandler = new skStyleSheetHandler;
//     q.BufferText = new skBufferText;

//     q.Surface = skSurface;
//     q.SurfaceTriangle = skSurfaceTriangle;
//     q.SurfaceCircle = skSurfaceCircle;

//     Object.defineProperty(q, "Query", {
//         get: function() {
//             return q.parseQueries.bind(q);
//         },
//         set: function(v) {}, // must be not writable, alternative
//         configurable: false,
//         enumerable: false

//     })

//     return q;
// }
