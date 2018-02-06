const math = require('./math.js');
let highlight = {
  typ: [
    'function ', 'func ', 'def ',
    'var ', 'let '
  ],
  kwd: [
    'define ', 'const ',
    'return ', 'return;', 'yeild ', 'yeild;',
    'if', 'else', 'elif', 'end', 'for',
    'break', 'continue',
    ' in ', ' is ', ' not ',
    'select ', 'from ', 'where ', 'orderby ', 'join ',
    'import ',
    '=', '+', '/ ', '%', '*', ' - ', ' & ', '|',
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
  input = input.slice(i+1);

  if (type == '' || type == 'plain'){
    let res = input.replace(/</g, '&lt').replace(/>/g, '&gt') // Encode <, >
      .replace(/\n/g, '<br>').replace(/ /g, '&nbsp').replace(/\t/g, '&nbsp&nbsp'); // Encode tabs and spaces

    return `<code>${res}</code>`
  }else if (type == 'math'){
    return '<code type="eq">'+math.encode(input.replace(/</g, '&lt').replace(/>/g, '&gt'))+'</code>';
  }

  let res = input.slice(i+1, -1)
    .replace(/</g, '&lt').replace(/>/g, '&gt') // Encode <, >
    .replace(/\n/g, '<br>').replace(/ /g, '&nbsp').replace(/\t/g, '&nbsp&nbsp'); // Encode tabs and spaces
  let j;

  loop:
  for (i=0; i<res.length; i++){
    // Color single line comments
    if (res[i] == '/' && res[i+1] == '/'){
      
      scan:
      for (j=i; j<res.length; j++){
        if (res[j] === '<' && res[j+1] == 'b' && res[j+2] == 'r' && res[j+3] == '>'){
          break scan;
        }
      }

      let insert = `<span class="com">${res.slice(i,j)}</span>`;
      res = res.slice(0, i) + insert + res.slice(j);

      i += insert.length-1; //Don't scan within the comment
      continue loop;
    }

    // Color multi line comments
    if (res[i] == '/' && res[i+1] == '*'){

      scan:
      for (j=i; j<res.length; j++){
        if (res[j] == '*' && res[j+1] == '/'){
          j += 2;
          break scan;
        }
      }

      let insert = `<span class="com">${res.slice(i, j)}</span>`;
      res = res.slice(0, i) + insert + res.slice(j);

      i += insert.length-1; //Don't scan within the comment
      continue loop;
    }



    // Color specific words
    type:
    for (let type in highlight){
      word:
      for (let word of highlight[type]){
        word = word.toLowerCase().replace(/ /g, '&nbsp');

        // If the word is too long for the remaining scan, don't check it
        if (i+word.length >= res.length){
          continue word;
        }

        scan:
        for (j=0; j<word.length; j++){
          if (res[i+j].toLowerCase() != word[j]){
            continue word;
          }
        }

        // Word passed scan
        let insert = `<span class="${type}">${res.slice(i, i+j)}</span>`;
        res = res.slice(0, i) + insert + res.slice(i+j);

        i += insert.length - j; //Do not scan the new content
        continue loop;
      }
    }
  }

  return `<code>${res}</code>`;
}

module.exports = {
  encode
};
