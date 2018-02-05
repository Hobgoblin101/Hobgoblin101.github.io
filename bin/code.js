let highlight = {
  typ: [
    'function', 'func', 'def',
    'var', 'let'
  ],
  kwd: [
    'define',
    'const',
    'return',
    'if', 'else', 'elif',
    'end',
    'break',
    'continue',
    'in',
    'select',
    'from',
    'import',
    'join',
    '=', '+', '/ ', '%', ' - ', ' & ', '|',
    '&gt', '&lt' //'<', '>'
  ],
  lit: [
    '\\',
    'true', 'false',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  ]
}

function encode(input){
  let i = input.indexOf('\n') || 0;
  let type = input.slice(0, i);

  input = input.slice(i+1, -1).replace(/</g, '&lt').replace(/>/g, '&gt').replace(/\n/g, '<br>\n');
  res = input//.replace(/ /g, '&nbsp').replace(/\t/g, '&nbsp&nbsp');

  // Comment
  let escape = false;
  search:
  for (let i=0; i<res.length; i++){
    if (escape){
      if (res[i] == '>'){
        escape = false;
      }

      continue search;
    }else if (res[i] == '<'){
      escape = true;
      continue search;
    }

    if (res[i] === '/' && res[i+1] === '/'){
      let j = res.indexOf('\n');
      if (j == -1){
        j = res.length;
      }

      let insert = '<span class="com">'+ res.slice(i, j) +'</span>';
      res = res.slice(0, i) + insert +res.slice(j);
      i += insert.length;
    }
  }

  // Colour specific words
  type:
  for (let type in highlight){
    word:
    for (let word of highlight[type]){
      let escape = false;

      scan:
      for (i=0; i<res.length; i++){
        if (escape){
          if (res[i] == '>'){
            escape = false;
          }

          continue;
        }

        if (res[i] == '<'){
          escape = true;
          continue;
        }

        check:
        for (let j=0; j<word.length; j++){
          if (res[i+j].toLowerCase() != word[j].toLowerCase()){
            continue scan;
          }
        }

        // Check passed
        let insert = `<span class="${type}">${res.slice(i, i+word.length)}</span>`;
        res = res.slice(0, i) + insert + res.slice(i+word.length);
        i += insert.length-1;
      }
    }
  }


  // Fixed tabbing + spaces
  escape = false;
  search:
  for (let i=0; i<res.length; i++){
    if (escape){
      if (res[i] == '>'){
        escape = false;
      }

      continue search;
    }else if (res[i] == '<'){
      escape = true;
      continue search;
    }

    if (res[i] == ' '){
      res = res.slice(0, i) + '&nbsp' + res.slice(i+1);
      i += 4;
    }else if (res[i] == '\t'){
      res = res.slice(0, i) + '&nbsp&nbsp' + res.slice(i+1);
      i += 8;
    }
  }

  return res;
}

module.exports = {
  encode
};