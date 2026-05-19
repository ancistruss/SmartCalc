document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('sc_current_user');
  document.querySelector('main').style.visibility = 'visible';

  if (!raw) {
    document.querySelector('main').innerHTML = `
  <div class="container text-center" style="padding: 80px 0;">
    <div class="cp-logo-big mb-4">SC</div>
    <p class="cp-eyebrow">Доступ обмежено</p>
    <h2 class="cp-headline-sm">Щоб переглянути профіль, потрібно <span class="cp-accent">увійти</span></h2>
    <div class="d-flex gap-3 justify-content-center mt-4 align-items-center">
      <a href="index.html" class="btn cp-btn-primary" style="min-width:160px; height:42px; display:flex; align-items:center; justify-content:center">Увійти</a>
      <a href="register.html" class="btn cp-btn-outline" style="min-width:160px; height:42px; display:flex; align-items:center; justify-content:center">Зареєструватись</a>
    </div>
  </div>`;
return;
    return;
  }

  const user = JSON.parse(raw);

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileFullName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;

  document.getElementById('tName').textContent = user.name;
  document.getElementById('tEmail').textContent = user.email;
  document.getElementById('tGender').textContent = formatGender(user.gender);
  document.getElementById('tBirthdate').textContent = formatDate(user.birthdate);

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('sc_current_user');
    sessionStorage.removeItem('sc_session_only');
    window.location.href = 'index.html';
  });
});

function formatGender(val) {
  const map = { male: 'Чоловіча', female: 'Жіноча', other: 'Інше' };
  return map[val] || val;
}

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}
