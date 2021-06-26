//methods of nick gen
async function generateNick() {
    let nick;
    switch (Math.floor(Math.random())) {
        //random phonetically viable letters
        case 0:
            nick = await generatePhoneticNick();
            addNick(nick);
            break;
        //random suffixes and prefixes to OG's
        case 1:
            nick = await generateSemiOGNick();
            addNick(nick);
            break;
    }
}

function addNick(generatedNick) {
    let node = document.createElement("H1");
    let textNode = document.createTextNode(generatedNick);
    node.appendChild(textNode);
    document.getElementsByTagName("body").item(0).appendChild(node);
}

function coinFlip() {
    return Math.random() < 0.5;
}

function heavyTrueCoinFlip() {
    return Math.random() < 0.85;
}