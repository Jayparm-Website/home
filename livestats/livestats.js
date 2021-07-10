let whitelist = [
    // Me
    ""
];
let keyOwnerUuid = null;
let ownerIGN = null;
let apikey = null;
let initial = new Map();
let initialStats = null;
let current = new Map();
let currentStats = null;
let continueSession = true;
let sessionTime = 0;

let lastLoss = 0;
let winsAtLastLoss = 0;
let bestWinstreak = 0;

let lastDeath = 0;
let killsAtLastDeath = 0;
let bestKillstreak = 0;

let recentShards = 0;
let opalsGained = 0;

function runLiveStats() {
    if (isUrlKeyValid()) {
        document.getElementById("apikeyform").style.display = "none";
        apikey = getParam("key");
        initStats();
    } else {
        document.getElementById("session").style.display = "none";
        document.getElementById("lastGame").style.display = "none";
        document.getElementById("currentMap").style.display = "none";
    }
}

function initStats() {
    fetch("https://api.hypixel.net/key?key="+apikey)
        .then(result => result.json())
        .then(({ record }) => {
            keyOwnerUuid = record.owner;
            document.getElementsByTagName("H4").item(0).innerHTML = "You're <strong>1</strong> out of <strong>" + whitelist.length + "</strong> whitelisted players";
            getSessionStartData();
            sessionLoop();
            mapLoop();
            sessionTime = Date.now();
            sessionClock();
            sessionGa();
        })
}

function getSessionStartData() {
    getStreaks();
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
            ownerIGN = player.displayname;
            if (ownerIGN.substring(ownerIGN.length-1) == "s") {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "' LiveStats" + " <img src='https://cravatar.eu/helmavatar/" + keyOwnerUuid + "/32.png'>";
            } else {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "'s LiveStats" + " <img src='https://cravatar.eu/helmavatar/" + keyOwnerUuid + "/32.png'>";
            }
            let stats = player.stats.SkyWars;
            initial.set("wins", stats.wins);
            winsAtLastLoss = stats.wins;
            initial.set("losses", stats.losses);
            lastLoss = stats.losses;
            initial.set("kills", stats.kills);
            killsAtLastDeath = stats.kills;
            initial.set("deaths", stats.deaths);
            lastDeath = stats.deaths;
            initial.set("coins", stats.coins);
            initial.set("experience", stats.skywars_experience);
            initial.set("heads", stats.heads);
            initial.set("shard", stats.shard);
            initial.set("time", stats.time_played);
            initial.set("opals", stats.opals);

            initialStats = stats;

            initLastGameModule();
        })
}

async function sessionLoop() {
    getSessionCurrentData();
    await wait(2000);
    if (continueSession){
        await sessionLoop();
    }
}

async function mapLoop() {
    updateCurrentMap();
    await wait(5000);
    if (continueSession) {
        await mapLoop();
    }
}

async function sessionGa() {
    if (ownerIGN == null) {
        ga('send', 'pageview', 'livestats/LOADING');
    } else {
        ga('send', 'pageview', 'livestats/'+ownerIGN);
    }
    await wait(60000);
    if (continueSession){
        await sessionGa();
    }
}

async function sessionClock() {
    document.getElementById("sessionDuration").innerHTML = sessionDurationString(sessionDuration());
    await wait(1000);
    if (continueSession){
        await sessionClock();
    }
}

function getSessionCurrentData() {
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
            let stats = player.stats.SkyWars;
            currentStats = stats;
            current.set("wins", stats.wins);
            current.set("losses", stats.losses);
            current.set("kills", stats.kills);
            current.set("deaths", stats.deaths);
            current.set("coins", stats.coins);
            current.set("experience", stats.skywars_experience);
            current.set("heads", stats.heads);
            current.set("shard", stats.shard);
            current.set("time", stats.time_played);
            current.set("corruption", calculateCorruption(stats));
            current.set("opals", stats.opals);
            checkForShardReset();
            if (current.get("losses") != lastLoss) {
                lastLoss = current.get("losses");
                winsAtLastLoss = current.get("wins");
            }
            if (current.get("deaths") != lastDeath) {
                lastDeath = current.get("deaths");
                killsAtLastDeath = current.get("kills");
            }
            checkFinishedGame();
            updateMainSessionVisuals();
        })
}

function updateMainSessionVisuals() {
    document.getElementById("wins").innerHTML = formatNumber(current.get("wins"));
        document.getElementById("swins").innerHTML = "(+" + (current.get("wins")-initial.get("wins")).toString() + ")";

    document.getElementById("losses").innerHTML = formatNumber(current.get("losses"));
        document.getElementById("slosses").innerHTML = "(+" + (current.get("losses")-initial.get("losses")).toString() + ")";

    document.getElementById("winpercentage").innerHTML = getCurrentWinPercentage();
        document.getElementById("swinpercentage").innerHTML = "(" + getSessionWinPercentage() + ")";

    document.getElementById("kills").innerHTML = formatNumber(current.get("kills"));
        document.getElementById("skills").innerHTML = "(+" + formatNumber((current.get("kills")-initial.get("kills")).toString()) + ")";

    document.getElementById("deaths").innerHTML = formatNumber(current.get("deaths"));
        document.getElementById("sdeaths").innerHTML = "(+" + formatNumber((current.get("deaths")-initial.get("deaths")).toString()) + ")";

    document.getElementById("kd").innerHTML = getCurrentKD().toString();
        document.getElementById("skd").innerHTML = "(" + getSessionKD() + ")";

    document.getElementById("swexp").innerHTML = formatNumber(current.get("experience"));
        document.getElementById("sswexp").innerHTML = "(+" + formatNumber((current.get("experience")-initial.get("experience")).toString()) + ")";

    document.getElementById("coins").innerHTML = formatNumber(current.get("coins"));
        document.getElementById("scoins").innerHTML = "(+" + formatNumber((current.get("coins")-initial.get("coins")).toString()) + ")";

    document.getElementById("heads").innerHTML = formatNumber(current.get("heads"));
        document.getElementById("sheads").innerHTML = "(+" + formatNumber((current.get("heads")-initial.get("heads")).toString()) + ")";

    document.getElementById("shards").innerHTML = formatNumber(current.get("shard"));
        document.getElementById("sshards").innerHTML = "(+" + formatNumber((current.get("shard")-initial.get("shard")+(opalsGained*20000)).toString()) + ")";

    document.getElementById("opals").innerHTML = current.get("opals");
    document.getElementById("sopals").innerHTML = "(+" + opalsGained + ")";

    document.getElementById("winstreak").innerHTML = formatNumber(getWinstreak());
    document.getElementById("killstreak").innerHTML = formatNumber(getKillstreak());

    document.getElementById("bestws").innerHTML = formatNumber(bestWinstreak);
    document.getElementById("bestks").innerHTML = formatNumber(bestKillstreak);

    document.getElementById("hourlywins").innerHTML = formatNumber(Math.round(statPerHour(current.get("wins")-initial.get("wins"))));
    document.getElementById("hourlykills").innerHTML = formatNumber(Math.round(statPerHour(current.get("kills")-initial.get("kills"))));
    document.getElementById("hourlyexp").innerHTML = formatNumber(Math.round(statPerHour(current.get("experience")-initial.get("experience"))));
    document.getElementById("hourlyshards").innerHTML = formatNumber(Math.round(statPerHour(current.get("shard")-initial.get("shard")+(opalsGained*20000))));

    document.getElementById("sgameTime").innerHTML = sessionDurationString((current.get("time") - initial.get("time"))*1000);

    document.getElementById("corruption").innerHTML = current.get("corruption") + "%";
    document.getElementById("scorruption").innerHTML = "(" + Math.round(sessionCorruptChance()) + "%)";

    updateProgressBars();
    storeStreaks();
}

function checkForShardReset() {
    if (current.get("shard") < recentShards){
        opalsGained += 1;
    }
    recentShards = current.get("shard");
}

function sessionCorruptChance() {
    let corruptionTotal = 0;
    for (let i = 0; i < corruptionHistory.length; i++) {
        if (corruptionHistory[i]) {
            corruptionTotal++;
        }
    }
    if (corruptionHistory.length == 0) {
        return 0;
    }
    return corruptionTotal/corruptionHistory.length*100;
}

function calculateCorruption(stats) {
    let totalChance = stats.angel_of_death_level;
    if (stats.packages.includes("favor_of_the_angel")) {
        totalChance++;
    }
    if (stats.angels_offering == 1) {
        totalChance++;
    }
    return totalChance;
}

function sessionDuration() {
    return Date.now() - sessionTime;
}

function statPerHour(sessionStat) {
    return sessionStat / sessionDuration() * 1000 * 60 * 60;
}

function storeStreaks() {
    getStreaks();
    if (bestWinstreak > getCookie("winstreak")) {
        document.cookie = "winstreak=" + bestWinstreak + "; expires=Thu, 6 Dec 2035 12:00:00 UTC";
    }
    if (bestKillstreak > getCookie("killstreak")) {
        document.cookie = "killstreak=" + bestKillstreak + "; expires=Thu, 6 Dec 2035 12:00:00 UTC";
    }
}

function getStreaks() {
    if (getCookie("winstreak") != "" && getCookie("winstreak") > bestWinstreak){
        bestWinstreak = parseInt(getCookie("winstreak"));
    }
    if (getCookie("killstreak") != "" && getCookie("killstreak") > bestKillstreak){
        bestKillstreak = parseInt(getCookie("killstreak"));
    }
}

function updateProgressBars() {
    let xpbar = document.getElementById("xpbarprogress");
    let shardsbar = document.getElementById("shardsbarprogress");

    document.getElementById("xpbartext").innerHTML = "EXP — " + formatNumber(xpIntoLevel(current.get("experience"))) + "/10,000";
    xpbar.style.width = xpIntoLevel(current.get("experience"))/100 + "%";

    document.getElementById("shardsbartext").innerHTML = "Shards — " + formatNumber(current.get("shard")) + "/20,000";
    shardsbar.style.width = current.get("shard")/200 + "%";
}

//only works above level 12
function xpIntoLevel(experience) {
    return (experience - 5000)%10000;
}

function sessionDurationString(duration) {
    let ms = duration % 1000 / 100;
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

function getWinstreak() {
    if (current.get("wins")-winsAtLastLoss > bestWinstreak) {
        bestWinstreak = current.get("wins")-winsAtLastLoss;
    }
    return current.get("wins")-winsAtLastLoss;
}

function getKillstreak() {
    if (current.get("kills")-killsAtLastDeath > bestKillstreak) {
        bestKillstreak = current.get("kills")-killsAtLastDeath;
    }
    return current.get("kills")-killsAtLastDeath;
}

function getCurrentWinPercentage() {
    if (current.get("losses") == 0) {
        return "&infin;";
    }
    return Math.round(current.get("wins")/current.get("losses")*10000)/10000;
}

function getSessionWinPercentage() {
    if (current.get("losses")-initial.get("losses") == 0) {
        return "&infin;";
    }
    return Math.round((current.get("wins")-initial.get("wins"))/(current.get("losses")-initial.get("losses"))*10000)/10000;
}

function getCurrentKD() {
    if (current.get("deaths") == 0) {
        return "&infin;";
    }
    return Math.round(current.get("kills")/current.get("deaths")*1000)/1000;
}

function getSessionKD() {
    if (current.get("deaths")-initial.get("deaths") == 0) {
        return "&infin;";
    }
    return Math.round((current.get("kills")-initial.get("kills"))/(current.get("deaths")-initial.get("deaths"))*1000)/1000;
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function initValidation(){
    document.getElementById("apikeyform").addEventListener("submit", formValidation);
}

function isFormKeyValid() {
    let apikey = document.getElementById("key").value;
    for (let i = 0; i < whitelist.length; i++) {
        if (md5(apikey) == whitelist[i]){
            return true;
        }
    }
    return false;
}

function isUrlKeyValid() {
    let apikey = getParam("key");
    for (let i = 0; i < whitelist.length; i++) {
        if (md5(apikey) == whitelist[i]){
            return true;
        }
    }
    return false;
}

function formValidation(event) {
    if (!isFormKeyValid()){
        event.preventDefault();
        document.getElementById("invalid").innerHTML = "Your key isn't whitelisted";
    }
}

function getParam(name) {
    let queryString = decodeURIComponent(location.search.replace(/\+/g, " "));
    let regex = new RegExp(name + "=([^&*]+)");
    let result = regex.exec(queryString);
    if (result) {
        return result[1];
    }
    return null;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
