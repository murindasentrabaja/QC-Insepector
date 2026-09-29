(() => {
'use strict';
const API = window.API_URL, TZ = 'Asia/Jakarta', $ = s => document.querySelector(s);
const S = { tok: localStorage.getItem('qct') || '', B: null, users: (() => { try { return JSON.parse(localStorage.getItem('qcus') || '[]'); } catch (e) { return []; } })(), d: {}, kal: [], pc: true, v: { t: 'login' }, f: {}, ncr: null, ref: null };
const PAL = ['#E4EDF7', '#E5F1EC', '#F6EBDD', '#EDE7F4', '#F3E5E8', '#E2F0F1', '#F1EEDC', '#E7EAF3', '#EAF0E4', '#F5E9E1'];
const SVG = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tf = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: TZ });
const df = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
const now = () => { const n = new Date(); return { d: df.format(n), t: tf.format(n).replace(/\./g, ':') }; };
const fd = s => { const m = /^(\d{4})-(\d\d)-(\d\d)(?: (\d\d):(\d\d))?/.exec(s || ''); return m ? `${m[3]}/${m[2]}/${m[1]}` + (m[4] && (m[4] + m[5]) !== '0000' ? ` ${m[4]}:${m[5]}` : '') : (s || ''); };
const clock = () => { const n = now(); document.querySelectorAll('.cd').forEach(e => e.textContent = n.d); document.querySelectorAll('.ct').forEach(e => e.textContent = n.t); document.querySelectorAll('.stamp').forEach(e => e.value = n.d + ', ' + n.t); };
const st = document.createElement('style');
st.textContent = '.ib{display:inline-flex;align-items:center;justify-content:center;gap:6px}.stamp{color:var(--pri);font-weight:700;font-variant-numeric:tabular-nums}.tile{box-shadow:0 1px 3px rgba(43,58,85,.06)}.tile small{display:block;margin-top:6px;font-size:11px;opacity:.75}.prev{margin:4px 0 12px}.lg h2{margin-top:6px}.lg .er{color:var(--ng);font-size:13px;min-height:18px}.more{margin:8px auto;display:block}.tg{font-size:11px;color:var(--pri);font-weight:600}.mut{font-size:13px}';
document.head.appendChild(st);
let tt; const toast = m => { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2800); };
const busy = b => $('#busy').classList.toggle('on', b);
// Kirim lewat POST. Jika server membalas teks doGet (POST dialihkan jadi GET oleh Google), ulangi lewat GET ?p=
async function send(o) {
  const body = JSON.stringify(o);
  let t = await (await fetch(API, { method: 'POST', body })).text();
  if (/^QC Inspector MSB API aktif/.test(t)) t = await (await fetch(API + (API.includes('?') ? '&' : '?') + 'p=' + encodeURIComponent(body))).text();
  try { return JSON.parse(t); }
  catch (e) { throw new Error(/^\s*</.test(t) ? 'Server membalas halaman error. Periksa deployment: akses "Siapa saja" dan versi terbaru.' : 'Balasan server tidak dikenali: ' + t.slice(0, 60)); }
}
async function api(a, p = {}) {
  busy(true);
  try {
    const j = await send(Object.assign({ a, t: S.tok }, p));
    if (!j.ok) { if (j.err === 'AUTH') { out(true); throw new Error('Sesi berakhir, silakan masuk lagi'); } throw new Error(j.err); }
    return j;
  } finally { busy(false); }
}
const wrap = fn => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message === 'Failed to fetch' ? 'Tidak ada koneksi ke server' : e.message); } };
const mod = k => S.B.mods.find(m => m.k === k);
const prep = d => ({ cols: d.cols, o: d.rows.map(r => { const o = { _r: r[r.length - 1] }; d.cols.forEach((c, i) => o[c] = r[i]); return o; }) });
const filled = (m, o) => m.f.some(f => f[1] !== 'i' && f[1] !== 'x' && o[f[0]] !== '' && o[f[0]] != null);
const chipCls = v => /^(accept|ok|closed|valid)$/i.test(v) ? 'ok' : /^(reject|ng|open|expired|overdue)$/i.test(v) ? 'ng' : v ? 'wr' : '';
const nb = () => S.kal.filter(x => x.st !== 'Valid').length;
const lastUser = () => localStorage.getItem('qcu') || '';
const userField = () => S.users.length
  ? `<select id="lu" aria-label="Username"><option value="">Pilih username</option>${S.users.map(x => `<option${x === lastUser() ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`
  : '<input id="lu" placeholder="Username" autocomplete="username">';
async function loadUsers() {
  if (/PASTE_URL/.test(API || '')) return;
  try {
    const j = await send({ a: 'users' });
    if (!j.ok || !j.users || !j.users.length) throw new Error(j.err || 'kosong');
    if (JSON.stringify(j.users) !== JSON.stringify(S.users)) {
      S.users = j.users; localStorage.setItem('qcus', JSON.stringify(j.users));
      const p = $('#lp'); if (S.v.t === 'login' && !(p && p.value)) draw();
    }
  } catch (e) {
    const er = $('#er'); if (S.v.t === 'login' && er && !S.users.length) er.textContent = 'Daftar username belum bisa dimuat. Periksa koneksi & deployment Apps Script.';
  }
}

// ---------- Tampilan ----------
const shell = h => `<header><img src="MSB_Logo.png" alt="MSB"><div class="clk"><b class="cd"></b><span class="ct"></span></div><button class="ib" data-a="kal" aria-label="Notifikasi kalibrasi"><svg ${SVG}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>${nb() ? `<i>${nb()}</i>` : ''}</button><button class="ib" data-a="out" aria-label="Keluar"><svg ${SVG}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button></header><main>${h}</main>`;
const bar = (t, back, extra) => `<div class="bar"><button class="bk" data-a="${back}">&larr; Kembali</button><h2>${esc(t)}</h2>${extra || ''}</div>`;
const V = {
  login: () => `<div class="lg card"><img src="MSB_Logo.png" alt="Murinda"><h2>QC Inspector</h2><small>${esc(S.cfgName || 'PT MURINDA SENTRA BAJA')}</small><div class="clk"><b class="cd"></b><span class="ct"></span></div>${userField()}<input id="lp" type="password" placeholder="Password" autocomplete="current-password"><div class="er" id="er">${/PASTE_URL/.test(API || '') ? 'URL API belum diisi di index.html' : ''}</div><button class="btn" data-a="in">Masuk</button></div>`,
  home() {
    const { u } = S.B, al = S.kal.filter(x => x.st !== 'Valid'), ex = al.filter(x => x.st === 'Expired').length;
    const tiles = S.B.mods.map((m, i) => `<button class="tile" style="background:${PAL[i % PAL.length]}" data-a="mod" data-k="${m.k}"><b>${m.c}</b><span>${esc(m.t)}</span></button>`).join('')
      + `<button class="tile" style="background:${PAL[8]}" data-a="ncr"><b>NCR</b><span>Non Conformance Report</span></button><button class="tile" style="background:${PAL[9]}" data-a="kal"><b>KAL</b><span>Kalibrasi alat</span></button>`;
    return shell(`<h2>Halo, ${esc(u.u.split(' ')[0])}</h2><small>${esc(u.role)} &middot; tercatat sebagai ${esc(u.insp)}</small>${al.length ? `<div class="ban" data-a="kal">Kalibrasi: ${ex ? ex + ' alat kedaluwarsa' : ''}${ex && al.length > ex ? ', ' : ''}${al.length > ex ? (al.length - ex) + ' akan jatuh tempo' : ''}. Ketuk untuk melihat.</div>` : ''}<div class="grid">${tiles}</div>`);
  },
  list() {
    const { k } = S.v, m = mod(k), d = S.d[k], f = S.f, q = f.q.toLowerCase();
    const rows = d.o.filter(o => (f.c === 'all' || (f.c === 'todo' ? !filled(m, o) : f.c === 'done' ? filled(m, o) : m.f.some(x => o[x[0]] === 'NG') || o.Status === 'Reject')) && (!q || Object.values(o).join(' ').toLowerCase().includes(q)));
    const sub = o => k === 'IMI' ? `${o.ItemCode} &middot; ${o.QtyReceived} ${o.UOM}` : `${esc(o.Customer)} &middot; ${esc(o.No_SO)} &middot; ${esc(o.Kategori)}`;
    const cs = [['all', 'Semua'], ['todo', 'Belum diisi'], ['done', 'Sudah diisi'], ['ng', 'NG / Reject']].map(c => `<button data-a="chip" data-c="${c[0]}" class="${f.c === c[0] ? 'on' : ''}">${c[1]}</button>`).join('');
    const cards = rows.slice(0, f.n).map(o => { const fl = filled(m, o); return `<div class="card" data-a="rec" data-r="${o._r}"><div class="rw"><b>${esc(o[m.ti])}</b><i class="chip ${fl ? chipCls(o.Status) : ''}">${fl ? esc(o.Status || 'Terisi') : 'Belum diisi'}</i></div><small>${k === 'IMI' ? sub(o) : sub(o)}</small></div>`; }).join('');
    return shell(bar(m.t, 'home', `<button class="sm" data-a="xlist">Export</button>`) + `<input class="srch" id="sq" placeholder="Cari serial, customer, SO..." value="${esc(f.q)}"><div class="chips">${cs}</div><small class="mut">${rows.length} data</small>${cards || '<div class="info"><span>Tidak ada data.</span></div>'}${rows.length > f.n ? '<button class="sm more" data-a="more">Tampilkan lebih banyak</button>' : ''}`);
  },
  form() {
    const { k, r } = S.v, m = mod(k), o = S.d[k].o.find(x => x._r === r), u = S.B.u, ro = !u.canWrite, fl = filled(m, o);
    const info = `<div class="info"><div><small>ID</small><span>${esc(o._id)}</span></div>` + m.ctx.map(c => `<div><small>${esc(c.replace(/_/g, ' '))}</small><span>${esc(o[c])}</span></div>`).join('') + '</div>';
    const stamp = `<label><span>${esc(m.dt)} ${fl && o[m.dt] ? '' : '(otomatis, waktu nyata)'}</span><input ${fl && o[m.dt] ? `readonly value="${esc(fd(o[m.dt]))}"` : 'readonly class="stamp"'}></label>`;
    const fields = m.f.map(f => {
      const h = f[0], t = f[1], v = o[h] == null ? '' : o[h], n = `name="${esc(h)}"`, lb = `<label><span>${esc(h)}</span>`, dis = ro ? 'disabled' : '';
      if (t === 's') { const L = S.B.lists; const op = f[2] === 'defect' ? L.defect.map(x => [x[0], x[0] + ' - ' + x[1]]) : (L[f[2]] || []).map(x => [x, x]); return `${lb}<select ${n} ${dis}><option value="">-- pilih --</option>${op.map(x => `<option value="${esc(x[0])}"${x[0] == v ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select></label>`; }
      if (t === 'i') { const cur = v || u.insp; if (h === 'Inspector' && u.role === 'QC Inspector') return `${lb}<input ${n} value="${esc(u.insp)}" readonly></label>`; const ps = S.B.lists.people.slice(); if (ps.indexOf(cur) < 0) ps.unshift(cur); return `${lb}<select ${n} ${dis}>${ps.map(x => `<option${x == cur ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`; }
      if (t === 'n') return `${lb}<input ${n} type="number" step="any" inputmode="decimal" value="${esc(v)}" ${dis}></label>`;
      if (t === 'x') return `${lb}<textarea ${n} rows="2" ${dis}>${esc(v === '-' ? '' : v)}</textarea></label>`;
      if (t === 'dt') { const x = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d)/.exec(v); const dv = x ? `${x[1]}T${x[2]}` : (() => { const d = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4); return d.toISOString().slice(0, 16); })(); return `${lb}<input ${n} type="datetime-local" value="${dv}" ${dis}></label>`; }
      return `${lb}<input ${n} value="${esc(v)}" ${dis}></label>`;
    }).join('');
    return shell(bar(o[m.ti], 'back') + info + `<form class="frm" id="fm" onsubmit="return false">${stamp}${fields}<div class="prev" id="pv" style="display:none"></div></form><div class="acts">${ro ? '' : '<button class="btn" data-a="save">Simpan</button>'}<button class="btn gh" data-a="xrec">Export PDF</button></div>`);
  },
  kal() {
    const c = S.B.u.role, all = ['Admin', 'QC Manager'].includes(c);
    const cards = S.kal.map(x => `<div class="card"><div class="rw"><b>${esc(x.nama)}</b><i class="chip ${chipCls(x.st)}">${esc(x.st)}</i></div><small>${esc(x.kode)} &middot; ${esc(x.vendor || '-')} &middot; hasil ${esc(x.hasil || '-')}</small><div class="rw"><small>Berikutnya: ${fd(x.next) || '-'}${x.days == null ? '' : x.days < 0 ? ` (lewat ${-x.days} hari)` : ` (${x.days} hari lagi)`}</small><span class="tg">${x.mine ? 'Alat Anda' : esc(x.pg)}</span></div></div>`).join('');
    return shell(bar('Kalibrasi Alat', 'home') + (S.pc ? '' : '<div class="ban">Kolom "Pengguna" belum ditemukan di sheet Kalibrasi.</div>') + `<small class="mut">${all ? 'Semua alat (Admin/QC Manager).' : 'Hanya alat dengan nama Anda di kolom Pengguna.'}</small>` + (cards || '<div class="info"><span>Tidak ada alat untuk ditampilkan.</span></div>') + `<button class="sm more" data-a="perm">Aktifkan notifikasi perangkat</button>`);
  },
  ncr() {
    const cards = S.ncr.o.slice().reverse().map(o => `<div class="card"><div class="rw"><b>${esc(o.No_NCR)}</b><i class="chip ${chipCls(o.Status_NCR)}">${esc(o.Status_NCR || 'Open')}</i></div><small>${esc(o['Serial Number'] || o.Product_ID)} &middot; ${esc(o.Defect_Code)} &middot; ${esc(o['Tingkat Keparahan (auto)'])} &middot; ${esc(fd(o.Tanggal))}</small><div>${esc(o['Deskripsi Ketidaksesuaian'])}</div></div>`).join('');
    return shell(bar('NCR', 'home', S.B.u.canWrite ? '<button class="sm" data-a="nnew">+ NCR baru</button>' : '') + (cards || '<div class="info"><span>Belum ada NCR.</span></div>'));
  },
  nform() {
    const R = S.ref, L = S.B.lists, sel = (n, op, ph) => `<select name="${n}"><option value="">${ph}</option>${op.map(x => `<option value="${esc(x[0])}">${esc(x[1])}</option>`).join('')}</select>`;
    return shell(bar('NCR Baru', 'ncr') + `<form class="frm" id="fm" onsubmit="return false"><label><span>Tanggal (otomatis, waktu nyata)</span><input class="stamp" readonly></label><label><span>Project_ID (Customer)</span>${sel('Project_ID', R.projects.map(x => [x[0], x[0] + ' - ' + x[1]]), '-- pilih --')}</label><label><span>Product_ID</span>${sel('Product_ID', R.produk.map(x => [x[0], x[0] + ' - ' + x[1]]), '-- pilih --')}</label><label><span>Serial Number</span><input name="Serial Number" list="dl" placeholder="Ketik kode serial"><datalist id="dl">${R.serials.map(x => `<option value="${esc(x)}">`).join('')}</datalist></label><label><span>Sumber Temuan</span>${sel('Sumber Temuan', L.sumber.map(x => [x, x]), '-- pilih --')}</label><label><span>Defect_Code</span>${sel('Defect_Code', L.defect.map(x => [x[0], x[0] + ' - ' + x[1] + ' (' + x[3] + ')']), '-- pilih --')}</label><label><span>Tingkat Keparahan</span>${sel('Tingkat Keparahan (auto)', ['Minor', 'Major', 'Critical'].map(x => [x, x]), 'Ikuti Master Defect')}</label><label><span>Deskripsi Ketidaksesuaian</span><textarea name="Deskripsi Ketidaksesuaian" rows="3"></textarea></label></form><div class="acts"><button class="btn" data-a="nsave">Simpan NCR</button></div>`);
  }
};
function draw() { $('#app').innerHTML = V[S.v.t](); clock(); if (S.v.t === 'login' && S.users.length && lastUser() && S.users.includes(lastUser())) $('#lp').focus(); if (S.v.t === 'form') calc(mod(S.v.k)); }

// ---------- Kalkulasi otomatis (pratinjau) ----------
function calc(m) {
  const c = m.calc, f = $('#fm'), p = $('#pv'); if (!c || !f || !p) return;
  const g = h => f.elements[h] && f.elements[h].value !== '' ? Number(f.elements[h].value) : null; let ok = null, tx = '';
  if (c.ty === 'tol') { const a = g(c.act), s = g(c.std), t = g(c.tol); if (a != null && s != null && t != null) { const d = a - s; ok = Math.abs(d) <= t; tx = `deviasi ${d > 0 ? '+' : ''}${+d.toFixed(3)}, toleransi &plusmn;${t}`; } }
  else if (c.ty === 'min') { const a = g(c.act), n = g(c.min); if (a != null && n != null) { ok = a >= n; tx = `DFT ${a} vs minimum ${n} micron`; } }
  else if (c.ty === 'leak') { const v = f.elements[c.v].value; if (v) { ok = v === 'OK'; tx = 'kondisi ' + v; } }
  p.className = 'prev ' + (ok == null ? '' : ok ? 'ok' : 'ng'); p.style.display = ok == null ? 'none' : ''; p.innerHTML = ok == null ? '' : `${ok ? 'OK' : 'NG'} (otomatis): ${tx}`;
}

// ---------- Aksi ----------
const A = {
  async in() {
    const u = $('#lu').value.trim(), p = $('#lp').value; if (!u || !p) return ($('#er').textContent = u ? 'Isi password' : 'Pilih username dan isi password');
    try { const j = await api('login', { u, p }); S.tok = j.t; localStorage.setItem('qct', j.t); localStorage.setItem('qcu', u); await boot(); } catch (e) { $('#er').textContent = e.message === 'Failed to fetch' ? 'Tidak ada koneksi ke server' : e.message; }
  },
  out() { out(); },
  home() { S.v = { t: 'home' }; draw(); },
  async mod(el) { const k = el.dataset.k, j = await api('list', { m: k }); S.d[k] = prep(j); S.v = { t: 'list', k }; S.f = { q: '', c: 'all', n: 50 }; draw(); },
  chip(el) { S.f.c = el.dataset.c; S.f.n = 50; draw(); },
  more() { S.f.n += 50; draw(); },
  rec(el) { S.v = { t: 'form', k: S.v.k, r: Number(el.dataset.r) }; draw(); scrollTo(0, 0); },
  back() { S.v = { t: 'list', k: S.v.k }; draw(); },
  async save() {
    const { k, r } = S.v, m = mod(k), o = S.d[k].o.find(x => x._r === r), f = $('#fm'), v = {};
    m.f.forEach(x => { const e = f.elements[x[0]]; if (e) v[x[0]] = e.value; });
    if (!v.Status) return toast('Status wajib dipilih');
    const j = await api('save', { m: k, id: o._id, sr: o.Kode_Serial || '', v, first: !filled(m, o) });
    Object.assign(o, prep({ cols: j.cols, rows: [j.row] }).o[0]); toast('Tersimpan'); S.v = { t: 'list', k }; draw();
  },
  xrec() {
    const { k, r } = S.v, m = mod(k), o = S.d[k].o.find(x => x._r === r), f = $('#fm');
    const kv = [['ID', o._id]].concat(m.ctx.map(c => [c.replace(/_/g, ' '), o[c]]), [[m.dt, fd(o[m.dt]) || now().d + ', ' + now().t]], m.f.map(x => { const e = f.elements[x[0]]; return [x[0], e ? e.value : o[x[0]]]; }));
    report('Laporan Inspeksi ' + m.t + ' - ' + o[m.ti], null, null, kv, o);
  },
  xlist() {
    const { k } = S.v, m = mod(k), rows = S.d[k].o.filter(o => filled(m, o));
    if (!rows.length) return toast('Belum ada data terisi untuk diexport');
    const cols = ['_id'].concat(k === 'IMI' ? ['GRNumber', 'ItemCode'] : ['Kode_Serial', 'Customer'], [m.dt], m.f.map(x => x[0]).filter(h => h !== 'Catatan'), ['Catatan']);
    report('Laporan Inspeksi ' + m.t, cols.map(c => c === '_id' ? 'ID' : c.replace(/_/g, ' ')), rows.map(o => cols.map(c => /Tanggal|Waktu/.test(c) ? fd(o[c]) : o[c])));
  },
  async kal() { const j = await api('kal'); S.kal = j.items; S.pc = j.pcol; S.v = { t: 'kal' }; draw(); if ('Notification' in window && Notification.permission === 'default') $('main').insertAdjacentHTML('afterbegin', ''); },
  async perm() { if (!('Notification' in window)) return toast('Perangkat tidak mendukung notifikasi'); const p = await Notification.requestPermission(); toast(p === 'granted' ? 'Notifikasi aktif' : 'Notifikasi tidak diizinkan'); if (p === 'granted') { localStorage.removeItem('qcn'); notify(); } },
  async ncr() { const j = await api('ncrList'); S.ncr = prep(j); S.v = { t: 'ncr' }; draw(); },
  async nnew() { if (!S.ref) S.ref = await api('ncrRef'); S.v = { t: 'nform' }; draw(); },
  async nsave() {
    const v = {}; [...$('#fm').elements].forEach(e => { if (e.name) v[e.name] = e.value; });
    const j = await api('ncrSave', { v }); toast('NCR tersimpan: ' + j.no); await A.ncr();
  }
};
function out(silent) { S.tok = ''; localStorage.removeItem('qct'); S.B = null; S.d = {}; S.ncr = null; S.v = { t: 'login' }; draw(); if (!silent) toast('Anda telah keluar'); loadUsers(); }

async function boot() {
  const j = await api('boot'); S.B = j; S.kal = j.kal.items; S.pc = j.kal.pcol; S.cfgName = j.cfg.nama; S.v = { t: 'home' }; draw(); notify();
}
async function notify() {
  const a = S.kal.filter(x => x.st !== 'Valid'), k = new Date().toISOString().slice(0, 10);
  if (!a.length || !('Notification' in window) || Notification.permission !== 'granted' || localStorage.getItem('qcn') === k) return;
  localStorage.setItem('qcn', k);
  const o = { body: a.slice(0, 4).map(x => `${x.nama}: ${x.st}`).join('\n'), icon: 'icon-192.png', badge: 'icon-192.png', tag: 'kal' };
  const r = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
  r ? r.showNotification('Kalibrasi alat perlu perhatian', o) : new Notification('Kalibrasi alat perlu perhatian', o);
}

// ---------- Export laporan (cetak / simpan PDF) ----------
function report(title, head, rows, kv, rec) {
  const w = window.open('', '_blank'); if (!w) return toast('Izinkan pop-up untuk export');
  const n = now(), B = S.B, logo = new URL('MSB_Logo.png', location.href).href, u = B.u;
  const td = c => { const s = esc(c == null ? '' : c); return /^(OK|Accept)$/.test(s) ? `<td class="g">${s}</td>` : /^(NG|Reject)$/.test(s) ? `<td class="r">${s}</td>` : `<td>${s}</td>`; };
  const tb = kv ? `<table class="kv">${kv.map(x => `<tr><th>${esc(x[0])}</th>${td(x[1])}</tr>`).join('')}</table>`
    : `<table><thead><tr><th>No</th>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${r.map(td).join('')}</tr>`).join('')}</tbody></table>`;
  const sg = (role, name, ttd) => `<div class="sg"><div>${role}</div><div class="im">${ttd ? `<img src="${esc(ttd)}" onerror="this.style.display='none'">` : ''}</div><b>${esc(name || '-')}</b></div>`;
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page{size:A4 ${kv ? 'portrait' : 'landscape'};margin:12mm}*{box-sizing:border-box}body{margin:0;font:11px/1.45 'Segoe UI',Arial,sans-serif;color:#2B3A55}
.hd{display:flex;align-items:center;gap:16px;border-bottom:3px solid #4A76A8;padding-bottom:10px}.hd img{height:46px}.hd div{flex:1}.hd b{font-size:15px;display:block}.hd span{color:#7B8AA0}
h1{font-size:16px;margin:14px 0 6px}.meta{display:flex;gap:24px;flex-wrap:wrap;color:#7B8AA0;margin-bottom:10px}.meta b{color:#2B3A55}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #DFE6EF;padding:5px 7px;text-align:left;vertical-align:top}thead th{background:#4A76A8;color:#fff;font-weight:600}tbody tr:nth-child(even){background:#F6F8FB}
.kv th{width:32%;background:#EEF2F7;font-weight:600}.g{color:#2F7A5E;font-weight:700}.r{color:#A8434B;font-weight:700}
.sgs{display:flex;justify-content:flex-end;gap:40px;margin-top:26px;page-break-inside:avoid}.sg{text-align:center;width:190px}.im{height:64px;display:flex;align-items:center;justify-content:center}.im img{max-height:60px;max-width:170px}.sg b{display:block;border-top:1px solid #2B3A55;padding-top:4px}
.ft{margin-top:18px;color:#7B8AA0;font-size:9px;text-align:center}
</style></head><body><div class="hd"><img src="${logo}"><div><b>${esc(B.cfg.nama)}</b><span>Quality Control &middot; Laporan Inspeksi</span></div></div>
<h1>${esc(title)}</h1><div class="meta"><span>Dicetak oleh: <b>${esc(u.insp)}</b> (${esc(u.role)})</span><span>Waktu cetak: <b>${esc(n.d)}, ${esc(n.t)}</b></span>${rows ? `<span>Jumlah data: <b>${rows.length}</b></span>` : ''}</div>${tb}
<div class="sgs">${sg('Dibuat oleh (Inspector)', kv ? (rec.Inspector || rec['Inspector/NDT Personnel'] || u.insp) : u.insp, kv ? '' : u.ttd)}${sg('Disetujui (QC Manager)', B.mgr && B.mgr.u, B.mgr && B.mgr.ttd)}</div>
<div class="ft">Dokumen dihasilkan otomatis oleh QC Inspector MSB</div><script>onload=()=>setTimeout(()=>print(),500)<\/script></body></html>`);
  w.document.close();
}

// ---------- Event ----------
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) wrap(A[el.dataset.a])(el); });
document.addEventListener('input', e => {
  if (e.target.id === 'sq') { S.f.q = e.target.value; const p = e.target.selectionStart; draw(); const s = $('#sq'); s.focus(); s.setSelectionRange(p, p); }
  else if (S.v.t === 'form') calc(mod(S.v.k));
});
document.addEventListener('change', e => { if (S.v.t === 'form') calc(mod(S.v.k)); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'lp') wrap(A.in)(); });
setInterval(clock, 1000);
addEventListener('online', () => { if (S.v.t === 'login') loadUsers(); });
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
draw();
if (S.tok && !/PASTE_URL/.test(API || '')) wrap(boot)().catch(() => { }); else loadUsers();
})();
