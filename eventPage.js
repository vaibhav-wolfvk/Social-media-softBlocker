// chrome.storage description
// Websites covered: Facebook, Instagram, Twitter, Youtube 
/*  -> counters (in minutes) for each distracting webiste
    -> today's date
    -> array containing count of "openTabs" for each of the above websites
    -> an object with key as tab ID and value as the hostname (only for above hosts) 
*/

// A utility for some sort of mapping from indices to the hostnames (alphabetical)
const conversion_array=["facebook","instagram","twitter","youtube"];

// Reset timers and date
function resetAll(){
    chrome.storage.sync.set({
        "facebook": 0,
        "instagram": 0,
        "twitter": 0,
        "youtube": 0,
        "date": (new Date()).getDate(),
    }, function() {
        let notifOptions={
            type: "basic",
            iconUrl: "icon48.png",
            title: "Updated!",
            message: "Timers have been reset"
        };
        chrome.notifications.create("resetNotif",notifOptions);
    });
}

// Initialization tasks done on installation/update of extension/browser
chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.set({
        "facebook": 0,
        "instagram": 0,
        "twitter": 0,
        "youtube": 0,
        "date": (new Date()).getDate(),
        "openTabs": [0,0,0,0],
        "tabIdToHostname": {}
    }, function() {
        let notifOptions={
            type: "basic",
            iconUrl: "icon48.png",
            title: "Updated!",
            message: "Timers have been reset"
        };
        chrome.notifications.create("resetNotif",notifOptions);
    });
});

// function (associated with setInterval) which is called every minute
// to keep track of minutes spent on one of the distracting websites 
function incrementTime(alarm){
    let name=alarm.name;
    chrome.storage.sync.get([name,"date"],function(timeSpent){
        let curr_date=(new Date()).getDate();
        // It's the next day
        if(curr_date!=timeSpent.date){
            console.log("New Day!");
            resetAll();
        } else{
            let ts=parseInt(timeSpent[name])
            if(isNaN(ts)){
                ts=0;
            }
            ts+=1;
            chrome.storage.sync.set({[name]:ts},function(){
                console.log(name+" "+ts);
                // Notify every hour
                if(ts%60==0){
                    let notifOptions={
                        type: "basic",
                        iconUrl: "icon48.png",
                        title: "A lot of distractions!",
                        message: "You've spent yet another hour on "+name
                    };
                    chrome.notifications.create("limitNotif",notifOptions);
                }
            });
        }
    });
}

// Calling the above function
chrome.alarms.onAlarm.addListener(incrementTime);

// Listening for request from content scripts
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    // Show the icon if the tab has one of the 4 websites open
    // alarm is created only if this is the first tab opened for that website
    if(request.todo=="showPageAction"){
        chrome.pageAction.show(sender.tab.id);
        let i=3;
        if(request.domain=="facebook"){
            i=0;
        } else if(request.domain=="instagram"){
            i=1;
        } else if(request.domain=="twitter"){
            i=2
        } else{
            i=3;
        }
        chrome.storage.sync.get(["openTabs","tabIdToHostname"],function(details){
            details.openTabs[i]+=1;
            details.tabIdToHostname[sender.tab.id]=request.domain;
            if(details.openTabs[i]==1){
                chrome.alarms.create(conversion_array[i],{periodInMinutes: 1});
            }
            chrome.storage.sync.set({"openTabs":details.openTabs,"tabIdToHostname":details.tabIdToHostname},function(){
                console.log("New tab added: ")
                console.log(details.openTabs);
                console.log(details.tabIdToHostname);
                sendResponse();
            });
        })
    }
});

// This is called when any tab is closed
// We check if the closed tab's ID is present in the "tabIdToHostname" object
// If it is present, we decrement the count for that domain 
// and clear alarm if necessary 
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.storage.sync.get(["openTabs","tabIdToHostname"],function(details){
        let val=details.tabIdToHostname[tabId];
        if(val!=undefined){
            delete details.tabIdToHostname[tabId];
            let i=3;
            if(val=="facebook"){
                i=0;
            } else if(val=="instagram"){
                i=1;
            } else if(val=="twitter"){
                i=2;
            } else{
                i=3;
            }
            details.openTabs[i]-=1;
            if(details.openTabs[i]==0){
                chrome.alarms.clear(val);
            }
            chrome.storage.sync.set({"openTabs": details.openTabs,"tabIdToHostname": details.tabIdToHostname},function(){
                console.log("Tab removed: ")
                console.log(details.openTabs);
                console.log(details.tabIdToHostname);
            });
        } else{
            console.log("It's undefined!!");
        }
    });
});
