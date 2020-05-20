// module: enable

import { skQueryManager } from "./jessie.js";
import { Render } from "./jessie.render.js";
import "./jessie.dom.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let r = new Render;
let $ = q.Query;

self.q = q;

q.QueueMainActivity.enqueue(function __queue__() {

    // let s = new q.Surface;
    // let t = new q.SurfaceTriangle;
    // let o = new q.SurfaceCircle;

    (async function() {

        let check_is_viewport = q.parseUrlSearch(location.search)?.viewport || null;
        let direct_view_page = q.parseUrlSearch(location.search)?.view || null;

        let check_is_mobile = /(android|i?phone|i?watch|mobile)/i.test(navigator.userAgent.toLowerCase());

        async function renderView (view, defaultView = "home") {

            if (check_is_mobile) {

                if (check_is_viewport != "yes") {
    
                    let pre = $("!pre");
    
                    pre = pre?.target || pre;
    
                    pre.style.whiteSpace = "pre-wrap"
    
                    pre.textContent = "webpage has been move into viewport.html, click me! to open up!";
    
                    $("body").append(pre);
    
                    $("body").on("click", () => {
    
                        self.open(`${location.origin}/viewport.html?view=${defaultView}`);
                    });
                    // throw `should change viewport!`;
                } else {
    
                    await r.renderJessieAuto(view);
                }
            } else {
                
                await r.renderJessieAuto(view);
            } 
        }

        switch (direct_view_page) {
            case "home":
                
                renderView("desktop")
                break

            case "about":
            
                renderView("desktop/about.jessie")
                break

            case "blog":
        
                renderView("desktop/blog.jessie")
                break

            case "service":
    
                renderView("desktop/service.jessie")
                break

            case "contact":

                renderView("desktop/contact.jessie")
                break
        
            default:

                renderView("desktop")
                break
        }

        // $("div.skyblue").target.append(s.target);

    })()
});

q.QueueMainActivity.fallback();
