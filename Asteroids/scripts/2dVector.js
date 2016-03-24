console.debug("Running Vecotr Maths...");

function RotateVector(center, end, angle){
	var radians = (Math.PI / 180) * angle,
		cos = Math.cos(radians),
		sin = Math.sin(radians),
		nx = (cos * (end[0] - center[0])) + (sin * (end[1] = center[1])) + center[0],
		ny = (cos * (end[1] - center[1])) + (sin * (end[0] = center[0])) + center[1];
	return [nx, ny];
};

function Distance(start, end){
	var NewEnd = [
		(end[0] - start[0]),
		(end[1] - start[1])
	];
	var distance = Math.sqrt( (NewEnd[0] * NewEnd[0]) + (NewEnd[1] * NewEnd[1]) );

	return distance
};

function LookAtRotation(start, target){
	var angleDeg = Math.atan((target[0] - start[0]), (target[1] - start[1])) * 180 / Math.PI;

	return angleDeg
};

function rand(floor, ceil){
	return Math.floor( (Math.random() * (ceil-floor)) +floor);
};

function overlappingBox(location, startpoint, endpoint){
	if (location[0] > startpoint[0] &&
			location[1] > startpoint[1] &&
			location[0] < endpoint[0] &&
			location[1] < endpoint[1]){
				return true;
			}else{
				return false;
			}
};

function normalise(locaiton){
	var length = Math.sqrt((location[0] * location[0]) + (location[1] * location[1]));

	location[0] = location[0] / length;
	location[1] = location[1] / length;

	return location
};
