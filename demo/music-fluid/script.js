let canvas = document.getElementById('heroBanner');
let ctx = canvas.getContext('2d');

let canvasWidth  = 500;
let canvasHeight = 500;
let cHW = canvasWidth /2;
let cHH = canvasHeight/2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;


let last = Date.now();
function Tick(){
	let now = Date.now();
	let dt = (now-last);
	last = now;

	pointTurningSpeed = (amplitude**2)/2;
	pointMovementSpeed = (amplitude**2)*5;

	if (dt > 0.5){
		dt = 0.5;
	}

	AudioAnalysis();

	for (let point of points){
		point.update(dt);
	}

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	for (let point of points){
		point.draw(dt);
	}


	window.requestAnimationFrame(Tick);
};


// Handle resize event
canvas.resize = function(){
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	cHW = canvasWidth/2;
	cHH = canvasHeight/2;

	let population = Math.floor(canvas.width * canvas.height * pointDensity);
	// let population = 1;
	if (population < points.length){
		points.length = population;
	}else{
		population -= points.length;
		while (population > 0){
			points.push(new Point(points.length));
			population--;
		}
	}
};
window.addEventListener('resize', canvas.resize);