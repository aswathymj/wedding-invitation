import { wedding } from './data/wedding.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = value => String(value).padStart(2, '0');
let opened = false;
let petalFallPending = false;
// Keep the cover as the only scrollable view until the viewer opens it.
document.documentElement.classList.add('invitation-locked');
if (location.hash) history.replaceState(null, '', `${location.pathname}${location.search}`);
const [weddingYear, weddingMonth, weddingDay] = wedding.date.split('-').map(Number);
const weddingDateReference = new Date(Date.UTC(weddingYear, weddingMonth - 1, weddingDay, 12));

function zonedLocalInstant(date, time, timeZone) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let instant = desired;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(instant));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const rendered = Date.UTC(+values.year, +values.month - 1, +values.day, +values.hour, +values.minute, +values.second);
    instant += desired - rendered;
  }
  return instant;
}

function bindWeddingContent() {
  const colorVars = {
    paper: '--paper', paperDeep: '--paper-deep', ink: '--ink', muted: '--muted',
    accent: '--maroon', accentDeep: '--wine', gold: '--gold', goldLight: '--gold-light',
    flower: '--theme-flower', leaf: '--theme-leaf'
  };
  for (const [key, cssVar] of Object.entries(colorVars)) {
    document.documentElement.style.setProperty(cssVar, wedding.theme.colors[key]);
  }
  for (const [key, path] of Object.entries(wedding.theme.artwork)) {
    document.documentElement.style.setProperty(`--theme-${key}`, `url("${path}")`);
  }
  const displayNames = `${wedding.couple.first} & ${wedding.couple.second}`;
  document.title = `${displayNames} | A Thousand Petals, One Promise`;
  $('.wordmark').innerHTML = `${wedding.couple.first[0]} <span>&</span> ${wedding.couple.second[0]}`;
  $('.wordmark').setAttribute('aria-label', `${displayNames} home`);
  $('meta[name="description"]').content = wedding.share.description;
  $('meta[property="og:title"]').content = wedding.share.title.replace('Aswathy & Arjun', displayNames);
  $('meta[property="og:description"]').content = wedding.share.description.replace('Aswathy & Arjun', displayNames);
  $('.cover-line').innerHTML = wedding.coverLine.replace(', ', ',<br/>');
  $('.card-names').innerHTML = `${wedding.couple.first} <span>&</span> ${wedding.couple.second}`;
  $('.hero-names').innerHTML = `${wedding.couple.first} <em>&</em> ${wedding.couple.second}`;
  $('.hero-invite').textContent = wedding.heroInvitation;
  $$('.letter-copy p').forEach((p, i) => { if (wedding.invitationMessage[i]) p.textContent = wedding.invitationMessage[i]; });
  $('.date-number').innerHTML = `${weddingDay} <span>${new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(weddingDateReference).toUpperCase()}</span>`;
  $('.date-year').textContent = `${new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' }).format(weddingDateReference).toUpperCase()} · ${weddingYear}`;
  $('.date-time').innerHTML = `Muhurtham<br/><strong>${wedding.startTime.replace(/^([0-9]{2}):([0-9]{2})$/, (_, h, m) => { const n = Number(h) % 12 || 12; return `${n}:${m} ${Number(h) >= 12 ? 'PM' : 'AM'}`; })} – ${wedding.endTime.replace(/^([0-9]{2}):([0-9]{2})$/, (_, h, m) => `${Number(h) % 12 || 12}:${m} ${Number(h) >= 12 ? 'PM' : 'AM'}`)} ${wedding.timeZoneLabel}</strong>`;
  $('.accessible-date').textContent = `${new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(weddingDateReference)}. Muhurtham: ${$('.date-time strong').textContent}.`;
  const closingNames = $('.closing-names');
  closingNames.replaceChildren();
  const accessibleNames = document.createElement('span');
  accessibleNames.className = 'sr-only';
  accessibleNames.textContent = `${wedding.couple.first} and ${wedding.couple.second}`;
  closingNames.append(accessibleNames);
  let letterIndex = 0;
  const appendAnimatedName = (name, tagName = 'span') => {
    for (const character of name) {
      const letter = document.createElement(tagName);
      letter.className = 'name-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.style.setProperty('--i', letterIndex++);
      letter.textContent = character;
      closingNames.append(letter);
    }
  };
  appendAnimatedName(wedding.couple.first);
  closingNames.append(document.createTextNode(' '));
  appendAnimatedName('&', 'em');
  closingNames.append(document.createTextNode(' '));
  appendAnimatedName(wedding.couple.second);
  $('.signature span').textContent = `${wedding.couple.first} & ${wedding.couple.second}`;
  $('.closing-footer').textContent = 'MADE WITH LOVE';
  const rows = $$('.detail-row');
  rows[0].querySelector('p').textContent = $('.date-time strong').textContent;
  rows[1].querySelector('p').innerHTML = `${wedding.venue.name}<br/>${wedding.venue.address}`;
  $('.portrait-image img').src = wedding.heroPhoto;
  $('.portrait-image img').alt = wedding.heroPhotoAlt;
}
bindWeddingContent();

function addLotusPetalAccents() {
  $$('main section:not(.cover)').forEach((section, sectionIndex) => {
    const layer = document.createElement('div');
    layer.className = 'lotus-petal-layer';
    layer.setAttribute('aria-hidden', 'true');
    const petalCount = section.id === 'welcome' ? 10 : 4;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('span');
      petal.className = 'lotus-petal';
      petal.style.setProperty('--petal-index', i);
      petal.style.setProperty('--page-index', sectionIndex % 3);
      layer.append(petal);
    }
    section.prepend(layer);
  });
}
addLotusPetalAccents();

const weddingInstant = zonedLocalInstant(wedding.date, wedding.startTime, wedding.timeZone);
function googleCalendarUrl() {
  const start = new Date(weddingInstant);
  const end = new Date(start.getTime() + wedding.calendar.durationMinutes * 60000);
  const googleDate = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: wedding.calendar.title,
    dates: `${googleDate(start)}/${googleDate(end)}`,
    details: wedding.share.description,
    location: `${wedding.venue.name}, ${wedding.venue.address}`,
    ctz: wedding.timeZone
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
$('#googleCalendarButton').href = googleCalendarUrl();
function updateCountdown() {
  const diff = weddingInstant - Date.now();
  if (diff <= 0) {
    $('#countdown').hidden = true;
    $('#countdownDone').hidden = false;
    $('#countdownDone').textContent = wedding.postWeddingMessage;
    return;
  }
  const seconds = Math.floor(diff / 1000);
  $('[data-unit="days"]').textContent = Math.floor(seconds / 86400);
  $('[data-unit="hours"]').textContent = pad(Math.floor(seconds % 86400 / 3600));
  $('[data-unit="minutes"]').textContent = pad(Math.floor(seconds % 3600 / 60));
  $('[data-unit="seconds"]').textContent = pad(seconds % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

function openInvitation() {
  if (opened) return;
  opened = true;
  petalFallPending = true;
  document.documentElement.classList.remove('invitation-locked');
  document.body.classList.add('invitation-open');
  $('#openInvitation').setAttribute('aria-expanded', 'true');
  // Let the cover collapse before calculating the welcome page's position;
  // scrolling during the cover animation can land one section too far down.
  window.setTimeout(() => {
    $('#welcome').scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', block: 'start' });
  }, prefersReduced ? 0 : 650);
  startMusic();
}
$('#openInvitation').addEventListener('click', openInvitation);
$('#giftRibbon').addEventListener('click', openInvitation);
$('#openInvitation').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation(); }
});
document.addEventListener('click', e => {
  if (!opened && e.target.closest('a[href^="#"]')) e.preventDefault();
}, true);

const audio = $('#backgroundAudio');
audio.src = wedding.backgroundMusic;
async function startMusic() {
  try {
    await audio.play();
    $('#musicToggle').classList.add('playing');
    $('#musicToggle').setAttribute('aria-label', 'Pause background music');
  } catch (error) {
    $('#musicToggle').setAttribute('aria-label', 'Play background music');
    showToast(error.name === 'NotAllowedError' ? 'Tap Music to allow playback' : 'Music could not load. Please try again');
  }
}
function stopMusic() { audio.pause(); $('#musicToggle').classList.remove('playing'); $('#musicToggle').setAttribute('aria-label', 'Play background music'); }
$('#musicToggle').addEventListener('click', () => audio.paused ? startMusic() : stopMusic());

// Scroll reveals remain purely decorative: content is visible when JS or motion is unavailable.
if ('IntersectionObserver' in window && !prefersReduced) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  $$('.reveal, .gallery-item, .reveal-section, .closing-section').forEach(el => revealObserver.observe(el));
} else $$('.reveal, .gallery-item, .reveal-section, .closing-section').forEach(el => el.classList.add('is-visible'));

const letterPage = $('#letter');
const letterRings = $('.letter-inner', letterPage);
if ('IntersectionObserver' in window && !prefersReduced) {
  const ringObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      letterRings.classList.add('rings-ready');
      ringObserver.unobserve(entry.target);
    }
  }), { rootMargin: '-25% 0px -25% 0px', threshold: 0.35 });
  ringObserver.observe(letterPage);
} else letterRings.classList.add('rings-ready');

const galleryRoot = $('#gallery');
wedding.gallery.forEach((photo, index) => {
  const button = document.createElement('button');
  button.className = `gallery-item ${photo.shape}`;
  button.type = 'button';
  button.setAttribute('aria-label', `View photo ${index + 1}: ${photo.alt}`);
  button.innerHTML = `<img src="${photo.src}" alt="${photo.alt}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async"><span class="gallery-zoom" aria-hidden="true">↗</span>${photo.caption ? `<span class="gallery-caption">${photo.caption}</span>` : ''}`;
  button.addEventListener('click', () => { photoTrigger = button; showPhoto(index); });
  galleryRoot.append(button);
});
$('#galleryPrev').addEventListener('click', () => galleryRoot.scrollBy({ left: -galleryRoot.clientWidth * .8, behavior: prefersReduced ? 'instant' : 'smooth' }));
$('#galleryNext').addEventListener('click', () => galleryRoot.scrollBy({ left: galleryRoot.clientWidth * .8, behavior: prefersReduced ? 'instant' : 'smooth' }));

const lightbox = $('#lightbox');
let photoIndex = 0;
let photoTrigger = null;
function showPhoto(index) {
  photoIndex = (index + wedding.gallery.length) % wedding.gallery.length;
  const photo = wedding.gallery[photoIndex];
  $('img', lightbox).src = photo.src;
  $('img', lightbox).alt = photo.alt;
  $('.lightbox-count', lightbox).textContent = `${pad(photoIndex + 1)} / ${pad(wedding.gallery.length)}${photo.caption ? ` · ${photo.caption}` : ''}`;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  $('.lightbox-close', lightbox).focus();
}
function closePhoto() { lightbox.hidden = true; document.body.classList.remove('lightbox-open'); photoTrigger?.focus(); }
$('.lightbox-close', lightbox).addEventListener('click', closePhoto);
$('.lightbox-prev', lightbox).addEventListener('click', () => showPhoto(photoIndex - 1));
$('.lightbox-next', lightbox).addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closePhoto(); });
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closePhoto();
  if (e.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(photoIndex + 1);
  if (e.key === 'Tab') {
    const items = [$('.lightbox-close', lightbox), $('.lightbox-prev', lightbox), $('.lightbox-next', lightbox)];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
let touchX = 0;
lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - touchX;
  if (Math.abs(dx) > 45) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
}, { passive: true });

// Lightweight canvas scratch card. Pointer capture keeps touch scrolling available outside the card.
const canvas = $('#scratchCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let scratching = false, lastPoint = null, isRevealed = false, checkScratch = 0;
function paintScratchSurface() {
  const box = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(box.width * dpr); canvas.height = Math.round(box.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = box.width, h = box.height;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#e7d7b4'); grad.addColorStop(.48, '#f4ead4'); grad.addColorStop(1, '#d8c195');
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(126,91,44,.25)'; ctx.lineWidth = 1; ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = '#876d42'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '500 10px "DM Sans", sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('A LITTLE SOMETHING FOR YOU', w / 2, h / 2 - 12);
  ctx.font = '22px "Playfair Display", serif'; ctx.letterSpacing = '0px'; ctx.fillText('Scratch to discover', w / 2, h / 2 + 14);
  ctx.font = '18px serif'; ctx.fillText('✿', w / 2, h - 30);
  ctx.globalCompositeOperation = 'source-over';
}
function revealDate() {
  if (isRevealed) return;
  isRevealed = true; canvas.classList.add('scratched-away'); $('#scratchHint').textContent = 'A day we cannot wait to share with you';
  launchPetals();
}
function scratchPoint(e) {
  const box = canvas.getBoundingClientRect();
  return { x: e.clientX - box.left, y: e.clientY - box.top };
}
canvas.addEventListener('pointerdown', e => {
  if (isRevealed) return;
  scratching = true; lastPoint = scratchPoint(e); canvas.setPointerCapture(e.pointerId);
  ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(lastPoint.x, lastPoint.y, 23, 0, Math.PI * 2); ctx.fill();
});
canvas.addEventListener('pointermove', e => {
  if (!scratching || isRevealed) return;
  const point = scratchPoint(e); ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(lastPoint.x, lastPoint.y); ctx.lineTo(point.x, point.y); ctx.stroke(); lastPoint = point;
  if (++checkScratch % 8 === 0) {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0; for (let i = 3; i < pixels.length; i += 4 * 10) if (pixels[i] < 20) clear++;
    if (clear / (pixels.length / 4 / 10) > .44) revealDate();
  }
});
canvas.addEventListener('pointerup', () => { scratching = false; lastPoint = null; });
canvas.addEventListener('pointercancel', () => { scratching = false; lastPoint = null; });
$('#revealDate').addEventListener('click', revealDate);
paintScratchSurface(); addEventListener('resize', () => { if (!isRevealed) paintScratchSurface(); });
function launchPetals() {
  const container = $('#petalBurst');
  ['✿','❀','✽','❁','·','✿','❀','·','✽','❁','✿','·'].forEach((glyph, i) => {
    const petal = document.createElement('span'); petal.textContent = glyph; petal.className = 'petal';
    petal.style.setProperty('--x', `${(i - 5.5) * 24}px`); petal.style.setProperty('--r', `${(i % 2 ? 1 : -1) * (90 + i * 13)}deg`);
    container.append(petal); setTimeout(() => petal.remove(), 1800);
  });
}

function launchFallingPetalsToScratchCard() {
  const section = $('#date');
  const card = $('#scratchCard');
  const container = $('#petalBurst');
  if (!section || !card || !container || prefersReduced) return;
  const sectionRect = section.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardLeft = cardRect.left - sectionRect.left;
  const cardTop = cardRect.top - sectionRect.top;
  const cardWidth = cardRect.width;
  const cardHeight = cardRect.height;
  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('span');
    petal.className = 'falling-petal';
    const gradientId = `lotus-falling-gradient-${i}`;
    petal.innerHTML = `<svg viewBox="0 0 48 52" aria-hidden="true"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4f6"/><stop offset=".48" stop-color="#f3b3c4"/><stop offset="1" stop-color="#d77f9e"/></linearGradient></defs><path class="falling-petal-shape" d="M24 2 C29 11 42 20 39 35 C37 45 30 50 24 50 C17 50 10 44 9 35 C6 20 19 11 24 2Z" fill="url(#${gradientId})"/><path class="falling-petal-vein" d="M24 47 C23 34 23 18 24 5 M22 34 C17 29 14 23 13 19 M26 34 C31 29 34 23 35 19"/></svg>`;
    const startX = Math.random() * Math.max(1, sectionRect.width - 20) + 10;
    const endX = cardLeft + 10 + Math.random() * Math.max(1, cardWidth - 30);
    const endY = cardTop + cardHeight * (.2 + Math.random() * .7);
    petal.style.left = `${startX}px`;
    petal.style.top = '-28px';
    petal.style.width = `${19 + Math.random() * 9}px`;
    petal.style.height = `${26 + Math.random() * 12}px`;
    container.append(petal);
    const duration = 1350 + Math.random() * 950;
    petal.animate([
      { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 0 },
      { transform: `translate3d(${(startX + endX) / 2 - startX + (Math.random() - .5) * 90}px, ${endY * .55}px, 0) rotate(180deg)`, opacity: .88, offset: .58 },
      { transform: `translate3d(${endX - startX}px, ${endY + 28}px, 0) rotate(${300 + Math.random() * 240}deg)`, opacity: .62 }
    ], { duration, delay: i * 75, easing: 'cubic-bezier(.22,.62,.34,1)', fill: 'forwards' });
    setTimeout(() => petal.remove(), duration + i * 75 + 250);
  }
}

const petalFallObserver = new IntersectionObserver(entries => {
  if (!petalFallPending || !entries.some(entry => entry.isIntersecting)) return;
  petalFallPending = false;
  launchFallingPetalsToScratchCard();
}, { threshold: .18 });
petalFallObserver.observe($('#date'));

const mapLink = $('#mapsLink');
if (wedding.venue.mapsUrl) mapLink.href = wedding.venue.mapsUrl;
else { mapLink.classList.add('disabled'); mapLink.removeAttribute('href'); mapLink.setAttribute('aria-disabled', 'true'); $('#mapsNote').hidden = false; $('#mapsNote').textContent = wedding.venue.mapsPlaceholder; }

const toast = $('#toast'); let toastTimer;
function showToast(message) { toast.textContent = message; toast.classList.add('shown'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('shown'), 2800); }
function invitationUrl() { return wedding.share.publicUrl || window.location.href.split('#')[0]; }
async function shareInvitation() {
  const displayNames = `${wedding.couple.first} & ${wedding.couple.second}`;
  const shareData = {
    title: wedding.share.title.replace('Aswathy & Arjun', displayNames),
    text: wedding.share.description.replace('Aswathy & Arjun', displayNames),
    url: invitationUrl()
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { const text = `${shareData.text}\n${shareData.url}`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer'); }
  } catch (error) {
    if (error.name === 'AbortError') return;
    try { await navigator.clipboard.writeText(shareData.url); showToast('Invitation link copied'); }
    catch { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n${shareData.url}`)}`, '_blank', 'noopener,noreferrer'); }
  }
}
$('#shareButton').addEventListener('click', shareInvitation);

$('#replayButton').addEventListener('click', () => {
  stopMusic(); opened = false; document.documentElement.classList.add('invitation-locked'); document.body.classList.remove('invitation-open');
  $('#top').scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth' }); $('#openInvitation').focus({ preventScroll: true });
});
