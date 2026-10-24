// 装備データ（見た目はSVG、名前・形は同じでレア度で背景とステータスだけ変わる）
const RARITY = {
  common:   {n:'コモン',   v:60,  p:60},
  uncommon: {n:'アンコモン',v:120, p:25},
  rare:     {n:'レア',     v:180, p:11.5},
  epic:     {n:'エピック', v:260, p:3},
  legend:   {n:'レジェンド',v:350, p:0.5},
};
const SLOTS = {weapon:'武器', belt:'ベルト', armor:'防具', boots:'靴'};
const svg = b => `<svg viewBox="0 0 64 64">${b}</svg>`;
const boot = (c, x='') => svg(`<path d="M22 8H38V32L54 40V54H14V40H22Z" fill="${c}" stroke="#222" stroke-width="2"/><rect x="14" y="48" width="40" height="6" fill="#222"/>${x}`);
const belt = (c, buckle) => svg(`<rect x="4" y="24" width="56" height="16" rx="5" fill="${c}" stroke="#222" stroke-width="2"/>${buckle}`);
const body = c => svg(`<path d="M12 14L24 8H40L52 14L56 30L46 32V56H18V32L8 30Z" fill="${c}" stroke="#222" stroke-width="2"/><path d="M32 12V56" stroke="#2226" stroke-width="2" stroke-dasharray="3 3"/>`);

// mod: 装備固有のプラス補正 / aura: 周囲の敵への効果
const ITEMS = {
  kunai:   {name:'クナイ', slot:'weapon', desc:'遠距離に短剣を連射',
    svg: svg('<polygon points="32,3 41,36 32,44 23,36" fill="#cfd8dc" stroke="#222" stroke-width="2"/><rect x="29" y="44" width="6" height="12" fill="#6d4c41"/><circle cx="32" cy="59" r="4" fill="none" stroke="#222" stroke-width="2.5"/>')},
  shotgun: {name:'ショットガン', slot:'weapon', desc:'弾が拡散。近距離ほど高ダメージ',
    svg: svg('<rect x="4" y="22" width="42" height="8" fill="#455a64" stroke="#222" stroke-width="2"/><rect x="14" y="32" width="26" height="6" rx="2" fill="#78909c" stroke="#222" stroke-width="2"/><polygon points="44,24 60,32 56,46 42,34" fill="#8d6e63" stroke="#222" stroke-width="2"/>')},
  stellar: {name:'ステラベルト', slot:'belt', desc:'周囲の敵の攻撃速度-10',
    aura:'敵攻撃速度-10',
    svg: belt('#5c6bc0','<polygon points="32,22 35,30 44,30 37,35 40,43 32,38 24,43 27,35 20,30 29,30" fill="#ffd54f" stroke="#222" stroke-width="1.5"/>')},
  etbelt:  {name:'エターナルベルト', slot:'belt', desc:'攻撃+30', mod:{atk:30},
    svg: belt('#8e2b2b','<circle cx="32" cy="32" r="10" fill="#ffd54f" stroke="#222" stroke-width="2"/><path d="M26 32c0-5 6-5 6 0s6 5 6 0" fill="none" stroke="#222" stroke-width="2"/>')},
  armor:   {name:'鎧', slot:'armor', desc:'耐久あり・速度が落ちる', mod:{hp:30,spd:-10}, svg: body('#90a4ae')},
  leather: {name:'レザーアーマー', slot:'armor', desc:'鎧より耐久は低いが軽い', mod:{hp:15}, svg: body('#8d6e63')},
  etboots: {name:'エターナルブーツ', slot:'boots', desc:'速度+10', mod:{spd:10},
    svg: boot('#26a69a','<path d="M14 30L4 24L8 38Z" fill="#ffd54f" stroke="#222" stroke-width="1.5"/>')},
  frost:   {name:'フロストブーツ', slot:'boots', desc:'速度-15。周囲の敵の速度-5', mod:{spd:-15}, aura:'敵速度-5',
    svg: boot('#4fc3f7','<path d="M32 12V30M25 16L39 26M39 16L25 26" stroke="#fff" stroke-width="2.5"/>')},
};
const STAGES = [
  {name:'草原', sub:'初心者向け', color:'#a5d6a7'},
  {name:'洞窟', sub:'暗闇の迷路', color:'#b0bec5'},
  {name:'雪原', sub:'凍える大地', color:'#b3e5fc'},
  {name:'火山', sub:'灼熱の溶岩', color:'#ffab91'},
];
