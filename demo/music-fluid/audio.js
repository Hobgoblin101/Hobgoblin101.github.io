//--------------------------------------------------
//  Audio
//--------------------------------------------------
let frequency  = 0;
let amplitude  = 0;
let audio = document.getElementById("sound");
let playBtn = document.getElementById("playBtn");
let audioContext = null;
let audioSrc = null;
let analyser = null;
let frequencyData = null;
let frequencies = [];

function AudioAnalysis(){
	analyser.getByteFrequencyData(frequencyData);

	amplitude = 0;
	for (let i=0; i<frequencyData.length; i++){
		frequencies[i] = frequencyData[i] / 256;

		if (frequencies[i] > amplitude){
			amplitude = frequencies[i];
		}
	}
}

function playFile(elm){
	let url = URL.createObjectURL(elm.files[0]);
	audio.src=url;
}

playBtn.onclick = function(evt){
	document.getElementById("inputSpace").style.display="none";

	audioContext = new AudioContext();
	audioSrc = audioContext.createMediaElementSource(audio);
	analyser = audioContext.createAnalyser();
	frequencyData = new Uint8Array(analyser.frequencyBinCount);
	analyser.connect(audioContext.destination);
	audioSrc.connect(analyser);

	setTimeout(()=>{
		audio.play();
	}, 500);

	points.length = 0;
	canvas.resize();
	Tick();
	return false;
};
