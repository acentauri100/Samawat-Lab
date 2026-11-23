# -*- coding: utf-8 -*-
"""Membuat kerangka konten per bab: content/vol-XX/bab-NN-slug.md
Tidak menimpa berkas yang sudah ada (aman untuk isian Anda). Jalankan: python3 tools/gen_templates.py"""
import json,os,re,sys
sys.path.insert(0,'tools')
import content as C

tax=json.load(open('tools/taxonomy.json',encoding='utf-8'))
def slug(s):
    import unicodedata
    s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=re.sub(r"['’`]",'',s); return re.sub(r'[^a-z0-9]+','-',s).strip('-')
def norm(s): return re.sub(r"[^a-z0-9 ]","",s.lower().replace("'","").replace("’",""))
G={norm(k):v for k,v in C.G.items()}

# ---------- panduan per bagian ----------
S={
'ringkasan':('Ringkasan','Jawab dalam 1–3 paragraf: Apa ini? Mengapa penting? Apa fungsinya? Di mana dipakai? Tulis untuk pemula; jelaskan istilah teknis saat pertama muncul (format: Azimuth — Azimut).'),
'sejarah':('Sejarah','Asal-usul, perkembangan, tokoh, tonggak, dan evolusi dari klasik ke modern. Setiap klaim sejarah wajib punya sumber; beri tanda "(perlu verifikasi)" bila belum yakin. Jangan menulis tahun atau nama dari ingatan tanpa sumber.'),
'fondasi':('Fondasi','Matematika, astronomi, fisika, geografi, fikih, dan teknologi apa yang dibutuhkan untuk memahami bab ini? Tautkan ke bab prasyarat dan jelaskan mengapa masing-masing diperlukan.'),
'komponen':('Komponen','Daftar semua komponen utama beserta penjelasan singkat masing-masing. Tulis juga apa yang perlu digambar sebagai diagram berlabel.'),
'cara':('Cara kerja','Jelaskan mekanismenya langkah demi langkah. Tandai di mana diagram, animasi, atau visualisasi interaktif dibutuhkan, dan jelaskan sumbu serta arah rujukannya (utara, searah jarum jam, dst.).'),
'diagram':('Diagram dan visualisasi','Daftar diagram yang diperlukan: apa yang digambar, label, arah rujukan (utara), satuan, dan apakah tidak berskala. Setiap visual harus punya penjelasan teks.'),
'rumus':('Rumus','Untuk TIAP rumus tulis: (1) bentuk rumus, (2) arti tiap variabel, (3) satuan, (4) asumsi, (5) turunan singkat bila relevan, (6) contoh hitung, (7) batasan. Tulis rumus dalam blok kode (```) atau notasi Unicode. Jangan menaruh rumus tanpa penjelasan.'),
'algoritma':('Algoritma','Tuliskan langkah komputasi berurutan (masukan → proses → keluaran), asumsi, penanganan kasus khusus, dan cara pengujian. Sertakan kode contoh bila ada.'),
'instrumen':('Instrumen','Untuk tiap alat: sejarah singkat, komponen, prinsip kerja, cara memakai, kalibrasi, sumber kesalahan, dan keterbatasan.'),
'prosedur':('Prosedur praktis','Langkah bernomor yang bisa diikuti di lapangan: persiapan → pengukuran → pencatatan → pengolahan → validasi → dokumentasi. Cantumkan keselamatan bila perlu.'),
'contoh':('Contoh hitung','Masukan → metode → perhitungan → hasil → interpretasi → validasi. Pakai data nyata (mis. Semarang: lintang −6,9666°, bujur 110,4203° BT, UTC+7) lalu bandingkan dengan Kalkulator Falak di situs ini.'),
'masalah':('Masalah dan keterbatasan','Kesalahan umum, salah kaprah, keterbatasan, faktor lingkungan, akurasi, ketidakpastian, dan pendekatan alternatif. Tandai mana fakta, mana tafsir.'),
'solusi':('Solusi dan verifikasi','Koreksi, pemecahan masalah, metode alternatif, dan cara memverifikasi hasil (mis. verifikasi silang dengan metode lain).'),
'terapan':('Penerapan','Penerapan nyata dan keagamaan (jika relevan): siapa memakainya, untuk apa, dan dalam kasus seperti apa.'),
'kasus':('Studi kasus','Satu atau dua kejadian nyata (mis. perbedaan jadwal, koreksi arah kiblat masjid, gerhana tertentu). Sebutkan sumber, tanggal, dan pelajaran yang dapat diambil.'),
'lanjut':('Topik lanjutan','Materi tambahan untuk pembaca tingkat lanjut/riset: turunan matematis, model yang lebih teliti, perkembangan penelitian terbaru (dengan sitasi).'),
'fikih':('Batas astronomi dan fikih','Pisahkan dengan jelas: (a) apa yang merupakan hasil hitung/pengamatan astronomis, (b) apa yang merupakan keputusan fikih atau otoritas. Jelaskan perbedaan metode dan asal-usulnya; jangan menyajikan kriteria yang diperdebatkan sebagai konsensus.'),
'dalil':('Dalil','Cantumkan ayat/hadis lengkap dengan nama surah dan nomor ayat atau nama kitab, nomor, dan perawi. Gunakan terjemahan dari sumber resmi (mis. Kemenag RI) dan sebutkan sumbernya. Jangan mengutip dari ingatan.'),
'tokoh':('Tokoh dan karya','Untuk tiap tokoh: nama, masa hidup, tempat, sumbangan, karya utama, dan keterkaitan dengan topik falak. Wajib bersumber.'),
'observasi':('Observasi','Target, kondisi pengamatan, instrumen, prosedur, keselamatan, dan cara mencatat hasil.'),
'latihan':('Cek pemahaman','3–5 soal (campuran konsep dan hitungan) lengkap dengan kunci jawaban, serta saran topik berikutnya.'),
}

# ---------- jenis bab ----------
KIND={}
def setk(k,ns):
    for n in ns: KIND[n]=k
setk('pengantar',[1,17]); setk('syariat',[3,55]); setk('sejarah',[2,77,78,79,80])
setk('math',[4,5,6,7,8,9]); setk('koord',[10,11,12,13,14,15,16])
setk('hitung',[18,19,20,28,29,30,31,32,33,34,35,36,37,41,42,43,44,46,47,50,51,52,53])
setk('metode',[21,24,26,45,54,81,82,85]); setk('alat',[22,23,38,57,58,59,60,61])
setk('masalah',[25,39,48,56,88]); setk('terap',[27,40,49]); setk('komputasi',[62,63,64,65,66,67])
setk('cabang',[68,69,70,71,72,73,74,75,76]); setk('riset',[83,84]); setk('edu',[86,87])

PLAN={
'pengantar':['ringkasan','sejarah','fondasi','fikih','terapan','lanjut','latihan'],
'syariat':['ringkasan','dalil','fikih','kasus','terapan','latihan'],
'sejarah':['ringkasan','sejarah','tokoh','kasus','terapan','latihan'],
'math':['ringkasan','fondasi','komponen','rumus','contoh','masalah','terapan','lanjut','latihan'],
'koord':['ringkasan','komponen','cara','diagram','rumus','contoh','masalah','terapan','latihan'],
'hitung':['ringkasan','fondasi','komponen','cara','diagram','rumus','contoh','masalah','solusi','fikih','terapan','lanjut','latihan'],
'metode':['ringkasan','fondasi','cara','prosedur','instrumen','contoh','masalah','solusi','latihan'],
'alat':['ringkasan','sejarah','komponen','cara','instrumen','prosedur','masalah','terapan','latihan'],
'masalah':['ringkasan','masalah','solusi','kasus','fikih','latihan'],
'terap':['ringkasan','prosedur','contoh','masalah','terapan','latihan'],
'komputasi':['ringkasan','komponen','cara','algoritma','contoh','masalah','terapan','latihan'],
'cabang':['ringkasan','fondasi','komponen','rumus','observasi','terapan','lanjut','latihan'],
'riset':['ringkasan','cara','rumus','contoh','masalah','lanjut','latihan'],
'edu':['ringkasan','komponen','kasus','terapan','lanjut'],
}
KIND_NAME={'pengantar':'Pengantar','syariat':'Dasar syariat','sejarah':'Sejarah & tokoh','math':'Matematika/fisika','koord':'Koordinat & bola langit','hitung':'Perhitungan falak','metode':'Metode & praktik','alat':'Instrumen','masalah':'Problematika','terap':'Penerapan','komputasi':'Data & komputasi','cabang':'Cabang astronomi','riset':'Riset & analisis','edu':'Edukasi'}
FIKIH_VOL={4,5,6,7}
PRE_VOL={4:[6,7,12,13],5:[7,9,14],6:[9,16,41],7:[16,41,50],3:[6,7],9:[6,9],10:[16,41],8:[6]}
DIFFN={'b':'pemula','m':'menengah','a':'lanjut','r':'riset'}

chmap={c['n']:(v,c) for v in tax for c in v['ch']}
os.makedirs('content',exist_ok=True)
created=0
for v in tax:
    vd=f"content/vol-{v['n']:02d}"; os.makedirs(vd,exist_ok=True)
    for c in v['ch']:
        n=c['n']; fn=f"{vd}/bab-{n:02d}-{slug(c['t'])}.md"
        if os.path.exists(fn): continue
        kind=KIND.get(n,'hitung'); plan=PLAN[kind]
        refs=list(dict.fromkeys(C.CH_REF.get(n,[])+C.VOL_REF[v['n']]))
        pres=[]
        vi=[x['n'] for x in v['ch']]; i=vi.index(n)
        if i>0: pres.append(vi[i-1])
        for p in PRE_VOL.get(v['n'],[]):
            if p!=n and p not in pres and p<n: pres.append(p)
        L=[]
        a=L.append
        a('---'); a(f'bab: {n}'); a(f"volume: {v['n']}"); a(f"judul: {c['t']}"); a(f'tingkat: {DIFFN[C.diff(n)]}  # pemula | menengah | lanjut | riset')
        a('status: kosong  # kosong | draft | review | verified | published | needs-update'); a('penulis: '); a('diperbarui: '); a('---'); a('')
        a(f"# Bab {n} — {c['t']}"); a('')
        a('<!-- CARA MENGISI: tulis isi DI BAWAH tiap judul. Teks di dalam komentar HTML seperti ini hanya panduan dan tidak tampil di situs. Bagian yang dibiarkan kosong tidak ditampilkan. Setelah mengisi, jalankan: python3 tools/build_atlas.py -->'); a('')
        a(f"> **Jenis bab:** {KIND_NAME[kind]} · **Volume {v['n']}:** {C.VOL_TITLES[v['n']]}  ")
        a(f"> **Draf tujuan (dari indeks):** {C.CH_SUM[n]}  ")
        if pres: a('> **Disarankan sudah dibaca:** '+', '.join(f"Bab {p} ({chmap[p][1]['t']})" for p in pres))
        a('')
        a('<!-- PERTANYAAN PEMANDU untuk bab ini:')
        a(f'  1. Setelah membaca bab ini, apa yang harus bisa dilakukan atau dijelaskan pembaca?')
        a(f'  2. Dari {len(c["c"])} konsep di bawah, mana yang wajib (inti) dan mana yang pelengkap?')
        a('  3. Mana bagian yang murni astronomi/matematika, dan mana yang keputusan fikih atau kebijakan?')
        a('  4. Sumber apa (buku, paper, lembaga) yang akan dipakai untuk tiap klaim faktual?')
        a('-->'); a('')
        for key in plan:
            if key=='fikih' and kind=='hitung' and v['n'] not in FIKIH_VOL: continue
            t,pr=S[key]
            a(f'## {t}'); a(''); a(f'<!-- {pr} -->'); a(''); a('')
        a('## Konsep'); a('')
        a('<!-- Satu judul ### per konsep dari indeks. Isi 1–3 paragraf per konsep (definisi, mengapa ada di bab ini, contoh/rumus bila ada). Konsep yang dikosongkan hanya tampil sebagai kerangka. Jangan ubah nama ### agar tertaut ke halaman konsep. -->'); a('')
        for k in c['c']:
            g=G.get(norm(k))
            a(f'### {k}'); a('')
            if g: a(f'<!-- Draf definisi dari glosarium (periksa & perluas): {g} -->')
            else: a(f'<!-- Tulis definisi 1–2 kalimat untuk "{k}", lalu: kenapa konsep ini ada di Bab {n}; contoh atau rumus bila relevan. -->')
            a(''); a('')
        a('## Relasi'); a('')
        a('<!-- Hubungan ke topik lain (graf pengetahuan). Format satu baris per relasi: `jenis: Nama topik`. Jenis yang tersedia: prerequisite, related, application, mathematical_basis, astronomical_basis, instrument, historical_origin, method, problem, solution, advanced_topic, example. Minimal 3 topik terkait. -->'); a('')
        a('<!-- contoh:'); a('prerequisite: Trigonometri'); a('instrument: Theodolit'); a('problem: Gangguan magnet'); a('-->'); a(''); a('')
        a('## Referensi'); a('')
        a('<!-- Tulis tiap sumber: Penulis, Judul, Tahun, Penerbit/Jurnal, DOI/URL. Hindari sitasi yang tidak bisa diverifikasi. Sumber yang sudah otomatis tampil di situs untuk bab ini (tidak perlu diulang):')
        for r in refs:
            rr=C.REFDB[r]; a(f'  - {rr[0]}'+(f' — {rr[1]}' if rr[1] else ''))
        a('-->'); a(''); a('- '); a('')
        a('## Daftar periksa editorial'); a('')
        a('<!-- Centang dengan x sebelum mengubah status menjadi review/verified. -->'); a('')
        for t in ['Definisi jelas','Lingkup bab jelas','Konteks sejarah akurat','Dasar ilmiah benar','Notasi matematika benar','Semua variabel dijelaskan','Satuan benar','Contoh hitung valid dan sudah dicek','Keterbatasan dijelaskan','Topik terkait tertaut (minimal 3)','Referensi ada dan tidak fiktif','Bahasa mudah dipahami','Tidak ada istilah teknis yang belum dijelaskan','Sesuai tingkat kesulitan']: a(f'- [ ] {t}')
        a('')
        open(fn,'w',encoding='utf-8').write('\n'.join(L)); created+=1
print('dibuat',created,'berkas')
