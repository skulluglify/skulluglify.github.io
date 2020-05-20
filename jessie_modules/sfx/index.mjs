import { skQueryManager } from "../../jessie.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

self.sfxs = {};

function sfx_apply (srcs, wait = false) {

    let source = q.getSource(srcs)

    let audio = new Audio;
    let type = "";

    if (source && typeof source == "object" && !Array.isArray(source)) {

        audio.src = source.src;
        type = source.type;
    }

    let canPlay = audio.canPlayType(type);

    if (!canPlay) {

        type = type.substring(0, type.indexOf(";"));

        canPlay = audio.canPlayType(type);
    }

    return function __wrapper__() {

        if (!wait) {
        
            if (type.length > 0 && ["probably", "maybe"].includes(canPlay)) {
        
                audio.volume = 0.4;
                audio.play()

            };

            // $(audio).on("loadedmetadata", (e) => {

            //     setTimeout(() => {

            //         wait = false;
    
            //     }, Math.floor(e.target.duration * 1e3));
            // })

            setTimeout(() => {

                audio.pause();
                audio.currentTime = 0;
                wait = false;

            }, 100);

            wait = true;
        }
    }
}

function sfx_config(cfg) {

    if (cfg && typeof cfg == "string" && cfg.length > 0) {

        if (cfg.startsWith("sfx_")) {

            let value = cfg.substring(4, cfg.length);
            let sources = `source.sfx_source_${value}`;
            let selector = `div.${cfg}*`;
            let elements = $(selector);

            let wait = false;

            let apply = sfx_apply(sources, wait);

            elements.hover({

                focus: apply,
                leave: () => {}

            });

            elements.on("click", apply);

            self.sfxs[cfg] = apply;
        }
    }
}

let main = q.onceCall(() => {

    sfx_config("sfx_hit_button");
    console.log("broom");

});

q.QueueMainActivity.enqueue(() => {
    
    $("body").on("click", main);

})

q.QueueMainActivity.fallback();