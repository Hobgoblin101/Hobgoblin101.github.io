let canvas = null;
let ctx = null;


function DrawParticle(x, y, height=1.0, speed=1.0){
	let color = `hsl(${speed*360}, 100%, 50%)`;

	// console.log(x, y, height);

	ctx.shadowBlur = pointSize*height*2;
	ctx.shadowColor = color;
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(
		x, y,
		pointSize*height,
		0, 2*Math.PI
	);
	ctx.fill();
}


let last = Date.now();
function Tick(){
	let now = Date.now();
	let dt = now-last;
	last = now;

	if (dt > 41){
		console.log(dt);
		dt = 41;
	}

	audio.analyser.getByteFrequencyData(freqData);

	// freqData.fill(1);

	// ctx.clearRect(0,0, canvas.width, canvas.height);

	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.rect(
		0,0,
		canvas.width, canvas.height
	);
	ctx.fill();

	if (WasmUpdate !== null){
		ctx.shadowBlur = 1;
		ctx.lineWidth = 0.5;
		WasmUpdate(dt);
	}

	// setTimeout(()=>{
	// 	window.requestAnimationFrame(Tick);
	// }, 1000)
	window.requestAnimationFrame(Tick);
}


function CanvasResize(){
	if (!canvas){
		return;
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	UpdateParticleBound(canvas.width, canvas.height);

	let population = Math.floor(canvas.width * canvas.height * pointDensity);
	UpdateParticleCount(population);
	// UpdateParticleCount(10);
}
window.addEventListener('resize', CanvasResize);


window.addEventListener('load', ()=>{
	canvas = document.getElementById('heroBanner');
	ctx = canvas.getContext('2d', {antialias: false});

	CanvasResize();
});
