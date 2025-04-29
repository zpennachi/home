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

// Show login form
showLoginBtn.addEventListener('click', () => {
  authSection.classList.toggle('hidden');
});

// Load public entries + check auth once DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadEntries();
  await checkAuthState();
});

// Check login state
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

// Handle upload
uploadForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title       = titleInput.value.trim();
  const medium      = mediumInput.value.trim();
  const desc        = descriptionInput.value.trim();
  const file        = fileInput.files[0];
  if (!title || !medium || !desc || !file) return alert('Fill all fields.');

  const filePath = `uploads/${Date.now()}_${file.name}`;
  let { error } = await mySupabaseClient.storage
    .from('portfolio-uploads')
    .upload(filePath, file);
  if (error) return alert(error.message);

  const { data: { publicUrl } } = mySupabaseClient.storage
    .from('portfolio-uploads')
    .getPublicUrl(filePath);

  ({ error } = await mySupabaseClient
    .from('365')
    .insert([{ title, medium, description: desc, file: [publicUrl] }])
  );
  if (error) return alert(error.message);

  uploadForm.reset();
  loadEntries();
});

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
  if (!entries.length) {
    entriesList.innerHTML = '<li>No uploads yet.</li>';
    return;
  }

  entries.forEach(entry => {
    // ensure `entry.file` is an array
    const files = Array.isArray(entry.file) ? entry.file : [entry.file];

    const li = document.createElement('li');
    li.className = 'entry-item';

    // media
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'files-container';
    files.forEach(url => mediaDiv.appendChild(renderFile(url)));

    // text
    const info = document.createElement('div');
    info.innerHTML = `
      <p><strong>${entry.title}</strong> (${entry.medium})</p>
      <p>${entry.description}</p>
    `;

    li.append(mediaDiv, info);
    entriesList.append(li);
  });
}

// Pick appropriate element by file extension
function renderFile(url) {
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const img = document.createElement('img');
    img.src = url; img.alt = ''; img.className = 'thumbnail';
    return img;
  }
  if (['mp4','webm','ogg'].includes(ext)) {
    const vid = document.createElement('video');
    vid.src = url; vid.controls = true; vid.className = 'video-thumb';
    return vid;
  }
  if (['mp3','wav','ogg'].includes(ext)) {
    const aud = document.createElement('audio');
    aud.src = url; aud.controls = true;
    return aud;
  }
  const link = document.createElement('a');
  link.href = url; link.textContent = 'Download file'; link.target = '_blank';
  return link;
}
