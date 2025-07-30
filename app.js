// Utility selectors
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

let currentTab = 'helpdesk';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  try {
    setupTabs();
    setupMobileMenu();
    setupDarkMode();
    setupScrollProgress();
    setupSyllabusForm();
    setupHostelSearch();
    setupGSAP();

    loadHostelsFromSheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vSd2pseQ2OZxE-mkiay67QzpAXiLvgSRbyL2XMSzYMdi9tKA0tig4yAfO3StD2Qjy5JviQUXBUFHyma/pub?output=csv', 'girlsTable');
    loadHostelsFromSheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vR9pa4oleYUmJSP3Bg6l7s0FTEdFneJbM8UHraJCmjTFOiYjlLwh5bOLmWYaCa84GlX1z6LQz8fQZPU/pub?output=csv', 'boysTable');

    loadBusTimes('https://docs.google.com/spreadsheets/d/e/2PACX-1vR6-Xq1Ko2HSmZ4_wRjcLKW4G5S8FGGGpcRmPFwE_R7epKZ6ZRovs-91r2MZiws1nuYk3euXaQeeA_n/pub?output=csv&t=' + Date.now(), 'busTimesAlappuzha');
    loadBusTimes('https://docs.google.com/spreadsheets/d/e/2PACX-1vQVFgYQra9dDafW-wKUhs-hSl2nBEKzlCNoAKDP-mTKHMv9uZdrJtrZs8LcHmcFG-4xYJuTndb6s1_Q/pub?output=csv&t=' + Date.now(), 'busTimesKayalpuram');

    loadHelpdeskFromSheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vQeSFVcp3wLyJqeblxj2H3ZQyOlADqFKSbsHZH0PFl4EjFWHNxQHedGJjmMCXvs8RqvuQcLodt5mt5a/pub?output=csv');
  } catch (err) {
    console.error('[KSU-CUCEK] Init error:', err);
  }
}

/*****************
  Tabs Navigation
*****************/
function setupTabs() {
  const tabButtons = $$('.tab-btn');
  const mobileBtns = $$('.mobile-tab-btn');
  const stripBtns = $$('.tab-strip-btn');
  const allButtons = [...tabButtons, ...mobileBtns, ...stripBtns];
  const allSections = $$('.tab-content');

  const hideAllPanels = () => {
    allSections.forEach(sec => sec.classList.add('hidden'));
  };

  hideAllPanels();
const savedTab = localStorage.getItem('ksu_active_tab') || 'helpdesk';
const savedSection = $(`#${savedTab}`);
if (savedSection) savedSection.classList.remove('hidden');
currentTab = savedTab;

  allButtons.forEach(btn => {
  const isActive = btn.dataset.tab === savedTab;
  btn.classList.toggle('active', isActive);
  if (btn.hasAttribute('aria-selected')) {
    btn.setAttribute('aria-selected', String(isActive));
  }
});


  const switchTab = tabName => {
    if (!tabName || tabName === currentTab) return;
    localStorage.setItem('ksu_active_tab', tabName);


    hideAllPanels();
    const nextPanel = $(`#${tabName}`);
    if (nextPanel) nextPanel.classList.remove('hidden');
    currentTab = tabName;

    allButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isActive);
      if (btn.hasAttribute('aria-selected')) {
        btn.setAttribute('aria-selected', String(isActive));
      }
    });

    if (!$('#mobileMenu').classList.contains('hidden')) {
      toggleMobileMenu();
    }
  };

  allButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
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

  const slider = checkbox.nextElementSibling;
  if (slider) {
    slider.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkbox.checked = !checkbox.checked;
      applyTheme(checkbox.checked);
       localStorage.setItem('ksu_theme', checkbox.checked ? 'dark' : 'light');
    });
  }
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
    // Hide both sections initially
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

  const helpdeskRows = $$('#helpdeskTable .table-row-animate');
  if (helpdeskRows.length) {
    gsap.from(helpdeskRows, {
      opacity: 0,
      x: -15,
      duration: 0.45,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#helpdeskTable',
        start: 'top 80%'
      }
    });
  }

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
  Helpdesk Sheet Integration
*****************/
function loadHelpdeskFromSheet(csvUrl) {
  fetch(csvUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n').map(r => r.split(','));
      const [headers, ...dataRows] = rows;

      const headingIndex = headers.findIndex(h => h.toLowerCase().includes('heading'));
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const roleIndex = headers.findIndex(h => h.toLowerCase().includes('designation'));
      const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      const emojiIndex = headers.findIndex(h => h.toLowerCase().includes('emoji'));

      const container = document.getElementById('helpdeskCards');
      if (!container) return;
      container.innerHTML = '';

      dataRows.forEach(row => {
        const heading = row[headingIndex] || '';
        const name = row[nameIndex] || '';
        const designation = row[roleIndex] || '';
        const phone = row[phoneIndex] || '';
        const email = row[emailIndex] || '';
        const emoji = emojiIndex !== -1 ? row[emojiIndex] || '📞' : '📞';

        const card = document.createElement('figure');
        card.className = 'qr-card hover-lift help-card';
        card.tabIndex = 0;
        card.innerHTML = `
          <div class="qr-placeholder">${emoji}</div>
          <figcaption>${heading}</figcaption>
          <p class="qr-desc">${designation}</p>
        `;

        card.addEventListener('click', () => {
          $('#helpModalHeading').textContent = heading;
          $('#helpModalName').textContent = name;
          $('#helpModalRole').textContent = designation;
          $('#helpModalPhone').textContent = phone;
          $('#helpModalEmail').textContent = email;
          $('#helpModal').classList.remove('hidden');
        });

        container.appendChild(card);
      });

      $('#closeHelpModal').addEventListener('click', () => {
        $('#helpModal').classList.add('hidden');
      });

      window.addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
          $('#helpModal').classList.add('hidden');
        }
      });
    })
    .catch(err => console.error('📛 Helpdesk fetch fail:', err));
}



/*****************
  Bus Time Sheet Integration
*****************/
function loadBusTimes(csvUrl, tbodyId) {
  fetch(csvUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n').map(r => r.split(','));
      const [headers, ...dataRows] = rows;

      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;
      tbody.innerHTML = '';

      dataRows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell.trim();
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error(`📛 Failed to load ${tbodyId}`, err));
}
/*****************
  Hostel Sheet Integration
*****************/
function loadHostelsFromSheet(csvUrl, tableId) {
  fetch(csvUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n').map(r => r.split(','));
      const [headers, ...dataRows] = rows;

      const tbody = document.getElementById(tableId);
      if (!tbody) return;

      tbody.innerHTML = '';
      dataRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.classList.add('hostel-row');
        tr.dataset.name = row[0].toLowerCase();
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error(`📛 Hostel fetch failed: ${err}`));
}
