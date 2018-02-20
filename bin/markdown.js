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

        insert = `</p><a name="${t.slice(a+1, b)}"><h${count}>${encode(t.slice(a+1, b), true)}</h${count}></a><p>`;
        t = t.slice(0, i) + insert + t.slice(b);
        i += insert.length-1; // Do not rescan the data

        continue scan;
      }
    }

    // New Line
    if (t.slice(i, i+3) == '  \n'){
      insert = '</br>';
      t = t.slice(0, i) + insert + t.slice(i+2);
      i += insert.length-1;  // Do not rescan the data

      continue scan;
    }

    // List
    if (t[i] == '\n' && (t.slice(i+1, i+3) == '* ' || t.slice(i+1, i+4) == '1. ')){
      a = i+1;

      search:
      for (b=a+1; b<t.length; b++){
        if (t[b] == '\n' && t[b+1] == '\n'){
          break search;
        }
      }

      insert = list(t.slice(a, b));
      t = t.slice(0, i) + insert + t.slice(b);
      i += insert.length-1;

      continue scan;
    }

    // Table
    if (t[i] == '\n' && t[i+1] == '|'){
      a = i+1;

      search:
      for (b=a; b<t.length; b++){
        if (t[b] == '\n' && t[b+1] == '\n'){
          break search;
        }
      }

      insert = table(t.slice(a, b));
      t = t.slice(0, i) + insert + t.slice(b);
      i += insert.length-1;
    }
    
    // New Paragraph
    if (i > 1 && t.slice(i, i+2) == '\n\n'){
      t = t.slice(0, i) + '</p><p>' + t.slice(i+1);
      i += 6; //insert.length - 1

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
      insert = `</p><break></break><p>`;
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
          i += insert.length-1;

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
          i += insert.length-1;

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

    // Inline Snippet
    if (t[i] == '`' && t[i+1] == '`' && t[i+2] != '`'){
      a = i+2;

      search:
      for (b=a+1; b<t.length; b++){
        // This type of snippet is single line only
        if (t[b] == '\n'){
          b = -1;
          break;
        }

        // Found the end tag
        if (t[b] == '`' && t[b+1] == '`' && t[b+2] != '`'){
          break;
        }
      }

      if (b != -1){
        insert = `<code inline="true">${t.slice(a, b)}</code>`;
        t = t.slice(0, i) + insert + t.slice(b+2);
        i += insert.length-1;

        continue scan;
      }
    }

    // Quote
    if (t.slice(i, i+3) == '\n> '){
      insert = '';
      a = i;

      while (t[a] == '\n' && t[a+1] == '>' && t[a+2] == ' '){
        search:
        for (b=a+3; b<t.length; b++){
          if (t[b] == '\n'){
            break search;
          }
        }

        insert += t.slice(a+3, b)+'\n';

        a = b;
      }

      insert = `</p><blockquote>${encode(insert)}</blockquote><p>`;
      t = t.slice(0,i) + insert + t.slice(b+1);
      i += insert.length-1;
    }
  }

  if (!nested){
    // Bake content into a paragraph
    t = '<p>'+t+'</p>';
  }

  return t.replace(/<p><\/p>/g, '').replace(/<p>\n<\/p>/g, ''); //Clean up any failed paragraphs
}





function list(t){
  t = t.split('\n');
  let d = [];

  // Split lines into their own depth
  scan:
  for (let i=0; i<t.length; i++){

    // Find the indentation
    search:
    for (var j=0; j<t[i].length; j++){
      if (t[i][j] != ' '){
        break search;
      }
    }

    // Reached the end of the row it must be invalid
    if (j == t[i].length){
      j == -1;
    }

    // It must be a continuation of the previous item
    if (j === -1){
      t[i-1] += '\n'+t[i];
      t.splice(i, 1);
      i--;
      continue scan;
    }

    // This item has it's own depth
    t[i] = t[i].slice(j); // Remove the leading spaces
    d[i] = j;
  }

  let comp = (item, depth)=>{
    let ordered = item[0][0] == '1';
    let d = depth[0];
    let res = '';

    scan:
    for (let i=0; i<item.length; i++){
      if (depth[i] == d){
        // Strip of the positional character (*, 1., 24.) and the trailing space
        search:
        for (var j=0; j<item[i].length; j++){
          if (item[i][j] == ' '){
            break search;
          }
        }
        j += 1;

        res += `<li>${encode(item[i].slice(j), true)}</li>`;
        continue scan;
      }

      // Otherwise this element but be out of the current depth
      // Find all elements at this depth
      search:
      for (var j=i+1; j<item.length; j++){
        if (depth[j] < depth[i]){
          break search;
        }
      }

      res += comp(item.slice(i, j), depth.slice(i, j));
      i = j-1; //Don't scan the nested values that were just compiled
    }

    if (ordered){
      return '<ol>'+res+'</ol>';
    }else{
      return '<ul>'+res+'</ul>';
    }
  }

  t = comp(t, d);

  return t;
}




function table(t){
  let item = t.split('\n');
  let res = '';

  // Split the items in to rows and columns
  for (let i=0; i<item.length; i++){
    item[i] = item[i].split('|');

    if (item[i][0] == ''){
      item[i].splice(0, 1);
    }
    if (item[i][item[i].length-1] == ''){
      item[i].splice(item[i].length-1, 1);
    }
  }


  // Strip trailing and leading spaces on items
  for (var y=0; y<item.length; y++){
    for (let x=0; x<item[y].length; x++){

      // Find start
      search:
      for (var a=0; a<item[y][x].length; a++){
        if (item[y][x][a] != ' '){
          break search;
        }
      }

      // Find end
      search:
      for (var b=item[y][x].length; b>=0; b--){
        if (item[y][x][b] != ' '){
          break search;
        }
      }

      item[y][x] = item[y][x].slice(a, b);
    }
  }


  // Setup alignment
  y=1;
  for (var x=0; x<item[y].length; x++){
    let align = 0;
    if (item[y][x][0] == ':'){
      align --;
    }
    if (item[y][x][item[y][x].length-1] == ':'){
      align += 1;
    }

    switch (align){
      case -1:
        item[y][x] = 'left';
        break;
      case 0:
        item[y][x] = 'center';
        break;
      case 1:
        item[y][x] = 'right';
        break;
    }

    
  }


  // Define table headers
  res += '<tr>';
  for (let x=0; x<item[0].length; x++){
    res += `<th>${item[0][x]}</th>`;
  }
  res += '</tr>';


  // Compile table data
  for (let y=2; y<item.length; y++){
    res += '<tr>';
    for (let x=0; x<item[y].length; x++){
      res += `<td style="text-align:${item[1][x]};">${encode(item[y][x], true)}</td>`;
    }
    res += '</tr>';
  }

  return `<table>${res}</table>`;
}




module.exports = {encode};