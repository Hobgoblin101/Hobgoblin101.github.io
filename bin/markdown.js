'use strict';

let code = require('./code.js');

function encode(input,nested){
  var t = input.replace(/\r\n/g, '\n'); //Remove OS obscurities
  
  // Raised working values
  var insert = '';
  var count = 0;

  //Raised Pointers
  var a=0;
  var b=0;
  var c=0;
  var d=0;

  scan:
  for (let i=0; i<t.length; i++){
    // Title
    if (t[i] == '#'){
      
      // Find the number of #s in a row
      search:
      for (a=i+1; a<t.length; a++){
        if (t[a] != '#'){
          break search;
        }
      }

      // Valid header tags end with a space
      if (t[a] == ' '){
        count = a-i;

        // Find the end of the line
        search:
        for (b=a+1; b<t.length; b++){
          if (t[b] == '\n'){
            break search;
          }
        }

        insert = `</p><h${count}>${encode(t.slice(a+1, b), true)}</h${count}><p>`;
        t = t.slice(0, i) + insert + t.slice(b);
        i += insert.length-1; // Do not rescan the data

        continue scan;
      }
    }
    
    // New Paragraph
    if (i > 1 && t.slice(i, i+2) == '\n\n'){
      t = t.slice(0, i) + '</p><p>' + t.slice(i+1);
      i += 6; //insert.length - 1

      continue scan;
    }
    
    // New Line
    if (t.slice(i, i+3) == '  \n'){
      insert = '<br>';
      t = t.slice(0, i) + insert + t.slice(i+2);
      i += insert.length-1;  // Do not rescan the data

      continue scan;
    }
    
    // Bold
    if (t.slice(i, i+2) == '**'){
      a = i+2;

      // Find the end of the tag (only consuping the last of a set of ***s)
      let found = false;
      search:
      for (b=a; b<t.length; b++){
        if (found && t[b+1] != '*'){
          b -= 1;
          break search;
        }

        if (t[b] == '\n'){ // Invalid Bolding
          b = -1;
          break search;
        }else if (t[b] == '*' && t[b+1] == '*'){
          found = true;
        }
      }

      // Valid bolding
      if (b != -1){
        insert = `<b>${encode(t.slice(a, b), true)}</b>`;
        t = t.slice(0, i) + insert + t.slice(b+2);
        i += insert.length-1;  // Do not rescan the data

        continue scan;
      }
    }

    // Italics
    if (t[i] == '*'){
      a = i+1;

      // Find the end of the tag
      search:
      for (b=a+1; b<t.length; b++){
        if(t[b] == '\n'){ // Invalid Italics
          b = -1;
          break search;
        }else if (t[b] == '*'){
          break search;
        }
      }

      // Valid Italics
      if (b != -1){
        insert = `<i>${encode(t.slice(a, b), true)}</i>`;
        t = t.slice(0, i) + insert + t.slice(b+1);
        i += insert.length-1;  // Do not rescan the data

        continue scan;
      }
    }

    // Strike Through
    if (t[i] == '~' && t[i] == '~'){
      a = i+1;

      search:
      for (b=a+1; b<t.length; b++){
        if(t[b] == '\n'){
          b = -1;
          break search;
        }else if (t[b] == '~' && t[b+1] == '~'){
          break search;
        }
      }

      // Valid strike though
      if (b != -1){
        insert = `<del>${encode(t.slice(a+1, b), true)}</del>`;
        t = t.slice(0, i) + insert + t.slice(b+2);
        i += insert.length-1;

        continue scan;
      }
    }

    // Section Break
    if (t.slice(i, i+5) == '\n---\n'){
      insert = `</p><break/><p>`;
      t = t.slice(0,i) + insert + t.slice(i+4);
      i += insert.length-1;

      continue scan;
    }

    // Link
    if (t[i] == '['){
      /*
        Find all key points (a,b,c,d)=>('[',']','(',')')
        Invalid link if it is not all on this line
      */
      a = i;

      search:
      for (b=a; b<t.length; b++){
        if (t[b] == ']'){
          break search;
        }else if (t[b] == '\n'){
          b = -1;
          break;
        }
      }

      c = -1;
      if (t[b+1] == '('){
        c = b+1;
      }

      if (b != -1 && c != -1){

        search:
        for (d=c; d<t.length; d++){
          if (t[d] == ')'){
            break search;
          }else if (t[d] == '\n'){
            d = -1;
            break search;
          }
        }

        if (d != -1){
          insert = `<a href="${t.slice(c+1, d)}">${encode(t.slice(a+1,b), true)}</a>`;
          t = t.slice(0, i) + insert + t.slice(d+1);
          i += insert.length;

          continue scan;
        }
      }
    }

    // Image
    if (t[i] == '!' && t[i+1] == '['){
      /*
        Find all key points (a,b,c,d)=>('[',']','(',')')
        Invalid link if it is not all on this line
      */
      a = i+1;

      search:
      for (b=a; b<t.length; b++){
        if (t[b] == ']'){
          break search;
        }else if (t[b] == '\n'){
          b = -1;
          break;
        }
      }

      c = -1;
      if (t[b+1] == '('){
        c = b+1;
      }

      if (b != -1 && c != -1){

        search:
        for (d=c; d<t.length; d++){
          if (t[d] == ')'){
            break search;
          }else if (t[d] == '\n'){
            d = -1;
            break search;
          }
        }

        if (d != -1){
          insert = `<img href="${t.slice(c+1, d)}" alt="${t.slice(a+1,b)}" />`;
          t = t.slice(0, i) + insert + t.slice(d+1);
          i += insert.length;

          continue scan;
        }
      }
    }

    // Snippet
    if (t.slice(i, i+3) == '```'){
      a = i+3;

      // Find the end of the snippet
      search:
      for (b=a; b<t.length; b++){
        if (t.slice(b, b+3) === '```'){
          break search;
        }
      }

      insert = code.encode(t.slice(a, b));
      t = t.slice(0, i) + insert + t.slice(b+3);
      i += insert.length-1;
    }
  }

  if (!nested){
    // Bake content into a paragraph
    t = '<p>'+t+'</p>';

    // If the input starts with a header causing a leading blank paragraph
    if (t.slice(0, 7) == '<p></p>'){
      t = t.slice(7);
    }
  }

  return t;
}


module.exports = {encode};