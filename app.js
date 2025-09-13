// app.js

// Utility selectors
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Use an object to track which data has been requested
const dataLoadState = {
  bus: false,
  hostels: false
};

// --- PWA INSTALLATION LOGIC ---
let deferredPrompt; // This variable will hold the install prompt event
const installBtn = document.getElementById('installBtn');

// This function will register the service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
  // By not calling e.preventDefault(), we allow the browser to show its default install prompt.
  
  // Stash the event so it can be triggered by our custom button later.
  deferredPrompt = e;
  // Show our custom install button as a fallback.
  if(installBtn) {
    installBtn.style.display = 'block';
  }
});

if(installBtn) {
  installBtn.addEventListener('click', async () => {
    // Hide the install button
    installBtn.style.display = 'none';
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, so clear it
    deferredPrompt = null;
  });
}

/* window.addEventListener('appinstalled', () => {
  // Hide the install button if the app is installed
  if(installBtn) {
    installBtn.style.display = 'none';
  }
  deferredPrompt = null;
  console.log('KSU CUCEK app was installed.');
}); */
// --- END OF PWA LOGIC ---


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  try {
    trackVisit(); // Track the visit
    registerServiceWorker(); // Register the service worker for PWA features
    setupTabs();
    setupMobileMenu();
    setupDarkMode();
    setupScrollProgress();
    setupSyllabusForm();
    setupHostelSearch();
    setupGSAP();
  } catch (err) {
    console.error('[KSU-CUCEK] Init error:', err);
  }
}

/*****************
  Tabs Navigation (REVISED LOGIC WITH DEEP LINKING)
*****************/
function setupTabs() {
  const allButtons = $$('.tab-btn, .mobile-tab-btn, .tab-strip-btn');
  const allSections = $$('.tab-content');

  // This function ONLY loads data if it hasn't been loaded before
function loadDataForTab(tabName) {
    if (tabName === 'bus' && !dataLoadState.bus) {
      dataLoadState.bus = true;
      loadBusTimes('alp.json', 'busTimesAlappuzha');
      loadBusTimes('kylp.json', 'busTimesKayalpuram');
    }
    
    if (tabName === 'hostels' && !dataLoadState.hostels) {
      dataLoadState.hostels = true;
      loadHostelsFromSheet('gh.json', 'girlsTable');
      loadHostelsFromSheet('bh.json', 'boysTable');
    }
  }
  
  // This function handles showing/hiding UI and updating the URL
  function showTab(tabName) {
    if (!tabName) return;

    localStorage.setItem('ksu_active_tab', tabName);

    // This reliably updates the URL hash
    window.location.hash = tabName;

    allButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    allSections.forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== tabName);
    });
    
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
    
    loadDataForTab(tabName);
  }

  allButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = btn.dataset.tab;
      showTab(tabName);
      
      if (!$('#mobileMenu').classList.contains('hidden')) {
        toggleMobileMenu();
      }
    });
  });

  // --- THIS IS THE CRITICAL PART FOR PAGE LOAD ---
  // This function determines which tab to show when the page first loads.
  function getInitialTab() {
    // 1. Check for a valid tab name in the URL hash
    const tabFromHash = window.location.hash.substring(1);
    if (tabFromHash && $(`#${tabFromHash}`)) {
      return tabFromHash;
    }
    
    // 2. If no hash, check local storage for the last visited tab
    const tabFromStorage = localStorage.getItem('ksu_active_tab');
    if (tabFromStorage && $(`#${tabFromStorage}`)) {
      return tabFromStorage;
    }
    
    // 3. If nothing else, default to the helpdesk tab
    return 'helpdesk';
  }

  const initialTab = getInitialTab();
  showTab(initialTab);
}

/*****************
  Mobile Menu
*****************/
function setupMobileMenu() {
  const toggler = $('#mobileMenuToggle');
  if (!toggler) return;
  toggler.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
  const toggler = $('#mobileMenuToggle');
  const drawer = $('#mobileMenu');
  const isOpen = !drawer.classList.contains('hidden');
  drawer.classList.toggle('hidden');
  toggler.classList.toggle('active');
  toggler.setAttribute('aria-expanded', String(!isOpen));
}

/*****************
  Dark Mode Toggle
*****************/
function setupDarkMode() {
  const checkbox = $('#darkModeToggle');
  if (!checkbox) return;

  const applyTheme = isDark => {
    const mode = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', mode);
    document.body.setAttribute('data-color-scheme', mode);
    document.documentElement.offsetHeight;
  };

  const storedTheme = localStorage.getItem('ksu_theme');
  const isDark = storedTheme === 'dark';
  checkbox.checked = isDark;
  applyTheme(isDark);

  checkbox.addEventListener('change', () => {
    applyTheme(checkbox.checked);
    localStorage.setItem('ksu_theme', checkbox.checked ? 'dark' : 'light');
  });
}

/*****************
  Scroll Progress
*****************/
function setupScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h ? (window.scrollY / h) * 100 : 0;
    bar.style.width = pct + '%';
    bar.style.opacity = window.scrollY > 60 ? '1' : '0';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
}

/*****************
  Syllabus Download
*****************/
function setupSyllabusForm() {
  const branchSel = $('#branchSelect');
  const schemeSel = $('#schemeSelect');
  const downloadBtn = $('#downloadBtn');

  if (!branchSel || !schemeSel || !downloadBtn) return;

  const schemes = {
    ce: ['2019', '2023'],
    cs: ['2019', '2023'],
    ec: ['2019', '2023'],
    ee: ['2019', '2023'],
    it: ['2019', '2023'],
    mca: ['2012']
  };

  let selectedBranch = '';
  let selectedScheme = '';

  const updateDownloadButton = () => {
    const shouldShow = selectedBranch && selectedScheme;
    downloadBtn.classList.toggle('hidden', !shouldShow);
  };

  branchSel.addEventListener('change', function(e) {
    selectedBranch = e.target.value;
    selectedScheme = '';
    schemeSel.innerHTML = '<option value="">Select Scheme</option>';

    if (!selectedBranch) {
      schemeSel.disabled = true;
      updateDownloadButton();
      return;
    }

    const availableSchemes = schemes[selectedBranch] || [];
    availableSchemes.forEach(scheme => {
      const option = document.createElement('option');
      option.value = scheme;
      option.textContent = scheme;
      schemeSel.appendChild(option);
    });

    schemeSel.disabled = false;
    schemeSel.value = '';
    updateDownloadButton();
  });

  schemeSel.addEventListener('change', function(e) {
    selectedScheme = e.target.value;
    updateDownloadButton();
  });

  downloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!selectedBranch || !selectedScheme) {
      alert('Please select both branch and scheme');
      return;
    }

    const fileName = `syllabus_${selectedBranch}_${selectedScheme}.pdf`;
    const fileUrl = `syllabus/${fileName}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  updateDownloadButton();
}

/*****************
  Hostels Section
*****************/
function setupHostelSearch() {
  const boysBtn = $('#boysBtn');
  const girlsBtn = $('#girlsBtn');
  const boysSec = $('#boysSection');
  const girlsSec = $('#girlsSection');

  if (boysBtn && girlsBtn && boysSec && girlsSec) {
    boysSec.style.display = 'none';
    girlsSec.style.display = 'none';

    boysBtn.addEventListener('click', () => {
      girlsSec.style.display = 'none';
      girlsSec.classList.remove('hostel-slide-in');

      boysSec.style.display = 'block';
      boysSec.classList.add('hostel-slide-in');

      boysBtn.classList.add('active');
      girlsBtn.classList.remove('active');
    });

    girlsBtn.addEventListener('click', () => {
      boysSec.style.display = 'none';
      boysSec.classList.remove('hostel-slide-in');

      girlsSec.style.display = 'block';
      girlsSec.classList.add('hostel-slide-in');

      girlsBtn.classList.add('active');
      boysBtn.classList.remove('active');
    });
  }
}


/*****************
  GSAP Animations
*****************/
function setupGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not available - skipping animations');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  
  $$('.section-animate').forEach(sec => {
    gsap.from(sec, {
      opacity: 0,
      y: 30,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 85%'
      }
    });
  });

  $$('.scale-animate').forEach(card => {
    gsap.from(card, {
      opacity: 0,
      scale: 0.9,
      duration: 0.55,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%'
      }
    });
  });

  $$('.hover-lift').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -8, duration: 0.25, ease: 'power1.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.25, ease: 'power1.out' });
    });
  });
}

/*****************
  Data Fetching Functions (with better loading/error states)
*****************/
function loadBusTimes(jsonUrl, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const colCount = tbody.previousElementSibling.firstElementChild.childElementCount || 4;
  tbody.innerHTML = `<tr><td colspan="${colCount}">Loading...</td></tr>`;

  fetch(jsonUrl)
    .then(res => res.ok ? res.json() : Promise.reject(new Error(`File not found: ${jsonUrl}`)))
    .then(data => {
      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}">No timings available.</td></tr>`;
        return;
      }

      data.forEach(route => {
        const tr = document.createElement('tr');
        tr.classList.add('bus-row');
        tr.innerHTML = `
          <td>${route.from_station || ''}</td>
          <td>${route.from_time || ''}</td>
          <td>${route.to_station || ''}</td>
          <td>${route.to_time || ''}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(`Bus fetch failed: ${err}`);
      tbody.innerHTML = `<tr><td colspan="${colCount}">Error loading data.</td></tr>`;
    });
}

function loadHostelsFromSheet(jsonUrl, tableId) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    const colCount = tbody.previousElementSibling.firstElementChild.childElementCount || 2;
    tbody.innerHTML = `<tr><td colspan="${colCount}">Loading...</td></tr>`;
    
  fetch(jsonUrl)
    .then(res => res.ok ? res.json() : Promise.reject(new Error(`File not found: ${jsonUrl}`)))
    .then(data => { // 'data' is now a ready-to-use JavaScript array
      tbody.innerHTML = '';

      if (data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="${colCount}">No hostels listed.</td></tr>`;
          return;
      }

      data.forEach(hostel => {
        const tr = document.createElement('tr');
        tr.classList.add('hostel-row');
        tr.innerHTML = `
            <td>${hostel.name || ''}</td>
            <td>${hostel.phone || ''}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
        console.error(`Hostel fetch failed: ${err}`);
        tbody.innerHTML = `<tr><td colspan="${colCount}">Error loading data.</td></tr>`;
    });
}

// This function will track the website visit
function trackVisit() {
  // This is YOUR specific URL
  const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyy8Ho7yb5316wckQdeeuuhll3uR7-o0Upoj5zJn-iCEHhDBc6kV8H8dbdUuSSRLTvV/exec';

  // Make a request to your Google Apps Script
  // We add a timestamp to prevent the browser from caching the request
  fetch(appsScriptUrl + '?t=' + new Date().getTime(), {
    method: 'GET',
    mode: 'cors',
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      console.log('Visit tracked successfully. New count:', data.newCount);
    } else {
      console.error('The tracking script failed to update the count.');
    }
  })
  .catch(error => {
    console.error('Error calling the tracking script:', error);
  });
}


