// Initialize Supabase
const supabaseUrl = 'https://sgvcogsjbwyfdvepalzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmNvZ3NqYnd5ZmR2ZXBhbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQxNjgsImV4cCI6MjA1NDk2MDE2OH0.24hgp5RB6lwt8GRDGTy7MmbujkBv4FLstA-z5SOuqNo';
const mySupabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// UI Elements
const signInSection     = document.getElementById('sign-in');
const loggedInSection   = document.getElementById('logged-in');
const userEmailSpan     = document.getElementById('user-email');
const uploadSection     = document.getElementById('upload-section');
const entriesList       = document.getElementById('entries-list');

// Form inputs
const uploadForm        = document.getElementById('uploadForm');
const titleInput        = document.getElementById('titleInput');
const descriptionInput  = document.getElementById('descriptionInput');
const mediumInput       = document.getElementById('mediumInput');
const fileInput         = document.getElementById('fileInput');

// Check authentication state on page load and update UI
async function checkAuthState() {
  const { data: { user } } = await mySupabaseClient.auth.getUser();
  if (user) {
    // Show logged-in UI
    userEmailSpan.textContent      = user.email;
    loggedInSection.classList.remove('hidden');
    signInSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    entriesList.classList.remove('hidden');
    loadEntries();
  } else {
    // Show sign-in UI
    userEmailSpan.textContent      = '';
    loggedInSection.classList.add('hidden');
    signInSection.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    entriesList.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', checkAuthState);

// Sign In
document.getElementById('signInButton').addEventListener('click', async () => {
  const email    = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;

  const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    checkAuthState();
  }
});

// Log Out
document.getElementById('logOutButton').addEventListener('click', async () => {
  await mySupabaseClient.auth.signOut();
  checkAuthState();
});

// Handle new upload submission
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title       = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const medium      = mediumInput.value.trim();
  const file        = fileInput.files[0];

  if (!title || !description || !medium || !file) {
    alert('Please fill in all fields and select a file.');
    return;
  }

  try {
    // Upload file to Supabase Storage
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await mySupabaseClient
      .storage.from('portfolio-uploads')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = mySupabaseClient
      .storage.from('portfolio-uploads')
      .getPublicUrl(filePath);
    const fileUrl = publicUrlData.publicUrl;

    // Insert new record into database
    const { data: insertData, error: insertError } = await mySupabaseClient
      .from('365')
      .insert([{ title, description, medium, file: [fileUrl] }]);
    if (insertError) throw insertError;

    alert('Upload successful!');
    uploadForm.reset();
    loadEntries();
  } catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
  }
});

// Load and display all entries
async function loadEntries() {
  entriesList.innerHTML = '';
  try {
    const { data: entries, error } = await mySupabaseClient
      .from('365')
      .select('id, title, description, medium, file')
      .order('id', { ascending: false });
    if (error) throw error;

    if (entries.length === 0) {
      entriesList.innerHTML = '<li>No uploads yet.</li>';
      return;
    }

    entries.forEach(entry => {
      const li = document.createElement('li');
      li.classList.add('entry-item');

      // Media container
      const mediaContainer = document.createElement('div');
      mediaContainer.classList.add('files-container');
      entry.file.forEach(url => {
        mediaContainer.appendChild(renderFile(url));
      });

      // Info container
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('entry-info');
      infoDiv.innerHTML = `
        <p><strong>Title:</strong> ${entry.title}</p>
        <p><strong>Medium:</strong> ${entry.medium}</p>
        <p>${entry.description}</p>
      `;

      li.appendChild(mediaContainer);
      li.appendChild(infoDiv);
      entriesList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert('Failed to load entries: ' + err.message);
  }
}

// Render a single file URL as appropriate media element
function renderFile(fileUrl) {
  const ext = fileUrl.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.alt = 'Uploaded image';
    img.classList.add('thumbnail');
    return img;
  }
  if (['mp4','webm','ogg'].includes(ext)) {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.controls = true;
    video.classList.add('video-thumb');
    return video;
  }
  if (['mp3','wav','ogg'].includes(ext)) {
    const audio = document.createElement('audio');
    audio.src = fileUrl;
    audio.controls = true;
    return audio;
  }
  const link = document.createElement('a');
  link.href = fileUrl;
  link.textContent = 'Download file';
  link.target = '_blank';
  return link;
}
