let audio = {
	element: null,
	ctx: new AudioContext(),
	analyser: null
};

let frequencyData = null;


window.addEventListener('load', ()=>{
	audio.element = document.getElementById("sound");

	let audioSrc = audio.ctx.createMediaElementSource(audio.element);
	audioSrc.connect(audio.ctx.destination);

	audio.analyser = audio.ctx.createAnalyser();
	audio.analyser.fftSize = 2048; // Default 2048

	frequencyData = new Uint8Array(audio.analyser.frequencyBinCount);
	audioSrc.connect(audio.analyser);



	let first = true;

	document.getElementById('play-button').onclick = function(evt){
		document.getElementById("inputSpace").style.display = "none";

		CanvasResize();

		audio.element.play();
		audio.ctx.resume();

		if (first){
			Tick();
			first = false;
		}
	};
});

function playFile(elm){
	let url = URL.createObjectURL(elm.files[0]);
	console.log(url);
	audio.element.src=url;
	// audio.analyser.connect(audio.ctx.destination);

	document.getElementById('play-button').removeAttribute('disabled');
}
