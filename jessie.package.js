/*
 * import packages with fetch async
 * support webpack requires
 */

if (typeof self == "undefined") self = globalThis;

class _Posix_Path extends Object {

    constructor(...args) {
        super();
    }

    get __WEBPACK_DEFAULT_ROOT_PATH__ () {
        return "./src/";
    }

    simplify (src) {
        if (src.startsWith("/")) src = src.slice(1, src.length);
        if (src.startsWith("./")) src = src.slice(2, src.length);
        if (src.endsWith("\/")) src = src.slice(0, src.length-1);
    
        let path, paths, caches, skipping;
    
        paths = src.split("\/");
        skipping = 0;
        caches = [];
    
        for (let i = 0; paths.length > i; i++) {
    
            path = paths[paths.length -1 -i];
    
            if (path == "\.") continue;
            if (path == "\.\.") {
                skipping++;
                continue;
            };
    
            if (skipping == 0) {
                caches.push(path);
            }
            
            if (skipping > 0) skipping--;
        }
    
        src = "";
    
        for (let i = 0; caches.length > i; i++) {
            path = caches[caches.length -1 -i];
            if (i > 0) src += "\/";
            src += path;
        }
    
        return src;
    }

    join (...src) {

        let fp = src.shift();
        if (fp.endsWith("\/")) fp = fp.slice(0, fp.length-1);

        let puts, caches, paths;

        paths = [fp, ...src];
        caches = "";

        for (let i = 0; paths.length > i; i++) {

            puts = paths[i];

            if (puts.startsWith("\/")) puts = puts.slice(1, puts.length);
            if (puts.startsWith("\.\/")) puts = puts.slice(2, puts.length);
            if (puts.endsWith("\/")) puts = puts.slice(0, puts.length-1);

            if (i > 0) caches += "\/";
            caches += puts;

        }

        return caches;
    }

    dirname (src) {

        let i, puts, caches, skipping;

        i = 0;
        caches = "";
        skipping = true;
    
        while (src.length > i) {
    
            puts = src[src.length - 1 - i]; // reverse
    
            if(!skipping) caches = puts + caches;
    
            if (puts == "\/") skipping = false;
    
            i++;
        }
    
        return caches;
    }

    basename (src) {

        let i, puts, caches, noskipping;

        i = 0;
        caches = "";
        noskipping = true;
    
        while (src.length > i) {
    
            puts = src[src.length - 1 - i]; // reverse
    
            if (puts == "\/") noskipping = false;
            
            if(noskipping) caches = puts + caches;
    
            i++;
        }
    
        return caches;
    }
}

export class Package extends Object{
    
    constructor(...args) {
        super();
    }

    get module() {
        return (async function include_file(src) {
            let context = "", obj = new Object;
            try {
                if ("__webpack_require__" in self) {
                    if (__webpack_require__ && typeof __webpack_require__ == "function") {
                        src = this.path.join(this.path.__WEBPACK_DEFAULT_ROOT_PATH__, this.path.simplify(src));
                        context = __webpack_require__(src);
                    } else {

                        throw `Could't Handle this file ${src}`;
                    }
                } else
                if ("__webpack_modules__" in self) {
                    if (__webpack_modules__ && typeof __webpack_modules__ == "object") {
                        src = this.path.join(this.path.__WEBPACK_DEFAULT_ROOT_PATH__, this.path.simplify(src));
                        if (src in __webpack_modules__) __webpack_modules__[src](obj);
                        context = obj?.exports;
                    } else {

                        throw `Could't Handle this file ${src}`;
                    }
                } else {
                    let file = await fetch(src);
                    context = await file.text();
                }
            } catch (error) {
                throw error;
            }
            return context;
        }).bind(this);
    }

    get path() {
        return new _Posix_Path;
    }
};

export default {

    Package: Package,
};