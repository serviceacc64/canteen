document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('login-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember');
  const errorMessage = document.getElementById('error-message');

  const ADMIN_CREDENTIALS = {
    email: 'ojtstudents2026@gmail.com',
    password: '123'
  };

  // Handle form submission
  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const remember = rememberCheckbox.checked;

    // Validation
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.textContent = 'Verifying...'; // Feedback during delay

    // Simulate authentication delay
    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Success - store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        if (remember) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        // Redirect to dashboard
        window.location.href = 'src/pages/dashboard.html';
      } else {
        // Failed login
        showError('Invalid email or password. Please try again.');
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Access Admin';
        passwordInput.value = '';
        passwordInput.focus();
      }
    }, 1200);
  });

  // Enter key support for all inputs
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Smoothly hide error
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 4000);
  }

  // Pre-fill email if remember me was checked
  if (localStorage.getItem('rememberMe') === 'true') {
    usernameInput.value = ADMIN_CREDENTIALS.email;
    rememberCheckbox.checked = true;
    passwordInput.focus(); // Focus password instead if email is already filled
  } else {
    usernameInput.focus();
  }
});