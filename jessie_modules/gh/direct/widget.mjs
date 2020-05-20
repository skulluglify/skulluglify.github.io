import { skQueryManager } from "../../../jessie.js";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

/*
    docs

    https://api.github.com/users/:user

    login
    id
    node_id
    avatar_url
    gravatar_id
    url
    html_url
    followers_url
    following_url
    gists_url
    starred_url
    subscriptions_url
    organizations_url
    repos_url
    events_url
    received_events_url
    type
    site_admin
    name
    company
    blog
    location
    email
    hireable
    bio
    twitter_username
    public_repos
    public_gists
    followers
    following
    created_at
    updated_at
*/

// let gh_widget_button_follows = $("div.gh_widget_button_follow*");
let gh_widget_button_follows = $("div.gh_widget_button_follow");

let gh_logo_source_image = q.getSource("source.gh_logo_image");

let gh_integer_formater = (value) => {

    if (1e9 <= value) return (value / 1e9).toFixed(1) + "B";
    if (1e6 <= value) return (value / 1e6).toFixed(1) + "M";
    if (1e3 <= value) return (value / 1e3).toFixed(1) + "K";

    return value;
};

let contruct_widget_button_follow = (currentElement) => {

    let gh_content = $("!div.gh_content").target;
    let gh_logo = $("!div.gh_logo").target;
    let gh_user = $("!div.gh_user").target;
    let gh_user_followers = $("!div.gh_user_followers").target;

    currentElement = currentElement?.target || currentElement;

    let user_name = currentElement.dataset?.name || null;

    if (!!user_name) {

        gh_content.classList.add("center", "row");
    
        gh_user.classList.add("center", "roboto", "bold");
        gh_user_followers.classList.add("center", "roboto", "bold");
    
        return (async () => {
    
            /*
            login
            avatar_url
            url
            blog
            followers
            */

            let data = {};
            let date = new Date;
            let time = date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}).toLowerCase().replace(/ |\,/g, "_");
            let followers = 0;
    
            let cookie = q.parseUrlSearch(document.cookie); // auto construct object.empty
            let ccount = cookie?.gh_f || "0";
            let cavatar_url = cookie?.gh_a || gh_logo_source_image?.src;
            let cfollowers = parseInt(ccount);
            let cdate = cookie?.gh_t || time;

            if (cdate != time || !cookie?.gh_t) {

                let response = await fetch("https://api.github.com/users/" + user_name);
    
                data = await response.json();
    
                followers = data.followers || 0;
                cavatar_url = data?.avatar_url || gh_logo_source_image?.src;
        
                // let cookie = q.parseUrlSearch(document.cookie);
                cookie.gh_f = followers;
                cookie.gh_a = "\"" + cavatar_url + "\"";
                cookie.gh_t = time;
                
                // update cookie
                document.cookie = q.urlSearchStringify(cookie);
            }

            followers = cfollowers || followers;

            // gh_logo.style.backgroundImage = `url(${gh_logo_source_image.src})`;
            gh_logo.style.backgroundImage = `url(${cavatar_url})`;
            gh_user.textContent = "@" + user_name;
            gh_user_followers.textContent = gh_integer_formater(followers);

            gh_content.append(gh_logo);
            gh_content.append(gh_user);
            gh_content.append(gh_user_followers);

            currentElement.append(gh_content);

            $(currentElement).on("click", () => {

                self.open("https://github.com/" + user_name);
            });

            return null;
    
        })();
    }

    return null;
}

// gh_widget_button_follows = gh_widget_button_follows?.target || gh_widget_button_follows;

// for (let element of gh_widget_button_follows) {
//     contruct_widget_button_follow(element);
// }

contruct_widget_button_follow(gh_widget_button_follows);