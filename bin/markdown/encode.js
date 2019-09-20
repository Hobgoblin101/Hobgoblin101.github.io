const fs = require('fs');

const code = require('./encoding/code.js');

const SYNTAX = JSON.parse(fs.readFileSync('./markdown/syntax.json', 'utf8'));
// const SYNTAX = JSON.parse(fs.readFileSync('./syntax.json', 'utf8'));

String.prototype.matchAt = function(phrase, offset){
	if (offset + phrase.length >= this.length){
		return false;
	}

	if (phrase == ""){
		return true;
	}

	for (let i=0; i<phrase.length; i++){
		if (phrase[i] != this[i+offset]){
			return false;
		}
	}

	return true;
}





// Fill in default values for the JSON to save time on data entry
for (let rule of SYNTAX.rules){
	if (!rule.start.pop){
		rule.start.pop = 0;
	}
	if (!rule.start.preamble){
		rule.start.preamble = "";
	}

	if (!rule.end.pop){
		rule.end.pop = 1;
	}
}




function Table(str){
	str = str.split('\n');

	let elements = [];
	let alignment = [];

	// Ingest element data and alignment
	let rowCount = 0;
	for (let row of str){
		row = row.split("|");

		// Trim off blank first and last elements
		let i = row[0] == "" ? 1 : 0;
		let j = row[row.length-1] == "" ? row.length-1 : row.length;
		row = row.slice(i, j);

		if (rowCount == 1){
			for (let align of row) {
				if (align[0] == ":" && align[align.length-1] == ":"){
					alignment.push("center");
				} else if (align[0] == ":") {
					alignment.push("left");
				} else if (align[align.length-1] == ":") {
					alignment.push("right");
				}
			}
		} else {
			elements.push(row);
		}

		rowCount++;
	}

	let output = "<table>";
	for (let row=0; row<elements.length; row++){
		output += "<tr>";

		let tag = row == 0 ? "th" : "td";

		for (let i=0; i<elements[row].length; i++){
			output += `<${tag} style="text-align: ${alignment[i] || "center"}">${Encode(elements[row][i], true)}</${tag}>`
		}

		output += "</tr>";
	}
	output += "</table>";

	return output;
}

function List (str){
	let output = "";
	let stack = [];

	str = str.split('\n');
	for (let line of str){
		let tab = 0;
		for (; tab < line.length && (line[tab] == "\t" || line[tab] == " "); tab++) {	}

		if (stack.length == 0 || stack[stack.length-1][0] < tab){  // Increase indent
			if        (line[tab] == "1") {
				output += "<ol>";
				stack.push([tab, "</ol>"]);
			} else if (line[tab] == "A") {
				output += "<ol type='A'>";
				stack.push([tab, "</ol>"]);
			} else if (line[tab] == "a") {
				output += "<ol type='a'>";
				stack.push([tab, "</ol>"]);
			} else if (line[tab] == "i") {
				output += "<ol type='i'>";
				stack.push([tab, "</ol>"]);
			} else if (line[tab] == "I") {
				output += "<ol type='I'>";
				stack.push([tab, "</ol>"]);
			} else {
				output += "<ul>";
				stack.push([tab, "</ul>"]);
			}
		} else if ( stack[stack.length-1][0] == tab ){             // Do no depth alterations
		} else {
			while ( stack[stack.length-1][0] > tab ){                // Decrease indent
				output += stack.pop()[1];
			}
		}

		let i = line.indexOf('.');
		if (i == -1){
			i = line.indexOf("*");
		}
		i++;
		output += `<li>${line.slice(i)}</li>`;
	}

	// Clear any remaining indentation
	while (stack.length > 0){
		output += stack.pop()[1];
	}

	return output;
}




function Encode(str, inline = false){
	str += " ";

	let output = "";
	let stack = [];


	function Pop(count){
		if (count == 0) {
			return [];
		} else if (count == -1){
			out = stack.reverse();
			stack = [];
			return out;
		}else {
			out = stack.slice(-1*count).reverse(); // Using slice then resize
			stack.length -= count;                 // for better performance
                                             // than splice
			return out;
		}
	}


	for (let i=0; i<str.length; i++){
		let matched = false;

		if (!inline && stack.length == 0){
			output += "<p>";
			stack.push('</p>');
		}

		// Special case
		//   list
		if (
			str.matchAt("\n1. ", i) || str.matchAt("\n* ", i ) ||
			str.matchAt("\ni. ", i) || str.matchAt("\nI. ", i) ||
			str.matchAt("\na. ", i) || str.matchAt("\nA. ", i)
		){
			// Search for the end of the list
			let j = i+1;
			for (; j < str.length && !(str.matchAt("\n\n", j)); j++){ }

			output += List(str.slice(i+1, j));

			matched = true;
			i = j+1;
		}

		// Special case
		//   Image/Link
		if (str[i] == "["){
			// Search for the closing braket
			let j = i + 1;
			for (; j < str.length && str[j] != "]"; j++){ }

			// Check this is actually an image
			if (str[j+1] == "("){
				// Search for the end bracket
				let k = j + 2;
				for (; k<str.length && str[k] != ")"; k++){ }

				let name = str.slice(i+1, j);
				let src = str.slice(j+2, k);

				if (str[i-1] === "!"){ // Image behaviour
					// remove the "!"
					output = output.slice(0, -1);

					output += `<img href="${src}" alt="${name}">`;
				} else {               // Link behaviour
					output += `<a href="${src}">${name}</a>`;
				}

				matched = true;
				i = k;
			}
		}

		// Special case
		//   Table
		if (str.matchAt("\n| ", i) /*&& str[i+2] != "|"*/){ // Don't miss call a spoiler tag
			// Find the end of the table
			let j = i + 1;
			for (; j < str.length && !str.matchAt("\n\n", j); j++){ }

			let table = str.slice(i+1, j-2);
			output += Table(table);

			matched = true;
			i = j+1;
		}

		if (!matched) {
			inner: for (let rule of SYNTAX.rules){
				if (
					( rule.start.newline == true && (str[i-1] != "\n" && i != 0) ) ||
					( str.matchAt(rule.start.match, i) == false      )
				){
					continue;
				}

				output += Pop(rule.start.pop).join("");
				output += rule.start.preamble.replace(/%index%/g, i);
				stack.push(rule.start.stack);

				// // Find the end of the match
				let noEnd = true;
				let j = i+rule.start.match.length;
				for (; j<str.length && noEnd; j++){
					if (str.matchAt(rule.end.match, j)){  // If the match spans till and end target
						noEnd = false;
					}
				}

				if (!noEnd){
					j--;
				}

				// Apply style to markdown elements inside eachother
				let inner = str.slice(
					i+rule.start.match.length,
					j
				);
				if (rule['inner-style'] !== false){
					inner = Encode(inner, true);
				} else if (rule.name == "code") {
					inner = code.encode(inner);
				}

				output += inner;
				output += Pop(rule.end.pop).join("");

				i = j + (rule.end.match.length-1);

				matched = true;
				break inner;
			}
		}

		if (matched == false){
			output += str[i];
		}
	}

	output += stack.join('\n');
	output = output.replace(/<p><\/p>/g, ""); // Remove some weird paragraphs
	output = output.replace(/<\/blockquote><blockquote>/g, "<br>"); // Continue block quotes
	return output;
}



// let html = Encode( fs.readFileSync('./test.md', 'utf8'), false );
// fs.writeFileSync('example.html', html);


module.exports = {
	encode: Encode
};
