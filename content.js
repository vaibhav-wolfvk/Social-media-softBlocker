// find hostname (just the first string after any www/m)
let url=window.location.hostname;
let url_split=url.split(".");
let domain=url_split[0];
if(domain=="www" || domain=='m'){
    domain=url_split[1];
}

// Message to background page to show the icon
// and start the timer for this domain if not yet started
chrome.runtime.sendMessage({todo: "showPageAction",domain: domain},function(response){
    console.log("Response received!");
});