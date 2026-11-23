/* =====================================================================
   SamawatLab — Atlas Ilmu interaktif (bagan klik bertingkat)
   Bergantung pada: assets/atlas-data.js (ATLAS, REFDB, GLOSS, SYN)
   dan pembantu di index.html (F, UL, REFS, NOTE, CASES, TBL)
   ===================================================================== */
(function(){
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const slug=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/['’`]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const gnorm=s=>s.toLowerCase().replace(/['’`]/g,'').replace(/[^a-z0-9 ]/g,'');
const sn=s=>s.toLowerCase().replace(/['’`]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const uniq=(s,set)=>{let r=s,i=2;while(set.has(r))r=s+'-'+(i++);set.add(r);return r};
const DIFF={b:['Pemula',1],m:['Menengah',2],a:['Lanjut',3],r:['Riset',4]};
const dots=d=>{const n=DIFF[d][1];return `<span class="dots" title="Tingkat: ${DIFF[d][0]}" aria-label="Tingkat ${DIFF[d][0]}">${'●'.repeat(n)}${'○'.repeat(4-n)}</span> ${DIFF[d][0]}`};

/* ---------- indeks ---------- */
const AT={flat:[],occ:{}};
ATLAS.forEach(v=>{
  v.s=slug(v.t);v.kind='v';const cs=new Set();
  v.ch.forEach(c=>{
    c.s=uniq(slug(c.t),cs);c.v=v;c.kind='c';const ks=new Set();
    c.k=c.c.map((t,i)=>({t,s:uniq(slug(t),ks),c,v,kind:'k',g:GLOSS[gnorm(t)]||null,b:(c.b&&c.b[i])||''}));
    c.k.forEach((k,i)=>{k.i=i;const key=gnorm(k.t);(AT.occ[key]=AT.occ[key]||[]).push(k)});
  });
});
const hv=s=>ATLAS.find(v=>v.s===s);
const path=x=>x.kind==='v'?`#/atlas/${x.s}`:x.kind==='c'?`#/atlas/${x.v.s}/${x.s}`:`#/atlas/${x.v.s}/${x.c.s}/${x.s}`;
ATLAS.forEach(v=>{
  AT.flat.push({x:v,kind:'v',t:v.t,hay:sn(v.t+' '+v.sum),vol:v.n,d:'m'});
  v.ch.forEach(c=>{
    AT.flat.push({x:c,kind:'c',t:c.t,hay:sn(c.t+' '+c.sum+' '+v.t),vol:v.n,d:c.d});
    c.k.forEach(k=>AT.flat.push({x:k,kind:'k',t:k.t,hay:sn(k.t+' '+(k.g||'')+' '+c.t+' '+v.t),vol:v.n,d:c.d}));
  });
});

/* ---------- pencarian dengan sinonim ---------- */
const SYNG=SYN.map(g=>g.map(sn));
function expand(q){
  const nq=sn(q);const out=new Set([nq]);
  SYNG.forEach(g=>{ if(g.some(w=>w===nq||(w.length>3&&nq.includes(w))||(nq.length>3&&w.includes(nq)))) g.forEach(w=>out.add(w)); });
  return [...out];
}
function search(q,f){
  f=f||{};const nq=sn(q);if(!nq)return [];
  const terms=expand(q),toks=nq.split(' ');
  const res=[];
  for(const e of AT.flat){
    if(f.vol&&e.vol!==+f.vol)continue; if(f.d&&e.d!==f.d)continue;
    const tt=sn(e.t);let s=0;
    if(tt===nq)s=100;else if(tt.startsWith(nq))s=70;else if(tt.includes(nq))s=50;
    else if(toks.every(t=>tt.includes(t)))s=45;
    else if(terms.some(w=>w!==nq&&(tt===w||tt.includes(w))))s=35;
    else if(toks.every(t=>e.hay.includes(t)))s=15;
    else if(terms.some(w=>w!==nq&&e.hay.includes(w)))s=8;
    if(!s)continue;
    s+=e.kind==='v'?6:e.kind==='c'?3:0;
    res.push([s,e]);
  }
  res.sort((a,b)=>b[0]-a[0]||a[1].t.length-b[1].t.length);
  return res.map(r=>r[1]);
}
function ctx(e){return e.kind==='v'?'Volume':e.kind==='c'?`Bab · ${e.x.v.t}`:`Konsep · ${e.x.c.t}`}
function searchBox(){
  return `<div class="sbox"><div class="search"><input id="aq" type="search" autocomplete="off" placeholder="Cari topik, sinonim, atau istilah… (mis. sudut kiblat, fajar, hilal)" aria-label="Cari di Atlas Ilmu"></div>
  <div class="filters"><select id="af-v" aria-label="Filter volume"><option value="">Semua volume</option>${ATLAS.map(v=>`<option value="${v.n}">Vol ${v.n} · ${v.t}</option>`).join('')}</select>
  <select id="af-d" aria-label="Filter tingkat"><option value="">Semua tingkat</option>${Object.entries(DIFF).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('')}</select></div>
  <div id="ares" class="ares" role="listbox" aria-live="polite"></div></div>`;
}
function bindSearch(){
  const q=document.getElementById('aq');if(!q)return;
  const out=document.getElementById('ares'),fv=document.getElementById('af-v'),fd=document.getElementById('af-d');
  const sugg=['sudut kiblat','fajar','hilal','deklinasi','gerhana matahari','trigonometri bola','theodolit'];
  function run(){
    const v=q.value.trim();
    if(!v){out.innerHTML=`<p class="hint">Coba: ${sugg.map(s=>`<a href="#" data-s="${s}">${s}</a>`).join(' · ')}</p>`;return}
    const r=search(v,{vol:fv.value,d:fd.value});
    if(!r.length){out.innerHTML=`<p class="hint">Tidak ada hasil untuk “${esc(v)}”. Coba istilah lain (Indonesia atau Inggris), kurangi filter, atau jelajahi bagan di bawah.</p>`;return}
    out.innerHTML=r.slice(0,30).map(e=>`<a class="hit" role="option" href="${path(e.x)}"><b>${esc(e.t)}</b><span>${esc(ctx(e))}</span><i class="k-${e.kind}">${e.kind==='v'?'Volume':e.kind==='c'?'Bab':'Konsep'}</i></a>`).join('')+(r.length>30?`<p class="hint">+${r.length-30} hasil lain. Persempit pencarian.</p>`:'');
  }
  q.addEventListener('input',run);fv.addEventListener('change',run);fd.addEventListener('change',run);
  out.addEventListener('click',e=>{const a=e.target.closest('a[data-s]');if(a){e.preventDefault();q.value=a.dataset.s;run();q.focus()}});
  run();
}

/* ---------- bagan radial ---------- */
function ringPos(n){
  const p=[];
  if(n<=14){for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;p.push([50+41*Math.cos(a),50+38.5*Math.sin(a)])}return {p,rings:[[41,38.5]]}}
  const ni=Math.round(n*.38),no=n-ni;
  for(let i=0;i<no;i++){const a=-Math.PI/2+i*2*Math.PI/no;p.push([50+43*Math.cos(a),50+40*Math.sin(a)])}
  for(let i=0;i<ni;i++){const a=-Math.PI/2+Math.PI/ni+i*2*Math.PI/ni;p.push([50+23*Math.cos(a),50+22*Math.sin(a)])}
  return {p,rings:[[43,40],[23,22]]};
}
function mapHTML(hub,items,col,label){
  const {p,rings}=ringPos(items.length);
  const lines=items.map((it,i)=>`<line x1="50" y1="50" x2="${p[i][0].toFixed(2)}" y2="${p[i][1].toFixed(2)}" style="--c:${it.col||col}"/>`).join('');
  const guides=rings.map(r=>`<ellipse cx="50" cy="50" rx="${r[0]}" ry="${r[1]}"/>`).join('');
  const nodes=items.map((it,i)=>`<a class="node" href="${it.href}" style="left:${p[i][0].toFixed(2)}%;top:${p[i][1].toFixed(2)}%;--c:${it.col||col};--d:${40+i*30}ms" title="${esc(it.title||it.label)}">${it.tag?`<i>${it.tag}</i>`:''}<b>${it.label}</b>${it.sub?`<small>${it.sub}</small>`:''}</a>`).join('');
  return `<div class="map" role="navigation" aria-label="${esc(label||'Bagan konsep')}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g class="guides">${guides}</g>${lines}</svg><div class="hub" style="--c:${col}">${hub}</div>${nodes}</div>`;
}
function listHTML(items,col){
  return `<div class="mapgrid">${items.map(it=>`<a class="card mini" href="${it.href}" style="--c:${it.col||col}">${it.tag?`<span class="tag">${it.tag}</span>`:''}<h3>${it.label}</h3>${it.sub?`<p>${it.sub}</p>`:''}</a>`).join('')}</div>`;
}
function atwrap(hub,items,col,label){
  let v='map';try{v=localStorage.getItem('sl-view')||'map'}catch(e){}
  return `<div class="atwrap" data-view="${v}"><div class="vtoggle" role="group" aria-label="Tampilan"><button data-v="map" aria-pressed="${v==='map'}">◎ Bagan</button><button data-v="list" aria-pressed="${v==='list'}">☰ Daftar</button></div>${mapHTML(hub,items,col,label)}${listHTML(items,col)}</div>`;
}
function bindAtlas(){
  document.querySelectorAll('.atwrap').forEach(w=>{
    w.querySelectorAll('.vtoggle button').forEach(b=>b.addEventListener('click',()=>{
      w.dataset.view=b.dataset.v;try{localStorage.setItem('sl-view',b.dataset.v)}catch(e){}
      w.querySelectorAll('.vtoggle button').forEach(x=>x.setAttribute('aria-pressed',x===b));
    }));
  });
  bindSearch();
}

/* ---------- komponen halaman ---------- */
const enc=encodeURIComponent;
function searchLinks(q){
  const L=[['Google Scholar',`https://scholar.google.com/scholar?q=${enc(q)}`],['Semantic Scholar',`https://www.semanticscholar.org/search?q=${enc(q)}`],['arXiv',`https://arxiv.org/search/?query=${enc(q)}&searchtype=all`],['Garuda (jurnal Indonesia)',`https://garuda.kemdikbud.go.id/documents?q=${enc(q)}`],['Wikipedia ID',`https://id.wikipedia.org/w/index.php?search=${enc(q)}`],['Wikipedia EN',`https://en.wikipedia.org/w/index.php?search=${enc(q)}`],['HyperPhysics (via Google)',`https://www.google.com/search?q=${enc(q+' site:hyperphysics.phy-astr.gsu.edu')}`]];
  return `<div class="chips">${L.map(l=>`<a class="chip" href="${l[1]}" target="_blank" rel="noopener">${l[0]} ↗</a>`).join('')}</div>`;
}
const research=q=>`<p>Tautan di bawah membuka <b>hasil pencarian</b> untuk “${esc(q)}” di basis data pihak ketiga. Ini <u>bukan</u> sumber yang sudah diverifikasi SamawatLab; telaah dan sitasi langsung dari artikel aslinya.</p>${searchLinks(q)}`;
const STAT={kosong:['Kerangka kosong','st-0'],draft:['Draft','st-1'],review:['Dalam review','st-2'],verified:['Terverifikasi','st-3'],published:['Terbit','st-3'],'needs-update':['Perlu pembaruan','st-1']};
const statBadge=st=>{const x=STAT[st]||STAT.draft;return `<span class="stat ${x[1]}">${x[0]}</span>`};
const RELN={prerequisite:'Prasyarat',related:'Terkait',application:'Penerapan',mathematical_basis:'Dasar matematika',astronomical_basis:'Dasar astronomi',instrument:'Instrumen',historical_origin:'Asal sejarah',method:'Metode',problem:'Masalah',solution:'Solusi',advanced_topic:'Topik lanjutan',example:'Contoh'};
function relHTML(rel,vol){
  if(!rel||!rel.length)return '';
  return `<div class="rels">${rel.map(r=>{const x=window.atlasResolve(r[1],0);const lab=RELN[r[0]]||r[0];
    return x?`<a class="chip" href="${path(x)}"><small>${lab}</small> ${esc(r[1])}</a>`:`<span class="chip off" title="Belum ada entri dengan nama ini di atlas"><small>${lab}</small> ${esc(r[1])}</span>`}).join('')}</div>`;
}
const refList=keys=>REFS(keys.map(k=>REFDB[k]).filter(Boolean));
const draft=(extra)=>`<div class="note"><b>Status: Draft.</b> ${extra||'Ringkasan ini belum ditinjau editor.'} Bagian rumus, tanggal, dan kutipan sebaiknya diperiksa kembali pada rujukan di bawah sebelum dipakai untuk ibadah atau penelitian.</div>`;
function crumbs(parts){return parts.map((p,i)=>p[1]&&i<parts.length-1?`<a href="${p[1]}">${p[0]}</a>`:`<span>${p[0]}</span>`).join(' / ')}
function tocFor(secs,extra){return secs.map(s=>`<a href="#" data-sec="${s[0]}">${s[1]}</a>`).join('')+(extra||'')}
function pager(prev,next){
  return `<div class="pager">${prev?`<a class="btn" href="${path(prev)}">← ${prev.t}</a>`:'<span></span>'}${next?`<a class="btn" href="${path(next)}">${next.t} →</a>`:'<span></span>'}</div>`;
}
const volItem=v=>({label:v.t,tag:`Vol ${v.n}`,sub:`${v.ch.length} bab`,href:path(v),col:v.col,title:v.t});
const chItem=c=>({label:c.t,tag:`Bab ${c.n}`,sub:`${c.k.length} konsep`,href:path(c),col:c.v.col,title:c.t});
const kItem=(k,tag)=>({label:k.t,tag:tag||'',sub:k.g?'● ada definisi':'',href:path(k),col:k.v.col,title:k.t});
const hubImg=`<img src="assets/logo.png" alt="SamawatLab">`;
window.atlasHubImg=hubImg;

/* ---------- halaman: akar atlas ---------- */
function pageAtlasRoot(){
  const nCh=ATLAS.reduce((a,v)=>a+v.ch.length,0),nK=ATLAS.reduce((a,v)=>a+v.ch.reduce((b,c)=>b+c.k.length,0),0);
  const tree=ATLAS.map(v=>`<details><summary><a href="${path(v)}" style="color:${v.col}">Vol ${v.n} · ${v.t}</a></summary>${v.ch.map(c=>`<details class="sub"><summary><a href="${path(c)}">Bab ${c.n} · ${c.t}</a> <small>(${c.k.length})</small></summary><div class="chips">${c.k.map(k=>`<a class="chip" href="${path(k)}">${esc(k.t)}</a>`).join('')}</div></details>`).join('')}</details>`).join('');
  return `<section class="atl"><span class="tag b">Knowledge Atlas</span><h1>Atlas Ilmu SamawatLab</h1>
  <p class="sub">Klik sebuah volume untuk membuka bagan bab-babnya, klik bab untuk melihat bagan konsepnya, lalu klik konsep untuk membaca ringkasan, referensi, dan penelitian terkait. ${ATLAS.length} volume · ${nCh} bab · ${nK.toLocaleString('id-ID')} konsep.</p>
  ${searchBox()}
  ${atwrap(hubImg,ATLAS.map(volItem),'#8a5cf0','Bagan besar: 13 volume')}
  <div class="legend"><span><i style="background:#e3b95c"></i> Falak praktis</span><span><i style="background:#6fa0ff"></i> Astronomi</span><span><i style="background:#9b7bff"></i> Matematika</span><span><i style="background:#4fd1c5"></i> Instrumen &amp; komputasi</span><span><i style="background:#f0a35e"></i> Sejarah</span><span><i style="background:#ff6b83"></i> Observasi &amp; riset</span><span><i style="background:#c9e3a2"></i> Edukasi</span></div>
  <h2 class="sec">Indeks lengkap</h2><p class="sub">Seluruh hierarki dalam satu daftar, seperti indeks HyperPhysics.</p>
  <div class="tree">${tree}</div></section>`;
}

/* ---------- halaman: volume ---------- */
function pageVolume(v){
  const i=ATLAS.indexOf(v),prev=ATLAS[i-1],next=ATLAS[i+1];
  const secs=[
   ['bagan','Bagan bab',atwrap(`<b>Vol ${v.n}</b><small>${v.t}</small>`,v.ch.map(chItem),v.col,'Bagan bab '+v.t)],
   ['tentang','Tentang volume',`<p>${v.sum}</p>${draft('Daftar bab dan ringkasan mengikuti indeks pada dokumen skill SamawatLab.')}`],
   ['bab','Daftar bab',`<div class="grid">${v.ch.map(c=>`<a class="card" href="${path(c)}" style="border-left:3px solid ${v.col}"><span class="tag">Bab ${c.n}</span><h3>${c.t}</h3><p>${c.sum}</p><p style="margin-top:8px;font-size:.8rem">${dots(c.d)} · ${c.k.length} konsep</p></a>`).join('')}</div>`],
   ['penelitian','Penelitian &amp; bacaan lanjut',research(v.t)],
   ['ref','Referensi volume',refList(v.ref)]];
  const toc=tocFor(secs)+`<hr><h4>Volume</h4>`+ATLAS.map(x=>`<a href="${path(x)}" class="${x===v?'on':''}">${x.n}. ${x.t}</a>`).join('');
  const inner=`<span class="tag" style="color:${v.col};border-color:${v.col}">Volume ${v.n}</span><h1>${v.t}</h1><p class="lede">${v.sum}</p>`+secs.map(s=>`<section id="${s[0]}"><h2>${s[1]}</h2>${s[2]}</section>`).join('');
  return `<div class="layout"><aside class="toc"><h4>Di halaman ini</h4>${toc}</aside><article><div class="crumb">${crumbs([['Beranda','#/'],['Atlas Ilmu','#/atlas'],['Vol '+v.n+' · '+v.t]])}</div>${inner}${pager(prev,next)}</article></div>`;
}

/* ---------- halaman: bab ---------- */
function pageChapter(c){
  const v=c.v,i=v.ch.indexOf(c),prev=v.ch[i-1],next=v.ch[i+1];
  const keyTerms=c.k.filter(k=>k.g);
  const secs=[
   ['bagan','Bagan konsep',atwrap(`<b>Bab ${c.n}</b><small>${c.t}</small>`,c.k.map(k=>kItem(k)),v.col,'Bagan konsep '+c.t)],
   ['ringkasan','Ringkasan',`${c.md?`<p>${statBadge(c.md.st)}${c.md.by?` &nbsp; Penulis: ${esc(c.md.by)}`:''}${c.md.up?` &nbsp; Diperbarui: ${esc(c.md.up)}`:''}</p>`:''}<p>${c.sum}</p><p style="color:var(--mute);font-size:.9rem">Tingkat: ${dots(c.d)} &nbsp;·&nbsp; perkiraan bacaan ±${Math.round(3+c.k.length*.8)} menit &nbsp;·&nbsp; Volume: <a href="${path(v)}">${v.t}</a></p>${c.deep?`<a class="card" href="${c.deep[0]}" style="margin:12px 0"><span class="tag v">Artikel mendalam</span><h3>${c.deep[1]}</h3><p>Pembahasan lengkap dengan rumus, sejarah, penerapan, dan kasus (halaman terpisah di situs ini).</p></a>`:''}${c.md&&c.md.st!=='kosong'&&c.md.st!=='draft'?'':draft(c.md?'Isi bab ini masih draf penulis.':(c.deep?'Ringkasan bab ini dilengkapi artikel mendalam, yang juga masih berstatus draft.':'Artikel mendalam untuk bab ini belum ditulis; saat ini tersedia ringkasan, daftar konsep, dan rujukan.'))}`],
   ...((c.md&&c.md.secs)||[]).map(x=>['m-'+x[0],x[1]==='Ringkasan'?'Ikhtisar':x[1],x[2]]),
   ...(c.md&&c.md.rel&&c.md.rel.length?[['relasi','Relasi topik',relHTML(c.md.rel)]]:[]),
   ...(keyTerms.length?[['istilah','Istilah kunci',`<div class="people">${keyTerms.map(k=>`<a class="person" href="${path(k)}"><b>${esc(k.t)}</b><span>${k.g}</span></a>`).join('')}</div>`]]:[]),
   ['penelitian','Penelitian &amp; bacaan lanjut',research(c.t)],
   ['ref','Referensi',refList(c.ref)+(c.md&&c.md.ref?`<h3 style="margin:14px 0 6px;font-size:1rem">Referensi tambahan bab ini</h3><div class="mdref">${c.md.ref}</div>`:'')],
   ['terkait','Bab terkait',`<div class="chips">${v.ch.filter(x=>x!==c).map(x=>`<a class="chip" href="${path(x)}">Bab ${x.n} · ${x.t}</a>`).join('')}</div>`]];
  const toc=tocFor(secs)+`<hr><h4>Bab di volume ini</h4>`+v.ch.map(x=>`<a href="${path(x)}" class="${x===c?'on':''}">${x.n}. ${x.t}</a>`).join('');
  const inner=`<span class="tag" style="color:${v.col};border-color:${v.col}">Bab ${c.n}</span><h1>${c.t}</h1><p class="lede">${c.sum}</p>`+secs.map(s=>`<section id="${s[0]}"><h2>${s[1]}</h2>${s[2]}</section>`).join('');
  return `<div class="layout"><aside class="toc"><h4>Di halaman ini</h4>${toc}</aside><article><div class="crumb">${crumbs([['Beranda','#/'],['Atlas Ilmu','#/atlas'],['Vol '+v.n+' · '+v.t,path(v)],['Bab '+c.n+' · '+c.t]])}</div>${inner}${pager(prev,next)}</article></div>`;
}

/* ---------- halaman: konsep ---------- */
function pageConcept(k){
  const c=k.c,v=k.v,sib=c.k,i=k.i,prev=sib[i-1],next=sib[i+1];
  const same=(AT.occ[gnorm(k.t)]||[]).filter(x=>x!==k);
  const near=[sib[i-2],sib[i-1],sib[i+1],sib[i+2]].filter(Boolean);
  const items=[{label:c.t,tag:'Bab induk',href:path(c),col:v.col,title:c.t},
    ...same.slice(0,5).map(x=>({label:esc(x.t),tag:'Juga di: '+x.c.t.slice(0,26),href:path(x),col:x.v.col,title:x.c.t})),
    ...near.map(x=>kItem(x,'Sekitar'))];
  const secs=[
   ['bagan','Bagan hubungan',atwrap(`<b>${esc(k.t)}</b>`,items,v.col,'Hubungan konsep '+k.t)],
   ...(k.b?[['uraian','Uraian',`<div class="mdbody">${k.b}</div>`]]:[]),
   ['definisi','Definisi',k.g?`<div class="formula" style="border-left-color:${v.col}"><b>${esc(k.t)}</b><span style="font-size:1.02rem">${k.g}</span><small>Definisi ringkas (Draft). Bandingkan dengan buku teks pada bagian referensi.</small></div>`:`<p>Definisi untuk <b>${esc(k.t)}</b> belum ditulis. Konsep ini termasuk dalam bab <a href="${path(c)}">${c.t}</a>: ${c.sum}</p>${draft('Entri ini baru berupa kerangka dari indeks skill SamawatLab.')}`],
   ['konteks','Posisi dalam hierarki',`<p>Volume <a href="${path(v)}">${v.t}</a> → Bab <a href="${path(c)}">${c.n}. ${c.t}</a> → <b>${esc(k.t)}</b>. Tingkat: ${dots(c.d)}.</p>${c.deep?`<p>Pembahasan mendalam: <a href="${c.deep[0]}">${c.deep[1]}</a>.</p>`:''}`],
   ...(same.length?[['juga','Muncul juga di bab lain',`<p>Istilah yang sama dibahas dari sudut pandang berbeda:</p>${UL(same.map(x=>`<a href="${path(x)}">${esc(x.t)}</a> — Bab ${x.c.n} ${x.c.t} (${x.v.t})`))}`]]:[]),
   ['sekitar','Konsep sebelum dan sesudah',`<div class="chips">${sib.map(x=>`<a class="chip ${x===k?'on':''}" href="${path(x)}">${esc(x.t)}</a>`).join('')}</div>`],
   ['penelitian','Penelitian &amp; bacaan lanjut',research(k.t)],
   ['ref','Referensi',refList(c.ref)]];
  const toc=tocFor(secs)+`<hr><h4>Bab ${c.n}</h4><a href="${path(c)}">← ${c.t}</a>`;
  const inner=`<span class="tag" style="color:${v.col};border-color:${v.col}">Konsep</span><h1>${esc(k.t)}</h1><p class="lede">${k.g||c.sum}</p>`+secs.map(s=>`<section id="${s[0]}"><h2>${s[1]}</h2>${s[2]}</section>`).join('');
  return `<div class="layout"><aside class="toc"><h4>Di halaman ini</h4>${toc}</aside><article><div class="crumb">${crumbs([['Beranda','#/'],['Atlas Ilmu','#/atlas'],['Vol '+v.n,path(v)],['Bab '+c.n,path(c)],[esc(k.t)]])}</div>${inner}${pager(prev,next)}</article></div>`;
}

/* ---------- jalur belajar (dari skill) ---------- */
const PATHS=[
 {id:'astronomi-dari-nol',t:'Astronomi dari Nol',ic:'✨',d:'Untuk pemula tanpa latar belakang astronomi.',why:'Dimulai dari pengertian dan skala, lalu kenali tiga benda terdekat (Matahari, Bulan, planet) sebelum bintang, kemudian pahami bahwa semua itu tampak bergerak karena Bumi berputar; geraknya dirangkum dalam model bola langit.',
  s:[['Apa itu astronomi?','Pengertian astronomi',1],['Bumi dan langit','Bentuk bumi',3],['Matahari','Astronomi Matahari',10],['Bulan','Astronomi Bulan',10],['Planet','Astronomi Planet',10],['Bintang','Astronomi Bintang',10],['Gerak semu','Gerak Benda Langit',3],['Bola langit','Bola Langit',3]]},
 {id:'matematika-falak',t:'Matematika untuk Falak',ic:'📐',d:'Bekal hitung dari bilangan sampai trigonometri bola.',why:'Setiap tahap memakai tahap sebelumnya: bilangan → sudut → bangun datar → trigonometri → koordinat → geometri bola. Trigonometri bola hanya dapat dipahami setelah trigonometri bidang dan konsep koordinat.',
  s:[['Bilangan','Bilangan',2],['Sudut','Sudut',2],['Geometri','Geometri',2],['Segitiga','Segitiga',2],['Trigonometri','Trigonometri',2],['Lingkaran satuan','Lingkaran satuan',2],['Koordinat','Sistem Koordinat Astronomi',3],['Trigonometri bola','Trigonometri Bola',2]]},
 {id:'arah-kiblat',t:'Menentukan Arah Kiblat',ic:'🕋',d:'Dari konsep arah sampai praktikum dan validasi.',why:'Arah kiblat adalah azimut lingkaran besar menuju Ka\'bah. Maka perlu konsep arah, model Bumi dan koordinat, baru rumus segitiga bola; sesudah itu alat ukur, rashdul kiblat sebagai pembanding, lalu praktik dan validasi.',
  s:[['Konsep arah','Definisi arah',4],['Bumi','Bentuk bumi',3],['Lintang dan bujur','Koordinat Geografis',3],['Koordinat Ka\'bah','Koordinat Ka\'bah',4],['Azimuth','Arah dan Azimuth',4],['Trigonometri bola','Trigonometri Bola',2],['Perhitungan kiblat','Trigonometri Bola untuk Kiblat',4],['Kompas','Kompas',4],['Mizwala','Mizwala',4],['Istiwa\'aini','Istiwa\'aini',4],['Theodolit','Theodolit',4],['Rashdul kiblat','Rashdul Kiblat',4],['Praktikum','Praktikum',12],['Validasi','Validasi',4]]},
 {id:'waktu-salat',t:'Memahami Waktu Salat',ic:'🕌',d:'Dari gerak Matahari hingga algoritma dan praktikum.',why:'Waktu salat adalah fungsi tinggi Matahari. Karena itu kita mulai dari gerak Matahari dan koordinat, lalu deklinasi, sudut jam, dan perata waktu untuk menghitung transit; kelima waktu salat kemudian diturunkan satu per satu.',
  s:[['Gerak Matahari','Gerak semu harian Matahari',3],['Bola langit','Bola Langit',3],['Koordinat horizontal','Koordinat Horizontal',3],['Deklinasi','Deklinasi',5],['Hour angle','Hour angle',5],['Equation of time','Equation of time',5],['Solar noon','Solar noon',5],['Zuhur','Zuhur',5],['Asar','Asar',5],['Magrib','Magrib',5],['Isya','Isya',5],['Subuh','Subuh',5],['Sunrise','Terbit Matahari',5],['Perhitungan','Algoritma Waktu Salat',5],['Problematika','Problematika Waktu Salat',5],['Praktikum','Praktikum',12]]},
 {id:'hilal',t:'Memahami Hilal',ic:'🌙',d:'Dari orbit Bulan hingga kriteria visibilitas dan kalender.',why:'Hilal adalah akibat geometri Bulan–Matahari–Bumi. Pahami orbit dan fase, lalu besaran posisi (konjungsi, elongasi, tinggi, azimut), barulah hisab, rukyat, dan kriteria visibilitas dapat dibandingkan secara adil.',
  s:[['Astronomi Bulan','Astronomi Bulan',6],['Orbit Bulan','Orbit',6],['Fase Bulan','Fase Bulan',6],['Konjungsi','Konjungsi',6],['Elongasi','Elongasi',6],['Altitude','Altitude',6],['Azimuth','Azimuth',6],['Hilal','Hilal',6],['Hisab','Hisab Awal Bulan',6],['Rukyat','Rukyat Hilal',6],['Kriteria visibilitas','Kriteria Visibilitas Hilal',6],['MABIMS','MABIMS',6],['Kalender Hijriah','Kalender Hijriah',6],['Problematika','Problematika Awal Bulan',6],['Observasi','Teknik Pengamatan',12]]},
 {id:'gerhana',t:'Memahami Gerhana',ic:'🌑',d:'Dari geometri tiga benda hingga prediksi dan pengamatan.',why:'Gerhana adalah kesejajaran Matahari–Bumi–Bulan dekat node. Karena itu orbit dan node harus dipahami sebelum bayangan (umbra, penumbra), baru jenis gerhana, prediksi, dan pengamatan.',
  s:[['Matahari','Astronomi Matahari',10],['Bumi','Bentuk bumi',3],['Bulan','Astronomi Bulan',10],['Orbit','Orbit',7],['Node','Node',7],['Alignment','Alignment',7],['Umbra','Umbra',7],['Penumbra','Penumbra',7],['Gerhana Matahari','Gerhana Matahari',7],['Gerhana Bulan','Gerhana Bulan',7],['Prediksi','Perhitungan Gerhana',7],['Observasi','Observasi Gerhana',7],['Praktikum','Praktikum',12]]}
];
function resolve(q,vol){
  const n=sn(q);
  const c=AT.flat.filter(e=>sn(e.t)===n&&(!vol||e.vol===vol));
  c.sort((a,b)=>(a.kind==='c'?0:a.kind==='k'?1:2)-(b.kind==='c'?0:b.kind==='k'?1:2));
  return c[0]?c[0].x:null;
}
window.atlasResolve=resolve;
function pageBelajarList(){
  return `<section class="atl"><span class="tag">Jalur Belajar</span><h1>Jalur Belajar</h1><p class="sub">Urutan belajar terkurasi dari skill SamawatLab. Tiap langkah terhubung langsung ke entri di Atlas Ilmu.</p>
  <div class="grid">${PATHS.map(p=>`<a class="card" href="#/belajar/${p.id}"><span class="ic">${p.ic}</span><h3>${p.t}</h3><p>${p.d}</p><p style="margin-top:8px;font-size:.8rem">${p.s.length} langkah</p></a>`).join('')}</div></section>`;
}
function pageBelajar(id){
  const p=PATHS.find(x=>x.id===id);if(!p)return pageBelajarList();
  const steps=p.s.map(s=>({l:s[0],x:resolve(s[1],s[2])}));
  const inner=`<span class="tag">Jalur Belajar</span><h1>${p.ic} ${p.t}</h1><p class="lede">${p.d}</p>
   <section><h2>Mengapa urutannya begini?</h2><p>${p.why}</p></section>
   <section><h2>Langkah</h2><ol class="steps">${steps.map(s=>`<li>${s.x?`<a href="${path(s.x)}">${esc(s.l)}</a> <span>${esc(ctx({kind:s.x.kind,x:s.x,t:s.x.t}))}</span>`:esc(s.l)}</li>`).join('')}</ol>
   ${NOTE('Setiap langkah memuat ringkasan; penjelasan "mengapa langkah ini sebelum langkah berikutnya" per langkah masih akan ditambahkan.')}</section>`;
  const toc=PATHS.map(x=>`<a href="#/belajar/${x.id}" class="${x===p?'on':''}">${x.ic} ${x.t}</a>`).join('');
  return `<div class="layout"><aside class="toc"><h4>Jalur belajar</h4>${toc}</aside><article><div class="crumb">${crumbs([['Beranda','#/'],['Jalur Belajar','#/belajar'],[p.t]])}</div>${inner}</article></div>`;
}

/* ---------- router atlas ---------- */
window.atlasRoute=function(parts){ // parts = segmen setelah 'atlas'
  const [a,b,c]=parts;
  if(!a)return pageAtlasRoot();
  const v=hv(a);if(!v)return pageAtlasRoot();
  if(!b)return pageVolume(v);
  const ch=v.ch.find(x=>x.s===b);if(!ch)return pageVolume(v);
  if(!c)return pageChapter(ch);
  const k=ch.k.find(x=>x.s===c);if(!k)return pageChapter(ch);
  return pageConcept(k);
};
window.belajarRoute=function(parts){return parts[0]?pageBelajar(parts[0]):pageBelajarList()};
window.atlasHomeMap=function(){return atwrap(hubImg,ATLAS.map(volItem),'#8a5cf0','Bagan besar: 13 volume')};
window.atlasSearchBox=searchBox;
window.atlasBind=bindAtlas;
window.atlasStats=function(){return {v:ATLAS.length,c:ATLAS.reduce((a,v)=>a+v.ch.length,0),k:ATLAS.reduce((a,v)=>a+v.ch.reduce((b,c)=>b+c.k.length,0),0)}};
window.PATHS=PATHS;
window.atlasSearch=search;
})();
