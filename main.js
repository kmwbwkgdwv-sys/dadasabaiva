const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const S = JSON.parse(localStorage.getItem('dsv') || 'null') || {coins:100000, inv:{}, eq:{}};
const save = () => { localStorage.setItem('dsv', JSON.stringify(S)); $('#coins').textContent = S.coins.toLocaleString(); };
const ME = sessionStorage.pid || (sessionStorage.pid = 'p' + Math.random().toString(36).slice(2, 7));
const NAME = 'プレイヤー' + ME.slice(-2);
const card = (id, r, extra = '', cls = '') => {
  const it = ITEMS[id], m = it.mod || {};
  const st = (['weapon','belt'].includes(it.slot) ? `ATK+${RARITY[r].v}` : `HP+${RARITY[r].v}`);
  return `<div class="card r-${r} ${cls}" data-k="${id}|${r}">${extra}${it.svg}<b>${it.name}</b>${RARITY[r].n}<div class="st">${st}</div></div>`;
};

// ---- タブ ----
$$('nav button').forEach(b => b.onclick = () => {
  $$('nav button').forEach(x => x.classList.toggle('on', x === b));
  $$('.tab').forEach(t => t.hidden = t.id !== b.dataset.tab);
  if (b.dataset.tab === 'equip') renderEquip();
});
$$('[data-sub]').forEach(b => b.onclick = () => {
  $$('[data-sub]').forEach(x => x.classList.toggle('on', x === b));
  $('#sub-stage').hidden = b.dataset.sub !== 'stage'; $('#sub-join').hidden = b.dataset.sub !== 'join';
});

// ---- ロビー（localStorageで擬似マルチ。複数タブで動作確認可）----
let stage = 0, room = sessionStorage.room || null;
const lobbies = () => JSON.parse(localStorage.getItem('lobbies') || '{}');
const putL = o => localStorage.setItem('lobbies', JSON.stringify(o));
$('#stages').innerHTML = STAGES.map((s, i) => `<div class="stage" data-i="${i}" style="background:${s.color}">${s.name}<small>${s.sub}</small></div>`).join('');
$$('.stage').forEach(e => e.onclick = () => { stage = +e.dataset.i; $$('.stage').forEach(x => x.classList.toggle('on', x === e)); });
$('.stage').classList.add('on');
const setRoom = id => { room = id; id ? sessionStorage.room = id : sessionStorage.removeItem('room'); renderLobby(); };

$('#create').onclick = () => {
  const L = lobbies(); let id;
  do id = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); while (L[id]);
  L[id] = {pw: $('#cpw').value || String(Math.floor(1000 + Math.random() * 9000)), stage, host: ME, members: [{id: ME, name: NAME}]};
  putL(L); setRoom(id);
};
$('#join').onclick = () => {
  const L = lobbies(), id = $('#jid').value.trim(), r = L[id], m = $('#msg');
  if (!r) return m.textContent = 'ロビーが見つかりません';
  if (r.pw !== $('#jpw').value) return m.textContent = 'パスワードが違います';
  if (!r.members.some(x => x.id === ME)) {
    if (r.members.length >= 4) return m.textContent = '満員です（最大4人）';
    r.members.push({id: ME, name: NAME}); putL(L);
  }
  m.textContent = ''; setRoom(id);
};
function renderLobby() {
  const L = lobbies(), r = L[room];
  if (room && (!r || !r.members.some(x => x.id === ME))) { room = null; sessionStorage.removeItem('room'); }
  $('#room').hidden = !room; $('#subs').hidden = !!room;
  if (!room) return;
  const host = r.host === ME;
  $('#room').innerHTML = `<h2>ロビー</h2><p>ID <b>${room}</b> ／ PASS <b>${r.pw}</b></p><p>ステージ：${STAGES[r.stage].name}</p>
  <div class="slots">${[0,1,2,3].map(i => { const m = r.members[i]; return `<div class="slot">${m ? (m.id === r.host ? '👑 ' : '') + m.name : '空き'}</div>`; }).join('')}</div>
  ${host ? '<button id="bot">テスト用に1人追加</button><button id="start" class="pri">ゲーム開始</button>' : ''}<button id="leave">退出</button>`;
  $('#leave').onclick = () => {
    const L2 = lobbies(), r2 = L2[room];
    if (r2) { r2.members = r2.members.filter(x => x.id !== ME); if (r2.host === ME || !r2.members.length) delete L2[room]; putL(L2); }
    setRoom(null);
  };
  if (host) {
    $('#start').onclick = () => alert('ゲーム本編は未実装です（ここからゲーム画面へ）');
    $('#bot').onclick = () => { const L2 = lobbies(); if (L2[room].members.length < 4) { L2[room].members.push({id: 'bot' + Date.now(), name: 'Bot' + L2[room].members.length}); putL(L2); renderLobby(); } };
  }
}
addEventListener('storage', e => { if (e.key === 'lobbies') renderLobby(); });

// ---- ガチャ ----
$('#rates').innerHTML = Object.entries(RARITY).map(([k, r]) => `<tr><td><span class="card r-${k}" style="padding:2px 10px;display:inline-block">${r.n}</span></td><td>${r.p}%</td><td>ATK/HP +${r.v}</td></tr>`).join('');
function roll() {
  let x = Math.random() * 100, a = 0;
  for (const [k, r] of Object.entries(RARITY)) { a += r.p; if (x < a) return k; }
  return 'common';
}
$$('.pull button').forEach(b => b.onclick = () => {
  const n = +b.dataset.n, cost = n * 3000;
  if (S.coins < cost) return alert('コインが足りません');
  S.coins -= cost; const ids = Object.keys(ITEMS), out = [];
  for (let i = 0; i < n; i++) { const k = ids[Math.floor(Math.random() * ids.length)] + '|' + roll(); S.inv[k] = (S.inv[k] || 0) + 1; out.push(k); }
  save();
  $('#result').hidden = false;
  $('#result').innerHTML = `<h2>結果</h2><div class="rgrid">${out.map(k => card(...k.split('|'))).join('')}</div><button class="pri" id="ok" style="margin-top:16px;width:100%">OK</button>`;
  $('#ok').onclick = () => $('#result').hidden = true;
});
$('#reset').onclick = () => { if (confirm('セーブを消去しますか？')) { localStorage.removeItem('dsv'); location.reload(); } };

// ---- 装備 ----
let slot = 'weapon';
function stats() {
  const t = {atk: 0, hp: 0, spd: 0, aura: []};
  for (const k of Object.values(S.eq)) {
    if (!k) continue; const [id, r] = k.split('|'), it = ITEMS[id], m = it.mod || {};
    if (['weapon','belt'].includes(it.slot)) t.atk += RARITY[r].v; else t.hp += RARITY[r].v;
    t.atk += m.atk || 0; t.hp += m.hp || 0; t.spd += m.spd || 0; if (it.aura) t.aura.push(it.aura);
  }
  return t;
}
function renderEquip() {
  $('#slots').innerHTML = Object.entries(SLOTS).map(([s, n]) => { const k = S.eq[s];
    return `<div class="sbox ${s === slot ? 'on' : ''}" data-s="${s}">${n}${k ? ITEMS[k.split('|')[0]].svg : '<div style="height:48px;opacity:.3;line-height:48px">なし</div>'}<div class="r-${k ? k.split('|')[1] : ''}" style="border-radius:6px;color:#111">${k ? RARITY[k.split('|')[1]].n : '-'}</div></div>`; }).join('');
  $$('.sbox').forEach(e => e.onclick = () => { slot = e.dataset.s; renderEquip(); });
  const t = stats();
  $('#sum').innerHTML = `ATK <b>+${t.atk}</b> ／ HP <b>+${t.hp}</b> ／ 速度 <b>${t.spd >= 0 ? '+' : ''}${t.spd}</b>${t.aura.length ? '<br>範囲効果：' + t.aura.join('、') : ''}`;
  const list = Object.keys(S.inv).filter(k => S.inv[k] > 0 && ITEMS[k.split('|')[0]].slot === slot)
    .sort((a, b) => RARITY[b.split('|')[1]].v - RARITY[a.split('|')[1]].v);
  $('#inv').innerHTML = list.length ? list.map(k => card(...k.split('|'), `<span class="cnt">×${S.inv[k]}</span>`, S.eq[slot] === k ? 'eq' : '')).join('') : '<div class="empty">所持している装備がありません。ガチャで入手しよう！</div>';
  $$('#inv .card').forEach(e => e.onclick = () => { S.eq[slot] = S.eq[slot] === e.dataset.k ? null : e.dataset.k; save(); renderEquip(); });
}
save(); renderLobby();
