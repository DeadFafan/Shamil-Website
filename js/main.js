// ===== Theme system: light / dark / auto (follows system + time) =====
const THEME_KEY = 'shamil-theme';
const root = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

function systemPrefersDark(){
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function isNightHour(){
  const h = new Date().getHours();
  return h >= 18 || h < 6;
}
function applyTheme(mode){
  let effective = mode;
  if(mode === 'auto'){
    effective = (systemPrefersDark() || isNightHour()) ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', effective);
  const icons = {
    light: {svg:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', label:'Terang'},
    dark:  {svg:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>', label:'Gelap'},
    auto:  {svg:'<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.4 5.4 0 0 1 12 3Z"/><circle cx="12" cy="12" r="3.2"/>', label:'Otomatis'}
  };
  const cfg = icons[mode];
  if(themeIcon) themeIcon.innerHTML = cfg.svg;
  if(themeLabel) themeLabel.textContent = cfg.label;
}
function getStoredTheme(){
  return localStorage.getItem(THEME_KEY) || 'auto';
}
let currentMode = getStoredTheme();
applyTheme(currentMode);

const themeToggle = document.getElementById('themeToggle');
if(themeToggle){
  themeToggle.addEventListener('click', () => {
    const order = ['light','dark','auto'];
    currentMode = order[(order.indexOf(currentMode)+1) % order.length];
    localStorage.setItem(THEME_KEY, currentMode);
    applyTheme(currentMode);
  });
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if(currentMode === 'auto') applyTheme('auto');
});

// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if(menuBtn){
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// ===== Hero slider =====
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('heroDots');
let heroIndex = 0, heroTimer;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Slide ' + (i+1));
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});
const dots = dotsWrap.querySelectorAll('.hero-dot');

function goToSlide(i){
  slides[heroIndex].classList.remove('active');
  dots[heroIndex].classList.remove('active');
  heroIndex = (i + slides.length) % slides.length;
  slides[heroIndex].classList.add('active');
  dots[heroIndex].classList.add('active');
}
function nextSlide(){ goToSlide(heroIndex + 1); }
function prevSlide(){ goToSlide(heroIndex - 1); }
function startAutoplay(){ heroTimer = setInterval(nextSlide, 5500); }
function stopAutoplay(){ clearInterval(heroTimer); }

document.getElementById('heroNext').addEventListener('click', () => { nextSlide(); stopAutoplay(); startAutoplay(); });
document.getElementById('heroPrev').addEventListener('click', () => { prevSlide(); stopAutoplay(); startAutoplay(); });
const heroEl = document.querySelector('.hero');
heroEl.addEventListener('mouseenter', stopAutoplay);
heroEl.addEventListener('mouseleave', startAutoplay);
startAutoplay();

// ===== Partner logo marquee =====
const PARTNERS = [
  { mark:'MTS', name:'Meratus' },
  { mark:'TNT', name:'Tanto' },
  { mark:'TMS', name:'PT Temas Shipping' },
  { mark:'PKA', name:'PT Pasya Kenzie Alger' },
  { mark:'TEB', name:'TEB' },
  { mark:'HKG', name:'Husakargo' },
  { mark:'SPIL', name:'SPIL' },
  { mark:'MSK', name:'Maersk' },
  { mark:'WKN', name:'Wiratama Kreasi Nusantara' },
  { mark:'KRL', name:'PT Kausyar Rizki Lestari' },
  { mark:'WWM', name:'WWM' },
  { mark:'WAS', name:'Wiratirta Alam Sejahtera' },
  { mark:'YJS', name:'PT Yenang Jaya Sejahtera' },
];

function renderMarquee(elId){
  const track = document.getElementById(elId);
  if(!track) return;
  // duplicate the list twice so the -50% translateX loop is seamless
  const doubled = [...PARTNERS, ...PARTNERS];
  track.innerHTML = doubled.map(p => `
    <div class="partner-badge"><div class="mark">${p.mark}</div><p>${p.name}</p></div>
  `).join('');
}
renderMarquee('marqueeTrack1');
renderMarquee('marqueeTrack2');

// ===== Back to top =====
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('show', window.scrollY > 500));
backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// ===== FAQ chat widget (rule-based, works fully offline) =====
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

chatToggle.addEventListener('click', () => { chatPanel.classList.add('open'); chatInput.focus(); });
chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

function addBubble(text, who){
  const div = document.createElement('div');
  div.className = 'bubble ' + who;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

const FAQ = [
  { k:['layanan','servis','service'], a:'Kami melayani Sea Freight, Air Freight, Land Freight, Customs Clearance, Warehousing, dan Project Cargo. Layanan mana yang Anda butuhkan?' },
  { k:['harga','tarif','biaya','quote','penawaran'], a:'Tarif tergantung rute, jenis kargo, dan moda pengiriman. Isi form kontak di bawah atau hubungi kami untuk penawaran resmi.' },
  { k:['lacak','tracking','status kiriman'], a:'Untuk pelacakan kiriman, mohon siapkan nomor referensi booking Anda dan hubungi tim operasional kami di email/telepon yang tertera.' },
  { k:['jam','operasional','buka','waktu'], a:'Tim operasional kami siaga 24/7 untuk kebutuhan pengiriman yang mendesak.' },
  { k:['kontak','hubungi','alamat','email','telepon'], a:'Anda bisa menghubungi kami melalui form kontak di bagian bawah halaman, atau email ke info@shamil-logistik.co.id.' },
  { k:['negara','rute','tujuan','jaringan'], a:'Kami memiliki jaringan mitra di lebih dari 40 negara, mencakup Asia Tenggara, Asia Timur, Timur Tengah, dan Eropa.' },
];

function botReply(msg){
  const lower = msg.toLowerCase();
  const hit = FAQ.find(f => f.k.some(k => lower.includes(k)));
  return hit ? hit.a : 'Terima kasih atas pertanyaannya. Untuk jawaban yang lebih detail, silakan hubungi tim kami melalui form kontak di bawah atau email info@shamil-logistik.co.id.';
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if(!msg) return;
  addBubble(msg, 'user');
  chatInput.value = '';
  setTimeout(() => addBubble(botReply(msg), 'bot'), 450);
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chatInput.value = chip.textContent;
    chatForm.requestSubmit();
  });
});
