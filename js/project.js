async function main(){
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  const data = await (await fetch('projects.json')).json();
  const proj = data.projects.find(p => p.slug === slug) || data.projects[0];

  document.title = proj.title + ' — Project';
  document.getElementById('proj-title').textContent = proj.title;
  const gh = document.getElementById('github-link');
  gh.href = proj.github; gh.textContent = 'GitHub ↗';

  const chips = document.getElementById('chips');
  proj.categories.forEach(c => {
    const label = (data.categories.find(x=>x.id===c)||{label:c}).label;
    const el = document.createElement('span'); el.className='chip'; el.textContent = label;
    chips.appendChild(el);
  });

  const mdPath = proj.markdown;
  const raw = await (await fetch(mdPath)).text();

  // Render markdown to HTML
  marked.setOptions({
    highlight: (code, lang) => { try { return hljs.highlight(code, {language: lang}).value } catch(e){ return code; } }
  });
  const html = marked.parse(raw);
  const content = document.getElementById('content');
  content.innerHTML = html;

  // Build TOC from headings
  const toc = document.getElementById('toc');
  const headings = content.querySelectorAll('h1, h2, h3');
  if(headings.length){
    const h4 = document.createElement('h4'); h4.textContent = 'Chapters'; toc.appendChild(h4);
  }
  headings.forEach(h => {
    const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    h.id = id;
    const a = document.createElement('a');
    a.href = '#'+id;
    a.textContent = h.textContent;
    toc.appendChild(a);
  });

  // Active link highlight
  const links = toc.querySelectorAll('a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const id = e.target.id;
      const link = Array.from(links).find(a => a.getAttribute('href') === '#'+id);
      if(link) link.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin: '0px 0px -70% 0px', threshold: 0.0 });

  headings.forEach(h => observer.observe(h));
}

main();
