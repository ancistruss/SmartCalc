document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btnLogin');
  const errorMsg = document.getElementById('loginError');

  btnLogin.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showError('Будь ласка, введіть email та пароль.');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Введіть коректний email (наприклад: you@example.com)');
      return;
    }

    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      showError('Невірний email або пароль.');
      return;
    }

    const remember = document.getElementById('remember').checked;
    localStorage.setItem('sc_current_user', JSON.stringify(user));
    if (!remember) {
      sessionStorage.setItem('sc_session_only', '1');
    }

    window.location.href = 'profile.html';
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
  function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}
});


