const pads = document.querySelectorAll('.quarter');
const audioFile = document.querySelector('.audio-files');

const startBtn = document.querySelector('.start-button');
const powerCheck = document.querySelector('#power');
const strictCheck = document.querySelector('#strict');

const brightness = 40;
let timeSequence = 1000;
let decreaseValue = 100;

let padsSequence = [];
let numsSequence = [];
let count = 0;
let numOfAttempts = 0;

//sequence running
let sequenceRun = false;
let sequenceTurn = true;

// your picks
let myArr = [];
let myTurn = false;

const playAudio = function (el) {
    const padNum = el.getAttribute('pad');
    audioFile.src = `https://s3.amazonaws.com/freecodecamp/simonSound${padNum}.mp3`;
    audioFile.play();
}

// get random pad
const getRandomPad = function (arr, min = 0) {
    const max = arr.length - 1;
    const randNum = Math.floor(Math.random() * (max - min + 1) + min);
    return arr[randNum];
}
// push pad attribute from random pad
const pushNumSequence = function (el) {
    const seq = Number(el.getAttribute('pad'));
    numsSequence.push(seq);
}

// push random pad to the padsSequence array and his pad attribute to the numSequence array
const pushPad = () => {
    const randPad = getRandomPad(pads);
    padsSequence.push(randPad);
    pushNumSequence(randPad);

    return padsSequence;
}

const renderSequence = async function (el) {
    el.style.filter = `brightness(${brightness}%)`;
    playAudio(el);
    return new Promise(resolve => {
        setTimeout(() => {
            el.style.filter = '';
            resolve('resolved');
        }, timeSequence)
    })
}

//loop over random pads
const loopOverElements = async function (arr) {
    sequenceRun = !sequenceRun; //true

    //every fifth round, decrease timeSequence by 100
    if (numOfAttempts > 0 && (numOfAttempts + 5) % 5 === 0) {
        timeSequence -= decreaseValue;
    }

    for (const el of arr) {
        await Promise.resolve(setTimeout(() => {
            el.style.filter = '';
        }, 200))
        await renderSequence(el);
    }

    sequenceRun = !sequenceRun; //false
    sequenceTurn = !sequenceTurn //false

    // reset my try
    myArr.length = 0;
}

const compare = function (a, b) {
    let result =
        a.length === b.length &&
        a.every((el, index) => el === b[index]);

    return result;
}


const renderCount = () => {
    const countDisplay = document.querySelector('.count-display');
    const res = compare(myArr, numsSequence);
    numOfAttempts++;
    if (res) {
        count++;
        countDisplay.innerText = count;
        startBtn.click();
    } else {
        if (strictCheck.checked) {
            count = 0;
            countDisplay.innerText = count;
        } else {
            count = count-- <= 0 ? 0 : count;

            countDisplay.innerText = 'NO!';
            setTimeout(() => {
                countDisplay.innerText = count;
                loopOverElements(padsSequence);
            }, 1000)
        }
    }
}

//set pad attribute to every pad
pads.forEach((el, i) => el.setAttribute('pad', ++i));

// add click event on start button
startBtn.addEventListener('click', () => {
    if (!powerCheck.checked || sequenceRun) return;
    pushPad();
    loopOverElements(padsSequence);
})

// Add click event on pads
pads.forEach(pad => pad.addEventListener('click', (e) => {
    if (sequenceRun || sequenceTurn) return;
    const padNumber = Number(e.target.getAttribute('pad'));
    myArr.push(padNumber)

    if (myArr.length === numsSequence.length) {
        // Object.freeze(myArr);
        // console.log(compare(myArr, numsSequence));
        renderCount(count);
        sequenceTurn = !sequenceTurn //true;
        return;
    }
}))

