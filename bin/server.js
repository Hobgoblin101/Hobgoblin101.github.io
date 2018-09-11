const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res)=>{
	if (req.url == '/'){
		req.url = '/index.html';
	}

	let path = './..'+req.url;

	fs.exists(path, (b)=>{
		if (!b){
			res.statusCode = 404;
			res.end('Invalid path: '+path);
			return;
		}

		res.setHeader('content-type', 'text/html; charset=utf-8');
		res.statusCode = 200;
		let s = fs.createReadStream(path);
		s.pipe(res);
		s.on('end', ()=>{
			s.close();
		});
	})
});

server.listen(8080, ()=>{
	console.log(`Server running at http://localhost:8080`);
})