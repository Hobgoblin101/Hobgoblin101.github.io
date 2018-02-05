let code = require('./code.js');

function Encode(input){
  input = input.replace(/\r\n/g, '\n');
  let count = 0;
  let res = '';
  let i = 0;

  outer:
  while (input.length > 0){
    switch (input[0]){
      case '#': // Title
        count = 0;
        i = 0;
        while (input[i] == '#'){
          count ++;
          i++;
        }
        let e = input.indexOf('\n');
        let title = input.slice(i+1, e);

        res += `</p><h${count}>${title}</h${count}><p>`;
        input = input.slice(e+1);

        break;
      case ' ': // New line
        if (input[1] == ' '){
          res += '<br>';
          input = input.slice(2);
        }else{
          res += input[0];
          input = input.slice(1);
        }

        break;
      case '*': // Bold / Italics
        let bold = input[1] === '*';
        i=0;

        if (bold){
          input = input.slice(2);
        }else{
          input = input.slice(1);
        }

        search:
        for (i=0; i<input.length; i++){
          if (input[i] == '\\'){
            i++;
            continue search;
          }

          if (input[i] === '*'){
            if (bold){
              if (input[i+1] === '*'){
                break;
              }else{
                continue search;
              }
            }else{
              break;
            }
          }
        }

        if (bold){
          res += '<b>'+Encode(input.slice(0,i))+'</b>';
          input = input.slice(i+2);
        }else{
          res += '<i>'+Encode(input.slice(0,i))+'</i>';
          input = input.slice(i+1);
        }

        break;
      case '~': // Strike Though
        if (input[1] == '~'){
          input = input.slice(2);
          i=0;

          search:
          for (i=0; i<input.length; i++){
            if (input[i] == '\\'){
              i++;
              continue search;
            }

            if (input[i] === '~'){
              if (input[i+1] === '~'){
                break search;
              }else{
                continue search;
              }
            }
          }

          res += '<del>'+Encode(input.slice(0,i))+'</del>';
          input = input.slice(i+2);
          break;
        }
      case '\n': // New Paragraph
        if (input[1] == '\n'){
          res += '</p><p>';
          input = input.slice(3);
        }else{
          res += input[0];
          input = input.slice(1);
        }

        break;
      case '[': // Link
        let a = input.indexOf(']');
        let b = input.indexOf('(');
        let c = input.indexOf(')');

        if (a == -1 || b > c){
          continue outer;
        }

        res += `<a href="${input.slice(b+1, c)}">${Encode(input.slice(1, a))}</a>`;
        input = input.slice(c+1);

        break;
      case '`':
        i = input.indexOf('```');
        if (i === 0){
          input = input.slice(3);
          i = input.indexOf('```');

          if (i > 0){
            res += `<code>${code.encode(input.slice(0, i))}</code>`;
            input = input.slice(i);
            break;
          }
        }
      default:
        res += input[0];
        input = input.slice(1);
    }
  }

  // fs.writeFileSync('./../p/'+path+'.html', res, 'utf8');
  return res;
}


module.exports = {
  encode: Encode
}