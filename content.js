// find hostname (just the first string after any www/m)
let url = window.location.hostname;
let url_split = url.split(".");
let domain = url_split[0];
if (domain == "www" || domain == "m") {
  domain = url_split[1];
}

// Message to background page to show the icon
// and start the timer for this domain if not yet started
chrome.runtime.sendMessage(
  { todo: "showPageAction", domain: domain },
  function (response) {
    console.log("Response received!");
  }
);

//image/text changer
function changer(d) {
  if (d === undefined) {
    return;
  }
  d = Number(d);
  let h = Math.floor(d / 60);
  if (h > 0) {
    let images = ["icon.png"];

    const imgs = document.getElementsByTagName("img");
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].src = images[0];
      console.log(imgs[i].src);
      imgs[i].alt = "you have wasted yet another hour. take a break";
    }

    const tags = ["h1", "h3", "h2", "p", "a", "span"];
    for (let j = 0; j < tags.length; j++) {
      const head = document.getElementsByTagName(tags[j]);
      for (let i = 0; i < head.length; i++) {
        head[i].innerText = "you have wasted yet another hour. take a break";
      }
    }
  }
}
// function to get latest timers from storage
function updateTime() {
  chrome.storage.sync.get(
    ["youtube", "facebook", "twitter", "instagram"],
    function (timeSpent) {
      changer(timeSpent.youtube);

      changer(timeSpent.facebook);

      changer(timeSpent.twitter);

      changer(timeSpent.instagram);
    }
  );
}

// Update timers every 1/2 a minute
// $(document).ready(function () {
//   updateTime();
//   setInterval(updateTime, 30000);
// });
setTimeout(updateTime, 30000);
//chrome.alarms.onAlarm.addListener(updateTime);
