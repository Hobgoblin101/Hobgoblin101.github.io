let points = [];

class Point{
	constructor(index){
		this.i = index;            // ID
		this.p = new Vector(0,0);  // position
		this.v = new Vector(0,0);  // velocity
		this.a = new Vector(0,0);  // acceleration
		this.r = 10;               // Area
		this.la = 0;               // Local amplitude

		if (randomStartPoint) {
			this.p.x = Math.random()*canvas.width;
			this.p.y = Math.random()*canvas.height;
		} else {
			this.p.x = canvas.width / 2;
			this.p.y = canvas.height / 2;
		}

		this.c = "hsl(0, 100%, 50%)";
	};
}

Point.prototype.update = function(dt){
	let vel2 = this.v.dist2();

	// Find amplitude lerping between indexes for a more accurate value
	let pos = new Vector(this.p.x-cHW, this.p.y-cHH);
	let i = Math.floor( pos.dist2() / (canvas.width*canvas.height) * frequencies.length );
	this.la = frequencies[i];
	this.c = "hsl("+ (this.la*360) +", 100%, 50%)";


	// Resize the particle acording to amplitude
	this.r = 5*this.la * pointScale;
	if (this.r <= 0){
		this.r = 0;
	}


	// Avoid other particles
	let avoid = new Vector(0,0);
	let t = new Vector(0,0);
	for (let other of points){
		if (other == this){
			continue;
		}

		// Distance between the sides of points
		t.x = (this.p.x - other.p.x - this.r - other.r);
		t.y = (this.p.y - other.p.y - this.r - other.r);
		let influence = 1 / t.dist2();
		t.setMagnitude( influence*influence );
		avoid.add(t);
	};
	avoid.setMagnitude(avoidStrength);
	if (!isFinite(avoid.x) || isNaN(avoid.x)){
		avoid.x = 0;
	}
	if (!isFinite(avoid.y) || isNaN(avoid.y)){
		avoid.y = 0;
	}

	let theta = this.la * 2 * Math.PI;
	let d = new Vector(
		Math.sin(theta),
		Math.cos(theta)
	);


	// let m = 0;
	// i++;
	// if (i < frequencies.length){
	// 	m = this.la - frequencies[i];
	// }
	// let theta = Math.atan(m);
	// let F = (Math.sin(theta) || 0) * 4;
	// let p = pos.clone();
	// 		p.setMagnitude(F);


	// Update acceleration
	this.a.add(avoid);
	this.a.add(d);
	this.a.setMagnitude(pointTurningSpeed*dt);


	// Update velocity
	this.v.x += this.a.x*dt || 0;
	this.v.y += this.a.y*dt || 0;
	this.v.setMagnitude(pointMovementSpeed);

	// Update position
	this.p.x += this.v.x*dt || 0;
	this.p.y += this.v.y*dt || 0;

	// Bounce of edges of the screen
	if (this.p.x < 0){
		this.p.x += canvas.width;
	}
	if (this.p.y < 0){
		this.p.y += canvas.height;
	}
	if (this.p.x > canvas.width){
		this.p.x -= canvas.width;
	}
	if (this.p.y > canvas.height && this.v.y > 0){
		this.p.y -= canvas.height;
	}

	// Reset acceleration
	this.a.x = 0;
	this.a.y = 0;
};


Point.prototype.draw = function(){
	// ctx.shadowBlur = 50*amplitude;
	if (pointGlow) {
		ctx.shadowBlur  = this.r*1.5;
		ctx.shadowColor = this.c;
	} else {
		ctx.shadowBlur = 0;
	}

	ctx.strokeStyle = this.c;
	ctx.fillStyle   = this.c;
	ctx.beginPath();
	ctx.arc(
		this.p.x, this.p.y,
		this.r,
		0, 2*Math.PI
	);
	ctx.fill();
};