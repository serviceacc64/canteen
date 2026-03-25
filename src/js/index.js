document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('login-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember');
  const errorMessage = document.getElementById('error-message');

  // Updated credentials as requested
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
    loginBtn.textContent = '';

    // Simulate authentication delay
    setTimeout(() => {
      // Check credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Success - store login state and redirect
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        if (remember) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // Failed login
        showError('Invalid email or password. Please try again.');
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Access Admin';
        usernameInput.value = '';
        passwordInput.value = '';
        usernameInput.focus();
      }
    }, 1500);
  });

  // Enter key support
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.activeElement !== rememberCheckbox) {
      loginBtn.click();
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }

  // Auto-focus email on load
  usernameInput.focus();

  // Pre-fill email if remember me was checked previously
  if (localStorage.getItem('rememberMe') === 'true') {
    usernameInput.value = ADMIN_CREDENTIALS.email;
    rememberCheckbox.checked = true;
  }
});