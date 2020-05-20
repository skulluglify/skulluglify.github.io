import { skQueryManager } from "../../jessie.js";
import { Package } from "../../jessie.package.js";
import emoji_init from "./emojis.mjs";

let pk = new Package;
let q = new skQueryManager;
let $ = q.Query;

(async (self) => {

    let emoji_vendor_lst = q.getSource("source.emoji_vendor_lst").src;

    let emoji_repos = q.getSourceAll("source.emoji_repos");

    emoji_repos = emoji_repos.map((e) => { return [ pk.path.basename(e.src).split(".").shift(), e.src ] });

    let emoji = await emoji_init(emoji_vendor_lst, emoji_repos);

    let emoji_span = $("span.emoji*").target

    for (let element of emoji_span) {

        element = element?.target || element;
        let clv = Array.from(element.classList).filter((e) => e.startsWith("u_")).shift() || null;

        if (!!clv) {

            clv = clv.substring(2, clv.length);
            let emoji_url = await emoji.emojipedia.getURL(clv, element?.dataset?.vendor || null, element?.dataset?.size || null);
            if (!!emoji_url) element.style.backgroundImage = `url(${emoji_url})`;
        }
    }

})(globalThis);