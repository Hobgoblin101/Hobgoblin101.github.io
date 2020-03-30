window.addEventListener('load', ()=>{
	function UpdateScroll(){
		if (document.body.scrollTop / window.innerHeight > 0.1){
			document.body.setAttribute('scrolled', true);
		}else{
			document.body.removeAttribute('scrolled');
		}
	}

	document.body.onscroll = UpdateScroll;
	UpdateScroll();
});

window.addEventListener('popstate', ()=>{
	BuildPage();
})

function BindLinks () {
	let links = document.getElementsByTagName('a');
	for (let link of links) {
		let path = link.href.split('/').slice(3).join('/');

		if (path.indexOf('p?') == 0) {
			link.addEventListener('click', ChangePage);
		}
	}
}

function ChangePage(evt) {
	evt.preventDefault();
	history.pushState({}, "Post - ", this.href);
	BuildPage();

	return false;
}