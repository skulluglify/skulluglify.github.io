import emoji_init from "./emojis.mjs";

(async (self) => {

    let emoji = await emoji_init(null, null, null);

    console.log(await emoji.emojipedia.getURL("airplane"));
    console.log(await emoji.emojipedia.getURL("1st place medal"));
    console.log(await emoji.emojipedia.getURL("women with bunny ears"));
    console.log(await emoji.emojipedia.getURL("airplane", "whatsapp"));
    console.log(await emoji.emojipedia.getURL("airplane", "facebook", "72"));

})(globalThis);
