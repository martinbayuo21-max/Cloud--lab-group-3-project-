(() => {
	const links = document.querySelectorAll('.nav-link');
	const path = location.pathname.split('/').pop() || 'index.html';

	links.forEach((link) => {
		if (link.getAttribute('href') === path) {
			link.classList.add('active');
			link.setAttribute('aria-current', 'page');
		}
	});

	const toggle = document.querySelector('.nav-toggle');
	const nav = document.querySelector('.main-nav');

	if (toggle && nav) {
		toggle.addEventListener('click', () => {
			const expanded = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!expanded));
			nav.classList.toggle('open');
		});
	}

	const viewport = document.querySelector('[data-carousel-viewport]');
	const track = document.querySelector('[data-carousel-track]');
	const cards = Array.from(document.querySelectorAll('[data-carousel-card]'));
	const dotsContainer = document.querySelector('[data-carousel-dots]');
	const prevButton = document.querySelector('[data-carousel-prev]');
	const nextButton = document.querySelector('[data-carousel-next]');

	if (!viewport || !track || !cards.length || !dotsContainer) {
		return;
	}

	const dots = cards.map((_, index) => {
		const dot = document.createElement('button');
		dot.type = 'button';
		dot.className = 'carousel-dot';
		dot.setAttribute('aria-label', `Go to member ${index + 1}`);
		dot.addEventListener('click', () => scrollToCard(index));
		dotsContainer.appendChild(dot);
		return dot;
	});

	let activeIndex = 0;
	let scrollFrame = 0;

	function setActive(index) {
		const boundedIndex = Math.max(0, Math.min(index, cards.length - 1));
		activeIndex = boundedIndex;

		cards.forEach((card, cardIndex) => {
			card.classList.toggle('is-active', cardIndex === boundedIndex);
			card.setAttribute('aria-current', cardIndex === boundedIndex ? 'true' : 'false');
		});

		dots.forEach((dot, dotIndex) => {
			dot.classList.toggle('is-active', dotIndex === boundedIndex);
			dot.setAttribute('aria-current', dotIndex === boundedIndex ? 'true' : 'false');
		});
	}

	function getStepWidth() {
		const card = cards[0];
		const gap = parseFloat(getComputedStyle(track).gap || '0');
		return card.getBoundingClientRect().width + gap;
	}

	function scrollToCard(index) {
		const boundedIndex = Math.max(0, Math.min(index, cards.length - 1));
		const card = cards[boundedIndex];
		card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
		setActive(boundedIndex);
	}

	function syncFromScroll() {
		scrollFrame = 0;
		const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;

		let closestIndex = 0;
		let closestDistance = Infinity;

		cards.forEach((card, index) => {
			const cardCenter = card.offsetLeft + card.offsetWidth / 2;
			const distance = Math.abs(viewportCenter - cardCenter);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		if (closestIndex !== activeIndex) {
			setActive(closestIndex);
		}
	}

	viewport.addEventListener('scroll', () => {
		if (scrollFrame) {
			cancelAnimationFrame(scrollFrame);
		}
		scrollFrame = requestAnimationFrame(syncFromScroll);
	}, { passive: true });

	if (prevButton) {
		prevButton.addEventListener('click', () => scrollToCard(activeIndex - 1));
	}

	if (nextButton) {
		nextButton.addEventListener('click', () => scrollToCard(activeIndex + 1));
	}

	window.addEventListener('resize', () => {
		setActive(activeIndex);
	});

	setActive(0);
	requestAnimationFrame(() => scrollToCard(0));
})();
