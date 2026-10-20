'use strict';
/* ============================================================
   PERSONALIZE YOUR SURPRISE HERE! Edit only this section.
   Each string in letterPages is a separate page of the letter.
   Use \n for line breaks. No HTML needed.
   ============================================================ */
const PERSONAL = {
  musicFile: './assets/music/birthday-song.mp3',
  letterPages: [
    'it’s your special day! the day my kimkim was born. i know you’re not used to celebrating your birthday because of certain circumstances in the past, but let me celebrate this wonderful day with you.',
    'yk, i’ve been looking forward to this day because i badly want to enjoy it with you, in hopes that i can at least make you happy this year. it really saddens me whenever i hear about how you experienced and celebrated your special day in the previous years. i hope that i can make you happy even with this small gift from me.',
    'i wish that you achieve all the things you’ve always prayed for, good health, happiness and all the good things this life has to offer. may you also succeed in life and get good grades. i also wish that when you achieve all of these, i’ll still be by your side, continuously supporting and loving you.',
    'again, happy happy birthday, bebi, my baby girl, my lovelove, my kimkim. enjoy your special day. i love you so much, always.'
  ],
  flowerSecret: 'No bouquet could ever be as beautiful as the happiness and joy you bring in me. Happy birthday, bebi',
  wishMessage: 'May all your wishes come true, lovelove',
  bottleWishes: [
    {title: 'For Your Happiness', text: 'i wish for your days to be filled with genuine happiness, because you deserve every beautiful thing this world has to offer.'},
    {title: 'For Your Dreams', text: "i wish that every dream you've been working so hard for slowly becomes true. i'll always be here cheering and supporting you."},
    {title: 'For Your Health', text: 'i wish for you to always be healthy and surrounded by people who truly care for you.'},
    {title: 'For Your Success', text: "i wish that you succeed in everything you pursue, especially your studies. i'm always proud of you, bebi."},
    {title: 'For Us', text: "and lastly, i wish that no matter where life takes us, we'll continue choosing and loving each other every single day."}
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const timers = new Set();
let activeModal = null;
let lastTrigger = null;
let letterIndex = 0;
let cakeCompleted = false;
let wishing = false;
let flowerFinished = false;
let confettiGeneration = 0;
let bottleIndex = 0;
let bottleAnimating = false;
let introStarted = false;

function schedule(callback, delay) {
  const id = window.setTimeout(() => { timers.delete(id); callback(); }, reducedMotion.matches ? 0 : delay);
  timers.add(id);
  return id;
}
function cancelTimers() { for (const id of timers) clearTimeout(id); timers.clear(); }
function setText(selector, value) { $(selector).textContent = value; }

// Decorative hearts and stars, limited to 17 for mobile performance.
const ambient = $('#ambient');
for (let i = 0; i < 17; i++) {
  const glyph = document.createElement('span');
  glyph.className = 'ambient-item';
  glyph.textContent = ['♡', '✧', '⋆', '♡'][i % 4];
  glyph.style.setProperty('--left', `${(i * 47 + 9) % 98}%`);
  glyph.style.setProperty('--size', `${13 + i % 4 * 7}px`);
  glyph.style.setProperty('--duration', `${15 + (i * 3) % 15}s`);
  glyph.style.setProperty('--delay', `${-i * 1.7}s`);
  ambient.append(glyph);
}

// Flip cards: only the card face is initially focusable.
$$('.flip-card').forEach(card => {
  const front = $('.card-front', card);
  const backButtons = $$('button', $('.card-back', card));
  const flip = (flipped) => {
    card.classList.toggle('flipped', flipped);
    front.setAttribute('aria-expanded', String(flipped));
    front.tabIndex = flipped ? -1 : 0;
    backButtons.forEach(button => button.tabIndex = flipped ? 0 : -1);
    (flipped ? $('.open-btn', card) : front).focus({preventScroll:true});
  };
  backButtons.forEach(button => button.tabIndex = -1);
  front.addEventListener('click', () => flip(true));
  $('.flip-back', card).addEventListener('click', () => flip(false));
});

function openModal(type, trigger) {
  if (activeModal) closeModal();
  lastTrigger = trigger;
  activeModal = $(`#${type}-modal`);
  activeModal.hidden = false;
  activeModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  $('.close-modal', activeModal).focus({ preventScroll: true });
  if (type === 'letter') startLetter();
  if (type === 'cake') startCake();
  if (type === 'flowers') startFlowers();
  if (type === 'wishes') startWishes();
}
function closeModal() {
  if (!activeModal) return;
  cancelTimers();
  confettiGeneration++;
  $('#confetti-field').replaceChildren();
  $('#petal-field').replaceChildren();
  bottleAnimating = false;
  activeModal.hidden = true;
  activeModal.setAttribute('aria-hidden', 'true');
  activeModal = null;
  document.body.classList.remove('modal-open');
  lastTrigger?.focus({ preventScroll: true });
}
$$('[data-open]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.open, button)));
$$('[data-close]').forEach(button => button.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => {
  if (!activeModal) return;
  if (event.key === 'Escape') { closeModal(); return; }
  if (event.key === 'Tab') {
    const focusable = $$('button:not(:disabled)', activeModal).filter(el => el.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

// Letter: flap opens, paper slides up, then paginated letter appears.
function startLetter() {
  cancelTimers();
  const envelope = $('#envelope-wrap');
  envelope.classList.remove('opening');
  $('#envelope-stage').hidden = false;
  $('#letter-paper').hidden = true;
  letterIndex = 0;
  renderLetter();
  // Reflow ensures replay works if opening animation was interrupted.
  void envelope.offsetWidth;
  schedule(() => envelope.classList.add('opening'), 420);
  schedule(() => {
    $('#envelope-stage').hidden = true;
    $('#letter-paper').hidden = false;
  }, 2450);
}
function renderLetter() {
  const pages = PERSONAL.letterPages.length ? PERSONAL.letterPages : ['Happy birthday, my bebi'];
  $('#letter-copy').textContent = pages[letterIndex];
  $('#letter-copy').style.animation = 'none';
  void $('#letter-copy').offsetHeight;
  $('#letter-copy').style.animation = '';
  $('#letter-counter').textContent = `${letterIndex + 1} / ${pages.length}`;
  $('#letter-prev').disabled = letterIndex === 0;
  $('#letter-next').textContent = letterIndex === pages.length - 1 ? 'With All My Love ♡' : 'Next →';
}
$('#letter-prev').addEventListener('click', () => { if (letterIndex > 0) {letterIndex--;renderLetter();} });
$('#letter-next').addEventListener('click', () => { if (letterIndex === PERSONAL.letterPages.length - 1) { heartsBurst($('#letter-paper')); return; } letterIndex++; renderLetter(); });
$('#letter-replay').addEventListener('click', startLetter);

// Cake: sequential layer assembly, candle lighting and timed confetti.
function startCake() {
  cancelTimers();
  confettiGeneration++;
  $('#confetti-field').replaceChildren();
  const scene = $('#cake-scene');
  scene.className = 'cake-scene';
  $('.cake-inner').classList.remove('celebrating');
  cakeCompleted = false;
  wishing = false;
  $('#make-wish').disabled = true;
  setText('#wish-response', '');
  void scene.offsetWidth;
  schedule(() => scene.classList.add('step-1'), 240);
  schedule(() => {scene.className = 'cake-scene step-2';}, 1040);
  schedule(() => {scene.className = 'cake-scene step-3';}, 1870);
  schedule(() => {
    scene.className = 'cake-scene ready';
    $('.cake-inner').classList.add('celebrating');
    cakeCompleted = true;
    $('#make-wish').disabled = false;
    burstConfetti();
  }, 2930);
}
function burstConfetti() {
  if (!activeModal || activeModal.id !== 'cake-modal' || reducedMotion.matches) return;
  const field = $('#confetti-field');
  const generation = ++confettiGeneration;
  field.replaceChildren();
  const colors = ['#E8A1BC','#F6CAD9','#F5D7A3','#D1B4D8','#C6DDC1','#FFFFFF'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    const side = i % 2 === 0 ? 0 : 1;
    piece.style.setProperty('--x', side ? '98%' : '2%');
    piece.style.setProperty('--y', `${26 + (i * 17 % 52)}%`);
    piece.style.setProperty('--w', `${5 + i % 5}px`);
    piece.style.setProperty('--h', `${7 + i % 7}px`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    piece.style.setProperty('--dx', `${(side ? -1 : 1) * (75 + (i * 53 % 470))}px`);
    piece.style.setProperty('--dy', `${-130 + i * 37 % 550}px`);
    piece.style.setProperty('--r', `${i * 15}deg`);
    piece.style.setProperty('--spin', `${i * 74}deg`);
    field.append(piece);
  }
  schedule(() => { if (generation === confettiGeneration) field.replaceChildren(); }, 3000);
}
$('#make-wish').addEventListener('click', () => {
  if (!cakeCompleted || wishing) return;
  wishing = true;
  $('#cake-scene').classList.add('wished');
  setText('#wish-response', PERSONAL.wishMessage);
  $('#make-wish').disabled = true;
  burstConfetti();
});
$('#cake-replay').addEventListener('click', startCake);

// Bouquet: seven independently blooming illustrated flowers.
function startFlowers() {
  cancelTimers();
  const scene = $('#bouquet-scene');
  scene.className = 'bouquet-scene';
  flowerFinished = false;
  $('#flower-note').hidden = true;
  $('#flower-quote').classList.remove('quote-shown');
  $('#flower-secret').textContent = 'One More Little Surprise ♡';
  $('#petal-field').replaceChildren();
  void scene.offsetWidth;
  for (let index = 1; index <= 7; index++) schedule(() => {scene.className = `bouquet-scene bloom-${index}`;}, 200 + index * 360);
  schedule(() => {
    scene.className = 'bouquet-scene bloom-7 finished';
    flowerFinished = true;
    $('#flower-quote').classList.add('quote-shown');
    addPetals();
  }, 3100);
}
function addPetals() {
  if (reducedMotion.matches) return;
  const field = $('#petal-field');
  field.replaceChildren();
  for (let i = 0; i < 13; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.setProperty('--x', `${(i * 67 + 9) % 96}%`);
    petal.style.setProperty('--t', `${4 + i % 4}s`);
    petal.style.setProperty('--delay', `${-i * .55}s`);
    field.append(petal);
  }
}
$('#flower-secret').addEventListener('click', () => {
  $('#flower-note').textContent = PERSONAL.flowerSecret;
  $('#flower-note').hidden = false;
  $('#flower-secret').textContent = 'For you, always ♡';
});
$('#flower-replay').addEventListener('click', startFlowers);

/* ===========================================================
   OPENING DISC + AUDIO: no autoplay; works without an MP3.
   =========================================================== */
const music = $('#birthday-music');
music.src = PERSONAL.musicFile;
function syncMusicButton() {
  const playing = !music.paused;
  $('#music-toggle').setAttribute('aria-pressed', String(playing));
  $('#music-toggle').setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  $('#music-status').textContent = playing ? 'Pause music' : 'Play music';
}
music.addEventListener('play', syncMusicButton);
music.addEventListener('pause', syncMusicButton);
music.addEventListener('error', () => { $('#music-status').textContent = 'Music unavailable'; $('#music-toggle').disabled = true; });
$('#music-toggle').addEventListener('click', () => {
  if (music.paused) music.play().catch(() => syncMusicButton());
  else music.pause();
});
$('#vinyl-button').addEventListener('click', () => {
  if (introStarted) return;
  introStarted = true;
  // play() is invoked synchronously from the user's actual click.
  music.play().catch(() => syncMusicButton());
  $('#vinyl-button').classList.add('spinning');
  const short = reducedMotion.matches;
  window.setTimeout(() => {
    $('#intro-scene').hidden = true;
    $('#greeting-scene').hidden = false;
    $('#greeting-scene').classList.add('show-words');
  }, short ? 0 : 850);
  window.setTimeout(() => {
    $('#greeting-scene').hidden = true;
    $('#home').hidden = false;
    $('#home').classList.add('home-revealed');
    $('#music-toggle').hidden = false;
    syncMusicButton();
  }, short ? 150 : 5150);
});

function heartsBurst(target) {
  if (reducedMotion.matches) return;
  const field = document.createElement('div');
  field.className = 'hearts-burst';
  for (let i = 0; i < 14; i++) {
    const heart = document.createElement('span');
    heart.textContent = '♡';
    heart.style.setProperty('--drift', `${(i - 7) * 18}px`);
    heart.style.setProperty('--stagger', `${i * 55}ms`);
    field.append(heart);
  }
  target.append(field);
  window.setTimeout(() => field.remove(), 1900);
}

/* ===========================================================
   WISH BOTTLE: all five notes are stored in PERSONAL above.
   =========================================================== */
function startWishes() {
  bottleIndex = 0;
  bottleAnimating = false;
  $('#wish-ending').hidden = true;
  $('#wishes-replay').hidden = true;
  $('#wish-next').hidden = false;
  $('#wish-parchment').hidden = true;
  $('#wish-next').disabled = true;
  $('#bottle-open').classList.add('uncorked');
  updateBottle();
  revealWish();
}
function updateBottle() {
  $$('.rolled-note', $('#bottle-open')).forEach((note, i) => {note.hidden = i < bottleIndex;});
}
function revealWish() {
  if (bottleAnimating || bottleIndex >= PERSONAL.bottleWishes.length || !activeModal) return;
  bottleAnimating = true;
  $('#wish-parchment').hidden = true;
  $('#wish-next').disabled = true;
  const stage = $('#wish-animation');
  stage.classList.remove('unfurl');
  void stage.offsetWidth;
  stage.classList.add('unfurl');
  schedule(() => {
    if (!activeModal || activeModal.id !== 'wishes-modal') return;
    const wish = PERSONAL.bottleWishes[bottleIndex];
    $('#wish-title').textContent = wish.title;
    $('#wish-copy').textContent = wish.text;
    $('#wish-count').textContent = `Wish ${bottleIndex + 1} of ${PERSONAL.bottleWishes.length}`;
    $('#wish-parchment').hidden = false;
    bottleIndex++;
    updateBottle();
    bottleAnimating = false;
    $('#wish-next').disabled = false;
    $('#wish-next').textContent = bottleIndex === PERSONAL.bottleWishes.length ? 'Finish Our Wishes ♡' : 'Next Wish ♡';
  }, 1050);
}
$('#bottle-open').addEventListener('click', () => openModal('wishes', $('#bottle-open')));
$('#wish-next').addEventListener('click', () => {
  if (bottleAnimating) return;
  if (bottleIndex === PERSONAL.bottleWishes.length) {
    $('#wish-parchment').hidden = true;
    $('#wish-animation').classList.remove('unfurl');
    $('#wish-next').hidden = true;
    $('#wish-ending').hidden = false;
    $('#wishes-replay').hidden = false;
    heartsBurst($('#wish-ending'));
  } else revealWish();
});
$('#wishes-replay').addEventListener('click', () => { cancelTimers(); startWishes(); });
