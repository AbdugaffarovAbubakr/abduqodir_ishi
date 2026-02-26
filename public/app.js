const state = {
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  devices: [],
  allDevices: [],
  tests: [],
  adminTests: [],
  currentDeviceId: null,
  currentDeviceName: '',
  authView: 'register',
  adminEditingId: null
};

const authScreen = document.getElementById('auth-screen');
const appContent = document.getElementById('app-content');
const authTabs = document.querySelectorAll('.auth-tabs .tab');
const authViews = document.querySelectorAll('.auth-view');

const authStatus = document.getElementById('auth-status');
const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');
const testMsg = document.getElementById('test-msg');
const devicesList = document.getElementById('devices-list');
const testForm = document.getElementById('test-form');
const testTitle = document.getElementById('test-title');
const resultsList = document.getElementById('results-list');
const loginEmailInput = document.querySelector('#login-form input[name="email"]');
const adminSection = document.getElementById('admin-tests-card');
const adminForm = document.getElementById('admin-test-form');
const adminTestTitle = document.getElementById('admin-test-title');
const adminDeviceSelect = document.getElementById('admin-test-device');
const adminQuestionInput = document.getElementById('admin-test-question');
const adminOptionsInput = document.getElementById('admin-test-options');
const adminCorrectInput = document.getElementById('admin-test-correct');
const adminSubmitBtn = document.getElementById('admin-test-submit');
const adminCancelBtn = document.getElementById('admin-test-cancel');
const adminMsg = document.getElementById('admin-test-msg');
const adminTestsList = document.getElementById('admin-tests-list');
const showcaseTabs = document.querySelectorAll('.device-tab');
const showcaseTitle = document.getElementById('device-title');
const showcaseLabel = document.getElementById('device-label');
const showcaseDescription = document.getElementById('device-description');
const showcaseSpecs = document.getElementById('device-specs');
const showcaseImage = document.getElementById('device-image');

const isAdmin = () => Boolean(state.user && state.user.role === 'admin');

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  if (token && user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
  updateAuthUI();
}

function setAuthView(view) {
  state.authView = view;
  authTabs.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  authViews.forEach((form) => {
    form.classList.toggle('active', form.dataset.view === view);
  });
}

function updateAuthStatus() {
  if (state.user) {
    authStatus.textContent = `Holat: ${state.user.fullname} (${state.user.role})`;
  } else {
    authStatus.textContent = 'Holat: tizimga kirilmagan';
  }
}

function clearAppData() {
  state.devices = [];
  state.tests = [];
  state.adminTests = [];
  state.adminEditingId = null;
  state.currentDeviceId = null;
  state.currentDeviceName = '';
  devicesList.innerHTML = '';
  testForm.innerHTML = '';
  testTitle.textContent = 'Qurilmani tanlang';
  resultsList.innerHTML = '';
  showMessage(testMsg, '', false);
  if (adminTestsList) {
    adminTestsList.innerHTML = '';
  }
  if (adminSection) {
    adminSection.classList.add('hidden');
  }
  if (adminForm) {
    resetAdminForm();
  }
}

async function updateAuthUI() {
  updateAuthStatus();
  if (state.user) {
    authScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    await loadDevices({}, true);
    if (isAdmin()) {
      if (adminSection) {
        adminSection.classList.remove('hidden');
      }
      updateAdminDeviceOptions();
      resetAdminForm();
      await loadAdminTests();
    } else if (adminSection) {
      adminSection.classList.add('hidden');
    }
  } else {
    authScreen.classList.remove('hidden');
    appContent.classList.add('hidden');
    clearAppData();
  }
}

function showMessage(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.className = isError ? 'form-msg error' : 'form-msg';
}

async function api(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (state.token) {
    config.headers.Authorization = `Bearer ${state.token}`;
  }
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const response = await fetch(path, config);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = data.error || "So'rovda xatolik yuz berdi";
    throw new Error(message);
  }
  return data;
}

async function loadDevices(query = {}, storeAll = false) {
  if (!state.user) return;
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  const url = params.toString() ? `/devices?${params.toString()}` : '/devices';
  const res = await api(url);
  state.devices = res.data || [];
  if (storeAll) {
    state.allDevices = state.devices;
  }
  renderDevices();
}

function renderDevices() {
  devicesList.innerHTML = '';
  if (!state.devices.length) {
    devicesList.innerHTML = '<p class="muted">Qurilmalar topilmadi.</p>';
    return;
  }
  state.devices.forEach((device) => {
    const item = document.createElement('div');
    item.className = 'device';
    const specs = device.specs
      ? Object.entries(device.specs)
          .map(([key, value]) => `<span>${key}: ${value}</span>`)
          .join(' | ')
      : '';
    item.innerHTML = `
      <div>
        <h3>${device.name}</h3>
        <p class="muted">${device.description}</p>
        <p class="tag">${device.category}</p>
        ${specs ? `<p class="specs">${specs}</p>` : ''}
      </div>
      <button data-device="${device.id}" data-name="${device.name}">Testni boshlash</button>
    `;
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => loadTests(device.id, device.name));
    devicesList.appendChild(item);
  });
}

async function loadTests(deviceId, deviceName) {
  const res = await api(`/tests/${deviceId}`);
  state.tests = res.data || [];
  state.currentDeviceId = deviceId;
  state.currentDeviceName = deviceName;
  renderTests();
}

function renderTests() {
  testForm.innerHTML = '';
  showMessage(testMsg, '', false);
  if (!state.currentDeviceId) {
    testTitle.textContent = 'Qurilmani tanlang';
    return;
  }
  testTitle.textContent = `${state.currentDeviceName} bo'yicha test`;
  if (!state.tests.length) {
    testForm.innerHTML = '<p class="muted">Test savollari topilmadi.</p>';
    return;
  }
  state.tests.forEach((test, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'question';
    fieldset.innerHTML = `
      <legend>${index + 1}. ${test.question}</legend>
      ${test.options
        .map(
          (opt, i) => `
        <label>
          <input type="radio" name="q_${test.id}" value="${i}">
          ${opt}
        </label>
      `
        )
        .join('')}
    `;
    testForm.appendChild(fieldset);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Natijani yuborish';
  testForm.appendChild(submit);
}

async function submitTest(event) {
  event.preventDefault();
  if (!state.tests.length) return;
  if (!state.token) {
    showMessage(testMsg, 'Natija saqlash uchun avval login qiling.', true);
    return;
  }
  const answers = state.tests.map((test) => {
    const selected = testForm.querySelector(`input[name="q_${test.id}"]:checked`);
    const answerIndex = selected ? Number(selected.value) : null;
    return { testId: test.id, answerIndex };
  });

  try {
    const res = await api('/results', {
      method: 'POST',
      body: {
        deviceId: state.currentDeviceId,
        answers
      }
    });
    const result = res.result;
    showMessage(
      testMsg,
      `Natija: ${result.score}/${result.total} (${result.percentage}%)`,
      false
    );
  } catch (error) {
    showMessage(testMsg, error.message, true);
  }
}

async function loadResults() {
  if (!state.token) {
    resultsList.innerHTML = '<p class="muted">Natijalarni ko\'rish uchun login qiling.</p>';
    return;
  }
  try {
    const res = await api('/results/me');
    const data = res.data || [];
    renderResults(data);
  } catch (error) {
    resultsList.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

function renderResults(results) {
  resultsList.innerHTML = '';
  if (!results.length) {
    resultsList.innerHTML = '<p class="muted">Natijalar hali yo\'q.</p>';
    return;
  }
  results.forEach((result) => {
    const item = document.createElement('div');
    item.className = 'result';
    const deviceLabel = result.deviceName ? ` - ${result.deviceName}` : '';
    item.innerHTML = `
      <strong>${result.score}/${result.total} (${result.percentage}%)</strong>
      <span class="muted">${result.date}${deviceLabel}</span>
    `;
    resultsList.appendChild(item);
  });
}

let showcaseTimer = null;
let showcaseResumeTimer = null;
let showcaseIndex = 0;

function setShowcase(tab) {
  if (!tab) return;
  showcaseTabs.forEach((btn) => btn.classList.toggle('active', btn === tab));

  if (showcaseLabel) {
    showcaseLabel.textContent = tab.dataset.category || '';
  }
  if (showcaseTitle) {
    showcaseTitle.textContent = tab.dataset.name || '';
  }
  if (showcaseDescription) {
    showcaseDescription.textContent = tab.dataset.description || '';
  }
  if (showcaseSpecs) {
    const specs = (tab.dataset.specs || '')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);
    showcaseSpecs.innerHTML = '';
    specs.forEach((spec) => {
      const span = document.createElement('span');
      span.textContent = spec;
      showcaseSpecs.appendChild(span);
    });
  }
  if (showcaseImage) {
    const template = document.getElementById(`device-image-${tab.dataset.device}`);
    if (template && 'content' in template) {
      showcaseImage.innerHTML = '';
      showcaseImage.appendChild(template.content.cloneNode(true));
    }
  }
}

function startShowcaseRotation() {
  if (!showcaseTabs.length) return;
  stopShowcaseRotation();
  showcaseTimer = setInterval(() => {
    showcaseIndex = (showcaseIndex + 1) % showcaseTabs.length;
    setShowcase(showcaseTabs[showcaseIndex]);
  }, 6000);
}

function stopShowcaseRotation() {
  if (showcaseTimer) {
    clearInterval(showcaseTimer);
    showcaseTimer = null;
  }
  if (showcaseResumeTimer) {
    clearTimeout(showcaseResumeTimer);
    showcaseResumeTimer = null;
  }
}

function initShowcase() {
  if (!showcaseTabs.length) return;
  const activeTab = Array.from(showcaseTabs).find((tab) => tab.classList.contains('active'));
  const initialTab = activeTab || showcaseTabs[0];
  showcaseIndex = Array.from(showcaseTabs).indexOf(initialTab);
  setShowcase(initialTab);
  startShowcaseRotation();

  showcaseTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      stopShowcaseRotation();
      showcaseIndex = index;
      setShowcase(tab);
      showcaseResumeTimer = setTimeout(startShowcaseRotation, 12000);
    });
  });
}

function updateAdminDeviceOptions() {
  if (!adminDeviceSelect) return;
  const devices = state.allDevices.length ? state.allDevices : state.devices;
  adminDeviceSelect.innerHTML = '';
  if (!devices.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Qurilmalar topilmadi';
    option.disabled = true;
    option.selected = true;
    adminDeviceSelect.appendChild(option);
    return;
  }
  devices.forEach((device) => {
    const option = document.createElement('option');
    option.value = device.id;
    option.textContent = device.name;
    adminDeviceSelect.appendChild(option);
  });
}

function resetAdminForm() {
  if (!adminForm) return;
  state.adminEditingId = null;
  adminForm.reset();
  if (adminTestTitle) {
    adminTestTitle.textContent = "Test qo'shish";
  }
  if (adminSubmitBtn) {
    adminSubmitBtn.textContent = "Test qo'shish";
  }
  if (adminCancelBtn) {
    adminCancelBtn.classList.add('hidden');
  }
  showMessage(adminMsg, '', false);
}

function setAdminForm(test) {
  if (!adminForm) return;
  state.adminEditingId = test.id;
  if (adminTestTitle) {
    adminTestTitle.textContent = 'Test tahrirlash';
  }
  if (adminSubmitBtn) {
    adminSubmitBtn.textContent = 'Saqlash';
  }
  if (adminCancelBtn) {
    adminCancelBtn.classList.remove('hidden');
  }
  if (adminDeviceSelect) {
    adminDeviceSelect.value = test.deviceId;
  }
  if (adminQuestionInput) {
    adminQuestionInput.value = test.question || '';
  }
  if (adminOptionsInput) {
    adminOptionsInput.value = Array.isArray(test.options)
      ? test.options.join('\n')
      : '';
  }
  if (adminCorrectInput) {
    adminCorrectInput.value = Number.isInteger(test.correctAnswer)
      ? test.correctAnswer + 1
      : '';
  }
  showMessage(adminMsg, '', false);
}

function parseOptions(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function loadAdminTests() {
  if (!isAdmin()) return;
  const res = await api('/tests/admin');
  state.adminTests = res.data || [];
  renderAdminTests();
}

function renderAdminTests() {
  if (!adminTestsList) return;
  adminTestsList.innerHTML = '';
  if (!state.adminTests.length) {
    adminTestsList.innerHTML = '<p class="muted">Testlar topilmadi.</p>';
    return;
  }
  state.adminTests.forEach((test) => {
    const item = document.createElement('div');
    item.className = 'admin-test';
    const deviceLabel = test.deviceName || test.deviceId || 'Unknown';
    const optionsText = Array.isArray(test.options)
      ? test.options.map((opt, idx) => `${idx + 1}. ${opt}`).join(' | ')
      : '';
    const correctLabel = Number.isInteger(test.correctAnswer)
      ? test.correctAnswer + 1
      : '-';
    item.innerHTML = `
      <div>
        <strong>${test.question}</strong>
        <div class="muted">Qurilma: ${deviceLabel}</div>
        ${optionsText ? `<div class="muted">Variantlar: ${optionsText}</div>` : ''}
        <div class="muted">To'g'ri: ${correctLabel}</div>
      </div>
      <div class="admin-test-actions">
        <button type="button" class="ghost" data-action="edit">Tahrirlash</button>
        <button type="button" data-action="delete">O'chirish</button>
      </div>
    `;
    const editBtn = item.querySelector('[data-action="edit"]');
    const deleteBtn = item.querySelector('[data-action="delete"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => setAdminForm(test));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteAdminTest(test.id));
    }
    adminTestsList.appendChild(item);
  });
}

async function deleteAdminTest(id) {
  if (!isAdmin()) return;
  const ok = window.confirm('Testni o\'chirishni xohlaysizmi?');
  if (!ok) return;
  try {
    await api(`/tests/${id}`, { method: 'DELETE' });
    showMessage(adminMsg, "Test o'chirildi.", false);
    resetAdminForm();
    await loadAdminTests();
  } catch (error) {
    showMessage(adminMsg, error.message, true);
  }
}

authTabs.forEach((btn) => {
  btn.addEventListener('click', () => setAuthView(btn.dataset.view));
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const body = {
    fullname: form.fullname.value.trim(),
    email,
    password: form.password.value
  };
  try {
    const res = await api('/auth/register', { method: 'POST', body });
    showMessage(registerMsg, `Ro'yxatdan o'tildi: ${res.user.fullname}`, false);
    form.reset();
    setAuthView('login');
    if (loginEmailInput) {
      loginEmailInput.value = email;
    }
    showMessage(loginMsg, 'Endi login qiling.', false);
  } catch (error) {
    showMessage(registerMsg, error.message, true);
  }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const body = {
    email: form.email.value.trim(),
    password: form.password.value
  };
  try {
    const res = await api('/auth/login', { method: 'POST', body });
    setAuth(res.token, res.user);
    showMessage(loginMsg, 'Muvaffaqiyatli login qilindi.', false);
  } catch (error) {
    showMessage(loginMsg, error.message, true);
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  setAuth(null, null);
  showMessage(loginMsg, 'Chiqildi.', false);
});

if (adminForm) {
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isAdmin()) return;
    const deviceId = adminDeviceSelect ? adminDeviceSelect.value : '';
    const question = adminQuestionInput ? adminQuestionInput.value.trim() : '';
    const options = adminOptionsInput ? parseOptions(adminOptionsInput.value) : [];
    const correctValue = adminCorrectInput ? Number(adminCorrectInput.value) : NaN;

    if (!deviceId) {
      showMessage(adminMsg, 'Qurilmani tanlang.', true);
      return;
    }
    if (!question) {
      showMessage(adminMsg, 'Savol matnini kiriting.', true);
      return;
    }
    if (options.length < 2) {
      showMessage(adminMsg, 'Kamida 2 ta variant kiriting.', true);
      return;
    }
    if (!Number.isInteger(correctValue) || correctValue < 1 || correctValue > options.length) {
      showMessage(adminMsg, "To'g'ri javob raqami noto'g'ri.", true);
      return;
    }

    const payload = {
      deviceId,
      question,
      options,
      correctAnswer: correctValue - 1
    };

    try {
      if (state.adminEditingId) {
        await api(`/tests/${state.adminEditingId}`, { method: 'PUT', body: payload });
        showMessage(adminMsg, 'Test tahrirlandi.', false);
      } else {
        await api('/tests', { method: 'POST', body: payload });
        showMessage(adminMsg, "Test qo'shildi.", false);
      }
      resetAdminForm();
      await loadAdminTests();
    } catch (error) {
      showMessage(adminMsg, error.message, true);
    }
  });
}

if (adminCancelBtn) {
  adminCancelBtn.addEventListener('click', () => resetAdminForm());
}

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const q = form.q.value.trim();
  const category = form.category.value;
  loadDevices({ q, category });
});

document.getElementById('load-results').addEventListener('click', loadResults);

testForm.addEventListener('submit', submitTest);

setAuthView(state.user ? 'login' : 'register');
updateAuthUI();
initShowcase();
