let canvas = document.getElementById('heroBanner');
let ctx = canvas.getContext('2d');

let canvasWidth  = 500;
let canvasHeight = 500;
canvas.width = canvasWidth;
canvas.height = canvasHeight;


let dotColour = "#ff5c8d";
// let dotColour = "#c72160";



let pointMovementSpeed = 0.1;
let pointTurningSpeed = 0.4;
let varyMovement = true;
let density = 20000;



let flockRange = 30000;
let avoidRange = flockRange/3;
let randomStartPoint = true;
let points = [];

class Point{
	constructor(){
		if (randomStartPoint){
			this.position = new Vector(
				Math.random() * canvasWidth,
				Math.random() * canvasHeight
			);
		}else{
			this.position = new Vector(
				canvasWidth /2,
				canvasHeight/2
			);
		}

		this.direction = new Vector(
			Math.random()-0.5,
			Math.random()-0.5
		);
		this.direction.normalize();
	};

	update(dt){

		// Tend towards the centre of the group
		let avg = new Vector(0,0);
		let align = new Vector(0,0);
		let avoid = new Vector(0,0);
		let nxt = new Vector(0,0);
		let dist = 0;
		for (let other of points){
			if (other == this){
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
			}
			if (dist < flockRange){
				nxt.x = this.position.x - other.position.x;
				nxt.y = this.position.y - other.position.y;
				nxt.setMagnitude( flockRange - nxt.getMagnitude() );

				avoid.add(nxt);
			}
		}



		// Get the desired direction
		let aim = new Vector(0,0);
		avg.normalize();
		// avg.multiply(1);
		aim.add(avg);

		align.normalize();
		align.multiply(0.5);
		aim.add(align);

		avoid.normalize();
		// avoid.multiply(1);
		aim.add(avoid);

		aim.normalize();

		// Change the direction of the particle
		this.direction.x += aim.x*pointTurningSpeed*dt;
		this.direction.y += aim.y*pointTurningSpeed*dt;
		this.direction.normalize();

		// Move the particle in it's direction
		let mov = this.direction.clone();
		mov.multiply(dt * pointMovementSpeed);
		this.position.add(mov);

		// Wrap the screen
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
	};

	draw(){
		ctx.shadowBlur = 5;
		ctx.fillStyle = ctx.shadowColor = dotColour;
		ctx.beginPath();
		ctx.arc(
			this.position.x, this.position.y,
			4,
			0, 2*Math.PI
		);
		ctx.fill();
	}
};



let last = Date.now();

function Draw(){
	let now = Date.now();
	let dt = now-last;
	last = now;

	if (dt > 1000){
		console.log(dt);
		dt = 1;
	}


	// Vary speeds
	if (varyMovement){
		pointMovementSpeed += (Math.random() - 0.5)*dt*0.0001;
		pointMovementSpeed = Math.min(0.1, Math.max(pointMovementSpeed, -0.1));
		pointTurningSpeed  += (Math.random() - 0.5)*dt*0.0001;
		pointTurningSpeed = Math.min(0.01, Math.max(pointTurningSpeed, -0.01));
	}


	// Updates points
	for (let dot of points){
		dot.update(dt);
	}

	// Clear the view
	ctx.clearRect(0,0, canvas.width, canvas.height);

	// Draw conections
	ctx.shadowBlur = 1;
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = "#ff90bd";
	for (let dot of points){
		let count = 3;
		let dist = 0;

		for (let other of points){
			dist = (dot.position.x - other.position.x)**2 + (dot.position.y - other.position.y)**2;

			if (dist < flockRange){
				ctx.beginPath();
				ctx.moveTo(dot.position.x, dot.position.y);
				ctx.lineTo(other.position.x, other.position.y);
				ctx.stroke();

				count--;
				if (count < 1){
					break;
				}
			}
		}
	}

	// Draw each point
	for (let dot of points){
		dot.draw(dt);
	}

	window.requestAnimationFrame(Draw);
};
Draw();





// Handle resize event
canvas.resize = function(){
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	let population = Math.floor(canvas.width * canvas.height / density);
	if (population < points.length){
		points.length = population;
	}else{
		population -= points.length;
		while (population > 0){
			points.push(new Point());
			population--;
		}
	}
};
window.addEventListener('resize', canvas.resize);
canvas.resize();
