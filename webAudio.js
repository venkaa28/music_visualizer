
console.clear();

//instigate our audio context

//for cross browser if webkitAudioContext works
const AudioContext = window.AudioContext; //|| window.webkitAudioContext;
let audioCtx;
const audioElement = document.getElementById("audio_file");
let track;
let analyzer;
let bufferLength;
let dataArray;


const playButton = document.getElementById("play_button");

playButton.addEventListener('click', function () {
    if(!audioCtx) {
        init();
    }
    if(audioCtx.state === 'suspended'){
        audioCtx.resume();
    }
    if(this.dataset.playing === 'false'){
        audioElement.play();
        this.dataset.playing = 'true';

    }else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }
    let state = this.getAttribute('aria-checked') === "true" ? true: false;
    this.setAttribute('aria-checked', state ? "false" : "true");

}, false);

//if track ends

audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
    playButton.setAttribute("aria-checked", "false");
}, false);

function init() {
    audioCtx = new AudioContext();
    track = audioCtx.createMediaElementSource(audioElement);

    const gainNode = audioCtx.createGain();
    const volumeControl = document.getElementById("volume_button");
    volumeControl.addEventListener('input', function () {
        gainNode.gain.value = this.value;
    }, false);
    track.connect(gainNode);

    analyzer = audioCtx.createAnalyser();
    gainNode.connect(analyzer);

    analyzer.connect(audioCtx.destination);

    analyzer.fftSize = 512;
    bufferLength = analyzer.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

}

init();