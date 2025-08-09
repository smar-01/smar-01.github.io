async function main(){
  const resp = await fetch('projects.json');
  const data = await resp.json();

  document.getElementById('your-name').textContent = data.name || 'Your Name';

  const legend = document.getElementById('legend');
  const rings = data.categories.map((c,i)=>({...c, idx:i}));
  rings.forEach((r,i)=>{
    const el = document.createElement('div'); el.className='key';
    const dot = document.createElement('span'); dot.className='dot'; dot.style.background = colorFor(r.id);
    const label = document.createElement('span'); label.textContent = r.label;
    el.append(dot, label); legend.appendChild(el);
  });

  const canvas = document.getElementById('cosmic');
  const ctx = canvas.getContext('2d', { alpha: false });
  function resize(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); window.addEventListener('resize', resize);

  const nodes = data.projects.map((p, i)=> ({
    id: p.slug,
    title: p.title,
    categories: p.categories,
    url: `project.html?slug=${encodeURIComponent(p.slug)}`,
    angle: (i / data.projects.length) * Math.PI*2 + Math.random()*0.5,
    jitter: Math.random()*1000
  }));

  function colorFor(id){
    const i = rings.findIndex(r=>r.id===id);
    const palette = ['#4c78a8','#f58518','#54a24b','#e45756','#72b7b2','#b279a2','#ff9da6','#9d755d','#bab0ab'];
    return palette[(i>=0?i:0) % palette.length];
  }

  nodes.forEach(n=>{
    const primary = n.categories?.[0];
    n.color = colorFor(primary);
  });

  const plane = {
    cx: () => canvas.width / (window.devicePixelRatio||1) / 2,
    cy: () => canvas.height / (window.devicePixelRatio||1) / 2,
    rx: (k)=> (Math.min(canvas.width, canvas.height) / (window.devicePixelRatio||1)) * 0.18 * k,
    ry: (k)=> (Math.min(canvas.width, canvas.height) / (window.devicePixelRatio||1)) * 0.10 * k
  };

  function ringIndex(n){
    const primary = n.categories?.[0];
    const idx = rings.findIndex(r=>r.id===primary);
    return idx>=0 ? idx+1 : 1;
  }

  function place(n){
    const ring = ringIndex(n);
    const x = plane.cx() + plane.rx(ring) * Math.cos(n.angle);
    const y = plane.cy() + plane.ry(ring) * Math.sin(n.angle);
    return {x,y};
  }

  let hover = null;
  canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hover = hitTest(x,y);
    showTooltip(hover, x, y);
  });
  canvas.addEventListener('mouseleave', ()=>{ hover=null; hideTooltip(); });
  canvas.addEventListener('click', ()=>{
    if(hover){ window.location.href = hover.url; }
  });

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
    tip.style.left = x+'px';
    tip.style.top = y+'px';
    tip.style.display='block';
  }
  function hideTooltip(){ tip.style.display='none'; }

  let t0 = performance.now();
  function frame(t){
    t0 = t;
    render(t);
    requestAnimationFrame(frame);
  }

  function render(t){
    const w = canvas.width/(window.devicePixelRatio||1), h = canvas.height/(window.devicePixelRatio||1);
    ctx.clearRect(0,0,w,h);

    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ring') || '#e7e2db';
    ctx.lineWidth = 1;
    for(let k=1;k<=Math.max(1,rings.length);k++){
      ctx.beginPath();
      const rx = plane.rx(k), ry = plane.ry(k);
      ellipse(ctx, plane.cx(), plane.cy(), rx, ry);
      ctx.setLineDash([4,6]);
      ctx.stroke();
    }
    ctx.restore();

    for(const n of nodes){
      const p = place(n);
      const a = 0.75 + 0.25 * Math.sin((t*0.001) + n.jitter);
      const r = hover===n ? 4 : 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fillStyle = withAlpha(n.color, a);
      ctx.fill();
      if(hover===n){
        ctx.beginPath();
        ctx.arc(p.x, p.y, r+3, 0, Math.PI*2);
        ctx.strokeStyle = n.color; ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function ellipse(ctx, cx, cy, rx, ry){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    ctx.beginPath();
    ctx.arc(0,0,1,0,Math.PI*2);
    ctx.restore();
  }

  function withAlpha(hex, a){
    const c = hex.replace('#','');
    const bigint = parseInt(c,16);
    const r = (bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
    return `rgba(${r},${g},${b},${a})`;
  }

  requestAnimationFrame(frame);
}

main();
