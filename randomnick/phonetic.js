const vowelSoundsT1 = [
    'a','e','i','o'
];
const vowelSoundsT2 = [
    'ai','au','al','ao',
    'ee','ea','ei','ey','eu','er',
    'io','ie','ia',
    'ou','ow','or','oi','oo','oa',
    'u','ue','ui','ur','ua',
    'y'
];

const consonantSoundsT1 = [
    'd','l','m','n','p','r','s','t'
];
const consonantSoundsT2 = [
    'b','c','f','g','h','j','k','v','w','x','z',
    'st','ck','sh','kn'
];

function generatePhoneticNick() {
    let word = '';
    word += buildSyllable(false);
    word += buildSyllable(isLastCharVowel(word));
    return postProcessPhonetic(word);
}

function buildSyllable(lastCharVowel) {

    let syllable = '';
    //decide if we start with vowel or not
    if (coinFlip() && !lastCharVowel) {
        //vowel
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(vowelSoundsT1);
        } else {
            syllable += randomSound(vowelSoundsT2);
        }
        //consonant
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(consonantSoundsT1);
        } else {
            syllable += randomSound(consonantSoundsT2);
        }
    } else {
        //consonant
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(consonantSoundsT1);
        } else {
            syllable += randomSound(consonantSoundsT2);
        }
        //vowel
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(vowelSoundsT1);
        } else {
            syllable += randomSound(vowelSoundsT2);
        }
        //coinflip for extra consonant
        if (!coinFlip()) {
            //consonant
            if (heavyTrueCoinFlip()) {
                syllable += randomSound(consonantSoundsT1);
            } else {
                syllable += randomSound(consonantSoundsT2);
            }
        }
    }
    return syllable;
}

async function postProcessPhonetic(word) {
    //if word is too short, add extra random syllable at end
    if (word.length < 5) {
        word += buildSyllable(isLastCharVowel(word));
    }
    //fix late oi to oy
    if (word.slice(-2) === 'oi') {
        word = replaceLast('oi', 'oy', word);
    }
    //fix late ai to ay
    if (word.slice(-2) === 'ai') {
        word = replaceLast('ai', 'ay', word);
    }
    //fix late kn
    if (word.slice(-2) === 'kn') {
        word = replaceLast('kn', 'n', word);
    }
    //fix early ck
    if (word.charAt(0) === 'c' && word.charAt(1) === 'k') {
        word = word.replace('ck', 'c');
    }
    //chance to give capital to start of word
    if (coinFlip()) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    let data = await doesPlayerExist(word);
    if (typeof data.username !== "undefined") {
        console.log("attempting to add z or x");
        //small chance to give x or z at start
        if (!heavyTrueCoinFlip() && word.charAt(0) !== 'I' && word.charAt(0).toUpperCase() === word.charAt(0)) {
            if (word.charAt(0) !== 'X' && coinFlip()) {
                word = 'x' + word;
            } else {
                if (word.charAt(0) !== 'Z') {
                    word = 'z' + word;
                }
            }
        }
    } else {
        return word;
    }
    data = await doesPlayerExist(word);
    //add chance for _tw or _es to be at the end to act like it's a regional name
    if (typeof data.username !== "undefined") {
        console.log("attempting to add a language suffix");
        if (Math.random() < 0.1) {
            if (coinFlip()) {
                word = word + "_tw"
            } else {
                word = word + "_es"
            }
        }
    } else {
        return word;
    }
    data = await doesPlayerExist(word);
    //add numbers if player still exists
    if (typeof data.username !== "undefined") {
        console.log("attempting to add numbers");
        word = word + Math.floor(Math.random() * 10);
        if (!heavyTrueCoinFlip()) {
            word = word + Math.floor(Math.random() * 10);
        }
    } else {
        return word;
    }
    return word;
}

function isLastCharVowel(word) {
    let currently = false;
    for (let i = 0; i < vowelSoundsT1.length; i++) {
        if (word.slice(-1) === vowelSoundsT1[i]) {
            currently = true;
        }
    }
    for (let i = 0; i < vowelSoundsT2.length-1; i++) {
        if (word.slice(-2) === vowelSoundsT2[i]) {
            currently = true;
        }
    }
    if (word.slice(-1) === 'y') {
        currently = true;
    }
    return currently;
}

function randomSound(soundsArray) {
    return soundsArray[Math.floor(Math.random()*soundsArray.length)];
}

function replaceLast(find, replace, string) {
    let lastIndex = string.lastIndexOf(find);

    if (lastIndex === -1) {
        return string;
    }

    let beginString = string.substring(0, lastIndex);
    let endString = string.substring(lastIndex + find.length);

    return beginString + replace + endString;
}

async function doesPlayerExist(word) {
    const response = await fetch('https://api.slothpixel.me/api/players/' + word);
    return response.json();
}
