// main.js — Matsuraku-Saikan

// スクロール時にヘッダーへシャドウを付ける
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});
