# -*- coding: utf-8 -*-
import json,sys,re,glob,os
import markdown as MD
sys.path.insert(0,'tools')
import content as C
tax=json.load(open('tools/taxonomy.json',encoding='utf-8'))
def norm(s): return re.sub(r"[^a-z0-9 ]","",s.lower().replace("'","").replace("’",""))
# ---------- konten markdown per bab (content/vol-XX/bab-NN-*.md) ----------
def _md(t):
    return MD.markdown(t,extensions=['tables','fenced_code','sane_lists']).strip()
def parse_md(path):
    raw=open(path,encoding='utf-8').read()
    fm={}
    m=re.match(r'^---\n(.*?)\n---\n',raw,re.S)
    if m:
        for ln in m.group(1).split('\n'):
            if ':' in ln:
                k,v=ln.split(':',1); fm[k.strip()]=re.split(r'\s+#',v)[0].strip()
        raw=raw[m.end():]
    raw=re.sub(r'<!--.*?-->','',raw,flags=re.S)
    parts=re.split(r'^## +',raw,flags=re.M)[1:]
    secs=[];b={};rel=[];ref='';
    for p in parts:
        head,_,body=p.partition('\n'); head=head.strip(); body=body.strip()
        if head=='Daftar periksa editorial': continue
        if head=='Konsep':
            for q in re.split(r'^### +',body,flags=re.M)[1:]:
                h,_,bb=q.partition('\n'); bb=bb.strip()
                if bb: b[norm(h.strip())]=_md(bb)
            continue
        if head=='Relasi':
            for ln in body.split('\n'):
                mm=re.match(r'^\s*-?\s*([a-z_]+)\s*:\s*(.+?)\s*$',ln)
                if mm: rel.append([mm.group(1),mm.group(2)])
            continue
        body=re.sub(r'^\s*-\s*$','',body,flags=re.M).strip()
        if not body: continue
        if head=='Referensi': ref=_md(body); continue
        secs.append([re.sub(r'[^a-z0-9]+','-',head.lower()).strip('-'),head,_md(body)])
    return fm,secs,b,rel,ref
MDS={}
for f in glob.glob('content/vol-*/bab-*.md'):
    fm,secs,b,rel,ref=parse_md(f)
    try: MDS[int(fm.get('bab'))]=(f,fm,secs,b,rel,ref)
    except Exception: print('lewati (tanpa nomor bab):',f)

vols=[]
for v in tax:
    n=v['n']; chs=[]
    for c in v['ch']:
        refs=list(dict.fromkeys(C.CH_REF.get(c['n'],[])+C.VOL_REF[n]))
        d=C.deep(c['n'])
        ent={'n':c['n'],'t':c['t'],'sum':C.CH_SUM[c['n']],'d':C.diff(c['n']),'deep':d,'ref':refs,'c':c['c']}
        mdv=MDS.get(c['n'])
        if mdv:
            f,fm,secs,bb,rel,ref=mdv
            body=[bb.get(norm(x),'') for x in c['c']]
            if secs or any(body) or rel or ref:
                ent['md']={'st':fm.get('status','draft'),'by':fm.get('penulis',''),'up':fm.get('diperbarui',''),'secs':secs,'rel':rel,'ref':ref}
                ent['b']=body
        chs.append(ent)
    vols.append({'n':n,'t':C.VOL_TITLES[n],'sum':C.VOL_SUM[n],'col':C.VOL_COLOR[n],'ref':C.VOL_REF[n],'ch':chs})
G={norm(k):v for k,v in C.G.items()}


out="/* DIBUAT OTOMATIS oleh tools/build_atlas.py dari skill SamawatLab — jangan edit manual */\n"
out+="window.ATLAS="+json.dumps(vols,ensure_ascii=False,separators=(',',':'))+";\n"
out+="window.REFDB="+json.dumps(C.REFDB,ensure_ascii=False,separators=(',',':'))+";\n"
out+="window.GLOSS="+json.dumps(G,ensure_ascii=False,separators=(',',':'))+";\n"
out+="window.SYN="+json.dumps(C.SYN,ensure_ascii=False,separators=(',',':'))+";\n"
open('assets/atlas-data.js','w',encoding='utf-8').write(out)
cnt=sum(len(c['c']) for v in vols for c in v['ch'])
hit=sum(1 for v in vols for c in v['ch'] for x in c['c'] if norm(x) in G)
print('bytes',len(out),'concepts',cnt,'with definition',hit, 'glossary',len(G))
missing=[k for k in C.CH_SUM if not any(c['n']==k for v in vols for c in v['ch'])]
print('missing',missing, 'summaries',len(C.CH_SUM))

# ---------- INDEKS progres ----------
KIND_ROWS=[]
for v in vols:
    for c in v['ch']:
        f=MDS.get(c['n']); 
        filled_secs=len(c['md']['secs']) if 'md' in c else 0
        filled_k=sum(1 for x in c.get('b',[]) if x)
        st=c['md']['st'] if 'md' in c else (f[1].get('status','kosong') if f else '-')
        KIND_ROWS.append((v['n'],c['n'],c['t'],st,filled_secs,filled_k,len(c['c'])))
L=['# Indeks progres konten','','Dibuat otomatis oleh `tools/build_atlas.py`. Jangan diedit manual.','','| Vol | Bab | Judul | Status | Bagian terisi | Konsep terisi |','|---|---|---|---|---|---|']
for r in KIND_ROWS: L.append(f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]}/{r[6]} |')
tot=sum(r[6] for r in KIND_ROWS); done=sum(r[5] for r in KIND_ROWS)
L+=['',f'Total konsep terisi: {done} dari {tot}.']
open('content/INDEKS.md','w',encoding='utf-8').write('\n'.join(L)+'\n')
print('bab dengan isi:',sum(1 for r in KIND_ROWS if r[4] or r[5]),'dari',len(KIND_ROWS))
