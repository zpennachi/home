// app.js

// 1) Category → color map
const CATEGORY_COLORS = {
  'all work':              '#000000',
  'product renders':       '#E55F0E',
  'artwork':               '#39FF14',
  'immersive experiences': '#FF2D95',
  'sounds':                '#1E90FF',
};

// 2) Supabase initialization
const supabaseUrl    = 'https://sgvcogsjbwyfdvepalzf.supabase.co';
const supabaseKey    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmNvZ3NqYnd5ZmR2ZXBhbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQxNjgsImV4cCI6MjA1NDk2MDE2OH0.24hgp5RB6lwt8GRDGTy7MmbujkBv4FLstA-z5SOuqNo';
const mySupabaseClient = supabase.createClient(supabaseUrl, supabaseKey);



// 3) UI element references (may be null depending on page)
const showLoginBtn      = document.getElementById('showSignInButton');
const signInBtn         = document.getElementById('signInButton');
const logOutBtn         = document.getElementById('logOutButton');
const userEmailSpan     = document.getElementById('user-email');
const categoryFilter    = document.getElementById('categoryFilter');
const entriesList       = document.getElementById('entries-list');
const uploadForm        = document.getElementById('uploadForm');
const caseStudyCheckbox = document.getElementById('caseStudyCheckbox');
const cs1Input          = document.getElementById('csSection1');
const cs2Input          = document.getElementById('csSection2');
const cs3Input          = document.getElementById('csSection3');

// 4) Application state
let page              = 0;
const pageSize        = 1;
let selectedCategory  = '';
const progressBars    = [];

// 5) Show/hide case study inputs
if (caseStudyCheckbox) {
  caseStudyCheckbox.addEventListener('change', () => {
    const show = caseStudyCheckbox.checked;
    [cs1Input, cs2Input, cs3Input].forEach(el => {
      if (el) el.classList.toggle('hidden', !show);
    });
  });
}

// 6) Infinite-scroll observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      obs.unobserve(entry.target);
      loadEntries();
    }
  });
}, { rootMargin: '200px' });

// 7) On DOM ready: check auth and load portfolio if present
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthState();
  if (entriesList) {
    loadEntries();
  }
});

// 8) Auth handlers
if (showLoginBtn) {
  showLoginBtn.addEventListener('click', () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) authSection.classList.toggle('hidden');
  });
}

if (signInBtn) {
  signInBtn.addEventListener('click', async () => {
    const email    = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else checkAuthState();
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', async () => {
    await mySupabaseClient.auth.signOut();
    checkAuthState();
  });
}

// Check auth state (shows/hides upload form or portfolio accordingly)
async function checkAuthState() {
  const { data: { user } } = await mySupabaseClient.auth.getUser();
  const uploadSection = document.getElementById('upload-section');
  if (user) {
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (uploadSection) uploadSection.classList.remove('hidden');
  } else {
    if (uploadSection) uploadSection.classList.add('hidden');
  }
}

// 9) Category filter (portfolio page)
if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    selectedCategory = categoryFilter.value;
    categoryFilter.style.color = CATEGORY_COLORS[selectedCategory] || '#000';
    page = 0;
    entriesList.innerHTML = '';
    progressBars.length = 0;
    loadEntries();
  });
}

// 10) Upload handler (fun.html page)
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title       = document.getElementById('titleInput').value.trim();
    const medium      = document.getElementById('mediumInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const isCaseStudy = caseStudyCheckbox.checked;
    const cs1         = isCaseStudy ? cs1Input.value : '';
    const cs2         = isCaseStudy ? cs2Input.value : '';
    const cs3         = isCaseStudy ? cs3Input.value : '';
    const category    = document.getElementById('categoryInput').value;
    const files       = Array.from(document.getElementById('fileInput').files);

    if (!title || !medium || !description || !category || files.length === 0) {
      return alert('Please fill all fields, select a category, and choose at least one file.');
    }

    try {
      // upload files
      const urls = await Promise.all(files.map(async file => {
        const path = `uploads/${Date.now()}_${file.name}`;
        const { error: upErr } = await mySupabaseClient
          .storage
          .from('portfolio-uploads')
          .upload(path, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = mySupabaseClient
          .storage
          .from('portfolio-uploads')
          .getPublicUrl(path);
        return publicUrl;
      }));

      // insert row
      const { error: insErr } = await mySupabaseClient
        .from('365')
        .insert([{
          title,
          medium,
          description,
          category,
          file: urls,
          case_study: isCaseStudy,
          cs_section1: cs1,
          cs_section2: cs2,
          cs_section3: cs3
        }]);
      if (insErr) throw insErr;

      // reset & reload
      uploadForm.reset();
      [cs1Input, cs2Input, cs3Input].forEach(el => el.classList.add('hidden'));
      page = 0;
      if (entriesList) {
        entriesList.innerHTML = '';
        progressBars.length = 0;
        loadEntries();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// 11) Load & render entries (portfolio page)
async function loadEntries() {
  if (!entriesList) return;

  const from = page * pageSize;
  const to   = from + pageSize - 1;

  let query = mySupabaseClient
    .from('365')
    .select('id, title, medium, description, file, category, case_study, cs_section1, cs_section2, cs_section3');
  if (selectedCategory) {
    query = query.eq('category', selectedCategory);
  }

  const { data: entries, error } = await query
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    const li = document.createElement('li');
    li.textContent = `Error loading entries: ${error.message}`;
    entriesList.append(li);
    return;
  }
  if (!entries.length) return;

  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'entry-item';
    li.style.position = 'relative';

    if (entry.case_study) {
      const cs1Div = document.createElement('div');
      cs1Div.className = 'cs-section';
      cs1Div.innerHTML = entry.cs_section1;
      li.append(cs1Div);
    }

    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'files-container';
    normalizeFileArray(entry.file).forEach(url => mediaDiv.append(renderFile(url)));
    li.append(mediaDiv);

    if (entry.case_study) {
      const cs2Div = document.createElement('div');
      cs2Div.className = 'cs-section';
      cs2Div.innerHTML = entry.cs_section2;
      li.append(cs2Div);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'entry-info';
    infoDiv.innerHTML = `
      <div class="progress-container"><div class="progress-bar"></div></div>
      <p><strong>${entry.title}</strong> (${entry.medium})</p>
      <p>${entry.description}</p>
    `;
    li.append(infoDiv);

    if (entry.case_study) {
      const cs3Div = document.createElement('div');
      cs3Div.className = 'cs-section';
      cs3Div.innerHTML = entry.cs_section3;
      li.append(cs3Div);
    }

    const bar = infoDiv.querySelector('.progress-bar');
    bar.style.backgroundColor = CATEGORY_COLORS[entry.category] || '#000';
    progressBars.push(bar);

    entriesList.append(li);
  });

  if (window.lightbox) window.lightbox.reload();

  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  entriesList.append(sentinel);
  observer.observe(sentinel);

  page++;
}

// 12) Scroll-driven progress updates
let ticking = false;
window.addEventListener('scroll', () => {
  if (!progressBars.length) return;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const vh = window.innerHeight;
      progressBars.forEach(bar => {
        const rect = bar.closest('.entry-item').getBoundingClientRect();
        let pct = ((vh - rect.top) / rect.height) * 100;
        pct = Math.min(Math.max(pct, 0), 100);
        bar.style.width = pct + '%';
      });
      ticking = false;
    });
    ticking = true;
  }
});

// 13) Helpers
function normalizeFileArray(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch {
      return [field];
    }
  }
  return [];
}

function renderFile(url) {
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const a = document.createElement('a');
    a.href = url;
    a.classList.add('glightbox');
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.className = 'thumbnail';
    img.onload = () => {
      const cls = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
      img.classList.add(cls);
      a.classList.add(cls);
    };
    a.append(img);
    return a;
  }
  if (['mp4','webm','ogg'].includes(ext)) {
    const vid = document.createElement('video');
    vid.src = url;
    vid.controls = true;
    return vid;
  }
  if (['mp3','wav','ogg'].includes(ext)) {
    const aud = document.createElement('audio');
    aud.src = url;
    aud.controls = true;
    return aud;
  }
  if (['glb','gltf'].includes(ext)) {
    const mv = document.createElement('model-viewer');
    mv.src = url;
    mv.alt = '3D model';
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    return mv;
  }
  const link = document.createElement('a');
  link.href = url;
  link.textContent = 'Download file';
  link.target = '_blank';
  return link;
}
