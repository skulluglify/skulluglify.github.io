import { skQueryManager } from "../../jessie.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

export function galleries() {

    let dv_container_wrapper_height = 0;

    // let dv_container_wrapper = Array.from($("div#container").target.children).shift();

    // dv_container_wrapper_height = dv_container_wrapper.clientHeight;

    let dv_galleries = $("div.galleries");

    dv_galleries = dv_galleries?.target || dv_galleries;
    
    // let spans = dv_galleries.querySelectorAll("span");

    let dv_galleries_childs = Array.from(dv_galleries.children);
    
    let low, high;
    
    low = false;
    high = false;
    
    let screen_low = () => {

        
        dv_galleries.style.flexDirection = "column";
        dv_galleries.style.height = "calc(256px * 3)";
        // dv_galleries.style.transform = "scale(1)";
        // dv_galleries.style.marginTop = "0";
        // dv_galleries.style.marginBottom = "0";
        // dv_galleries.style.height = "1052px";

        for (let i = 0; i < dv_galleries_childs.length; i++) {

            let dv_galleries_child = dv_galleries_childs[i];

            dv_galleries_child.style.width = "384px";

            // dv_galleries_child.style.borderTop = "none";
            // dv_galleries_child.style.borderRight = "none";
            // dv_galleries_child.style.borderBottom = "none";
            // dv_galleries_child.style.borderLeft = "none";
        }
    
        // for (let i = 0; i < spans.length; i++) {
    
        //     let span = spans[i];
        //     span.style.paddingBottom = "0";
        // }
    };
    
    let screen_high = () => {
    
        dv_galleries.style.flexDirection = "row";
        dv_galleries.style.height = "256px";
        // dv_galleries.style.marginTop = "26px";
        // dv_galleries.style.marginBottom = "26px";
        // dv_galleries.style.height = "auto";

        for (let i = 0; i < dv_galleries_childs.length; i++) {

            let dv_galleries_child = dv_galleries_childs[i];

            dv_galleries_child.style.width = "33%";

            // dv_galleries_child.style.borderTop = "none";
            // dv_galleries_child.style.borderRight = "12px solid white";
            // dv_galleries_child.style.borderBottom = "none";
            // dv_galleries_child.style.borderLeft = "12px solid white";
        }
    
        // for (let i = 0; i < spans.length; i++) {
    
        //     let span = spans[i];
        //     span.style.paddingBottom = "26px";
        // }
    };
    
    // let dv_galleries_responsive = () => {
        
    
    //     if (document.body.clientWidth < 640) {
    
    //         if (!low) {
    
    //             low = true;
    //             height = false;
    //             screen_low();
    //         }
    
    
    //     } else {
    
    
    //         if (!height) {
    
    //             low = false;
    //             height = true;
    //             screen_high();
    //         }

    //         let w = Math.ceil((document.body.clientWidth / 1366) * 10) / 10;

    //         w = w > 1 ? 1 : w;

    //         let h = (1 - w) * 180; 

    
    //         dv_galleries.style.transform = `scale(${w}) translateY(-${h}px)`;
        
    //     }
    // }
    
    // $(window).on("resize", dv_galleries_responsive);
    // dv_galleries_responsive();

    let c = Array.from(dv_galleries.children).map(e => $(e));
    let d = c.map(e => {

        e = e?.target || e;

        return $(e.querySelector("span"));
    });

    let zw, czw;

    zw = 0;
    czw = 0;

    $(window).resize((e) => {

        let width = e?.cw || 0;
        let height = e?.ch || 0;
        let percent = e?.percent || {};
        let w = percent?.w || 0;
        let h = percent?.h || 0;

        if (zw == 0) zw = width;

        if (width < zw) czw = width / zw;
        else czw = 1;
        
        if (width <= 640) {

            if (!low) {
    
                low = true;
                high = false;
                screen_low();

                // dv_container_wrapper.style.height = dv_container_wrapper_height + 328 + "px";
    
                // $(c).scale(1, 1);
                // $(d).textSize(83.2 * czw);
                // $(dv_galleries).translateY(0);

                // rem to px * 16, 5.2 * 16 = 83.2
                $(d).textSize(83.2);
            }

        } else {
            
            if (!high) {
    
                low = false;
                high = true;
                screen_high();

                // dv_container_wrapper.style.height = dv_container_wrapper_height + "px";
            }

            // let m = 0.72;

            // w = w <= m ? m : w;

            // $(c).scale(w, w);
            // $(dv_galleries).translateY((1 - w) * 128 * -1);
            // $(d).textSize(w * 104);
         
            czw = 0.64 < czw ? czw : 0.64;
    
            // rem to px * 16, 5.2 * 16 = 83.2
            $(d).textSize(83.2 * czw);
        }
    });
}