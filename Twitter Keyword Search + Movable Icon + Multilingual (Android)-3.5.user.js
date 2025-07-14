// ==UserScript==
// @name         Twitter Keyword Search + Movable Icon + Multilingual (Android)
// @namespace    http://x.com/@happyhojjat
// @version      3.5
// @description  Floating icon to search tweets with draggable translucent modal (fixed drag-touch conflict + UI improvements) - Sorani & Kurmanci & Arabic UI supported - Android-friendly
// @author       @happyhojjat
// @match        https://x.com/*
// @match        https://*.x.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'floatingBtnPos';
  const LANG_KEY = 'searchLang';

  const translations = {
    fa: {
      usernamePlaceholder: "@یوزرنیم",
      keywordPlaceholder: "کلمه مورد نظر را وارد کنید",
      search: "جستجو",
      close: "بستن",
      hideIcon: "مخفی کردن آیکن",
      seconds30: "۳۰ ثانیه",
      seconds60: "۱ دقیقه",
      seconds180: "۳ دقیقه",
      seconds300: "۵ دقیقه",
      alertUsername: "لطفاً یک یوزرنیم وارد کنید یا مطمئن شوید در صفحه پروفایل کاربر هستید.",
      alertKeyword: "لطفاً کلمه‌ای برای جستجو وارد کنید."
    },
    ku: {
      usernamePlaceholder: "@navê bikarhêner",
      keywordPlaceholder: "Gotinê bigere",
      search: "Lêgerîn",
      close: "Girtin",
      hideIcon: "Nîşanê veşêre",
      seconds30: "۳۰ çirke",
      seconds60: "١ deqîqe",
      seconds180: "٣ deqîqe",
      seconds300: "٥ deqîqe",
      alertUsername: "Ji kerema xwe navê bikarhêner binivîse an li rûpelê profîlê be.",
      alertKeyword: "Ji kerema xwe gotinek binivîse bo lêgerînê."
    },
    ckb: {
      usernamePlaceholder: "@ناوی بەکارهێنەر",
      keywordPlaceholder: "وشەیەک بنووسە بۆ گەڕان",
      search: "گەڕان",
      close: "داخستن",
      hideIcon: "نیشانی بشاردەوە",
      seconds30: "٣٠ چرکە",
      seconds60: "١ خولەک",
      seconds180: "٣ خولەک",
      seconds300: "٥ خولەک",
      alertUsername: "تکایە ناوی بەکارهێنەر بنووسە یان دڵنیا بە لە پەڕەی پرۆفایلە.",
      alertKeyword: "تکایە وشەیەک بنووسە بۆ گەڕان."
    },
    ar: {
      usernamePlaceholder: "@اسم المستخدم",
      keywordPlaceholder: "أدخل الكلمة المطلوبة",
      search: "بحث",
      close: "إغلاق",
      hideIcon: "إخفاء الأيقونة",
      seconds30: "٣٠ ثانية",
      seconds60: "١ دقيقة",
      seconds180: "٣ دقائق",
      seconds300: "٥ دقائق",
      alertUsername: "يرجى إدخال اسم مستخدم أو التأكد من أنك في صفحة الملف الشخصي.",
      alertKeyword: "يرجى إدخال كلمة للبحث."
    },
    en: {
      usernamePlaceholder: "@username",
      keywordPlaceholder: "Enter keyword",
      search: "Search",
      close: "Close",
      hideIcon: "Hide icon",
      seconds30: "30 seconds",
      seconds60: "1 minute",
      seconds180: "3 minutes",
      seconds300: "5 minutes",
      alertUsername: "Please enter a username or make sure you're on a profile page.",
      alertKeyword: "Please enter a keyword to search."
    }
  };

  function getSavedPosition() {
    const pos = localStorage.getItem(STORAGE_KEY);
    return pos ? JSON.parse(pos) : { bottom: 95, right: 12 };
  }

  function savePosition(bottom, right) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bottom, right }));
  }

  const position = getSavedPosition();

  const button = document.createElement('button');
  button.innerHTML = '🔍';
  button.id = 'floating-search-button';
  button.style = `
    position: fixed;
    bottom: ${position.bottom}px;
    right: ${position.right}px;
    z-index: 9999999;
    background: #FF0000;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-size: 16px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
  `;
  document.body.appendChild(button);

  let touchTimer, isDragging = false, startY, startX, startBottom, startRight;

  button.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    startBottom = parseInt(button.style.bottom);
    startRight = parseInt(button.style.right);
    touchTimer = setTimeout(() => {
      isDragging = true;
    }, 500);
  });

  button.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - startY;
    const deltaX = e.touches[0].clientX - startX;
    button.style.bottom = `${startBottom - deltaY}px`;
    button.style.right = `${startRight - deltaX}px`;
  });

  button.addEventListener('touchend', (e) => {
    clearTimeout(touchTimer);
    if (!isDragging) {
      // Only a quick tap (not drag)
      modal.style.display = 'block';
      input.focus();
    } else {
      savePosition(parseInt(button.style.bottom), parseInt(button.style.right));
    }
    isDragging = false;
  });

  const modal = document.createElement('div');
  modal.style = `
    display: none;
    position: fixed;
    top: 100px;
    left: 20px;
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(4px);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000000;
    width: 80%;
    max-width: 300px;
    text-align: center;
  `;

  const modalHeader = document.createElement('div');
  modalHeader.style = `
    width: 100%;
    height: 24px;
    cursor: move;
    background: #ccc;
    border-radius: 6px 6px 0 0;
    margin-bottom: 10px;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #555;
  `;
  modalHeader.innerHTML = '⠿';

  const langSelect = document.createElement('select');
  langSelect.style = 'margin-bottom:10px;padding:8px;width:100%;border:1px solid #ccc;border-radius:4px;';
  langSelect.innerHTML = `
    <option value="ckb">سۆرانی</option>
    <option value="ku">Kurmancî</option>
    <option value="ar">العربية</option>
    <option value="fa">فارسی</option>
    <option value="en">English</option>
  `;

  const savedLang = localStorage.getItem(LANG_KEY) || 'fa';
  langSelect.value = savedLang;
  let currentLang = savedLang;

  const manualUsernameInput = document.createElement('input');
  const input = document.createElement('input');
  const hideSelect = document.createElement('select');
  const searchBtn = document.createElement('button');
  const closeBtn = document.createElement('button');

  function applyTranslations(lang) {
    const t = translations[lang];
    manualUsernameInput.placeholder = t.usernamePlaceholder;
    input.placeholder = t.keywordPlaceholder;
    searchBtn.innerHTML = t.search;
    closeBtn.innerHTML = t.close;
    hideSelect.innerHTML = `
      <option value="0">${t.hideIcon}</option>
      <option value="30">${t.seconds30}</option>
      <option value="60">${t.seconds60}</option>
      <option value="180">${t.seconds180}</option>
      <option value="300">${t.seconds300}</option>
    `;
  }

  langSelect.onchange = () => {
    currentLang = langSelect.value;
    localStorage.setItem(LANG_KEY, currentLang);
    applyTranslations(currentLang);
  };

  manualUsernameInput.type = input.type = 'text';
  manualUsernameInput.style = input.style =
    'margin-bottom:10px;padding:8px;width:100%;border:1px solid #ccc;border-radius:4px;';
  hideSelect.style = input.style;

  searchBtn.style = 'background:#1DA1F2;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;width:48%;margin-bottom:10px;';
  closeBtn.style = 'background:#ccc;color:black;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;width:48%;margin-left:4%;';

  applyTranslations(currentLang);

  modal.append(modalHeader, langSelect, manualUsernameInput, input, hideSelect, searchBtn, closeBtn);
  document.body.appendChild(modal);

  let modalDragging = false, modalStartX = 0, modalStartY = 0, modalOffsetX = 0, modalOffsetY = 0;

  modalHeader.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    modalDragging = true;
    modalStartX = e.touches[0].clientX;
    modalStartY = e.touches[0].clientY;
    const rect = modal.getBoundingClientRect();
    modalOffsetX = modalStartX - rect.left;
    modalOffsetY = modalStartY - rect.top;
  });

  modalHeader.addEventListener('touchmove', (e) => {
    if (!modalDragging || e.touches.length !== 1) return;
    const x = e.touches[0].clientX - modalOffsetX;
    const y = e.touches[0].clientY - modalOffsetY;
    modal.style.left = `${x}px`;
    modal.style.top = `${y}px`;
    modal.style.transform = 'none';
  });

  modalHeader.addEventListener('touchend', () => {
    modalDragging = false;
  });

  function isProfilePage() {
    const p = window.location.pathname;
    return !(p === '/' || p === '/home' || p.includes('/status/') || p.includes('/search') || p.includes('/explore')) &&
           /^[a-zA-Z0-9_]+$/.test(p.split('/')[1]);
  }

  function getUsername() {
    if (!isProfilePage()) return null;
    const u = window.location.pathname.split('/')[1];
    return /^[a-zA-Z0-9_]+$/.test(u) ? u : null;
  }

  searchBtn.onclick = () => {
    const keyword = input.value.trim();
    const manualUsername = manualUsernameInput.value.trim().replace('@', '');
    const currentUsername = getUsername();
    const usernameToSearch = manualUsername || currentUsername;

    if (!usernameToSearch) {
      alert(translations[currentLang].alertUsername);
      return;
    }
    if (!keyword) {
      alert(translations[currentLang].alertKeyword);
      return;
    }

    window.location.href = `https://x.com/search?q=from%3A${usernameToSearch}%20${encodeURIComponent(keyword)}`;
    modal.style.display = 'none';
    input.value = '';
    manualUsernameInput.value = '';
    hideSelect.value = '0';
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
    input.value = '';
    manualUsernameInput.value = '';
    hideSelect.value = '0';
  };

  hideSelect.onchange = () => {
    const duration = parseInt(hideSelect.value);
    if (duration > 0) {
      button.style.display = 'none';
      setTimeout(() => {
        button.style.display = 'flex';
      }, duration * 1000);
    }
    modal.style.display = 'none';
  };

  document.addEventListener('touchstart', (e) => {
    if (!modal.contains(e.target) && e.target !== button) {
      modal.style.display = 'none';
    }
  });

  window.addEventListener('popstate', () => button.style.display = 'flex');
  window.addEventListener('hashchange', () => button.style.display = 'flex');
})();
