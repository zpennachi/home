// Initialize Supabase
const supabaseUrl = 'https://sgvcogsjbwyfdvepalzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmNvZ3NqYnd5ZmR2ZXBhbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQxNjgsImV4cCI6MjA1NDk2MDE2OH0.24hgp5RB6lwt8GRDGTy7MmbujkBv4FLstA-z5SOuqNo';
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

// Toggle login form
showLoginBtn.addEventListener('click', () => {
  authSection.classList.toggle('hidden');
});

// On load: fetch entries + auth state
document.addEventListener('DOMContentLoaded', async () => {
  await loadEntries();
  await checkAuthState();
});

// Check whether user is signed in
async function checkAuthState() {
  const { data: { user } } = await mySupabaseClient.auth.getUser();
  if (user) {
    userEmailSpan.textContent = user.email;
    signInSection.classList.add('hidden');
    loggedInSection.classList.remove('hidden');
    uploadSection.classList.remove('hidden');
  } else {
    signInSection.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
    uploadSection.classList.add('hidden');
  }
}

// Sign in handler
document.getElementById('signInButton').addEventListener('click', async () => {
  const email    = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else checkAuthState();
});

// Sign out handler
document.getElementById('logOutButton').addEventListener('click', async () => {
  await mySupabaseClient.auth.signOut();
  checkAuthState();
});

// Upload form handler
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const medium = mediumInput.value.trim();
  const desc = descriptionInput.value.trim();
  const file = fileInput.files[0];
  if (!title || !medium || !desc || !file) {
    return alert('Please fill all fields.');
  }

  // 1) upload to storage
  const filePath = `uploads/${Date.now()}_${file.name}`;
  let { error } = await mySupabaseClient
    .storage.from('portfolio-uploads')
    .upload(filePath, file);
  if (error) return alert(error.message);

  // 2) get public URL
  const { data: { publicUrl } } = mySupabaseClient
    .storage.from('portfolio-uploads')
    .getPublicUrl(filePath);

  // 3) insert metadata row
  ({ error } = await mySupabaseClient
    .from('365')
    .insert([{ title, medium, description: desc, file: [publicUrl] }])
  );
  if (error) return alert(error.message);

  uploadForm.reset();
  loadEntries();
});

// Fetch & render all entries
async function loadEntries() {
  entriesList.innerHTML = '';
  const { data: entries, error } = await mySupabaseClient
    .from('365')
    .select('id, title, medium, description, file')
    .order('id', { ascending: false });

  if (error) {
    entriesList.innerHTML = `<li>Error loading entries: ${error.message}</li>`;
    return;
  }
  if (!entries || entries.length === 0) {
    entriesList.innerHTML = '<li>No uploads yet.</li>';
    return;
  }

  entries.forEach(entry => {
    const files = normalizeFileArray(entry.file);
    const li = document.createElement('li');
    li.className = 'entry-item';

    // media container
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'files-container';
    files.forEach(url => mediaDiv.appendChild(renderFile(url)));

    // text info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'entry-info';
    infoDiv.innerHTML = `
      <p><strong>${entry.title}</strong> (${entry.medium})</p>
      <p>${entry.description}</p>
    `;

    li.append(mediaDiv, infoDiv);
    entriesList.append(li);
  });
}

// Ensure we have an array of URLs
function normalizeFileArray(fileField) {
  if (Array.isArray(fileField)) return fileField;
  if (typeof fileField === 'string') {
    try {
      const parsed = JSON.parse(fileField);
      return Array.isArray(parsed) ? parsed : [fileField];
    } catch {
      return [fileField];
    }
  }
  return [];
}

// Choose the right element to render each URL
function renderFile(url) {
  const ext = url.split('.').pop().toLowerCase();

  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const img = document.createElement('img');
    img.src = url; img.alt = ''; img.className = 'thumbnail';
    return img;
  }

  if (['mp4','webm','ogg'].includes(ext)) {
    const video = document.createElement('video');
    video.src = url; video.controls = true; video.className = 'video-thumb';
    return video;
  }

  if (['mp3','wav','ogg'].includes(ext)) {
    const audio = document.createElement('audio');
    audio.src = url; audio.controls = true;
    return audio;
  }

  // 3D model support
  if (['glb','gltf'].includes(ext)) {
    const mv = document.createElement('model-viewer');
    mv.src = url;
    mv.alt = '3D model';
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    mv.style.width = '200px';
    mv.style.height = '200px';
    return mv;
  }

  // fallback download link
  const link = document.createElement('a');
  link.href = url; link.textContent = 'Download file'; link.target = '_blank';
  return link;
}
