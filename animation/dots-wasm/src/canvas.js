let canvas  = null;
let ctx = null;


let dotColour = "#ff5c8d";


function DrawBoid(x, y){
	ctx.beginPath();
	ctx.arc(
		x-2, y-2,
		4,
		0, 2*Math.PI
	);
	ctx.fill();
}
function DrawConnection(sx, sy, dx, dy){
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(dx, dy);
	ctx.stroke();
}
function DrawAim(sx, sy, dx, dy){
	ctx.shadowBlur = 1;
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = "red";

	dx = sx + dx*20;
	dy = sy + dy*20;

	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(dx, dy);
	ctx.stroke();
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

	let res = WasmGetSpeeds();
	res.mov += (Math.random() - 0.5)*dt*0.0001;
	res.mov = Math.min(0.1, Math.max(res.mov, -0.1));
	res.turn += (Math.random() - 0.5)*dt*0.0001;
	res.turn = Math.min(0.01, Math.max(res.turn, -0.01));
	WasmSetSpeeds(res.mov, res.turn);

	ctx.clearRect(0,0, canvas.width, canvas.height);

	if (WasmUpdate !== null){
		ctx.shadowBlur = 1;
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = "#ff90bd";
		WasmUpdate(dt);

		ctx.shadowBlur = 5;
		ctx.fillStyle = ctx.shadowColor = dotColour;
		WasmDraw();
	}

	window.requestAnimationFrame(Tick);
}


function Resize(){
	if (!canvas){
		return;
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	UpdateBoidBounds(canvas.width, canvas.height);

	let population = Math.floor(canvas.width * canvas.height / 20000);
	UpdateBoidCount(population);
}
window.addEventListener('resize', Resize);


window.addEventListener('load', ()=>{
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d', { antialias: false });
	Resize();
	Tick();

	Resize();
})
