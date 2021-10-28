// function to convert minutes into string describing hours and minutes
function secondsToHms(d) {
    if(d==undefined ){
        return "less than a minute";
    }
    d = Number(d);
    let h = Math.floor(d/60);
    let m = Math.floor(d%60);
    if(h==0 && m==0){
        return "less than a minute";
    }
    let hDisplay=h>0 ? h+(h==1 ? " hour " : " hours ") : "";
    let mDisplay=m>0 ? m+(m==1 ? " minute " : " minutes ") : "";
    return hDisplay+mDisplay; 
}

// function to get latest timers from storage
function updateTime(){
    chrome.storage.sync.get(["youtube","facebook","twitter","instagram"],function(timeSpent){
        $("#ydTime").html('<em>'+secondsToHms(timeSpent.youtube)+'</em>');
        $("#fdTime").html('<em>'+secondsToHms(timeSpent.facebook)+'</em>');
        $("#tdTime").html('<em>'+secondsToHms(timeSpent.twitter)+'</em>');
        $("#idTime").html('<em>'+secondsToHms(timeSpent.instagram)+'</em>');
    });
}

// Update timers every 1/2 a minute 
$(document).ready(function(){
    updateTime();
    setInterval(updateTime,30000);
});