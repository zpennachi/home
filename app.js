// Initialize Supabase
const supabaseUrl      = 'https://sgvcogsjbwyfdvepalzf.supabase.co';
const supabaseKey   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmNvZ3NqYnd5ZmR2ZXBhbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQxNjgsImV4cCI6MjA1NDk2MDE2OH0.24hgp5RB6lwt8GRDGTy7MmbujkBv4FLstA-z5SOuqNo';


const mySupabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// UI Elements
const showLoginBtn     = document.getElementById('showSignInButton');
const authSection      = document.getElementById('auth-section');
const signInSection    = document.getElementById('sign-in');
const loggedInSection  = document.getElementById('logged-in');
const userEmailSpan    = document.getElementById('user-email');
const uploadSection    = document.getElementById('upload-section');
const uploadForm       = document.getElementById('uploadForm');
const titleInput       = document.getElementById('titleInput');
const mediumInput      = document.getElementById('mediumInput');
const descriptionInput = document.getElementById('descriptionInput');
const fileInput        = document.getElementById('fileInput');
const entriesList      = document.getElementById('entries-list');

// Pagination state
let page       = 0;
const pageSize = 1;

// IntersectionObserver for infinite scroll
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      obs.unobserve(entry.target);
      loadEntries();
    }
  });
}, {
  rootMargin: '200px'
});

// On load: auth + first entry
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthState();
  loadEntries();
});

// Toggle login form
showLoginBtn.addEventListener('click', () => {
  authSection.classList.toggle('hidden');
});

// Check auth state
async function checkAuthState() {
  const { data: { user } } = await mySupabaseClient.auth.getUser();
  if (user) {
    userEmailSpan.textContent       = user.email;
    signInSection.classList.add('hidden');
    loggedInSection.classList.remove('hidden');
    uploadSection.classList.remove('hidden');
  } else {
    signInSection.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
    uploadSection.classList.add('hidden');
  }
}

// Sign in
document.getElementById('signInButton').addEventListener('click', async () => {
  const email    = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else checkAuthState();
});

// Sign out
document.getElementById('logOutButton').addEventListener('click', async () => {
  await mySupabaseClient.auth.signOut();
  checkAuthState();
});

// Upload form (multi-file)
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title  = titleInput.value.trim();
  const medium = mediumInput.value.trim();
  const desc   = descriptionInput.value.trim();
  const files  = Array.from(fileInput.files);

  if (!title || !medium || !desc || files.length === 0) {
    return alert('Please fill all fields and select at least one file.');
  }

  try {
    // 1) upload each file & collect URLs
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

    // 2) insert row
    const { error: insertErr } = await mySupabaseClient
      .from('365')
      .insert([{ title, medium, description: desc, file: urls }]);
    if (insertErr) throw insertErr;

    // reset & reload
    uploadForm.reset();
    page = 0;
    entriesList.innerHTML = '';
    loadEntries();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// Load one entry at a time
async function loadEntries() {
  const from = page * pageSize;
  const to   = from + pageSize - 1;

  const { data: entries, error } = await mySupabaseClient
    .from('365')
    .select('id, title, medium, description, file')
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    const li = document.createElement('li');
    li.textContent = `Error loading entries: ${error.message}`;
    entriesList.append(li);
    return;
  }
  if (!entries.length) return; // no more

  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'entry-item';

    // media
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'files-container';
    normalizeFileArray(entry.file).forEach(url =>
      mediaDiv.append(renderFile(url))
    );

    // sticky info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'entry-info';
    infoDiv.innerHTML = `
      <p><strong>${entry.title}</strong> (${entry.medium})</p>
      <p>${entry.description}</p>
    `;

    li.append(mediaDiv, infoDiv);
    entriesList.append(li);
  });

  // reload lightbox on new anchors
  if (window.lightbox) window.lightbox.reload();

  // sentinel for next entry
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  entriesList.append(sentinel);
  observer.observe(sentinel);

  page++;
}

// Helpers
function normalizeFileArray(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const p = JSON.parse(field);
      return Array.isArray(p) ? p : [field];
    } catch {
      return [field];
    }
  }
  return [];
}

function renderFile(url) {
  const ext = url.split('.').pop().toLowerCase();

  // image + lightbox
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const link = document.createElement('a');
    link.href = url;
    link.classList.add('glightbox');

    const img = document.createElement('img');
    img.src       = url;
    img.alt       = '';
    img.className = 'thumbnail';

    img.onload = () => {
      const cls = img.naturalWidth > img.naturalHeight
        ? 'landscape'
        : 'portrait';
      img.classList.add(cls);
      link.classList.add(cls);
    };

    link.append(img);
    return link;
  }
  // video
  if (['mp4','webm','ogg'].includes(ext)) {
    const vid = document.createElement('video');
    vid.src      = url;
    vid.controls = true;
    return vid;
  }
  // audio
  if (['mp3','wav','ogg'].includes(ext)) {
    const aud = document.createElement('audio');
    aud.src      = url;
    aud.controls = true;
    return aud;
  }
  // 3D
  if (['glb','gltf'].includes(ext)) {
    const mv = document.createElement('model-viewer');
    mv.src = url;
    mv.alt = '3D model';
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    return mv;
  }
  // fallback
  const a = document.createElement('a');
  a.href        = url;
  a.textContent = 'Download file';
  a.target      = '_blank';
  return a;
}
