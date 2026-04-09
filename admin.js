// ==================== FIREBASE CONFIGURATION ==================== //
const firebaseConfig = {
  apiKey: "AIzaSyBYe05TmBzh1-f3arisvhpSk5fG9xY8_4A",
  authDomain: "velvettrim-6da3a.firebaseapp.com",
  projectId: "velvettrim-6da3a",
  storageBucket: "velvettrim-6da3a.appspot.com",
  messagingSenderId: "357069133185",
  appId: "1:357069133185:web:ed0068ef6454cc43744480",
};

// GLOBAL VARIABLES
let db;
let storage;
let currentCourseId = null;
let currentPaymentId = null;
let selectedLessonFile = null;
let selectedDemoFile = null;

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Initialize Firebase
try {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('✅ Firebase ready');
} catch (error) {
    console.error('❌ Firebase error:', error);
}

function checkFirebase() {
    if (typeof db === 'undefined' || db === null) {
        alert('❌ Firebase is not initialized!\n\nPlease:\n1. Refresh the page\n2. Check browser console (F12) for errors');
        return false;
    }
    return true;
}

// ==================== INIT ==================== //
document.addEventListener('DOMContentLoaded', () => {
    if (checkFirebase()) {
        loadDashboardData();
        console.log('✅ Admin panel ready!');
    }
});

// ==================== NAVIGATION ==================== //
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) tabElement.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'courses') loadCourses();
    else if (tabName === 'payments') loadPayments();
    else if (tabName === 'students') loadStudents();
    else if (tabName === 'users') loadUsers();
    else if (tabName === 'settings') loadSettingsTab();
    else if (tabName === 'dashboard') loadDashboardData();
}

// ==================== DASHBOARD ==================== //
async function loadDashboardData() {
    if (!checkFirebase()) return;
    try {
        const coursesSnap = await db.collection('courses').get();
        document.getElementById('totalCourses').textContent = coursesSnap.size;

        const studentsSnap = await db.collection('students').get();
        document.getElementById('totalStudents').textContent = studentsSnap.size;

        const paymentsSnap = await db.collection('payments').where('status', '==', 'Completed').get();
        let totalRevenue = 0;
        paymentsSnap.forEach(doc => { totalRevenue += doc.data().finalAmount || 0; });
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('completedPayments').textContent = paymentsSnap.size;

        await loadRecentEnrollments();
        await loadRecentPaymentsList();
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

async function loadRecentEnrollments() {
    try {
        const snap = await db.collection('students').orderBy('enrollmentDate', 'desc').limit(5).get();
        let html = '';
        snap.forEach(doc => {
            const s = doc.data();
            html += `<div class="enrollment-item">
                <div>
                    <div class="enrollment-name">${s.name}</div>
                    <div class="enrollment-course">${s.enrolledCourses?.length || 0} course(s)</div>
                </div>
                <span class="badge badge-${(s.paymentStatus||'pending').toLowerCase()}">${s.paymentStatus||'Pending'}</span>
            </div>`;
        });
        document.getElementById('recentEnrollments').innerHTML = html || '<p style="text-align:center;padding:20px;color:#999;">No enrollments yet</p>';
    } catch (err) { console.error(err); }
}

async function loadRecentPaymentsList() {
    try {
        const snap = await db.collection('payments').orderBy('paymentDate', 'desc').limit(5).get();
        let html = '';
        snap.forEach(doc => {
            const p = doc.data();
            const date = new Date(p.paymentDate?.toDate?.() || Date.now()).toLocaleDateString();
            html += `<div class="payment-item">
                <div>
                    <div class="enrollment-name">₹${p.finalAmount}</div>
                    <div class="enrollment-course">${date}</div>
                </div>
                <span class="badge badge-${(p.status||'pending').toLowerCase()}">${p.status||'Pending'}</span>
            </div>`;
        });
        document.getElementById('recentPayments').innerHTML = html || '<p style="text-align:center;padding:20px;color:#999;">No payments yet</p>';
    } catch (err) { console.error(err); }
}

// ==================== COURSES ==================== //
async function loadCourses() {
    try {
        const snap = await db.collection('courses').get();
        let html = '';
        if (snap.empty) {
            html = `<div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>No courses yet</h3>
                <p>Create your first course to get started</p>
                <button class="btn-primary" onclick="openCourseModal()"><i class="fas fa-plus"></i> Create Course</button>
            </div>`;
        } else {
            snap.forEach(doc => {
                const course = doc.data();
                html += `<div class="course-card">
                    <div class="course-image"><i class="fas fa-video"></i></div>
                    <div class="course-content">
                        <div class="course-title">${course.title}</div>
                        <div class="course-meta">
                            <span>${course.level}</span>
                            <span class="course-price">₹${course.price}</span>
                        </div>
                        <div class="course-meta">
                            <span>${course.content?.length || 0} lessons</span>
                            <span>${course.duration || 'N/A'}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-secondary btn-small" onclick="editCourse('${doc.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-danger btn-small" onclick="deleteCourse('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
        document.getElementById('coursesContainer').innerHTML = html;
    } catch (err) {
        console.error('Error loading courses:', err);
        alert('Error loading courses: ' + err.message);
    }
}

function openCourseModal() {
    currentCourseId = null;
    document.getElementById('courseModalTitle').textContent = 'Create New Course';
    document.getElementById('courseForm').reset();
    document.getElementById('courseContentSection').classList.add('hidden');
    document.getElementById('courseModal').classList.remove('hidden');
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.add('hidden');
    currentCourseId = null;
}

async function handleCourseSubmit(e) {
    e.preventDefault();
    const courseData = {
        title: document.getElementById('courseTitle').value,
        description: document.getElementById('courseDescription').value,
        level: document.getElementById('courseLevel').value,
        price: parseInt(document.getElementById('coursePrice').value),
        duration: document.getElementById('courseDuration').value,
        lessons: parseInt(document.getElementById('courseLessons').value) || 0,
        featured: document.getElementById('courseFeatured').checked,
        createdAt: new Date()
    };
    try {
        if (currentCourseId) {
            await db.collection('courses').doc(currentCourseId).update(courseData);
        } else {
            const ref = await db.collection('courses').add(courseData);
            currentCourseId = ref.id;
        }
        alert('Course saved!');
        document.getElementById('courseContentSection').classList.remove('hidden');
        loadCourses();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ==================== LESSON VIDEO UPLOAD ==================== //
function handleLessonVideoSelect(input) {
    const file = input.files[0];
    if (!file) return;
    selectedLessonFile = file;
    document.getElementById('lessonVideoInfo').style.display = 'block';
    document.getElementById('lessonVideoName').textContent = `${file.name} (${formatFileSize(file.size)})`;
}

function handleDemoVideoSelect(input) {
    const file = input.files[0];
    if (!file) return;
    selectedDemoFile = file;
    document.getElementById('demoVideoInfo').style.display = 'block';
    document.getElementById('demoVideoName').textContent = `${file.name} (${formatFileSize(file.size)})`;
}

function openCourseForLesson(courseId) {
    currentCourseId = courseId;
    openLessonModal();
}

function openLessonModal() {
    if (!currentCourseId) { alert('Please create/select a course first!'); return; }
    document.getElementById('lessonForm').reset();
    selectedLessonFile = null;
    document.getElementById('lessonVideoInfo').style.display = 'none';
    document.getElementById('lessonUploadProgress').style.display = 'none';
    document.getElementById('lessonModal').classList.remove('hidden');
}

function closeLessonModal() {
    document.getElementById('lessonModal').classList.add('hidden');
}

async function handleLessonSubmit(e) {
    e.preventDefault();
    if (!selectedLessonFile) { alert('Please select a video file for this lesson'); return; }
    if (!currentCourseId) { alert('No course selected!'); return; }

    const submitBtn = document.getElementById('lessonSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

    try {
        // Upload video to Firebase Storage
        const fileName = `courses/${currentCourseId}/lessons/${Date.now()}_${selectedLessonFile.name}`;
        const storageRef = storage.ref(fileName);
        const uploadTask = storageRef.put(selectedLessonFile);

        document.getElementById('lessonUploadProgress').style.display = 'block';

        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById('lessonProgressBar').style.width = progress + '%';
                    document.getElementById('lessonProgressText').textContent = `Uploading... ${Math.round(progress)}%`;
                },
                (error) => reject(error),
                () => resolve()
            );
        });

        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

        const lesson = {
            lessonNumber: parseInt(document.getElementById('lessonNumber').value) || 1,
            title: document.getElementById('lessonTitle').value,
            description: document.getElementById('lessonDescription').value || '',
            duration: document.getElementById('lessonDuration').value || '',
            videoUrl: downloadURL,
            storagePath: fileName,
            uploadedAt: new Date().toISOString()
        };

        await db.collection('courses').doc(currentCourseId).update({
            content: firebase.firestore.FieldValue.arrayUnion(lesson),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        submitBtn.innerHTML = '<i class="fas fa-check"></i> Lesson Added!';
        alert('✅ Lesson uploaded and saved!');
        closeLessonModal();
        loadCourses();
    } catch (err) {
        console.error('❌ Error:', err);
        alert('Error uploading lesson: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Upload & Add Lesson';
    }
}

async function editCourse(courseId) {
    try {
        const doc = await db.collection('courses').doc(courseId).get();
        const course = doc.data();

        document.getElementById('courseTitle').value = course.title;
        document.getElementById('courseDescription').value = course.description;
        document.getElementById('courseLevel').value = course.level;
        document.getElementById('coursePrice').value = course.price;
        document.getElementById('courseDuration').value = course.duration;
        document.getElementById('courseLessons').value = course.lessons || 0;
        document.getElementById('courseFeatured').checked = course.featured || false;

        currentCourseId = courseId;
        document.getElementById('courseModalTitle').textContent = 'Edit Course';
        document.getElementById('courseContentSection').classList.remove('hidden');

        let lessonsHtml = '';
        if (course.content && course.content.length > 0) {
            course.content.sort((a,b)=>(a.lessonNumber||0)-(b.lessonNumber||0)).forEach((lesson, index) => {
                lessonsHtml += `<div style="background:#f5f5f5;padding:10px;border-radius:4px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>Lesson ${lesson.lessonNumber}: ${lesson.title}</strong>
                        <p style="margin:5px 0;color:#666;font-size:12px;">
                            ${lesson.duration || 'N/A'}
                            &nbsp;|&nbsp;
                            <span style="color:#625df5;"><i class="fas fa-video"></i> Video saved</span>
                        </p>
                    </div>
                    <button type="button" class="btn-danger btn-small" onclick="deleteLesson('${courseId}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
            });
        }
        document.getElementById('lessonsContainer').innerHTML = lessonsHtml || '<p style="color:#999;">No lessons yet</p>';
        document.getElementById('courseModal').classList.remove('hidden');
    } catch (err) {
        alert('Error loading course: ' + err.message);
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
        await db.collection('courses').doc(courseId).delete();
        alert('✅ Course deleted successfully!');
        loadCourses();
    } catch (err) {
        alert('Error deleting course: ' + err.message);
    }
}

async function deleteLesson(courseId, lessonIndex) {
    if (!confirm('Delete this lesson?')) return;
    try {
        const doc = await db.collection('courses').doc(courseId).get();
        const course = doc.data();
        const updatedContent = course.content.filter((_, index) => index !== lessonIndex);
        await db.collection('courses').doc(courseId).update({ content: updatedContent });
        alert('✅ Lesson deleted!');
        editCourse(courseId);
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ==================== PAYMENTS ==================== //
async function loadPayments() {
    if (!checkFirebase()) return;
    try {
        const filterValue = document.getElementById('paymentFilter')?.value || '';
        let snap;
        if (filterValue) {
            snap = await db.collection('payments').where('status', '==', filterValue).get();
        } else {
            snap = await db.collection('payments').get();
        }
        let html = '';
        snap.forEach(doc => {
            const payment = doc.data();
            const date = new Date(payment.paymentDate?.toDate?.() || Date.now()).toLocaleDateString();
            html += `<tr>
                <td>${payment.studentName || 'Unknown'}</td>
                <td>${payment.courseName || 'Unknown'}</td>
                <td>₹${payment.amount}</td>
                <td>₹${payment.discountAmount || 0}</td>
                <td>₹${payment.finalAmount}</td>
                <td><span class="badge badge-${(payment.status||'pending').toLowerCase()}">${payment.status||'Pending'}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn-secondary btn-small" onclick="openPaymentModal('${doc.id}','${payment.status||'pending'}')">
                        <i class="fas fa-edit"></i> Update
                    </button>
                </td>
            </tr>`;
        });
        document.getElementById('paymentsTable').innerHTML = html ||
            `<tr><td colspan="8" style="text-align:center;padding:40px;">No payments yet</td></tr>`;
    } catch (err) { console.error('Error loading payments:', err); }
}

function openPaymentModal(paymentId, status) {
    currentPaymentId = paymentId;
    document.getElementById('paymentStatus').value = status;
    document.getElementById('paymentModal').classList.remove('hidden');
}
function closePaymentModal() { document.getElementById('paymentModal').classList.add('hidden'); }

async function handlePaymentUpdate(e) {
    e.preventDefault();
    const status = document.getElementById('paymentStatus').value;
    try {
        await db.collection('payments').doc(currentPaymentId).update({ status });
        alert('✅ Payment status updated!');
        closePaymentModal();
        loadPayments();
        loadDashboardData();
    } catch (err) { alert('Error: ' + err.message); }
}

// ==================== STUDENTS ==================== //
async function loadStudents() {
    if (!checkFirebase()) return;
    try {
        const snap = await db.collection('students').get();
        let html = '';
        snap.forEach(doc => {
            const s = doc.data();
            const enrollDate = new Date(s.enrollmentDate?.toDate?.() || Date.now()).toLocaleDateString();
            html += `<tr>
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.enrolledCourses?.length || 0}</td>
                <td>${enrollDate}</td>
                <td><span class="badge badge-${(s.paymentStatus||'pending').toLowerCase()}">${s.paymentStatus||'Pending'}</span></td>
            </tr>`;
        });
        document.getElementById('studentsTable').innerHTML = html ||
            `<tr><td colspan="6" style="text-align:center;padding:40px;">No students yet</td></tr>`;
    } catch (err) { console.error('Error loading students:', err); }
}

// ==================== USER LOGINS ==================== //
async function loadUsers() {
    if (!checkFirebase()) return;
    try {
        const snap = await db.collection('users').get();
        document.getElementById('userCount').textContent = `${snap.size} users registered`;
        let html = '';
        snap.forEach(doc => {
            const u = doc.data();
            const regDate = u.createdAt
                ? new Date(u.createdAt?.toDate?.() || u.createdAt).toLocaleDateString()
                : 'N/A';
            const lastLogin = u.lastLogin
                ? new Date(u.lastLogin?.toDate?.() || u.lastLogin).toLocaleString()
                : 'N/A';
            const coursesCount = u.purchasedCourses?.length || 0;
            const isActive = u.isActive !== false;
            html += `<tr>
                <td>${u.name || u.displayName || '-'}</td>
                <td>${u.email || '-'}</td>
                <td>${u.phone || '-'}</td>
                <td>${regDate}</td>
                <td>${lastLogin}</td>
                <td>${coursesCount}</td>
                <td><span class="badge badge-${isActive ? 'completed' : 'failed'}">${isActive ? 'Active' : 'Inactive'}</span></td>
            </tr>`;
        });
        document.getElementById('usersTable').innerHTML = html ||
            `<tr><td colspan="7" style="text-align:center;padding:40px;">No users registered yet</td></tr>`;
    } catch (err) {
        console.error('Error loading users:', err);
        document.getElementById('usersTable').innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:40px;color:#e74c3c;">Error loading users: ${err.message}</td></tr>`;
    }
}

// ==================== SETTINGS / DEMO VIDEO ==================== //
async function loadSettingsTab() {
    if (!checkFirebase()) return;
    try {
        const doc = await db.collection('settings').doc('site').get();
        if (doc.exists && doc.data().demoVideoUrl) {
            const currentSection = document.getElementById('currentDemoSection');
            currentSection.style.display = 'block';
            document.getElementById('currentDemoPreview').src = doc.data().demoVideoUrl;
        }
    } catch (err) { console.error('Error loading settings:', err); }
}

async function saveDemoVideo() {
    if (!selectedDemoFile) { alert('Please select a demo video file first.'); return; }

    const statusEl = document.getElementById('demoSaveStatus');
    const progressDiv = document.getElementById('demoUploadProgress');
    const progressBar = document.getElementById('demoProgressBar');
    const progressText = document.getElementById('demoProgressText');

    progressDiv.style.display = 'block';

    try {
        const fileName = `demo/demo_${Date.now()}_${selectedDemoFile.name}`;
        const storageRef = storage.ref(fileName);
        const uploadTask = storageRef.put(selectedDemoFile);

        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = `Uploading... ${Math.round(progress)}%`;
                },
                reject,
                resolve
            );
        });

        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

        await db.collection('settings').doc('site').set({
            demoVideoUrl: downloadURL,
            demoStoragePath: fileName,
            updatedAt: new Date()
        }, { merge: true });

        // Show in preview
        const currentSection = document.getElementById('currentDemoSection');
        currentSection.style.display = 'block';
        document.getElementById('currentDemoPreview').src = downloadURL;

        statusEl.style.display = 'block';
        statusEl.style.background = '#efffef';
        statusEl.style.border = '1px solid #b2dfdb';
        statusEl.style.color = '#2e7d32';
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Demo video uploaded and saved!';
        setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
        progressDiv.style.display = 'none';
    } catch (err) {
        console.error('Error saving demo video:', err);
        statusEl.style.display = 'block';
        statusEl.style.background = '#fff0f0';
        statusEl.style.color = '#c62828';
        statusEl.innerHTML = 'Error: ' + err.message;
        progressDiv.style.display = 'none';
    }
}
