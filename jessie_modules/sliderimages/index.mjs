import { skQueryManager } from "../../jessie.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

let si_recycle_views = $("div.si_recycle_view*");

let si_pagination_indicator = $("div.pagination-indicator");

let si_previous_arrow = $("div.si_previous_arrow");
let si_next_arrow = $("div.si_next_arrow");

let si_image_view = $("div.si_image_view");
let si_image_sources = si_image_view.getSourceAll();

let vw, vh;

vw = 0;
vh = 0;

// auto resize, fix slider effects
$(window).resize((e) => {

    vw = e.vw;
    vh = e.vh;
});

function hit_button() {

    if (typeof sfxs?.sfx_hit_button == "function") {

        sfxs.sfx_hit_button();
    }
}

function _fix_range_images (pagination, images) {

    pagination = pagination?.target || pagination;
    images = images?.target || images;

    if (!Element.prototype.isPrototypeOf(pagination)) return null;
    if (!(images && typeof images == "object" && Array.isArray(images))) return null;

    let n = images.length;

    if (n < 2) pagination.style.display = "none";

    let z = n % 3;

    for (let i = 0; i < z; i++) {

        images.push(images[i]);
    }
}

function set_pagination_indicator (pagination, images) {

    pagination = pagination?.target || pagination;
    images = images?.target || images;

    if (!Element.prototype.isPrototypeOf(pagination)) return null;

    if (images && typeof images == "object" && Array.isArray(images)) {


        let n = images.length;
    
        let bullets = new Array;
    
        for (let i = 0; i < n; i++) {
    
            let bullet = $("!div.bullet");

            bullet = bullet?.target || bullet;

            bullet.dataset.image_index = i;
            bullet.dataset.activate = false;
            bullet.classList.add("sfx_hit_button");
            
            pagination.append(bullet);
        }

        bullets = Array.from(pagination.children);

        let set_all_bullet_transparent = () => {
            
            for (let i = 0; i < n; i++) {
                
                let bullet = bullets[i];
                
                // bullet = bullet?.target || bullet;

                bullet.style.backgroundColor = "rgba(15, 15, 15, 0.4)";

                $(bullet).hover({

                    focus: (e) => {

                        bullet.style.backgroundColor = "rgba(255, 255, 255, 0.8)";

                    },
                    leave: (e) => {

                        setTimeout(() => {
                            
                            let activate = q.parseBool(bullet.dataset?.activate);
                            if (!activate) bullet.style.backgroundColor = "rgba(15, 15, 15, 0.4)";

                        }, 100);
                    }
                });
            }
        }
        
        let set_single_bullet_activate = (i) => {
    
            let bullet = bullets[i];
            
            // bullet = bullet?.target || bullet;

            set_all_bullet_transparent();

            bullet.dataset.activate = true;

            for (let j = 0; j < bullets.length; j++) {

                if (j == i) continue;

                set_single_bullet_deactivate(j); 
            }

            bullet.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        }

        let set_single_bullet_deactivate = (i) => {
    
            let bullet = bullets[i];
            
            // bullet = bullet?.target || bullet;

            bullet.dataset.activate = false;

            bullet.style.backgroundColor = "rgba(15, 15, 15, 0.4)";
        }
    
        return {
    
            bullets: bullets,
            set_single_bullet_activate: set_single_bullet_activate,
            set_single_bullet_deactivate: set_single_bullet_deactivate
        };
    }

    return null;
}

function set_image_view(views, images, indicator = null) {

    views = views?.target || views;

    let bullets = indicator?.bullets || new Array;
    let set_single_bullet_activate = (i) => {

        let check = indicator?.set_single_bullet_activate || null;

        if (check && typeof check == "function") {
        
            indicator.set_single_bullet_activate(i);
        
        }
    }

    let width, height;

    width = 0;
    height = 0;

    if (views.length > 0) {

        let check = views[0];
        let indexs = q.parseUrlSearch(document.cookie)?.img_i || "0";
        let image_index = parseInt(indexs);

        let update_image_index_on_cookie = (i) => {

            let cookie = q.parseUrlSearch(document.cookie);
            cookie.img_i = i;

            document.cookie = q.urlSearchStringify(cookie);

        }

        check = check?.target || check;

        width = check.clientWidth || 0;
        height = check.clientHeight || 0;

        if (views.length <= images.length) {

            let v = views.length;
            let n = images.length;

            for (let i = 0; i < v; i++) {

                let element = views[i];

                element = element?.target || element;
    
                let image = images[i];
            
                element.style.backgroundImage = `url(${image.src})`;
            }

            let setAnimation = (context) => {

                for (let i = 0; i < v; i++) {

                    let element = views[i];

                    element = element?.target || element;
                    element.style.transition = context;

                }
            };

            let translateX = (x) => {

                for (let i = 0; i < v; i++) {

                    let element = views[i];

                    element.translateX(x);
                }
            };

            /*
            
            images.length 0 1
            0 1 2
            1 2 3
            2 3 0
            */

            function getImagePos(i) {

                let x = i - 1;

                if (x < 0) x = n - 1;

                return [ x, i, (i + 1) % n ];
            }

            function setImagePos(i) {

                let get_image_pos = getImagePos(i); 

                for (let i = 0; i < v; i++) {

                    let pos = get_image_pos[i];

                    let element = views[i];
                    let image = images[pos];

                    element = element?.target || element;
                    element.style.backgroundImage = `url(${image.src})`;

                }
            }

            setImagePos(image_index);

            set_single_bullet_activate(image_index);

            let wait = false;

            let next_image = async () => new Promise((resolve, reject) => {

                if (!wait) {

                    wait = true;
    
                    setAnimation("transform 1s");
    
                    translateX(-(vw || width));

                    let i = image_index;
    
                    i += 1;
                    i = i % n;

                    update_image_index_on_cookie(i);

                    set_single_bullet_activate(i);
    
                    setTimeout(() => {
    
                        setAnimation("");

                        setImagePos(i);
                        
                        translateX(0);
    
                        setTimeout(() => {
                            
                            wait = false;
                            resolve(i);

                        }, 1e2)
                    
                    }, 1e3);
                }
            });

            let previous_image = async () => new Promise((resolve, reject) => {

                if (!wait) {

                    wait = true;

                    setAnimation("transform 1s");
    
                    translateX((vw || width));

                    let i = image_index;
    
                    i += -1;

                    if (i < 0) {

                        i = n - 1;

                    } else {

                        i = i % n;
                    
                    }

                    update_image_index_on_cookie(i);

                    set_single_bullet_activate(i);
                    
                    setTimeout(() => {
    
                        setAnimation("");

                        setImagePos(i);
                        
                        translateX(0);
    
                        setTimeout(() => {
                            
                            wait = false;
                            resolve(i);

                        }, 1e2)
                    
                    }, 1e3);
                
                } else {

                    reject("sliderimages need more times for transition!");
                }
            });

            if (bullets.length > 0) {

                for (let i = 0; i < n; i++) {
    
                    let bullet = bullets[i];

                    if (!bullet) continue;
    
                    $(bullet).on("click", (e) => {
    
                        (async function __async__() {
    
                            let target = e?.target || e;
        
                            let image_index_new = target.dataset.image_index;
        
                            if (image_index < image_index_new) {
        
                                // for (let j = 0; j < (image_index_new - image_index); j++) {
        
                                //     image_index = await next_image();
                                // }
    
                                let play = false;
    
                                while (image_index != image_index_new) {
    
                                    if (play) hit_button();
                                    
                                    image_index = await next_image();
    
                                    play = true;
                                }
                            }
    
                            if (image_index_new < image_index) {
        
                                // for (let j = 0; j < (image_index - image_index_new); j++) {
        
                                //     image_index = await previous_image();
                                // }
    
                                let play = false;
    
                                while (image_index != image_index_new) {
    
                                    if (play) hit_button();
    
                                    image_index = await previous_image();
    
                                    play = true;
                                }
                            }
                        })();
                    })
                }
            }

            si_next_arrow.on("click", () => {

                next_image().then((index) => {

                    image_index = index;

                }).catch((err) => {

                    throw `${err}`;
                })
            });

            si_next_arrow.hover({

                focus: () => {

                    si_next_arrow.target.style.opacity = "1";
                },
                leave: () => {

                    setTimeout(() => {

                        si_next_arrow.target.style.opacity = "0.4";

                    }, 200);
                }
            });

            si_previous_arrow.on("click", () => {

                previous_image().then((index) => {

                    image_index = index;

                }).catch((err) => {

                    throw `${err}`;
                })
            });

            si_previous_arrow.hover({

                focus: () => {

                    si_previous_arrow.target.style.opacity = "1";
                },
                leave: () => {

                    setTimeout(() => {

                        si_previous_arrow.target.style.opacity = "0.4";
                        
                    }, 200);
                }
            });
        }
    }
}

_fix_range_images(si_pagination_indicator, si_image_sources);
let pagination_indicator = set_pagination_indicator(si_pagination_indicator, si_image_sources);
set_image_view(si_recycle_views, si_image_sources, pagination_indicator);