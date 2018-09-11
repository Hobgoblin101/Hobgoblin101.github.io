//--------------------------------------------------
//  Audio
//--------------------------------------------------
let frequency  = 0;
let amplitude  = 0;
let audio = document.getElementById("sound");
let audioContext = new AudioContext();
let audioSrc = audioContext.createMediaElementSource(audio);
let analyser = audioContext.createAnalyser();
let frequencyData = new Uint8Array(analyser.frequencyBinCount);
let frequencies = [];

audioSrc.connect(analyser);

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
	analyser.connect(audioContext.destination);
}

audio.onplay = function(evt){
	document.getElementById("inputSpace").style.display="none";

	setTimeout(()=>{
		audio.play();
	}, 500);
	
	points.length = 0;
	canvas.resize();
	Tick();
	return false;
};