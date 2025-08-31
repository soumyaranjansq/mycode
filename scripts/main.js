(function() {
	const links = document.querySelectorAll('a[href^="#"]');
	for (const link of links) {
		link.addEventListener('click', (e) => {
			const targetId = link.getAttribute('href') || '';
			if (targetId.length > 1) {
				e.preventDefault();
				document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	}
})();

