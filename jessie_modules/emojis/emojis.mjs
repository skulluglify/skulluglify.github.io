export const emoji_init = (emoji_source_vendor_lst = null, emoji_repositories = null) => (async (self) => {

    // getUrl
    let pwd = typeof process == "object" ? (process?.env?.PWD || null) : null;
    function getURL(url) {

        // fetch only load in server mode, setup server in http://127.0.0.1:4747/  
        // if (!!pwd) return ["file:/", pwd, url.startsWith(".") ? url.substring(2, url.length) : url].join("\/");
        if (!!pwd) return "http://127.0.0.1:5656/" + url;
        return url;
    };
    // node-fetch config vars
    let AbortError = self?.AbortError || null;
    let FetchError = self?.FetchError || null;
    let Headers = self?.Headers || null;
    let Request = self?.Request || null;
    let Response = self?.Response || null;
    let fetch = self?.fetch || null;
    let isRedirect = self?.isRedirect || null;
    // node-fetch import module
    if (typeof process == "object") { if (process?.env && process?.versions?.node) {
    let module = {};
    module = await import("node-fetch");
    AbortError = module.AbortError; 
    FetchError = module.FetchError;
    Headers = module.Headers;
    Request = module.Request;
    Response = module.Response;
    fetch = module.default;
    isRedirect = module.isRedirect;
    }};

    // safety string params
    emoji_source_vendor_lst = typeof emoji_source_vendor_lst == "string" ? emoji_source_vendor_lst : null;
    emoji_repositories = typeof emoji_repositories == "object" && Array.isArray(emoji_repositories) ? emoji_repositories : null;

    let emojis_unique_vendor_reponse = await fetch(emoji_source_vendor_lst || getURL("./emojis_unique_vendor.lst"));

    let emojis_unique_vendor_context = await emojis_unique_vendor_reponse.text();

    function emojis_unique_vendor_parse(context) {

        let o = {};
        let r = [];
        let t = "";
        let s = 0;

        for (let c of context) {

            if (c == "\n") {

                r.push(t);
                r = [];
                t = "";
                s = 0;
                continue;
            }

            if (c == " ") {
                if (!s) {

                    o[t] = r;
                    t = "";

                } else {

                    r.push(t);
                    t = "";
                    
                }
                s += 1;
                continue;
            }

            t += c;
        };

        return o;
    }

    function string_minify(context) {

        let t ="";
        for (let c of context) {

            let x = c.codePointAt();

            let check_is_numeric = (48 <= x && x <= 57);
            let check_upper_case = (65 <= x && x <= 90);
            let check_lower_case = (97 <= x && x <= 122);

            let b = check_is_numeric || 
            check_upper_case ||
            check_lower_case ||
            (x == 32) ||
            (x == 45) ||
            (x == 95);

            if (!!b) {

                if (x == 32 || x == 45) t += "_";
                else if (check_upper_case) t += String.fromCodePointAt(x);
                else t += c;
                
            }
        }

        return t;
    }


    let emojis_unique_vendor_object = emojis_unique_vendor_parse(emojis_unique_vendor_context);

    function emoji_check_available(emoji_cldr_name, vendor) {

        emoji_cldr_name = string_minify(emoji_cldr_name);

        // if (!!emojis_unique_array.includes(emoji_cldr_name)) {
        if (!!(emoji_cldr_name in emojis_unique_vendor_object)) {

            let emoji_vendors = emojis_unique_vendor_object[emoji_cldr_name];
            let emoji_vendor_default = emoji_vendors[0];
            if (!!emoji_vendors.includes(vendor)) {
            
                return vendor + "." + emoji_cldr_name;
            }
            return emoji_vendor_default + "." + emoji_cldr_name;
        }

        return null;
    }

    function emoji_get_repo(vendor) {

        let repos = emoji_repositories || null;

        if (!!repos) {

            for (let repo of repos) {

                if (repo[0] == vendor) {

                    return repo[1];
                }
            }

            return null;
        }

        return "./repositories/" + vendor + ".csv";
    }

    async function emojis_vendor_repo_load(vendor) {

        let src = emoji_get_repo(vendor);
        let reponse = await fetch(getURL(src));
        let context = await reponse.text();

        let o = {};
        let k = "";
        let t = "";

        for (let c of context) {

            if (c == "\n") {

                o[k] = t;
                k = "";
                t = "";
                continue;
            }

            if (c == ",") {

                k = t;
                t = "";
                continue;
            }

            t += c;
        }

        return o;
    }

    let emoji_vendors_cache = {};

    async function emoji_get_image_url(emoji_cldr_name, vendor="openmoji", size="240") {

        vendor = !vendor ? "openmoji" : vendor;
        size = !size ? "72" : size;

        let data = emoji_check_available(emoji_cldr_name, vendor);
        if (!!data) {        
            [ vendor, emoji_cldr_name ] = data.split(".");
            let emoji_vendor = null;
            if (!(vendor in emoji_vendors_cache)) {
                emoji_vendor = await emojis_vendor_repo_load(vendor);
                emoji_vendors_cache[vendor] = emoji_vendor;
            } else {
                emoji_vendor = emoji_vendors_cache[vendor];
            }
            let url = emoji_vendor[emoji_cldr_name];
            if (!!url) return url.replace("\/thumbs\/72", "\/thumbs\/" + size); 
        }
        return null;
    }

    return { emojipedia: { getURL: emoji_get_image_url } };

})(globalThis);

export default emoji_init;
