// Full Firebase Authentication Implementation
import { 
    auth, 
    db,
    googleProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signInWithPopup,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
  } from './firebase-config.js';
  
  (function() {
    "use strict";
  
    // DOM Elements
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const displayNameInput = document.getElementById('displayName');
    const nameGroup = document.getElementById('nameGroup');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const authTitle = document.getElementById('authTitle');
    const loginOptions = document.getElementById('loginOptions');
    const toggleText = document.getElementById('toggleText');
    const toggleAuthLink = document.getElementById('toggleAuthLink');
    const loginToggleBtn = document.getElementById('loginToggleBtn');
    const signupToggleBtn = document.getElementById('signupToggleBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  
    // State
    let isLoginMode = true;
    let isLoading = false;
  
    /* ---------- Toggle Between Login and Signup ---------- */
    function toggleAuthMode(mode) {
      isLoginMode = mode;
      
      if (isLoginMode) {
        // Login mode
        nameGroup.style.display = 'none';
        loginOptions.style.display = 'flex';
        authTitle.textContent = 'Welcome back';
        submitBtnText.textContent = 'Sign In';
        toggleText.innerHTML = `Don't have an account? <a href="#" class="signup-link" id="toggleAuthLink">Create account</a>`;
        loginToggleBtn.classList.add('active');
        signupToggleBtn.classList.remove('active');
        displayNameInput.required = false;
      } else {
        // Signup mode
        nameGroup.style.display = 'block';
        loginOptions.style.display = 'none';
        authTitle.textContent = 'Create account';
        submitBtnText.textContent = 'Sign Up';
        toggleText.innerHTML = `Already have an account? <a href="#" class="signup-link" id="toggleAuthLink">Sign in</a>`;
        signupToggleBtn.classList.add('active');
        loginToggleBtn.classList.remove('active');
        displayNameInput.required = true;
      }
      
      // Re-attach event listener to new toggle link
      document.getElementById('toggleAuthLink').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode(!isLoginMode);
      });

      // Show/hide password strength indicator
      const strengthContainer = document.querySelector('.password-strength');
      if (strengthContainer) {
        strengthContainer.style.display = isLoginMode ? 'none' : 'block';
      }
    }
  
    loginToggleBtn.addEventListener('click', () => toggleAuthMode(true));
    signupToggleBtn.addEventListener('click', () => toggleAuthMode(false));
    toggleAuthLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode(!isLoginMode);
    });
  
    /* ---------- Password Toggle ---------- */
    togglePasswordBtn.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = this.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  
    /* ---------- Password Strength Indicator ---------- */
    function checkPasswordStrength(password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]+/)) strength++;
      if (password.match(/[A-Z]+/)) strength++;
      if (password.match(/[0-9]+/)) strength++;
      if (password.match(/[$@#&!]+/)) strength++;
      
      return strength;
    }

    function setupPasswordStrength() {
      passwordInput.addEventListener('input', function() {
        if (isLoginMode) return;
        
        const strength = checkPasswordStrength(this.value);
        let strengthBar = document.querySelector('.strength-bar');
        let strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar) {
          const container = document.createElement('div');
          container.className = 'password-strength';
          container.innerHTML = '<div class="strength-bar"></div><div class="strength-text"></div>';
          this.parentElement.parentElement.appendChild(container);
          strengthBar = container.querySelector('.strength-bar');
          strengthText = container.querySelector('.strength-text');
        }
        
        strengthBar.className = 'strength-bar';
        if (strength <= 2) {
          strengthBar.classList.add('strength-weak');
          strengthText.textContent = 'Weak password';
        } else if (strength <= 4) {
          strengthBar.classList.add('strength-medium');
          strengthText.textContent = 'Medium password';
        } else {
          strengthBar.classList.add('strength-strong');
          strengthText.textContent = 'Strong password';
        }
      });
    }
    
    setupPasswordStrength();
  
    /* ---------- Show Loading ---------- */
    function showLoading() {
      isLoading = true;
      submitBtn.classList.add('loading');
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      overlay.id = 'loadingOverlay';
      document.body.appendChild(overlay);
    }
  
    function hideLoading() {
      isLoading = false;
      submitBtn.classList.remove('loading');
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.remove();
    }
  
    /* ---------- Show Messages ---------- */
    function showError(input, message) {
      input.classList.add('error');
      let errorSpan = input.parentElement.parentElement.querySelector('.error-message');
      if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        input.parentElement.parentElement.appendChild(errorSpan);
      }
      errorSpan.textContent = message;
    }
  
    function clearError(input) {
      input.classList.remove('error');
      const errorSpan = input.parentElement.parentElement.querySelector('.error-message');
      if (errorSpan) errorSpan.remove();
    }
  
    function showSuccessMessage(message) {
      const successDiv = document.createElement('div');
      successDiv.className = 'success-message';
      successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  
    /* ---------- Save User to Firestore ---------- */
    async function saveUserToFirestore(user, additionalData = {}) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // New user - create profile
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: additionalData.displayName || user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${additionalData.displayName || user.email.split('@')[0]}&background=1ed760&color=000`,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            playlists: [],
            likedSongs: []
          });
        } else {
          // Existing user - update last login
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
        
        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    }
  
    /* ---------- Handle Sign Up ---------- */
    async function handleSignUp(email, password, displayName) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, { displayName });
        
        // Save user data to Firestore
        await saveUserToFirestore(user, { displayName });
        
        showSuccessMessage('Account created successfully!');
        
        // Store session
        sessionStorage.setItem('streamwave_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          photoURL: user.photoURL
        }));
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = 'Signup failed. Please try again.';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email already in use. Please login instead.';
            showError(emailInput, errorMessage);
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            showError(emailInput, errorMessage);
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            showError(passwordInput, errorMessage);
            break;
          default:
            showError(emailInput, errorMessage);
        }
        
        hideLoading();
      }
    }
  
    /* ---------- Handle Login ---------- */
    async function handleLogin(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last login in Firestore
        await saveUserToFirestore(user);
        
        // Fetch user data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        let userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL
        };
        
        if (userSnap.exists()) {
          userData = { ...userData, ...userSnap.data() };
        }
        
        // Store session
        sessionStorage.setItem('streamwave_user', JSON.stringify(userData));
        
        // Remember me functionality
        if (document.getElementById('rememberMe')?.checked) {
          localStorage.setItem('rememberedEmail', email);
        }
        
        showSuccessMessage(`Welcome back, ${userData.displayName}!`);
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = 'Login failed. Please check your credentials.';
        
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            showError(emailInput, errorMessage);
            showError(passwordInput, errorMessage);
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            showError(emailInput, errorMessage);
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            showError(emailInput, errorMessage);
        }
        
        hideLoading();
      }
    }
  
    /* ---------- Handle Google Sign In ---------- */
    async function handleGoogleSignIn() {
      try {
        showLoading();
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Save/update user in Firestore
        await saveUserToFirestore(user);
        
        // Store session
        sessionStorage.setItem('streamwave_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
        
        showSuccessMessage(`Welcome, ${user.displayName}!`);
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error("Google sign-in error:", error);
        hideLoading();
        
        if (error.code !== 'auth/popup-closed-by-user') {
          showError(emailInput, 'Google sign-in failed. Please try again.');
        }
      }
    }
  
    /* ---------- Handle Password Reset ---------- */
    async function handlePasswordReset(email) {
      if (!email) {
        showError(emailInput, 'Please enter your email address');
        return;
      }
      
      try {
        showLoading();
        await sendPasswordResetEmail(auth, email);
        hideLoading();
        showSuccessMessage(`Password reset email sent to ${email}`);
      } catch (error) {
        hideLoading();
        console.error("Password reset error:", error);
        
        switch (error.code) {
          case 'auth/user-not-found':
            showError(emailInput, 'No account found with this email');
            break;
          case 'auth/invalid-email':
            showError(emailInput, 'Invalid email address');
            break;
          default:
            showError(emailInput, 'Failed to send reset email. Please try again.');
        }
      }
    }
  
    /* ---------- Form Submit Handler ---------- */
    authForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (isLoading) return;
      
      // Clear previous errors
      clearError(emailInput);
      clearError(passwordInput);
      if (!isLoginMode) clearError(displayNameInput);
      
      // Get values
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const displayName = !isLoginMode ? displayNameInput.value.trim() : '';
      
      // Validation
      let hasError = false;
      
      if (!email) {
        showError(emailInput, 'Email is required');
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(emailInput, 'Please enter a valid email');
        hasError = true;
      }
      
      if (!password) {
        showError(passwordInput, 'Password is required');
        hasError = true;
      } else if (password.length < 6) {
        showError(passwordInput, 'Password must be at least 6 characters');
        hasError = true;
      }
      
      if (!isLoginMode && !displayName) {
        showError(displayNameInput, 'Name is required');
        hasError = true;
      }
      
      if (hasError) return;
      
      showLoading();
      
      if (isLoginMode) {
        await handleLogin(email, password);
      } else {
        await handleSignUp(email, password, displayName);
      }
    });
  
    /* ---------- Google Sign In ---------- */
    googleLoginBtn.addEventListener('click', handleGoogleSignIn);
  
    /* ---------- Forgot Password ---------- */
    forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      handlePasswordReset(email);
    });
  
    /* ---------- Check Auth State on Load ---------- */
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to main app
        sessionStorage.setItem('streamwave_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
        
        // Only redirect if we're on login page and user is authenticated
        if (window.location.pathname.includes('login.html')) {
          window.location.href = 'index.html';
        }
      }
    });
  
    /* ---------- Load Remembered Email ---------- */
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      document.getElementById('rememberMe').checked = true;
    }
  
    /* ---------- Initialize ---------- */
    function init() {
      // Focus on email input
      setTimeout(() => emailInput.focus(), 500);
      console.log('🎵 StreamWave Auth - Ready');
    }
    
    init();
  
  })();