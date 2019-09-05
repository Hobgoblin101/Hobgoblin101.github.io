async function loadWasm(path, importObj) {
  const resp = await fetch(path);
  const buf = await resp.arrayBuffer();
  const module = await WebAssembly.compile(buf);
  return new WebAssembly.Instance(module, importObj);
}


const maxBoids = 500;
const maxBytes = (8*4 + maxBoids*4*8);
const maxPages = Math.ceil(maxBytes / (64*1024));
console.log (`Allocating: ${maxBytes}bytes, ${maxPages}`);
const memory = new WebAssembly.Memory({
	initial: maxPages,
	maximum: maxPages
});

const intData = new Int32Array(memory.buffer, 0);
const floatData = new Float32Array(memory.buffer, 0);

let WasmUpdate = null;
let WasmDraw = null;

let constants = 10;
intData  [0] = maxBoids;
intData  [1] = window.innerWidth;
intData  [2] = window.innerHeight;
floatData[3] = 0.5;
floatData[4] = 1.0;
floatData[5] = 0.2;
intData  [6] = 30000;
intData  [7] = intData[6]/1;
floatData[8] = 0.1;
floatData[9] = 0.005;

loadWasm('./bin/code.wasm', {
	env: {
		mem: memory,
		drawBoid: DrawBoid,
		drawConnection: DrawConnection,
		drawAim: DrawAim,
		header: constants*4,
		log: console.log
	}
}).then(instance => {
	WasmUpdate = instance.exports['update'];
	WasmDraw = instance.exports['draw'];
});



function UpdateBoidBounds(width, height){
	intData[1] = width;
	intData[2] = height;
}
function GetBoidPosition(id) {
	let i = constants + 4*id;

	return {
		x: intData[i],
		y: intData[i+1]
	};
}
function SetBoidPosition(id, x, y) {
	let i = constants + 4*id;
	intData[i]   = x;
	intData[i+1] = y;
	intData[i+2] = 0;
	intData[i+3] = 0;
}
function UpdateBoidCount (count) {
	intData[0] = count;

	for (let i=0; i<count; i++){
		SetBoidPosition(
			i,
			Math.random() * intData[1],
			Math.random() * intData[2]
		);
	}
}
function GetBoidCount() {
	return intData[0];
}
function WasmGetSpeeds(){
	return {mov: floatData[8], turn: floatData[9]};
}
function WasmSetSpeeds(mov, turn){
	floatData[8] = mov;
	floatData[9] = turn;
}
