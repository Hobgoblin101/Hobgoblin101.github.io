class Vector{
	constructor(x=0, y=0){
		this.x = x;
		this.y = y;
	}

	getMagnitude(){
		let res = Math.sqrt(this.x**2 + this.y**2);

		if (isNaN(res) || !isFinite(res)){
			return 0;
		}

		return res;
	}
	getNormal(){
		let res = new Vector(this.x, this.y);
		res.normalize();

		return res;
	}

	normalize(){
		let mag = this.getMagnitude();
		this.x = (this.x / mag) || (0);
		this.y = (this.y / mag) || (0);
	};
	setMagnitude(amount){
		this.normalize();
		this.x *= amount;
		this.y *= amount;
	}


	multiply(other){
		this.x *= other;
		this.y *= other;
	}


	clone(){
		return new Vector(this.x, this.y);
	}


	add(other){
		if (other instanceof Vector){
			this.x += other.x;
			this.y += other.y;
			return;
		}

		this.x += other;
		this.y += other;
	}
}





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

function AudioAnalysis(){
	analyser.getByteFrequencyData(frequencyData);

	frequency = 0;
	let count = 0;
	amplitude = 0;
	for (let i=0; i<frequencyData.length; i++){
		amplitude += frequencyData[i];

		frequency += frequencyData[i] * i;
		count += frequencyData[i];
	}
	amplitude /= frequencyData.length;
	amplitude /= 258;
	frequency /= count;
	frequency /= frequencyData.length;
	if (isNaN(frequency) || !isFinite(frequency)){
		frequency = 0;
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





//--------------------------------------------------
//  Visual
//--------------------------------------------------
let canvas = document.getElementById('heroBanner');
let ctx = canvas.getContext('2d');

let canvasWidth  = 500;
let canvasHeight = 500;
let cHW = canvasWidth /2;
let cHH = canvasHeight/2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;


let flockRange = 30000;
let avoidRange = flockRange*(3/4);
let points = [];

class Point{
	constructor(index=-1){
		this.index = index;
		if (randomStartPoint){
			this.position = new Vector(
				Math.random() * canvasWidth,
				Math.random() * canvasHeight
			);
		}else{
			this.position = new Vector(
				cHW,
				cHH
			);
		}

		this.direction = new Vector(
			Math.random()-0.5,
			Math.random()-0.5
		);
		this.direction.normalize();
		this.connections    = [];
		this.connectionDist = [];
		this.color = "hls(0,0%,0%)";
	};

	update(dt){

		// Tend towards the centre of the group
		let avg = new Vector(0,0);
		let align = new Vector(0,0);
		let avoid = new Vector(0,0);
		let nxt = new Vector(0,0);
		let dist = 0;
		let selfSeen = false;
		this.connections = [];
		this.connectionDist = [];
		for (let other of points){
			if (other == this){
				selfSeen = true;
				continue;
			}

			dist  = (this.position.x - other.position.x)**2;
			dist += (this.position.y - other.position.y)**2;
			if (dist < flockRange){
				avg.add(new Vector(
					other.position.x - this.position.x,
					other.position.y - this.position.y
				));
				align.add(other.direction);

				if (!selfSeen) {
					this.connections.push(other.position);
					this.connectionDist.push(dist);
				}
			}
			if (dist < avoidRange){
				nxt.x = this.position.x - other.position.x;
				nxt.y = this.position.y - other.position.y;
				nxt.setMagnitude( avoidRange - nxt.getMagnitude() );

				avoid.add(nxt);
			}
		}


		let centre = new Vector(
			(cHW)-this.position.x,
			(cHH)-this.position.y
		);



		// Get the desired direction
		let aim = new Vector(0,0);
		avg.normalize();
		avg.multiply(0.6);
		aim.add(avg);

		align.normalize();
		align.multiply(0.8);
		aim.add(align);

		avoid.normalize();
		avoid.multiply(1);
		aim.add(avoid);

		centre.normalize();
		centre.multiply(0.1);
		aim.add(centre);

		aim.normalize();

		// Change the direction of the particle
		this.direction.x += aim.x*pointTurningSpeed*dt;
		this.direction.y += aim.y*pointTurningSpeed*dt;
		this.direction.normalize();

		// Move the particle in it's direction
		let mov = this.direction.clone();
		mov.multiply(dt * pointMovementSpeed);
		this.position.add(mov);

		// Bounce of screen edge
		if (this.position.x < 0){
			this.position.x = 0;
			this.direction.x *= -1;
		}else if (this.position.x > canvasWidth){
			this.position.x = canvasWidth;
			this.direction.x *= -1;
		}
		if (this.position.y < 0){
			this.position.y = 0;
			this.direction.y *= -1;
		}else if (this.position.y > canvasHeight){
			this.position.y = canvasHeight;
			this.direction.y *= -1;
		}

		this.color = "hsla(";
		if (densityBasedColour){
			this.color += (this.connections.length/points.length*360)+",";
		}else{
			let x = this.position.x - (cHW);
			let y = this.position.y - (cHH);
			let index = (x**2 + y**2) / (cHW*cHH) * frequencyData.length;
			let lower = Math.floor(index);
			let heighter = Math.ceil(index);
			index -= lower;

			let hue = frequencyData[ lower ]*index/256;
			    hue += (1-index)*frequencyData[heighter]/256;
			this.color += hue*360 +",";

			// this.color += frequencyData[ Math.floor(this.index/points.length*frequencyData.length) ]/256*360 +",";
		}
		this.color += (1-(frequency**2))*100;
		this.color += "%,50%,0.9)";
	};

	drawPoint(){
		if (pointGlow) {
			ctx.shadowBlur = 50*amplitude;
			ctx.shadowColor = this.color;
		} else {
			ctx.shadowBlur = 0;
		}

		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(
			this.position.x, this.position.y,
			40*(amplitude**2),
			0, 2*Math.PI
		);
		ctx.fill();
	}
	drawConnection(warp){
		ctx.shadowBlur = 6+warp;
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = this.color;
		ctx.shadowColor = this.color;

		if (useOnlyClosestConnection){
			// Make an array of the closes l number of points
			// Iterativly replace elements with better options
			let opts = Array(pointMaxConnections);
			outer: for (let i=0; i<this.connections.length; i++){

				for (let j=0; j<opts.length; j++){
					if (isNaN(opts[j])){
						opts[j] = i;
						continue outer;
					}

					if (this.connectionDist[i] < this.connectionDist[ opts[j] ]){
						opts[j] = i;
						continue outer;
					}
				}
			}

			for (let i=0; i<opts.length; i++){
				if (isNaN(opts[i])){
					break;
				}
				if ((this.connections[ opts[i] ] instanceof Vector) == false){
					console.warn("Invalid connection detected");
					console.warn(opts[i], this.connections.length, this.connections[ opt[i] ]);
					console.warn(this.connections);
					break;
				}

				// Use the point
				ctx.beginPath();
				ctx.moveTo(this.position.x, this.position.y);
				ctx.lineTo(this.connections[ opts[i] ].x, this.connections[ opts[i] ].y);
				ctx.stroke();
			}
		}else{
			let max = Math.min(this.connections.length, pointMaxConnections);

			for (let i=0; i<max; i++){
				ctx.beginPath();
				ctx.moveTo(this.position.x, this.position.y);
				ctx.lineTo(this.connections[ i ].x, this.connections[ i ].y);
				ctx.stroke();
			}
		}
	};
};



let last = Date.now();

ctx.fillStyle = "rgb(0,0,0)";
ctx.rect(0, 0, canvasWidth, canvasHeight);
ctx.fill();

function Draw(){
	let now = Date.now();
	let dt = now-last;
	last = now;

	if (dt > 1000){
		dt = 1;
	}


	// Updates points
	for (let dot of points){
		dot.update(dt);
	}

	// Clear the view
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	if (drawConnections){
		let warp = 50*(frequency**2);
		for (let dot of points){
			dot.drawConnection(warp);
		}
	}

	// Draw each point
	if (drawPoints){
		for (let dot of points){
			dot.drawPoint(dt);
		}
	}
};
function Tick(){
	AudioAnalysis();

	pointTurningSpeed = (amplitude**2)/8;
	pointMovementSpeed = (frequency*amplitude**2)*5;

	Draw();
	window.requestAnimationFrame(Tick);
}





// Handle resize event
canvas.resize = function(){
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	cHW = canvasWidth/2;
	cHH = canvasHeight/2;

	let population = Math.floor(canvas.width * canvas.height * pointDensity);
	// let population = 10;
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