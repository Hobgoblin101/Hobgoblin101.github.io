const markdown = require('./markdown.js');
const fs = require('fs');

let header = fs.readFileSync('./../header.html').toString();
let footer = fs.readFileSync('./../footer.html').toString();

function Compile(article){
  let data = fs.readFileSync('./../post/'+article+'.md').toString();
  data = markdown.encode(data);

  data = `<head>${header}</head><body>${data}</body><footer>${footer}</footer>`;

  fs.writeFileSync('./../p/'+article+'.html', data, 'utf8');
}

Compile('example');