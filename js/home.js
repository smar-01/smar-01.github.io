document.addEventListener('DOMContentLoaded', () => main());

async function main(){
  const resp = await fetch('projects.json', { cache: 'no-store' });
  const data = await resp.json();

  // Header
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

  // Stage sizing
  const guides = document.getElementById('guides');
  const projects = document.getElementById('projects');
  const particlesDiv = document.getElementById('tsparticles');
  const gctx = guides.getContext('2d');
  const pctx = projects.getContext('2d');

  function sizeAll(){
    [guides, projects].forEach(cv => {
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.floor(cv.clientWidth * dpr);
      cv.height = Math.floor(cv.clientHeight * dpr);
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    });
    // particles container follows size via CSS (absolute inset:0)
    drawGuides();
  }
  sizeAll(); window.addEventListener('resize', sizeAll);

  // Guide rings (dashed ellipses)
  function drawGuides(){
    const w = guides.clientWidth, h = guides.clientHeight;
    gctx.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2;
    const maxR = Math.min(w,h);
    const rxBase = maxR*0.18, ryBase = maxR*0.10;
    gctx.save();
    gctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ring') || '#d8d2c9';
    gctx.setLineDash([5,7]);
    gctx.lineWidth = 1;
    for(let k=1;k<=Math.max(1,rings.length);k++){
      ellipse(gctx, cx, cy, rxBase*k, ryBase*k);
      gctx.stroke();
    }
    gctx.restore();
  }
  function ellipse(ctx, cx, cy, rx, ry){
    ctx.beginPath(); ctx.save(); ctx.translate(cx,cy); ctx.scale(rx,ry); ctx.arc(0,0,1,0,Math.PI*2); ctx.restore();
  }

  // Project dots — orbiting with trail on top canvas
  const nodes = data.projects.map((p, i)=> ({
    id: p.slug,
    title: p.title,
    url: `project.html?slug=${encodeURIComponent(p.slug)}`,
    categories: p.categories,
    color: colorFor(p.categories?.[0]),
    angle: (i / data.projects.length) * Math.PI*2,
    speed: 0.12 + Math.random()*0.08, // radians/sec scaled by ellipse
  }));

  function plane(){
    const w = projects.clientWidth, h = projects.clientHeight;
    const maxR = Math.min(w,h);
    return {
      cx: w/2, cy: h/2,
      rx: k => maxR*0.18*k,
      ry: k => maxR*0.10*k
    };
  }
  function ringIndex(n){
    const idx = rings.findIndex(r=>r.id===(n.categories?.[0]));
    return idx>=0 ? idx+1 : 1;
  }
  function pos(n, t){
    const pl = plane();
    const ring = ringIndex(n);
    const a = n.angle + t * (n.speed * (0.08 + ring*0.04)); // slower outer rings
    return {
      x: pl.cx + pl.rx(ring) * Math.cos(a),
      y: pl.cy + pl.ry(ring) * Math.sin(a)
    };
  }

  // Trail effect: paint a translucent rect each frame so trails linger
  // "medium intensity, long linger": low alpha clear
  const fadeAlpha = 0.06; // smaller -> longer trails
  let tStart = performance.now();
  let hover = null;

  projects.addEventListener('mousemove', e=>{
    const rect = projects.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    hover = hit(x,y);
    showTooltip(hover, x, y);
  });
  projects.addEventListener('mouseleave', ()=>{ hover=null; hideTooltip(); });
  projects.addEventListener('click', ()=>{ if(hover) location.href = hover.url; });

  function hit(x,y){
    for(const n of nodes){
      const p = pos(n, (performance.now()-tStart)/1000);
      const dx = x-p.x, dy=y-p.y;
      if(dx*dx+dy*dy<=10*10) return n;
    }
    return null;
  }
  const tip = document.getElementById('tooltip');
  function showTooltip(n,x,y){
    if(!n){ tip.style.display='none'; return; }
    tip.textContent = n.title; tip.style.left = x+'px'; tip.style.top = y+'px'; tip.style.display='block';
  }
  function hideTooltip(){ tip.style.display='none'; }

  function drawProjects(tMs){
    const t = (tMs - tStart)/1000;
    const w = projects.clientWidth, h = projects.clientHeight;
    // fade
    pctx.fillStyle = `rgba(247,245,242,${fadeAlpha})`; // bone bg
    pctx.fillRect(0,0,w,h);

    // draw dots
    for(const n of nodes){
      const p = pos(n,t);
      const r = (hover===n)? 4 : 3;
      pctx.beginPath(); pctx.arc(p.x,p.y,r,0,Math.PI*2);
      pctx.fillStyle = n.color; pctx.fill();
      if(hover===n){
        pctx.beginPath(); pctx.arc(p.x,p.y,r+3,0,Math.PI*2);
        pctx.strokeStyle = n.color; pctx.lineWidth = 1; pctx.stroke();
      }
    }
    requestAnimationFrame(drawProjects);
  }

  // Ambient layer with tsParticles
  const palette = ['#4c78a8','#f58518','#54a24b','#e45756','#72b7b2','#b279a2','#ff9da6','#9d755d','#bab0ab'];
  await tsParticles.load("tsparticles", {
    background: { color: { value: "#f7f5f2" } },
    fullScreen: { enable: false },
    detectRetina: true,
    fpsLimit: 60,
    particles: {
      number: { value: 100, density: { enable: true, area: 900 } },
      size: { value: { min: 1, max: 1.8 } },
      color: { value: "#9aa0a6" },
      opacity: { value: 0.5 },
      move: { enable: true, speed: 0.2, direction: "none", outModes: { default: "bounce" }, random: true, straight: false },
      links: { enable: true, distance: 110, opacity: 0.12, width: 1, color: "#8a8a8a" },
      shadow: { enable: false },
      shape: { type: "circle" },
      trail: { enable: true, length: 12, fill: { color: "#f7f5f2" } } // long linger, medium visibility
    },
    interactivity: {
      events: { onHover: { enable: false }, onClick: { enable: false }, resize: true }
    }
  });

  // kick off draw
  requestAnimationFrame(drawProjects);

  function colorFor(id){
    const i = rings.findIndex(r=>r.id===id);
    const palette = ['#4c78a8','#f58518','#54a24b','#e45756','#72b7b2','#b279a2','#ff9da6','#9d755d','#bab0ab'];
    return palette[(i>=0?i:0) % palette.length];
  }
}
