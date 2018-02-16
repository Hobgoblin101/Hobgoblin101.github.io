const fs = require('fs');

let chars = 'abcdefghijklmnopqrstuvwxyz';

function encode(str){
  str = str.toLowerCase();
  let res = chars.indexOf(str[0])+1;

  if (res == 0){ //Includes bad characters
    return -1;
  }

  for (let i=1; i<str.length; i++){
    let j = chars.indexOf(str[i]);
    if (j == -1){ //Includes bad characters
      return -1;
    }

    res *= j+1;
  }

  return res;
}


let s = fs.createReadStream('data.txt');
let buff = '';
let collisions = 0;
let count = 0;

let largest = 0;

let found = {};

s.on('data', (c)=>{
  buff += c.toString().replace(/\r\n/g, '\n');  // Remove OS obscurities
  let words = buff.split('\n');      //split every new line

  while (words.length > 1){             // leave the last word incase it hasn't been fully read
    let word = words.splice(0, 1)[0];   // remove a word from the stack

    let i = encode(word.toLowerCase());
    if (i == -1){ // Don't count bad words
      continue;
    }

    if (i > largest){
      largest = i;
    }

    count += 1;
    if (found[i]){
      collisions += 1;
      continue;
    }

    found[i] = true;
  }

  buff = words[0]; // Add the left left over partial word into the buffer for the next chunk to complete
});
s.on('end', ()=>{
  console.log(`${collisions} collided of ${count}\n\t${collisions/count*100}%`);
  console.log(`Largest: ${largest}`);
})