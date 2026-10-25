// Entrances for the sub-pages: reveal each part once as it scrolls in. Content stays visible if this script never runs.
const targets = 'h2,.lede,.card,.steps div,.soon,details,.gallery img,.posters img,.calc,.result,form,.pk li';
document.querySelectorAll(targets).forEach((el, i) => { if (!el.classList.contains('rv')) { el.classList.add('rv'); el.style.setProperty('--d', (i % 4) * 70 + 'ms'); } });
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(el => io.observe(el));
