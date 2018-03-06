let letters = 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function isLetter(char){
  return letters.indexOf(char) != -1;
}


const math = require('./math.js');
let highlight = {
  typ: [ //Type definition
    'function ', 'func', 'def',
    'var', 'let', 'constructor',
    'indexOf', 'class'
  ],
  kwd: [ // Keywords
    'define', 'const', 'delete',
    'return', 'yeild',
    'if', 'else', 'elif', 'for',
    'continue', 'break',
    'in', 'of', 'is', 'not', 'and', 'or',
    'select', 'from', 'where', 'orderby', 'join',
    'import',
    '!', '=', '+', '/ ', '%', '*', '-', '&', '|',
    '&gt', '&lt', //'<', '>'
    'new'
  ],
  lit: [ // Literals
    '\\',
    'true', 'false',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  ],
  spe: [
    'this'
  ],
  cal: [
  ]
}

function encode(input){
  let i = input.indexOf('\n') || 0;
  let type = input.slice(0, i);
  input = input.slice(i+1);

  if (type == 'plain'){
    let res = input.replace(/</g, '&lt').replace(/>/g, '&gt') // Encode <, >
      .replace(/\n/g, '<br>').replace(/ /g, '&nbsp').replace(/\t/g, '&nbsp&nbsp'); // Encode tabs and spaces

    return `<code>${res}</code>`
  }else if (type == 'math'){
    return '<code type="eq">'+math.encode(input)+'</code>';
  }

  let res = input.slice(0, -1).replace(/</g, '&lt').replace(/>/g, '&gt') // Encode <, >
  let j;

  loop: for (i=0; i<res.length; i++){
    // Color single line comments
    if (res[i] == '/' && res[i+1] == '/'){
      
      scan: for (j=i+2; j<res.length; j++){
        if (res[j] === '\n'){
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

    // Highlight functions
    if (isLetter(res[i]) && (res[i-1] == undefined || !isLetter(res[i-1]))){
      scan: for (let j=i+1; j<res.length; j++){
        if (res[j] == '('){
          let insert = '<span class="cal">'+res.slice(i,j)+'</span>';
          res = res.slice(0, i) + insert + res.slice(j);
          i += insert.length-1;

          continue loop;
        }

        if (!isLetter(res[j])){
          break scan;
        }
      }
    }

    // Single quote string
    if (res[i] == "'"){
      scan: for(let j=i+1; j<res.length; j++){
        if (res[j] == '\n'){
          break scan;
        }

        if (res[j] == "'"){
          insert = '<span class="str">'+res.slice(i, j+1)+'</span>';
          res = res.slice(0,i)+insert+res.slice(j+1);
          i += insert.length;
          continue loop;
        }
      }
    }
    // Multi-lined string
    if (res[i] == "`"){
      scan: for(let j=i+1; j<res.length; j++){
        if (res[j] == "`"){
          insert = '<span class="str">'+res.slice(i, j+1)+'</span>';
          res = res.slice(0,i)+insert+res.slice(j+1);
          i += insert.length;
          continue loop;
        }
      }
    }
    // Double qoute string
    if (res[i] == '"'){
      scan: for(let j=i+1; j<res.length; j++){
        if (res[j] == '\n'){
          break scan;
        }

        if (res[j] == '"'){
          insert = '<span class="str">'+res.slice(i, j+1)+'</span>';
          res = res.slice(0,i)+insert+res.slice(j+1);
          i += insert.length;
          continue loop;
        }
      }
    }

    // Color specific words
    type: for (let type in highlight){
      word: for (let key of highlight[type]){
        key = key.toLowerCase();

        // If the word is too long for the remaining scan, don't check it
        if (i+key.length >= res.length){
          continue word;
        }

        let isWord = isLetter(key[0]);

        // If this is not the start of a word
        if (isWord && ( res[i-1]!=undefined && isLetter(res[i-1]) )){
          continue word;
        }
        scan: for (j=0; j<key.length; j++){
          if (res[i+j].toLowerCase() != key[j]){
            continue word;
          }
        }
        // If the end of this word isn't the end of the goal word
        if (isWord && (res[j+1]!=undefined && isLetter(res[i+j]))){
          continue word;
        }

        // Word passed scan
        let insert = `<span class="${type}">${res.slice(i, i+j)}</span>`;
        res = res.slice(0, i) + insert + res.slice(i+j);

        i += insert.length - j; //Do not scan the new content
        continue loop;
      }
    }
  }

  // Make spacing exact
  let escaping = false;
  scan: for (let i=0; i<res.length; i++){
    if (res[i] == '<'){
      escaping = true;
    }else if (res[i] == '>'){
      escaping = false;
    }

    if (escaping){
      continue scan;
    }

    if (res[i] == ' '){
      res = res.slice(0, i) + '&nbsp' + res.slice(i+1);
      i+= 4;
    }
  }

  res = res.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp&nbsp'); // Encode tabs and spaces
  return `<code>${res}</code>`;
}


module.exports = {
  encode
};
