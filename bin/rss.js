function Generate(index){
	let res = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel>`;
	res += '<title>AJ Bilby\'s Blog</title>';
	res += '<link>https://hobgoblin101.github.io/</link>';
	res += `<lastBuildDate>${Date()}</lastBuildDate>`;

	for (let article of index){
		res += '<item>';

		res += '<title>'+article.title+'</title>';
		
		if (article.rawBlurb){
			res += '<description>'+article.rawBlurb.replace(/&/g, '&amp;')+'</description>';    
		}

		res += '<link>https://hobgoblin101.github.io/p/'+article.name+'</link>';

		let t = article.date.split('/');
		
		res += '<pubDate>'+new Date(parseInt(t[2]), parseInt(t[1])-1, parseInt(t[0])).toUTCString()+'</pubDate>'

		res += '</item>';
	}

	return res += '</channel></rss>';
}


module.exports = Generate