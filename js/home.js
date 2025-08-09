async function main(){
  // No external packages. Pure HTML5 canvas + vanilla JS.
  let data;
  try {
    data = await (await fetch('projects.json', { cache: 'no-store' })).json();
  } catch (e) {
    console.warn('projects.json failed to load, using placeholders', e);
    data = {
      name: 'Your Name',
      categories: [{id:'a',label:'Category A'},{id:'b',label:'Category B'}],
      projects: [
        { title:'Sample 1', slug:'s1', categories:['a'] },
        { title:'Sample 2', slug:'s2', categories:['b'] }
      ]
    };
  }
  document.getElementById('your-name').textContent = data.name || 'Your Name';

  // Legend
  const legend = document.getElementById('legend');
  const rings = data.categories.map((c,i)=>({...c, idx:i}));
  rings.forEach((r,i)=>{
    const el = document.createElement('div'); el.className='key';
    const dot = document.createElement('span'); dot.className='dot'; dot.style.background = colorFor(r.id);
    const label = document.createElement('span'); label.textContent = r.label;
    el.append(dot, label); legend.appendChild(el);
  });

  // Canvas
  const canvas = document.getElementById('cosmic');
  const ctx = canvas.getContext('2d', { alpha: false });
  function sizeCanvas(){
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  sizeCanvas(); window.addEventListener('resize', sizeCanvas);

  // Nodes
  const nodes = (data.projects || []).map((p, i)=> ({
    id: p.slug || ('p'+i),
    title: p.title || 'Untitled',
    categories: p.categories || [],
    url: p.slug ? `project.html?slug=${encodeURIComponent(p.slug)}` : '#',
    angle: (i / Math.max(1,(data.projects||[]).length)) * Math.PI*2 + Math.random()*0.5,
    jitter: Math.random()*1000
  }));

  function colorFor(id){
    const i = rings.findIndex(r=>r.id===id);
    const palette = ['#2d5f9a','#d67118','#2f8a3e','#be3c3e','#4aa3a0','#8c5a8c','#cc6b75','#7a624e','#8b8f8f'];
    return palette[(i>=0?i:0) % palette.length];
  }

  nodes.forEach(n=> n.color = colorFor(n.categories?.[0]));

  // Plane geometry helpers
  const plane = {
    cx: () => canvas.clientWidth / 2,
    cy: () => canvas.clientHeight / 2,
    rx: (k)=> Math.min(canvas.clientWidth, canvas.clientHeight) * 0.18 * k,
    ry: (k)=> Math.min(canvas.clientWidth, canvas.clientHeight) * 0.10 * k
  };
  function ringIndex(n){
    const idx = rings.findIndex(r=>r.id===(n.categories?.[0]));
    return idx>=0 ? idx+1 : 1;
  }
  function place(n){
    const ring = ringIndex(n);
    return {
      x: plane.cx() + plane.rx(ring) * Math.cos(n.angle),
      y: plane.cy() + plane.ry(ring) * Math.sin(n.angle)
    };
  }

  // Interaction
  let hover = null;
  canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hover = hitTest(x,y);
    showTooltip(hover, x, y);
  });
  canvas.addEventListener('mouseleave', ()=>{ hover=null; hideTooltip(); });
  canvas.addEventListener('click', ()=>{ if(hover && hover.url!=='#') location.href = hover.url; });

  function hitTest(x,y){
    const r = 10;
    for(const n of nodes){
      const p = place(n);
      const dx = x - p.x, dy = y - p.y;
      if(dx*dx + dy*dy <= r*r) return n;
    }
    return null;
  }

  const tip = document.getElementById('tooltip');
  function showTooltip(n, x, y){
    if(!n){ tip.style.display='none'; return; }
    tip.textContent = n.title;
    tip.style.left = x+'px'; tip.style.top = y+'px'; tip.style.display='block';
  }
  function hideTooltip(){ tip.style.display='none'; }

  // Render
  function render(t){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);

    // dashed ellipses
    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ring') || '#dcd6cd';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,6]);
    for(let k=1;k<=Math.max(1,rings.length);k++){
      ellipse(ctx, plane.cx(), plane.cy(), plane.rx(k), plane.ry(k));
      ctx.stroke();
    }
    ctx.restore();

    // dots
    for(const n of nodes){
      const p = place(n);
      const a = 0.8 + 0.2 * Math.sin((t*0.001) + n.jitter);
      const r = hover===n ? 4 : 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fillStyle = withAlpha(n.color, a); ctx.fill();
      if(hover===n){
        ctx.beginPath(); ctx.arc(p.x, p.y, r+3, 0, Math.PI*2);
        ctx.strokeStyle = n.color; ctx.lineWidth = 1; ctx.stroke();
      }
    }

    requestAnimationFrame(render);
  }

  function ellipse(ctx, cx, cy, rx, ry){
    ctx.beginPath();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(rx, ry);
    ctx.arc(0,0,1,0,Math.PI*2);
    ctx.restore();
  }
  function withAlpha(hex, a){
    const c = hex.replace('#','');
    const bigint = parseInt(c,16);
    const r = (bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
    return `rgba(${r},${g},${b},${a})`;
  }

  requestAnimationFrame(render);
}

main();
