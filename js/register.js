document.addEventListener('DOMContentLoaded', () => {
  const btnRegister = document.getElementById('btnRegister');
  const errorMsg = document.getElementById('registerError');

  document.querySelectorAll('.cp-radio-card input').forEach((radio) => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.cp-radio-card').forEach((c) => c.classList.remove('selected'));
      radio.closest('.cp-radio-card').classList.add('selected');
    });
  });

  btnRegister.addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const birthdate = document.getElementById('regBirthdate').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const terms = document.getElementById('terms').checked;
    const genderEl = document.querySelector('input[name="gender"]:checked');

    if (!name || !email || !birthdate || !password || !confirm || !genderEl) {
      showError('Будь ласка, заповніть усі поля.');
      return;
    }
    if (!isValidEmail(email)) {
      showError('Введіть коректний email (наприклад: you@example.com)');
      return;
    }
    if (password.length < 8) {
      showError('Пароль має містити щонайменше 8 символів.');
      return;
    }
    if (password !== confirm) {
      showError('Паролі не збігаються.');
      return;
    }
    if (!terms) {
      showError('Необхідно погодитись з умовами використання.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    if (users.find((u) => u.email === email)) {
      showError('Користувач з таким email вже зареєстрований.');
      return;
    }

    const newUser = { name, email, gender: genderEl.value, birthdate, password };
    users.push(newUser);
    localStorage.setItem('sc_users', JSON.stringify(users));

    localStorage.setItem('sc_current_user', JSON.stringify(newUser));

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


