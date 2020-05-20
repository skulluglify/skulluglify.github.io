/*
    sk: skulluglify
*/

if (typeof self == "undefined") self = globalThis;

import { skQueryManager, ElementTrace } from "./jessie.js";
import { Package } from "./jessie.package.js";

self.package = Package;

let q = new skQueryManager;
let $ = q.Query;

export class Render extends Object {

    constructor() {

        super();

        this.TABSPACESIZE = 4;

        this.pipelines = new Array;

        this.package = new Package;
        this.path = this.package.path;

        this.nodups = new Array;

        this.defaultLocalePath = "";

        this.enableCache = false;
    }

    usePipeline(pipeline) {

        this.pipelines.splice(0,0,pipeline);
    }
    
    get parseInit() {

        let has_initialized = false;

        return function __init__() {

            if (!has_initialized) {
                
                this.pipelines.splice(0,0,this.parseVirtualElementQueryPerLine);
                this.pipelines.splice(0,0,this.parseBetterLookQueryPerLine);
                this.pipelines.splice(0,0,this.parseSourceGetEmbedPerLine);
                this.pipelines.splice(0,0,this.parseTextCollectorPerLine);
                this.pipelines.splice(0,0,this.parseIncludeFilePerLine);
                this.pipelines.splice(0,0,this.parseConfigVirtualAuto);
                this.pipelines.splice(0,0,this.parseNoDuplicateAuto);
                this.pipelines.splice(0,0,this.parseJavaScriptAuto);
                this.pipelines.splice(0,0,this.parseCommitPerLine);
                // this.pipelines.push(this.parseCommitPerLine);
                // this.pipelines.push(this.parseJavaScriptAuto);
                // this.pipelines.push(this.parseNoDuplicateAuto);
                // this.pipelines.push(this.parseIncludeFilePerLine);
                this.pipelines.push(this.parseQueryPerLine);
                has_initialized = false;
            }
        }   
    }

    _get_source(src) {

        if (/^https?\:\/\//i.test(src)) {

            // pass

        } else if (src.startsWith("mo:")) {

            /**
             * 
             * .
             * ..
             * mo:
             * pkg:
             */

            src = src.substring("mo:".length, src.length);
            src = this.path.join("./jessie_modules/", src);
        
        } else if (src.startsWith("pkg:")) {

            src = src.substring("pkg:".length, src.length);
            src = this.path.join("./jessie_modules/", src);
        
        } else {

            if ([".", ".."].includes(src.split("/").shift())) {
                
                src = this.path.simplify(this.path.join(this.defaultLocalePath, src));
            
            } else {
                
                src = this._get_source("pkg:" + src);
            }
        }

        if (this.path.basename(src).split(".").length < 2) {

            src = this.path.simplify(this.path.join(src, "component.jessie"));
        }

        return src;
    }

    _split_once(context, key = "<", count = 2) {

        let arrayList = new Array;

        let data = Array.from(context);

        let _shl = 0;

        let _shl_index = 0;

        let n = data.length;

        for (let i = 0; i < n; i++) {

            let puts = data[i];

            if (puts == key) {

                _shl += 1;
                _shl_index = i;

                if (_shl == count) break;
            }

            _shl = 0;
        }

        if (_shl_index > 0) {

            arrayList.push(context.substring(0,_shl_index - (count - 1)));
            arrayList.push(context.substring(_shl_index + 1, context.length));

        } else {

            arrayList.push(context);
        }

        return arrayList.map((t) => q.unSpaceText(t));
    }

    async _fetch_auto_cache(input, init) {

        let key = input.replace(/(\/|\.)/g, "_");

        let sizeStorage;
        let sizeLimitCache;
        let sizeLimitCacheLength;

        sizeStorage = null;
        
        sizeLimitCache = 0;
        sizeLimitCacheLength = 0;
        
        if (typeof StorageManager == "object") {

            if (StorageManager?.prototype) {
    
                if (StorageManager.prototype.isPrototypeOf(navigator?.storage)) {
    
    
                    sizeStorage = await navigator.storage.estimate();
                    sizeLimitCache = 150 * 1e3;
                    sizeLimitCacheLength = Math.floor(sizeStorage.quota / sizeLimitCache);
                }            
            }
        }

        let dataLocal = localStorage.getItem(key);

        if (!dataLocal) {

            let data = await fetch(input, init);
            let context = await data.text();

            // limit 150KB
            let sizeFile = context.length * 8;

            if (sizeFile <= sizeLimitCache && localStorage.length <= sizeLimitCacheLength) {
    
                if (this.enableCache) localStorage.setItem(key, context);
            }
    
            return context;
        }

        return dataLocal;
    }

    setDefaultLocalePath(src) {

        this.defaultLocalePath = src;
    }

    setEnableCache(enable) {

        this.enableCache = enable;
    }

    async eval(context) {

        let obj, start, wait;
        obj = new Object; // alocate mems

        this.parseInit();

        let defaultLocalePath = `${this.defaultLocalePath}`; // copy string

        obj.virtualConfig = new Object;

        // add local
        obj.local = new Object;

        obj.imports = async function __import__ (src) {

            let render = new Render;
            render.setDefaultLocalePath(defaultLocalePath);
            
            return await render._fetch_auto_cache(render._get_source(src));
        }
        
        obj.getUrl = function __getUrl__ (src) {
            
            let render = new Render;
            render.setDefaultLocalePath(defaultLocalePath);

            return render.path.join(self.location.origin, render._get_source(src));
        }
        
        obj.document = new DocumentFragment;
        obj.head = document.createElement("head");
        obj.body = document.createElement("body");
        
        obj.document.head = obj.head;
        obj.document.body = obj.body;

        // obj.document.append(obj.document.head);
        // obj.document.append(obj.document.body);

        obj.element = new DocumentFragment;
        obj.virtual_documents = new Array;
        obj.virtual_parent = null;
        obj.parent = obj.element;
        obj.currentElement = obj.parent;
        
        obj.selectors = new Array;
        obj.nodups = Array.from(this.nodups);
        
        obj.tabs = 0;
        obj.caches = "";
        
        start = true;
        wait = true;

        context += "\n";

        for (let puts of context) {

            // priority 1
            // 
            // priority 2
            // priority 3

            if ([" ", "\t"].includes(puts) && start) {
                obj.tabs = obj.tabs +(puts == "\t" ? this.TABSPACESIZE : 1);
                continue;
            }

            start = false;

            if (puts == "\n") {

                obj.caches = q.unSpaceText(obj.caches);

                if (obj.caches.length > 0) {
                    for (let rule of this.pipelines) {
                        if (rule && typeof rule == "function" && obj.caches.length > 0) {
                            wait = await rule(obj);
                            if (!wait) break;
                        }
                    }
                    // if (!wait) continue;
                }
                
                obj.tabs = 0;
                start = true;
                obj.caches = "";
                continue;
            }

            obj.caches += puts;
        }

        // return [ obj.document, obj?.selectors || new Array ];

        return {

            virtuals: obj.virtual_documents,
            document: obj.document,
            element: obj.element,
            selectors: obj.selectors,
            nodups: obj.nodups,

        };
    }

    async renderJessieAuto(src) {

        src = this._get_source(src);

        let dirname = this.path.dirname(src);

        this.setDefaultLocalePath(dirname);

        let context = await this._fetch_auto_cache(src);
        let data = await this.eval(context);

        self.virtuals = data.virtuals;

        document.body.append(data.element);

        Array.from(data.document.head.children).forEach((element) => {

            data.document.head.remove(element);
            document.head.append(element);
        })

        Array.from(data.document.body.children).forEach((element) => {

            data.document.body.remove(element);
            document.body.append(element);
        })

        return data;
    }

    //TODOs
    // FUTURES -- // /* */
    get parseCommitPerLine() {

        let comment_zone;
        comment_zone = false;

        return function __cache__ (obj) {

            if (obj.caches.startsWith("\/\*")) comment_zone = true;
            
            if (!!comment_zone && obj.caches.endsWith("\*\/")) {
                comment_zone = false;
                return false;
            }
            
            if (!!comment_zone) {
                return false;
            }


            if (obj.caches.startsWith("--") || obj.caches.startsWith("\/\/")) {
                return false;
            }

            return true;
        }
    }

    get parseIncludeFilePerLine() {

        let INCLUDE_HEADER = "include";
        let IMPORT_HEADER = "import";

        let includeFiles = new Array;
        let path = this.path;
        let defaultLocalePath = this.defaultLocalePath;
        

        let element_builder_context = "";

        return (async function __cache__(obj) {

            if (obj.caches.startsWith(INCLUDE_HEADER) || obj.caches.startsWith(IMPORT_HEADER)) {
                
                defaultLocalePath = this.defaultLocalePath;
                
                if (obj.caches.startsWith(INCLUDE_HEADER)) {

                    obj.caches = obj.caches.substring(INCLUDE_HEADER.length, obj.caches.length);
                
                } else if (obj.caches.startsWith(IMPORT_HEADER)) {
                    
                    obj.caches = obj.caches.substring(IMPORT_HEADER.length, obj.caches.length);

                } else {

                    throw `something wrong!`;
                }
                
                includeFiles = Array.from(q.unQuote(obj.caches, / /i, true, false));
                obj.caches = "";

                includeFiles = includeFiles.map(((src) => {

                    return this._get_source(src);

                }).bind(this))

                includeFiles = includeFiles.filter((src) => {

                    // http://
                    // https://
                    // auto builder .js .mjs .css

                    if (/\.(m?js|css|txt)$/i.test(src)) {

                        switch (src.split(".").pop()) {
                            case "js":

                                element_builder_context = `script[src="${src}"&type="text/javascript"]`;
                                break;
                                
                            case "mjs":

                                element_builder_context = `script[src="${src}"&type="module"&async]`;
                                break;
                                
                            case "css":
                                    
                                element_builder_context = `link[rel="stylesheet"&href="${src}"]`;
                                break;
                            
                            case "txt":

                                element_builder_context = `text-stream[src="${src}"]`;
                                break;
                                
                            default:
                                break;
                        }
                        
                        if (!obj.nodups.includes(element_builder_context)) {

                            let [ et, _ ] = q.createQuery(element_builder_context, false);
                            let element = q.createQuery(et);

                            obj.nodups.push(element_builder_context);
                            
                            if (et?.nodeName == "SCRIPT") {
                                
                                obj.document.body.append(element);
                                
                            } else if (et?.nodeName == "LINK") {
                                
                                obj.document.head.append(element);
                            
                            } else {

                                obj.parent.append(element);    
                            }
                        }

                        return false;
                    }

                    return true;
                })
                                
                if (includeFiles.length > 0) {

                    let r = new RenderFile;

                    includeFiles = includeFiles.map(async (src) => {

                        return await r.openAsync(src);
                    })

                    includeFiles = await Promise.all(includeFiles);

                    // collect document and selector
    
                    includeFiles.forEach((data) => {
    
                        data = data?.data || {};

                        obj.currentElement.append(data.element);
                        
                        Array.from(data.document.head.children).forEach((element) => {
                            
                            data.document.head.remove(element);
                            obj.document.head.append(element);

                        });
                        
                        Array.from(data.document.body.children).forEach((element) => {

                            data.document.body.remove(element);
                            obj.document.body.append(element);

                        });

                        data.virtuals.forEach((virtual_document) => {

                            obj.virtual_documents.push(virtual_document);

                        });
                        
                        data.selectors.forEach((selector) => {
    
                            obj.selectors.push(selector);

                        })

                        data.nodups.forEach((selector) => {
    
                            obj.nodups.push(selector);

                        })

                        delete data.virtuals;
                        // delete data.document;
                        // delete data.element;
                        delete data.selectors;
                        delete data.nodups;
                    })
                }

                return false;
            }

            return true;
            
        }.bind(this))
    }

    get parseTextCollectorPerLine() {

        let EOF_HEADER = "EOF";

        let tabs;
        let text;
        let caches;
        let collectorMode;

        tabs = 0;
        text = "";
        caches = "";

        collectorMode = false;

        let __cache__ = async (obj) => {

            if (obj.caches.includes(">>")) {

                let concept = this._split_once(obj.caches, ">", 2);

                if (2 <= concept.length) {

                    if (concept[1] == EOF_HEADER) {

                        caches = concept[0];
                        collectorMode = true;
                        tabs = obj.tabs;
                        caches += "<<";
                        return false;

                    } else {

                        // is not EOF protocol
                    }
                }

                if (concept.length > 2) {

                    console.warn("out of concept using EOF!");
                }
            };

            if (obj.caches.startsWith(EOF_HEADER) && tabs == obj.tabs) {
                
                collectorMode = false;
                obj.caches = caches;
                caches = "";
                tabs = 0;
            }
            
            if (!!collectorMode) {

                if (tabs < obj.tabs) {
                    
                    caches += obj.caches + "\\n";
                
                } else {

                    console.warn("multiple text outside safe zone!");
                }
                return false;
            }

            return true;
        };

        return (__cache__).bind(this);
    }

    get parseSourceGetEmbedPerLine() {

        let SOURCE_SET_HEADER = "source-set";
        let SOURCE_GET_HEADER = "source-get";

        let virtualBetterLook = false;

        let params = new Array;

        let name, url, type;
        
        name = "";
        url = "";
        type = "";

        let __cache__ = async (obj) => {

            // source-set name url mimetype
            // source-get url mimetype

            if (virtualBetterLook) {

                if (typeof obj.virtualConfig?.virtual_better_look == "boolean") {

                    obj.virtualConfig.virtual_better_look = virtualBetterLook;
                    virtualBetterLook = false;
                }
            }

            if (obj.caches.startsWith(SOURCE_SET_HEADER)) {

                obj.caches = obj.caches.substring(SOURCE_SET_HEADER.length, obj.caches.length);
                
                params = q.unQuote(obj.caches, " ", true, false);

                name = params.shift() || "";
                url = params.shift() || "";
                type = params.shift() || "";

                if (name.length > 0) {

                    name = "." + name;
                }

                if (url.length > 0) {

                    url = this._get_source(url);
                    url = `src="${url}"`;

                } else {

                    return false;
                }

                if (type.length > 0) {

                    type = `type="${type}"`;
                    type = "&" + type;
                }

                obj.caches = `source[${url}${type}].jessie-get-source${name}`;

                if (obj.virtualConfig?.virtual_better_look) {

                    virtualBetterLook = obj.virtualConfig?.virtual_better_look;
                    obj.virtualConfig.virtual_better_look = false;
                }
                
            } else
            if (obj.caches.startsWith(SOURCE_GET_HEADER)) {
                
                obj.caches = obj.caches.substring(SOURCE_GET_HEADER.length, obj.caches.length);
                
                params = q.unQuote(obj.caches, " ", true, false);

                url = params.shift() || "";
                type = params.shift() || "";

                if (url.length > 0) {

                    url = this._get_source(url);
                    url = `src="${url}"`;

                } else {

                    return false;
                }

                if (type.length > 0) {

                    type = `type="${type}"`;
                    type = "&" + type;
                }

                obj.caches = `source[${url}${type}].jessie-get-source`;

                if (obj.virtualConfig?.virtual_better_look) {

                    virtualBetterLook = obj.virtualConfig?.virtual_better_look;
                    obj.virtualConfig.virtual_better_look = false;
                }
            }

            return true;
        };

        return (__cache__).bind(this);
    }

    get parseBetterLookQueryPerLine() {

        let _split_once = this._split_once;

        return async function __cache__(obj) {

            if (obj.virtualConfig?.virtual_better_look) {

                let concept = _split_once(obj.caches);

                let selector = concept.shift();

                let nodeName = "";
                let nodeAttributes = new Array;

                let nodeId = "";
                let nodeClassLists = new Array;

                let dataTrace = q.unQuote(selector, " ", true, true);

                let virtual_elements = new Array;

                dataTrace.forEach((value) => {

                    if (value.includes("=")) {

                        nodeAttributes.push(value);
                    }
                    else if (value.startsWith("#")) {

                        nodeId = value;
                    }
                    else if (value.startsWith(".")) {

                        nodeClassLists.push(value);
                    } else {

                        virtual_elements.push(value);
                    }
                })

                nodeName = virtual_elements.join(" ");

                let attributes = "";
                let classLists = "";

                if (nodeAttributes.length > 0) {

                    attributes = `[${nodeAttributes.join("&")}]`;
                }

                // if (nodeId.length > 0) {

                //     nodeId = "#" + nodeId;
                // }

                if (nodeClassLists.length > 0) {

                    classLists = `${nodeClassLists.join("")}`;
                }

                obj.caches = `${nodeName}${attributes}${nodeId}${classLists}`;

                if (concept.length > 0) {

                    obj.caches += "<<" + concept.shift();
                }
            }

            return true;
        }
    }

    get parseVirtualElementQueryPerLine() {

        let _split_once = this._split_once

        let tabs = 0;

        let mtabs = new Array;

        let in_virtual = false;
        
        let virtual_parent = null;

        function __parse_cli_to_legit_element__(obj, cname, callback = null) {

            if (obj.caches.startsWith(cname)) {

                let concept = _split_once(obj.caches, " ", 1);

                let virtual_cli, selectorText;

                virtual_cli = concept.shift();

                if (concept.length > 0) {

                    selectorText = concept.shift();

                    let [ selector, text ] = _split_once(selectorText);

                    if (selector.length > 0) {
                        
                        if (!text) {
    
                            obj.caches = `${virtual_cli}[def="${selector}"]`;
                        
                        } else {
                            
                            obj.caches = `${virtual_cli}[def="${selector}"] << ${text}`;
    
                        }
                    } else {

                        obj.caches = `${virtual_cli} << ${text}`;
                    }
                
                } else {

                    obj.caches = virtual_cli;
                }

                if (callback && typeof callback == "function") {

                    return callback(obj);
                }
            }
            return null;
        }

        function __clear_var__(obj) {

            tabs = 0;
            mtabs = new Array;
            in_virtual = false;
            virtual_parent = null;
            obj.virtual_parent = null;

        }

        return async function __cache__(obj) {

            if (obj.virtualConfig?.virtual_node) {

                if (in_virtual) {
    
                    if (obj.caches.startsWith("virtualend")) {
                            
                        __clear_var__(obj);
                        
                        console.log("virtual has stopped!");
    
                        // stop pipeline
                        return false;
                    }
    
                    if (obj.tabs == tabs) {
    
                        __clear_var__(obj);
                        
                        console.log("virtual has stopped!");
    
                        // pass pipeline
                    
                    } else {
    
                        // __parse_cli_to_legit_element__(obj, "remove");
                        __parse_cli_to_legit_element__(obj, "parent");
    
                        // return false;
                        // by passing
                    }
                }
    
                __parse_cli_to_legit_element__(obj, "virtual", (e) => {
    
                    tabs = obj.tabs;
    
                    in_virtual = true;
    
                    virtual_parent = new DocumentFragment;
    
                    console.log("virtual has created!");
    
                    obj.virtual_documents.push(virtual_parent);
    
                    obj.virtual_parent = virtual_parent;
                })
            }

            return true;
        }
    }

    //TODOs
    // Coming Soon ... im lazy dude!
    get parseNoDuplicateAuto() {

        return async function __cache__(obj) {

            return true;
        }
    }

    get parseConfigVirtualAuto() {

        let cache, dot, CONFIG_HEADER;
        cache = "";
        dot = ".";
        CONFIG_HEADER = "!config";

        return async function __cache__(obj) {

            cache = obj.caches;

            if (cache.startsWith(CONFIG_HEADER + dot)) {

                cache = cache.substring(CONFIG_HEADER.length + 1, cache.length);

                let [configname, configvalue, ...ignored] = cache.split(" ");

                obj.virtualConfig[configname] = configvalue == "true" ? true : (configvalue == "false" ? false : null);

                return false;
            }

            return true;
        }
    }

    get parseJavaScriptAuto() {

        let contextJS, fnSync, fnReturn, doubleBrackets, tripleQuotes, doubleClosedBrackets, tripleClosedQuotes, wrapQuote, caches;
        contextJS = "";
        fnSync = null;
        fnReturn = "";
        doubleBrackets = "";
        tripleQuotes = ""; // new future
        doubleClosedBrackets = "";
        tripleClosedQuotes = ""; // new future
        wrapQuote = false;
        caches = "";

        let FN_HEADER = `"use strict"; let q, $, global, local, imports, getUrl, element; q = new this.skQueryManager; $ = q.Query; global = this.global; local = this.local; imports = this.imports; getUrl = this.getUrl; element = this.element; return (async function sync() {\n`;

        let FN_CLOSED = "\n}).bind(this);";

        let binding = new Object;

        binding.global = self;
        binding.skQueryManager = skQueryManager;
        
        return async function __cache__(obj) {

            if (tripleQuotes.length == 0 && doubleBrackets.length == 0) caches = "";

            let data = Array.from(obj.caches);
            let n = data.length;
            
            for (let i = 0; i < n; i++) {

                let puts = data[i];

                if (doubleBrackets.length > 1) {

                    // pass

                } else if (tripleQuotes.length < 3 && doubleBrackets.length == 0) {

                    if (puts == "\"") {

                        tripleQuotes += puts;
                        if ((i+1) == n) {

                            if (tripleQuotes.length < 3) {

                                caches += tripleQuotes;
                                tripleQuotes = "";
                            }
                        }
                        continue;
                    }

                    caches += tripleQuotes;
                    tripleQuotes = "";
                } else
                if (tripleQuotes.length > 2) {

                    if (puts == "\"") {

                        tripleClosedQuotes += puts;
                        
                        if (tripleClosedQuotes.length > 2) {

                            try {

                                // auto refresh
                                // binding.document = obj.document;
                                binding.element = obj.currentElement;
                                binding.imports = obj.imports;
                                binding.getUrl = obj.getUrl;
                                binding.local = obj.local;
                                
                                fnSync = new Function(`${FN_HEADER} return \`${contextJS}\` ${FN_CLOSED}`).bind(binding).call();
                            
                                let wait = await fnSync.call();
                                fnReturn = wait;
                                
                            } catch(e) {
                                
                                console.warn(e);
                            }
                            
                            if (!["undefined", "null"].includes(fnReturn)) caches += fnReturn;

                            contextJS = "";
                            fnSync = null;
                            fnReturn = "";
                            tripleQuotes = "";
                            tripleClosedQuotes = "";
                            wrapQuote = false;
                            
                        }
                        continue;
                    }

                    contextJS += tripleClosedQuotes;
                    tripleClosedQuotes = "";

                    contextJS += puts;
                    continue;
                }

                // no conflicts
                if (tripleQuotes.length > 2) continue;

                if (doubleBrackets.length < 2) {

                    if (doubleBrackets.length == 0 ? "\[\{".includes(puts) : "\[\{\%".includes(puts)) {

                        doubleBrackets += puts;
                        if ((i+1) == n) {
                            
                            if (doubleBrackets.length < 2) {

                                caches += doubleBrackets;
                                doubleBrackets = "";
                            }
                        }
                        continue;
                    }

                    caches += doubleBrackets;
                    doubleBrackets = "";

                } else 
                if (doubleBrackets.length > 1)
                {

                    if (doubleClosedBrackets.length == 0 && (doubleBrackets[0] == "\{" ? "\%\}".includes(puts) : "\%\]".includes(puts))) {
                        
                        doubleClosedBrackets += puts;
                        continue;
                    }

                    if (doubleClosedBrackets.length > 0 && (doubleBrackets[0] == "\{" ? puts == "\}" : puts == "\]")) {
                        
                        doubleClosedBrackets += puts;
                    }

                    if (doubleClosedBrackets.length > 1) {

                        if (["\{\%", "\{\{"].includes(doubleBrackets) && ["\%\}", "\}\}"].includes(doubleClosedBrackets)) {
                            wrapQuote = true;
                        }
    
                        try {

                            // auto refresh
                            // binding.document = obj.document;
                            binding.element = obj.currentElement;
                            binding.imports = obj.imports;
                            binding.getUrl = obj.getUrl;
                            binding.local = obj.local;
                            
                            if (["\[\%", "\{\%"].includes(doubleBrackets)) {
    
                                fnSync = new Function(`${FN_HEADER} return ${contextJS} ${FN_CLOSED}`).bind(binding).call();
                            
                            } else {
                                
                                fnSync = new Function(`${FN_HEADER} ${contextJS} ${FN_CLOSED}`).bind(binding).call();
                            
                            }
        
                            wrapQuote = wrapQuote ? "\"" : "";
    
                            let wait = await fnSync.call();
                            fnReturn = `${wrapQuote}${wait}${wrapQuote}`;
    
                        } catch (e) {
    
                            console.warn(e);
                        }

                        // console.log(fnReturn);
    
                        if (!["undefined", "null"].includes(fnReturn)) caches += fnReturn;

                        contextJS = "";
                        fnSync = null;
                        fnReturn = "";
                        doubleBrackets = "";
                        doubleClosedBrackets = "";
                        wrapQuote = false;
                        
                        continue;
                    }

                    contextJS += doubleClosedBrackets;
                    doubleClosedBrackets = "";

                    contextJS += puts;
                    continue;
                }
                
                caches += puts;
            }

            // console.log(caches)
            
            obj.caches = caches;
            // caches = "";

            if (contextJS.length > 0) contextJS += "\n";

            if (tripleQuotes.length > 2 || doubleBrackets.length > 1) return false;
            return true;
        }
    }

    get parseQueryPerLine() {

        let _split_once, parent, concept, et, attrs, element, selectorText, elements, mtabs, tabs, text, x;
        _split_once = this._split_once;
        parent = null;
        concept = new Array;
        et = null;
        attrs = null;
        element = null;
        selectorText = "";
        elements = new Array;
        mtabs = new Array;
        text = "";
        tabs = 0;
        x = -1;

        return async function __cache__(obj) {

            tabs = obj.tabs;

            concept = _split_once(obj.caches);

            if (concept.length > 0) {

                obj.caches = concept.shift();

                if (concept.length > 0) {
    
                    text = concept.shift();
                }
            }

            // concept = obj.caches.split("<<");
            // if (concept.length > 0) {

            //     obj.caches = q.unSpaceText(concept[0]);

            //     if (concept.length > 1) {
    
            //         text = q.unSpaceText(concept[1]);
            //     }
            // }

            [ et, selectorText ] = q.createQuery(obj.caches, false);

            if (!et?.nodeName) return true;

            obj.selectors.push(selectorText);
            
            attrs = et?.attributes;

            if (attrs && typeof attrs == "object") {

                for (let attr in attrs) {

                    switch (attr) {

                        case "text":

                            et.text = attrs[attr];
                            delete et.attributes[attr];
                            break;

                        case "html":

                            et.html = attrs[attr];
                            delete et.attributes[attr];
                            break;

                        case "specify":

                            et.specify = attrs[attr];
                            delete et.attributes[attr];
                            break;

                        case "cstyle":

                            et.cstyle = attrs[attr];
                            delete et.attributes[attr];
                            break;
                    }
                }
            }

            if (text.length > 0) {
                et.html = text.replace(/\\n/g, "\n");
                text = "";
            }
            
            element = q.createQuery(et);

            let m;
            m = 0;
            for (let t of mtabs) {
                if (t < tabs) {
                    
                    // obj.tabs = tabs;
                    m = m +1;
                    continue;
                } else 
                if (t != tabs) {
                    
                    obj.tabs = t;
                    console.warn("not consistent tabs from jessie files!")
                }
                else break;
            }

            if (m == 0) {

                mtabs = new Array;
                elements = new Array;
                parent = obj.element;
                obj.parent = parent;

                // virtual state ...
                if (obj?.virtual_parent != null) {

                    parent = obj.virtual_parent;
                    obj.parent = obj.virtual_parent;
                }
                
                elements.push(element);
                x = elements.length -1;
                element = elements[x];

                obj.currentElement = element;

                parent.append(element);
                mtabs.push(tabs);

            } else
            {

                if (!mtabs.includes(tabs)) {

                    x = elements.length -1;
                    parent = elements[x];
                    obj.parent = parent;
                    elements.push(element);
                    element = elements[x +1];

                    obj.currentElement = element;

                    parent.append(element);
                    mtabs.push(tabs);
    
                } else 
                {

                    x = mtabs.indexOf(tabs);
                    elements[x] = element;
                    element = elements[x];
                    let chains = elements[x -1];

                    obj.currentElement = element;

                    chains.append(element);
                }
            }

            return false; // no more added parse function, any was null or empty!
        }
    }
}

export class RenderFile {

    constructor() {

        // super();

        this.package = new Package;
        this.module = this.package.module;
        this.path = this.package.path;
    }

    async openAsync(src, type) {

        src = this.path.simplify(src);

        // let module = this.module;
        let path = this.path;
        let dirname = path.dirname(src);
        let basename = path.basename(src);
        let render = new Render;

        render.setDefaultLocalePath(dirname);

        // let text = await module(src);
        let text = await render._fetch_auto_cache(src);
        let data = await render.eval(text);

        return {

            dirname: dirname,
            basename: basename,
            context: text,
            data: data,
        };

    }

    async open(src, type) {

        src = this.path.simplify(src);
        
        // let module = this.module;
        let render = new Render;
        
        // render.setDefaultLocalePath("./jessie_modules");
            
        // let text = await module(src);
        let text = await render._fetch_auto_cache(src);
        let data = await render.eval(text);

        return data;
    }
}