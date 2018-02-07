function encode(input){
  let insert = '';
  let dep = 0; // Depth
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  
  scan:
  for (let i=0; i<input.length; i++){
    // Only work at the current depth
    switch (input[i]){
      case '(':
        dep += 1;
        continue scan;
      case ')':
        dep -= 1;
        continue scan;
    }

    if (dep !== 0){
      continue scan;
    }

    switch (input[i]){
      case '\\':

        // End the end of the numerator
        search:
        for (b=i; b>0; b--){
          if (input[b] == ')'){
            break search;
          }
        }

        // Find the beginning of the numerator
        dep = 0;
        search:
        for (a=b; a>0; a--){
          if (input[a] == ')'){
            dep += 1;
          }

          if (input[a] == '('){
            dep -= 1;

            if (dep === 0){
              break search;
            }
          }
        }

        // Find the beginning of the denominator
        search:
        for (c=i; c<input.length; c++){
          if (input[c] == '('){
            break search;
          }
        }

        // Find the end of the denominator
        dep = 0;
        search:
        for (d=c; d<input.length; d++){
          if (input[d] == '('){
            dep += 1;
          }else if (input[d] == ')'){
            dep -= 1;

            if (dep === 0){
              break search;
            }
          }
        }

        a += 1;
        c += 1;

        insert = `<span class="fract"><span class="top">${encode(input.slice(a, b))}</span><span class="bot">${encode(input.slice(c, d))}</span></span>`;
        input = input.slice(0, a-1) + insert + input.slice(d+1);
        i = a + insert.length-2;

        continue scan;
    
      case '^':
        // End the end of the numerator
        search:
        for (b=i; b>0; b--){
          if (input[b] == ')'){
            break search;
          }
        }

        // Find the beginning of the numerator
        dep = 0;
        search:
        for (a=b; a>0; a--){
          if (input[a] == ')'){
            dep += 1;
          }

          if (input[a] == '('){
            dep -= 1;

            if (dep === 0){
              break search;
            }
          }
        }

        // Find the beginning of the denominator
        search:
        for (c=i; c<input.length; c++){
          if (input[c] == '('){
            break search;
          }
        }

        // Find the end of the denominator
        dep = 0;
        search:
        for (d=c; d<input.length; d++){
          if (input[d] == '('){
            dep += 1;
          }else if (input[d] == ')'){
            dep -= 1;

            if (dep === 0){
              break search;
            }
          }
        }

        a += 1;
        c += 1;

        insert = `<span class="pow"><span class="base">${encode(input.slice(a, b))}</span><span class="exp">${encode(input.slice(c, d))}</span></span>`;
        input = input.slice(0, a-1) + insert + input.slice(d+1);
        i = a + insert.length-2;

        continue scan;    

      case '/':
        input = input.slice(0,i) + '<span class="opper">÷</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '*':
        input = input.slice(0,i) + '<span class="opper">×</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '+':
        input = input.slice(0,i) + '<span class="opper">+</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '-':
        input = input.slice(0,i) + '<span class="opper">-</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '%':
        input = input.slice(0,i) + '<span class="opper">%</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '&':
        input = input.slice(0,i) + '<span class="opper">&</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '=':
        input = input.slice(0,i) + '<span class="opper">÷</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '!':
        input = input.slice(0,i) + '<span class="opper">÷</span>' + input.slice(i+1);
        i += 27;
        continue scan;
      case '<':
        input = input.slice(0,i) + '<span class="opper">&gt</span>' + input.slice(i+1);
        i += 29;
        continue scan;
      case '>':
        input = input.slice(0,i) + '<span class="opper">&lt</span>' + input.slice(i+1);
        i += 29;
        continue scan;
      case ' ':
        input = input.slice(0, i) + input.slice(i+1);
        i--;
        continue;
    }

    // Must be a number / or algebra
    input = input.slice(0,i) + '<span class="char">'+input[i]+'</span>' + input.slice(i+1);
    i += 26;
    continue scan;
  }

  return input;
}

module.exports = {
  encode: (input)=>{
    input = input.split('\n');
    let res = '';

    for (let eq of input){
      res += `<span class="row">${encode(eq)}</span>`;
    }

    return res;
  }
}