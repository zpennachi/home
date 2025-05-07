// Initialize Supabase
const supabaseUrl   = 'https://sgvcogsjbwyfdvepalzf.supabase.co';
const supabaseKey   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmNvZ3NqYnd5ZmR2ZXBhbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQxNjgsImV4cCI6MjA1NDk2MDE2OH0.24hgp5RB6lwt8GRDGTy7MmbujkBv4FLstA-z5SOuqNo';
const mySupabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ——— UI Elements ———
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

// ——— Pagination state ———
let page      = 0;
const pageSize = 1;

// ——— IntersectionObserver for infinite scroll ———
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

// ——— On load: auth + first entry ———
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthState();
  loadEntries();
});

// ——— Auth handlers ———
showLoginBtn.addEventListener('click', () => {
  authSection.classList.toggle('hidden');
});

async function checkAuthState() {
  const { data: { user } } = await mySupabaseClient.auth.getUser();
  if (user) {
    userEmailSpan.textContent        = user.email;
    signInSection.classList.add('hidden');
    loggedInSection.classList.remove('hidden');
    uploadSection.classList.remove('hidden');
  } else {
    signInSection.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
    uploadSection.classList.add('hidden');
  }
}

document.getElementById('signInButton').addEventListener('click', async () => {
  const email    = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else checkAuthState();
});

document.getElementById('logOutButton').addEventListener('click', async () => {
  await mySupabaseClient.auth.signOut();
  checkAuthState();
});

// ——— Upload form (multi-file) ———
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title  = titleInput.value.trim();
  const medium = mediumInput.value.trim();
  const desc   = descriptionInput.value.trim();
  const files  = Array.from(fileInput.files);

  if (!title || !medium || !desc || files.length === 0) {
    return alert('Please fill all fields and select at least one file.');
  }

  // upload each and collect URLs
  try {
    const urls = await Promise.all(files.map(async file => {
      const path = `uploads/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await mySupabaseClient
        .storage
        .from('portfolio-uploads')
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = mySupabaseClient
        .storage
        .from('portfolio-uploads')
        .getPublicUrl(path);
      return publicUrl;
    }));

    // insert a single row with the array of URLs
    const { error: insertErr } = await mySupabaseClient
      .from('365')
      .insert([{ title, medium, description: desc, file: urls }]);
    if (insertErr) throw insertErr;

    // reset and reload from page 0
    uploadForm.reset();
    page = 0;
    entriesList.innerHTML = '';
    loadEntries();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// ——— Load one entry at a time ———
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

  if (!entries.length) {
    // no more entries
    return;
  }

  entries.forEach(entry => {
    const files = normalizeFileArray(entry.file);
    const li    = document.createElement('li');
    li.className = 'entry-item';

    // media
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'files-container';
    files.forEach(url => mediaDiv.appendChild(renderFile(url)));

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

  // reload lightbox
  if (window.lightbox) lightbox.reload();

  // add sentinel for next entry
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  entriesList.append(sentinel);
  observer.observe(sentinel);

  page++;
}

// ——— Helpers ———
function normalizeFileArray(fileField) {
  if (Array.isArray(fileField)) return fileField;
  if (typeof fileField === 'string') {
    try {
      const p = JSON.parse(fileField);
      return Array.isArray(p) ? p : [fileField];
    } catch {
      return [fileField];
    }
  }
  return [];
}

function renderFile(url) {
  const ext = url.split('.').pop().toLowerCase();

  // images w/ orientation + lightbox
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const link = document.createElement('a');
    link.href = url;
    link.classList.add('glightbox');

    const img = document.createElement('img');
    img.src       = url;
    img.alt       = '';
    img.className = 'thumbnail';

    img.onload = () => {
      const cls = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
      img.classList.add(cls);
      link.classList.add(cls);
    };

    link.append(img);
    return link;
  }

  // video
  if (['mp4','webm','ogg'].includes(ext)) {
    const video = document.createElement('video');
    video.src      = url;
    video.controls = true;
    return video;
  }

  // audio
  if (['mp3','wav','ogg'].includes(ext)) {
    const audio = document.createElement('audio');
    audio.src      = url;
    audio.controls = true;
    return audio;
  }

  // 3D model
  if (['glb','gltf'].includes(ext)) {
    const mv = document.createElement('model-viewer');
    mv.src = url;
    mv.alt = '3D model';
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    return mv;
  }

  // fallback link
  const link = document.createElement('a');
  link.href        = url;
  link.textContent = 'Download file';
  link.target      = '_blank';
  return link;
}
