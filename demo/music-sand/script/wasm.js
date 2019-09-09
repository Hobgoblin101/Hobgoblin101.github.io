async function loadWasm(path, importObj) {
  const resp = await fetch(path);
  const buf = await resp.arrayBuffer();
  const module = await WebAssembly.compile(buf);
  return new WebAssembly.Instance(module, importObj);
}


const memory = new WebAssembly.Memory({
	initial: 2,
	maximum: 2
});

/*-------------------------
	Settings
-------------------------*/
const iSettings = new Int32Array  (memory.buffer, 0, 8);
const fSettings = new Float32Array(memory.buffer, 0, 8);

// Load defaults
iSettings[0] = 0;      // particles
iSettings[1] = 0;      // canvas width
iSettings[2] = 0;      // canvas height
fSettings[3] = 1.2;    // avoid factor
iSettings[4] = 30000;  // avoid range^2
fSettings[5] = 0.1;   // movement speed
iSettings[6] = 16;     // frequencies count
iSettings[7] = Math.sqrt(iSettings[6]);

const freqData = new Uint8Array(memory.buffer,
	iSettings.byteLength, iSettings[6]
);
const posData  = new Int32Array(memory.buffer,
	freqData.byteOffset+freqData.byteLength
);

const viewPort = new Uint8Array(
	memory.buffer, 0,
	posData.byteOffset+posData.byteLength)


const allData = new Int32Array


let WasmUpdate = null;


function UpdateParticleBound(width, height){
	iSettings[1] = width;
	iSettings[2] = height;
}

function UpdateParticleCount(particles){
	let index = 0;

	iSettings[0] = particles;

	for (let i=0; i<particles; i++){
		if (randomStartPoint){
			posData[index+0] = Math.random()*iSettings[1];
			posData[index+1] = Math.random()*iSettings[2];
		}else{
			posData[index+0] = iSettings[1]/2;
			posData[index+1] = iSettings[2]/2;
		}

		index += 2;
	}
}




window.addEventListener('load', ()=>{
	loadWasm('./bin/code.wasm', {
		env: {
			mem: memory,

			// Data locations
			posHeader   : 0,
			posFreq     : freqData.byteOffset,
			posParticle : posData.byteOffset,

			// The size of a particle structure
			strucParticle: 8,

			log: console.log,
			DrawParticle: DrawParticle,

			sin: Math.sin,
			cos: Math.cos
		}
	}).then(instance => {
		WasmUpdate = instance.exports['update'];
	});
})
