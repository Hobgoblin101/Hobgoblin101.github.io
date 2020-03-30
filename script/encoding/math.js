Markdown.Math = {};
(function(){
	let special = '%^&*{}-=+/|=<>';


	trim = function(str){
		// Find the first non-whitespace character
		let i=0;
		for (; i<str.length; i++){
			if (str[i] == " " || str[i] == "\t" || str[i] == "\n" || str[i] == "\r"){
				continue;
			}

			break;
		}

		// Find the last non-whitespace character
		let j = str.length-1;
		for (; j>i; j--){
			if (str[j] == " " || str[j] == "\t" || str[j] == "\n" || str[j] == "\r"){
				continue;
			}

			break;
		}

		return str.slice(i, j+1);
	};


	let opperator = [
		'{', '}',
		'\\\\', "\\", 
		'<=', '>=',
		'>',  "<",
		'!=', ':=', "=",
		"+", "-",
		"/", "*",
		"&", "|",
		"^", 'sqrt'
	];
	function GetOpperatorID(str){
		search: for (let i=0; i<opperator.length; i++){

			for (let j=0; j<opperator[i].length; j++){
				if (j >= str.length){
					continue search;
				}

				if (str[j] != opperator[i][j]){
					continue search;
				}
			}
			return i;
		}

		return -1;
	}


	class Tokens{
		constructor(str){
			if (typeof(str) == "string"){
				this.t = [];

				// Split into tokens
				let forward = '';
				let l = 0;
				let oppID = -1;
				for (let i=0; i<str.length; i++){
					oppID = GetOpperatorID(str.slice(i, i+4));

					if (oppID != -1){
						forward = trim( str.slice(l, i) );
						if (forward.length > 0){
							this.t.push(forward);
						}
						this.t.push(opperator[oppID]);

						i += opperator[oppID].length -1;
						l = i+1;
					}
				}
				forward = trim( str.slice(l) );
				if (forward.length > 0){
					this.t.push(forward);
				}
			}else{
				this.t = str;
			}

			// Split tokens into sub-groups
			for (let i=0; i<this.t.length; i++){
				if (this.t[i] == "{"){
					let count = 1;
					let l=i+1;

					for (; l<this.t.length; l++){
						if (this.t[l] == "{"){
							count++;
						}else if (this.t[l] == "}"){
							count--;
						}

						if (count < 1){
							break;
						}
					}

					let forward = trim( this.t.slice(i+1, l) );
					this.t[i] = new Tokens(forward);
					this.t.splice(i+1, l-i);

				}
			}
		}

		toHTML(){
			let out = [];

			for (let i=0; i<this.t.length; i++){
				// Opperators
				if (this.t[i] == '+'){
					out.push(`<span class="opper">+</span>`);
					continue;
				}
				if (this.t[i] == '-'){
					out.push(`<span class="opper">-</span>`);
					continue;
				}
				if (this.t[i] == '*'){
					out.push(`<span class="opper">&times;</span>`);
					continue;
				}
				if (this.t[i] == '/'){
					out.push(`<span class="opper">&divide;</span>`);
					continue;
				}

				if (this.t[i] == '%'){
					out.push(`<span class="opper">%</span>`);
					continue;
				}
				if (this.t[i] == '&'){
					out.push(`<span class="opper">&amp;</span>`);
					continue;
				}
				if (this.t[i] == '|'){
					out.push(`<span class="opper">|</span>`);
					continue;
				}

				if (this.t[i] == '^'){
					// Consume the previous and next item
					let j = out.length-1;
					let prev = out.splice(j, 1)[0];
					let nxt = this.t[i+1];
					if (nxt instanceof Tokens){
						nxt = nxt.toHTML();
					}
					out.push(`<span class="power"><span class="base">${prev}</span><span class="exponent">${nxt}</span></span>`);
					i++;

					continue;
				}
				if (this.t[i] == '\\'){
					// Consume the previous and next item
					let j = out.length-1;
					let prev = out.splice(j, 1)[0];
					let nxt = this.t[i+1];
					if (nxt instanceof Tokens){
						nxt = nxt.toHTML();
					}
					out.push(`<span class="fraction"><span class="top">${prev}</span><span class="bottom">${nxt}</span></span>`);
					i++;

					continue;
				}
				if (this.t[i] == '\\\\'){
					// Consume the previous and next item
					let j = out.length-1;
					let prev = out.splice(j, 1)[0];
					let nxt = this.t[i+1];
					if (nxt instanceof Tokens){
						nxt = nxt.toHTML();
					}
					out.push(`<span class="fraction" w="t"><span class="top">${prev}</span><span class="bottom">${nxt}</span></span>`);
					i++;

					continue;
				}
				if (this.t[i] == "sqrt"){
					// Consume the previous and next item
					let j = out.length-1;
					let nxt = this.t[i+1];
					if (nxt instanceof Tokens){
						nxt = nxt.toHTML();
					}
					out.push(`<span class="fraction" w="t"><span class="top">${prev}</span><span class="bottom">${nxt}</span></span>`);
					i++;
					
					continue;
				}

				if (this.t[i] == '<='){
					out.push(`<span class="opper">&le;</span>`);
					continue;
				}
				if (this.t[i] == '>='){
					out.push(`<span class="opper">&ge;</span>`);
					continue;
				}
				if (this.t[i] == '<'){
					out.push(`<span class="opper>&lt;<span>`);
					continue;
				}
				if (this.t[i] == '>'){
					out.push(`<span class="opper">&gt;</span>`);
					continue;
				}

				if (this.t[i] == '='){
					out.push(`<span class="opper">=</span>`);
					continue;
				}
				if (this.t[i] == ':='){
					out.push(`<span class="opper">&asymp;</span>`);
					continue;
				}
				if (this.t[i] == '!='){
					out.push(`<span class="opper">&ne;</span>`);
					continue;
				}

				if (this.t[i] instanceof Tokens){
					out.push(this.t[i].toHTML());
					continue;
				}

				// out.push(`<span class="variable">${trim(this.t[i])}</span>`);
				out.push(`<span class="variable">${this.t[i]}</span>`);
			}

			return out.join('');
		}
	}


	function encode(line, nested=false){
		let r = new Tokens(line);
		return r.toHTML();
	}


	Markdown.Math.encode = function(input){
		input = input.split('\n').slice(0, -1);
		let res = '';

		for (let eq of input){
			res += `<span class="row">${encode(eq)}</span>`;
		}

		return res;
	}
})()