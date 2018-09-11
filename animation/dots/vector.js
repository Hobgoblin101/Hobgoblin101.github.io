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