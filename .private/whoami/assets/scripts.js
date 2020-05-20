import JoyStick from "./controller.js";

((g) => {

    JoyStick();

    let once = 0;

    function complete() {
        // if (navigator.userAgentData.mobile) {
        //     const metas = document.querySelectorAll("meta");
        //     const mv = Array.from(metas).filter((e) => e.getAttribute("name", null) == "viewport").shift();
        //     if (mv) {
        //         let mvc = mv.getAttribute("content")
        //         mvc = mvc.replace("minimum-scale=1.0", "minimum-scale=0.5")
        //         mvc = mvc.replace("initial-scale=1.0", "initial-scale=0.5")
        //         mvc = mvc.replace("maximum-scale=1.0", "maximum-scale=0.5")
        //         mv.setAttribute("content", mvc)
        //     }
        // }
        return 0;
    }

    function ready() {
        if (g.document.readyState == "complete" && once == 0) {
            complete();
            once++;
        }
    }

    g.addEventListener("DOMContentLoaded", (e) => {
        ready();
        return true;
    })

    g.document.addEventListener("readystatechange", (e) => {
        ready();
        return true;
    })

    g.addEventListener("load", (e) => {
        ready();
        return true;
    })

    ready();

})(globalThis);