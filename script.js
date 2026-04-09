// ==================== FIREBASE INTEGRATION ==================== //
const firebaseConfig = {
    apiKey: "AIzaSyBYe05TmBzh1-f3arisvhpSk5fG9xY8_4A",
    authDomain: "velvettrim-6da3a.firebaseapp.com",
    projectId: "velvettrim-6da3a",
    storageBucket: "velvettrim-6da3a.appspot.com",
    messagingSenderId: "357069133185",
    appId: "1:357069133185:web:ed0068ef6454cc43744480"
};

let db;

function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        console.log('✅ Firebase initialized');
        loadCoursesFromFirebase();
        loadPackagesFromFirebase();
    } catch (err) {
        console.error('❌ Firebase init error:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    setupHamburgerMenu();
    setupNavigationActiveState();
    setupFAQAccordion();
    setupSmoothScroll();
    setupCourseCardInteraction();
    setupScrollAnimations();
    setupFeatureCardHover();
    setupPromoCode();
    setupCounterAnimation();
    initializeDarkMode();
});

// ==================== LOAD COURSES FROM FIREBASE ==================== //
async function loadCoursesFromFirebase() {
    if (!db) {
        console.log('Database not initialized yet');
        return;
    }

    try {
        const snap = await db.collection('courses').get();
        const coursesContainer = document.getElementById('coursesContainer') || document.querySelector('.courses-grid');
        
        if (snap.empty) {
            console.log('No courses found in Firebase');
            return;
        }

        let coursesHtml = '';
        const courses = [];

            snap.forEach(doc => {
    const course = doc.data();
    course.id = doc.id; // important
    courses.push(course);
});

        // Sort courses: featured first, then by price
        courses.sort((a, b) => {
            if (a.featured === b.featured) {
                return a.price - b.price;
            }
            return a.featured ? -1 : 1;
        });

        // Generate HTML for courses
        courses.forEach((course, index) => {
            const isFeatured = course.featured ? 'featured' : '';
            coursesHtml += `
                <div class="course-card ${isFeatured}">
                    <div class="course-badge">${course.level}</div>
                    <h3>${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <ul class="course-features">
                        <li>✓ ${course.lessons || '10'} Lessons</li>
                        <li>✓ ${course.duration || '6 weeks'} Duration</li>
                        <li>✓ Certificate upon completion</li>
                        <li>✓ Lifetime access</li>
                        <li>✓ 24/7 Support</li>
                    </ul>
                    <div class="course-meta">
                        <span class="price">₹${(course.price || 0).toLocaleString()}</span>
                        <span class="lessons">${course.lessons || 10} Lessons</span>
                    </div>
                    <button class="btn btn-outline" 
                        onclick="showEnrollModal('${course.title.replace(/'/g, "\\'")}', '${course.price}', '${course.id}')">
                        Enroll Now
                    </button>
                </div>
            `;
        });

        // Update the courses grid
        if (coursesContainer) {
            coursesContainer.innerHTML = coursesHtml;
            console.log('✅ Loaded ' + courses.length + ' courses from Firebase');
        }
    } catch (err) {
        console.error('Error loading courses from Firebase:', err);
    }
}

// ==================== LOAD PACKAGES FROM FIREBASE ==================== //
async function loadPackagesFromFirebase() {
    if (!db) {
        return;
    }

    try {
        const snap = await db.collection('packages').get();
        
        if (snap.empty) {
            console.log('No packages found in Firebase');
            return;
        }

        snap.forEach(doc => {
            const pkg = doc.data();
            // You can add packages section if needed
        });

        console.log('✅ Loaded packages from Firebase');
    } catch (err) {
        console.error('Error loading packages from Firebase:', err);
    }
}

// ==================== HAMBURGER MENU ==================== //
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// ==================== NAVIGATION ACTIVE STATE ==================== //
function setupNavigationActiveState() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== FAQ ACCORDION ==================== //
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', function() {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// ==================== SMOOTH SCROLL ENHANCEMENT ==================== //
function setupSmoothScroll() {
    const allLinks = document.querySelectorAll('a[href^="#"]');

    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#home') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== COURSE CARD INTERACTION ==================== //
function setupCourseCardInteraction() {
    // This is handled by inline onclick in the Firebase loaded courses
}

// ==================== ENROLL MODAL ==================== //
// Stores current course info for use in Razorpay handler
let _currentEnroll = {};

function showEnrollModal(courseTitle, coursePrice, courseId) {
    _currentEnroll = { courseTitle, coursePrice: parseInt(coursePrice), courseId };

    let modal = document.getElementById('enrollModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'enrollModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const user = firebase.auth ? firebase.auth().currentUser : null;

    if (!user) {
        // ── NOT SIGNED IN: prompt to sign in first ──
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="closeEnrollModal()">&times;</span>
                <h3>Sign In to Enroll</h3>
                <div class="modal-course-info">
                    <span class="modal-course-info-title">${courseTitle}</span>
                    <span class="modal-course-info-price">₹${parseInt(coursePrice).toLocaleString('en-IN')}</span>
                </div>
                <div class="modal-signin-prompt">
                    <p>Please sign in to complete your enrollment. Your account details will be used automatically — no extra forms needed.</p>
                    <a href="index.html?redirect=index.html" class="btn btn-primary btn-block" style="text-decoration:none;justify-content:center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                        Sign In to Continue
                    </a>
                    <p style="margin-top:16px;font-size:13px;color:#5a5a78;">Don't have an account?
                        <a href="index.html?redirect=index.html" style="color:#d4af37;text-decoration:none;font-weight:500;">Create one free →</a>
                    </p>
                </div>
            </div>
        `;
    } else {
        // ── SIGNED IN: show user info and direct payment button ──
        const displayName = user.displayName || 'Trader';
        const email = user.email || '';
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="closeEnrollModal()">&times;</span>
                <h3>Confirm Enrollment</h3>
                <div class="modal-course-info">
                    <span class="modal-course-info-title">${courseTitle}</span>
                    <span class="modal-course-info-price">₹${parseInt(coursePrice).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(0,208,132,0.06);border:1px solid rgba(0,208,132,0.2);border-radius:10px;margin-bottom:24px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#e8d5b7);color:#1a1a2e;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>
                    <div>
                        <p style="font-size:14px;font-weight:600;color:#fff;margin:0;">${displayName}</p>
                        <p style="font-size:12px;color:#b8b8b8;margin:2px 0 0;">${email}</p>
                    </div>
                    <span style="margin-left:auto;font-size:12px;color:#00d084;background:rgba(0,208,132,0.1);padding:4px 10px;border-radius:50px;border:1px solid rgba(0,208,132,0.2);white-space:nowrap;">✓ Signed in</span>
                </div>
                <button class="btn btn-primary btn-block" onclick="startRazorpayPayment()" style="width:100%;justify-content:center;padding:15px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Proceed to Payment
                </button>
                <p style="text-align:center;font-size:12px;color:#5a5a78;margin-top:12px;">🔒 Secured by Razorpay · 30-day money-back guarantee</p>
            </div>
        `;
    }

    modal.style.display = 'block';
}

function closeEnrollModal() {
    const modal = document.getElementById('enrollModal');
    if (modal) modal.style.display = 'none';
}

// ==================== RAZORPAY PAYMENT ==================== //
function startRazorpayPayment() {
    const user = firebase.auth ? firebase.auth().currentUser : null;
    if (!user) {
        closeEnrollModal();
        window.location.href = 'index.html?redirect=index.html';
        return;
    }

    const name  = user.displayName || 'Trader';
    const email = user.email || '';
    const phone = user.phoneNumber || '';

    const { courseTitle, coursePrice, courseId } = _currentEnroll;

    // ⚠️ REPLACE with your actual Razorpay Key ID from https://dashboard.razorpay.com
    const RAZORPAY_KEY = 'rzp_test_XXXXXXXXXXXXXXXX';

    const options = {
        key: RAZORPAY_KEY,
        amount: coursePrice * 100,
        currency: 'INR',
        name: 'Sell Edge',
        description: courseTitle,
        prefill: { name, email, contact: phone },
        theme: { color: '#d4af37' },

        handler: async function(response) {
            await onPaymentSuccess(response, { name, email, phone, courseTitle, coursePrice, courseId });
        },

        modal: {
            ondismiss: function() {
                console.log('Payment popup closed by user');
            }
        }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', function(response) {
        alert('❌ Payment failed: ' + response.error.description);
        console.error('Razorpay error:', response.error);
    });

    rzp.open();
}

// ==================== ON PAYMENT SUCCESS ==================== //
async function onPaymentSuccess(razorpayResponse, { name, email, phone, courseTitle, coursePrice, courseId }) {
    if (!db) {
        alert('Database not ready. Please refresh and try again.');
        return;
    }

    try {
        // 1. Save or update student record
        const studentsRef = db.collection('students');
        const existing = await studentsRef.where('email', '==', email).get();

        if (existing.empty) {
            await studentsRef.add({
                name, email, phone,
                enrolledCourses: [courseId],
                paymentStatus: 'Completed',
                enrollmentDate: new Date()
            });
        } else {
            const studentDoc = existing.docs[0];
            const currentCourses = studentDoc.data().enrolledCourses || [];
            if (!currentCourses.includes(courseId)) currentCourses.push(courseId);
            await studentDoc.ref.update({
                enrolledCourses: currentCourses,
                paymentStatus: 'Completed'
            });
        }

        // 2. Save payment record
        await db.collection('payments').add({
            studentName: name,
            studentEmail: email,
            courseId: courseId,
            courseName: courseTitle,
            amount: coursePrice,
            discountAmount: 0,
            finalAmount: coursePrice,
            status: 'Completed',
            razorpayPaymentId: razorpayResponse.razorpay_payment_id || '',
            paymentDate: new Date()
        });

        console.log('✅ Payment saved to Firebase');

        // 3. Redirect to course page
        window.location.href = `course.html?courseId=${courseId}&studentEmail=${encodeURIComponent(email)}&payment=success`;

    } catch (err) {
        console.error('Error saving payment:', err);
        alert('Payment was successful but we had trouble saving your record. Please contact support with your payment ID: ' + razorpayResponse.razorpay_payment_id);
    }
}

// ==================== SCROLL ANIMATIONS ==================== //
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `${entry.target.dataset.animation || 'fadeIn'} 0.6s ease forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature cards and testimonial cards
    document.querySelectorAll('.feature-card, .testimonial-card').forEach(el => {
        el.dataset.animation = 'slideInUp';
        observer.observe(el);
    });
}

// ==================== MODAL STYLES (Injected) ==================== //
function injectModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(26, 26, 46, 0.95));
    margin: 5% auto;
    padding: 40px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    position: relative;
    animation: slideInDown 0.3s ease;
}

.modal-content h3 {
    color: #d4af37;
    margin-bottom: 20px;
    font-size: 28px;
}

.modal-content p {
    color: #b8b8b8;
    margin-bottom: 25px;
}

.modal-close {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 28px;
    font-weight: bold;
    color: #d4af37;
    cursor: pointer;
    transition: all 0.3s ease;
}

.modal-close:hover {
    color: #e8d5b7;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: #d4af37;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
}

.form-group input {
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.05);
}

.form-group input.error {
    border-color: #ff4757;
}

.form-group input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
}

.form-group label input[type="checkbox"] {
    display: flex;
    align-items: center;
}

.btn-block {
    width: 100%;
}

.success-message {
    text-align: center;
    padding: 40px 20px;
}

.success-message h4 {
    color: #00d084;
    font-size: 24px;
    margin-bottom: 15px;
}

.success-message p {
    color: #b8b8b8;
    margin-bottom: 25px;
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
    `;
    document.head.appendChild(style);
}

// Inject modal styles
injectModalStyles();

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('enrollModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// ==================== FEATURE CARD HOVER EFFECT ==================== //
function setupFeatureCardHover() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ==================== COPY PROMO CODE ==================== //
function setupPromoCode() {
    const ctaNote = document.querySelector('.cta-note');

    if (ctaNote) {
        ctaNote.style.cursor = 'pointer';
        ctaNote.addEventListener('click', function() {
            const code = 'TRADEVAULT25';
            navigator.clipboard.writeText(code);

            const originalText = this.textContent;
            this.textContent = '✓ Code copied!';

            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        });
    }
}

// ==================== COUNTER ANIMATION ==================== //
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

function setupCounterAnimation() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');

                statNumbers.forEach(el => {
                    const text = el.textContent;
                    const number = parseInt(text);

                    if (!el.dataset.animated) {
                        el.dataset.animated = true;
         animateCounter(el, number);
                    }
                });
 
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
 
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }
}
 
// ==================== DARK MODE (Optional Enhancement) ==================== //
function initializeDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
}
// ==================== RESIZE HANDLER ==================== //
window.addEventListener('resize', () => {
    // Close mobile menu on resize
    if (window.innerWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
 
        if (navMenu && hamburger) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});
// ==================== AUTH STATE & PROFILE UI ==================== //

function initAuthState() {
    if (!firebase.auth) return;

    firebase.auth().onAuthStateChanged(function(user) {
        const loggedOut = document.getElementById('navLoggedOut');
        const loggedIn  = document.getElementById('navLoggedIn');

        if (!loggedOut || !loggedIn) return;

        if (user) {
            // ── Show profile icon ──
            loggedOut.style.display = 'none';
            loggedIn.style.display  = 'flex';

            const displayName = user.displayName || 'User';
            const email       = user.email || '';
            const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

            const avatarEl   = document.getElementById('profileAvatar');
            const avatarLgEl = document.getElementById('profileAvatarLg');
            const nameEl     = document.getElementById('profileName');
            const emailEl    = document.getElementById('profileEmail');

            if (avatarEl)   avatarEl.textContent   = initials;
            if (avatarLgEl) avatarLgEl.textContent = initials;
            if (nameEl)     nameEl.textContent     = displayName;
            if (emailEl)    emailEl.textContent    = email;

        } else {
            // ── Show sign-in buttons ──
            loggedOut.style.display = 'flex';
            loggedIn.style.display  = 'none';
        }
    });
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const btn      = document.getElementById('profileBtn');
    if (!dropdown) return;
    const isOpen = dropdown.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.profile-menu-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const dropdown = document.getElementById('profileDropdown');
        const btn      = document.getElementById('profileBtn');
        if (dropdown) dropdown.classList.remove('open');
        if (btn)      btn.classList.remove('open');
    }
});

function handleSignOut() {
    if (!firebase.auth) return;
    firebase.auth().signOut().then(() => {
        window.location.reload();
    }).catch(err => {
        console.error('Sign out error:', err);
    });
}

// ── Add initAuthState to DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', function() {
    // Defer auth init until Firebase is ready
    setTimeout(initAuthState, 500);
});
