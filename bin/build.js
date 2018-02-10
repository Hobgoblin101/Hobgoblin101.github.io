const markdown = require('./markdown.js');
const fs = require('fs');

let header = fs.readFileSync('./../header.html').toString();
let head = fs.readFileSync('./../head.html').toString();
let footer = fs.readFileSync('./../footer.html').toString();

let metaData = [];
let tags = [];





function Compile(article){
  let data = fs.readFileSync('./../post/'+article+'.md').toString().replace(/\r\n/g, '\n');
  let blurb = '';
  let body = '';
  let meta = '';
  let a = 0;
  let b = 0;
  let i = metaData.length;

  // Find the Blog post data
  search: for (a=0; a<data.length; a++){
    if (data.slice(a, a+5) === '\n---\n'){
      break search;
    }
  }
  search: for (b=a+5; b<data.length; b++){
    if (data.slice(b, b+5) === '\n---\n'){
      break search;
    }
  }

  meta = data.slice(0, a).split('\n');
  blurb = data.slice(a+5, b);
  body = data.slice(b+5);

  metaData[i] = {};
  for (let entry of meta){
    entry = entry.split(': ');
    entry[0] = entry[0].toLowerCase();

    if (entry[0] == 'tags'){
      entry[1] = entry[1].split('; ');
      metaData[i][entry[0]] = entry[1];

      // Add tag to the list of tags
      for (let tag of entry[1]){
        if (tags.indexOf(tag) === -1){
          tags.push(tag);
        }
      }
    }else{
      metaData[i][entry[0]] = entry[1];
    }
  }


  body = `<h1>${metaData[i].title}</h1>`+markdown.encode(body);
  body += '<span class="tags"><h6 style="display: inline-block;">Tags:</h6>'
  for (tag of metaData[i].tags){
    body += `<a href="/t/${tag}.html"><tag>${tag};</tag></a>`;
  }
  body += '</span></article>';

  fs.writeFileSync(
    './../p/'+article+'.html',
    `<head><title>${metaData[i].title}</title>${head}</head><body>${header}${body}${footer}</body>`,
    'utf8'
  );

  if (metaData[i].unlisted && metaData[i].unlisted[0] == 't'){
    metaData.length = i; // remove this element
  }else{
    metaData[i].name = article;
    metaData[i].blurb = markdown.encode(blurb);
  }
}





function BuildIndexPage(){
  let body = '';

  body += '<div class="articles">'
  for (let entry of metaData){
    body += '<article>';

    body += `<a href="/p/${entry.name}.html"><h3>${entry.title}</h3></a>`;
    body += `<span class="date">${entry.date}</span>`;
    // body += `<span class="author">${entry.author}</span>`;
    body += `${entry.blurb}`;

    body += '<span class="tags">'
    for (tag of entry.tags){
      body += `<a href="/t/${tag}.html"><tag>${tag};</tag></a>`;
    }
    body += '</span></article>';
  }
  body += '</div>';

  fs.writeFileSync(
    './../index.html',
    `<head>${head}</head><body>${header}${body}${footer}</body>`,
    'utf8'
  );
}
function BuildIndexJSON(){
  fs.writeFileSync(
    './../index.json',
    JSON.stringify(metaData),
    'utf8'
  );
}
function BuildIndexRSS(){}
function BuildTagPage(tag){
  let body = '';
  body += '<h2>Tag: '+tag+'</h2>';

  body += '<div class="articles">'
  for (let entry of metaData){
    if (entry.tags.indexOf(tag) === -1){
      continue;
    }

    body += '<article>';

    body += `<a href="/p/${entry.name}.html"><h3>${entry.title}</h3></a>`;
    body += `<span class="date">${entry.date}</span>`;
    // body += `<span class="author">${entry.author}</span>`;
    body += `${entry.blurb}`;

    body += '<span class="tags">'
    for (let tag of entry.tags){
      body += `<a href="/t/${tag}.html"><tag>${tag};</tag></a>`;
    }
    body += '</span></article>';
  }
  body += '</div>';

  return fs.writeFileSync(
    `./../t/${tag}.html`,
    `<head>${head}</head><body>${header}${body}${footer}</body>`,
    'utf8'
  );
}





let files = fs.readdirSync('./../post/');
for (let file of files){
  Compile(file.slice(0, -3));
}

metaData = metaData.sort(function (a, b){
  // If one of the meta tags is missing their date field
  if (!a.date || !b.date){
    if (a.date){
      return -1;
    }else if (b.date){
      return 1;
    }
    
    return 0;
  }

  let c = a.date.split('/');
  let d = b.date.split('/');

  // If one of them has an invalid date
  if (d.length != 3){
    return -1;
  }else if (c.length != 3){
    return 1;
  }

  // Make the date values comparable
  c[0] = parseInt(c[0]);
  c[1] = parseInt(c[1]);
  c[2] = parseInt(c[2]);
  d[0] = parseInt(d[0]);
  d[1] = parseInt(d[1]);
  d[2] = parseInt(d[2]);

  // Match years
  if (c[2] > d[2]){
    return -1;
  }else if (c[2] < d[2]){
    return 1;
  }

  // Match months
  if (c[1] > d[1]){
    return -1;
  }else if (c[1] < d[1]){
    return 1;
  }

  // Match days
  if (c[0] > d[0]){
    return -1;
  }else if (c[0] < d[0]){
    return 1;
  }

  return 0;
});
BuildIndexJSON();
BuildIndexPage();
for (let tag of tags){
  BuildTagPage(tag);
}