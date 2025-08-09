async function main(){
  const resp = await fetch('projects.json');
  const data = await resp.json();

  // Set header
  document.getElementById('your-name').textContent = data.name || 'Your Name';
  document.getElementById('tagline').textContent = data.tagline || 'Quant projects';

  const rings = data.categories.map((c, i) => ({...c, ring:i+1}));
  const nodes = data.projects.map((p, idx) => ({
    id: p.slug,
    name: p.title,
    categories: p.categories,
    group: p.categories[0] || 'misc', // primary category for color
    slug: p.slug
  }));

  // Build legend
  const legend = document.getElementById('legend');
  rings.forEach((r,i)=>{
    const el = document.createElement('div'); el.className='key';
    const dot = document.createElement('span'); dot.className='dot'; dot.style.background = colorFor(r.id);
    const label = document.createElement('span'); label.textContent = r.label;
    el.append(dot, label); legend.appendChild(el);
  });

  // 3D graph
  const elem = document.getElementById('graph');
  const Graph = ForceGraph3D()(elem)
    .graphData({ nodes, links: [] })
    .nodeAutoColorBy('group')
    .nodeLabel(n => n.name)
    .onNodeClick(n => { window.location.href = `project.html?slug=${encodeURIComponent(n.slug)}`; })
    .nodeThreeObjectExtend(true)
    .warmupTicks(0);

  // Place nodes on concentric rings by first category
  const ringRadius = 30; // spacing
  nodes.forEach((n, i) => {
    const primary = n.categories[0] || 'misc';
    const ringIndex = rings.findIndex(r => r.id === primary);
    const radius = (ringIndex+1) * ringRadius;
    const angle = (i / nodes.length) * Math.PI * 2 + Math.random()*0.5;
    n.fx = radius * Math.cos(angle);
    n.fy = (Math.random()-0.5) * 8; // small vertical jitter
    n.fz = radius * Math.sin(angle);
  });

  // helper color
  function colorFor(id){
    const i = rings.findIndex(r => r.id===id);
    const palette = ['#4c78a8','#f58518','#54a24b','#e45756','#72b7b2','#b279a2','#ff9da6','#9d755d','#bab0ab'];
    return palette[i % palette.length];
  }
}

main();
