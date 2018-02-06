// res[r] = res.replace(/\*/g, '×').replace(/\//g, '÷');

/**
 * 
 * @param {string[]} opp Operation
 * @param {string[]} sect Section
 */
function encode(opp, sect){
  res = sect[0];

  work:
  for (let i=0; i<opp.length; i++){
    switch(opp[i]){
      case '^':
        res += `<span class="pow">${sect[i+1]}</span>`;
        continue work;
      case '/':
        res = `<span class="fract"><span class="top">${res}</span><span class="bot">${sect[i]}</span></span>`
        continue work;
    }
  }

  return res;
}

function split(input){
  let s = 0; // Start point
  let e = 0; // end point
  let d = 0; // Depth
  if (s === -1){
    s = 0;
  }

  let opp = [];
  let res = [];

  // Split into components
  scan:
  for (i=0; i<input.length; i++){
    console.log(i, d, `"${input[i]}"`);

    switch(input[i]){
      case '{':
        if (d == 0){
          s = i+1;
        }

        d += 1;
        continue scan;
      case '}':
        d -= 1;

        if (d == 0){
          e = i;
          let sect = input.slice(s, e);
          console.log(`parse "${sect}"`);
          res.push(sect);
          // res.push(split(sect));
          s = e + 1;
        }
        continue scan;
    }

    console.log('continued');

    if (d != 0){
      continue scan;
    }

    switch(input[i]){
      case '/':
        e = i;
        let sect = input.slice(s, e);
        s = e;

        opp.push('/')

        if (sect != '' && sect != ' '){
          res.push(sect);
        }

        continue scan;
      case '^':
        e = i;
        res.push(input.slice(s, e));
        s = e;
  
        opp.push('^');
        continue scan;
    }
  }

  console.log('end parse', input.slice(s));
  res.push(input.slice(s));

  console.log(opp, res);

  return encode(opp, res);
};

module.exports = {
  encode: (input)=>{
    console.log('start');
    input = input.split('\n');
    // for (let i=0; i<input.length; i++){
    //   input[i] = split(input[i]);
    // }

    input[0] = split(input[0]);

    return input.join('<br>');
  }
}