window.addEventListener('load', ()=>{
	BuildPage();
});


async function BuildPage() {
	let id = window.location.search.slice(1);
	console.log('Loading...', id);

	let req = await fetch(`/post/${id}.md`);
	let raw = await req.text();


	// Metadata
	let i = raw.indexOf('---');
	let metaString = raw.slice(0, i-1).split('\n');
	let metadata = {};
	for (let element of metaString) {
		element = element.split(': ');
		metadata[element[0].toLowerCase()] = element[1];
	}
	metadata.tags = metadata.tags.split('; ');
	raw = raw.slice(i+5);

	// Description
	i = raw.indexOf('---');
	metadata.description = raw.slice(0, i-1);
	metadata.body = raw.slice(i+5);



	let target = document.getElementsByClassName('wrapper')[0];
	let html = `<h1>${metadata.title}</h1>`;
	html += Markdown.encode(metadata.body)
	html += '<span class="tags"><h6 style="display: inline-block;">Tags:</h6>';
	for (let tag of metadata.tags) {
		html += `<a href="/t/${tag}"><tag>${tag};</tag></a>`;
	}
	html += '</span>';

	target.innerHTML = html;

	// Update title
	document.title = metadata.title;

	// Jump to a given position
	let temp = location.hash;
	location.hash = "";
	location.hash = temp;

	setTimeout(BindLinks, 100);
};