<script>
  const apiKey = '08088ff7f0c23f1a1e94793cde2e3124'; // Warning: Use backend for production to hide keys
  let apiData = null;

  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const imgInput = document.getElementById('imgInput');
  const urlInput = document.getElementById('urlInput');
  const customNameInput = document.getElementById('customFileName');
  const loadingArea = document.getElementById('loadingArea');
  const resultArea = document.getElementById('resultArea');
  const mainInputArea = document.getElementById('mainInputArea');
  const imgPreview = document.getElementById('imgPreview');

  // --- Toast Notification System ---
  function showToast(message, type = 'success') {
      const toast = document.getElementById("toast");
      toast.innerHTML = type === 'success' 
          ? `<i class="fa-solid fa-circle-check"></i> ${message}` 
          : `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
      
      toast.className = `show ${type}`;
      setTimeout(() => { toast.className = toast.className.replace(`show ${type}`, ""); }, 3000);
  }

  // --- 1. Tab Switching Logic ---
  function switchTab(type) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab')[type === 'file' ? 0 : 1].classList.add('active');
      
      document.getElementById('fileSection').style.display = type === 'file' ? 'block' : 'none';
      document.getElementById('urlSection').style.display = type === 'url' ? 'block' : 'none';
  }

  // --- 2. File Upload Event Listeners ---
  dropZone.addEventListener('click', () => imgInput.click());
  
  imgInput.addEventListener('change', () => {
    if (imgInput.files.length) processUpload(imgInput.files[0]);
  });

  // Drag & Drop Visuals
  dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) processUpload(e.dataTransfer.files[0]);
  });

  // --- 3. Paste Event Listener (Global) ---
  document.addEventListener('paste', (e) => {
      if(resultArea.style.display === 'block') return;

      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
          if (item.kind === 'file' && item.type.startsWith('image/')) {
              const blob = item.getAsFile();
              processUpload(blob);
              return; 
          }
      }
  });

  // --- 4. URL Upload Trigger ---
  function uploadUrl() {
      const url = urlInput.value.trim();
      if(url) {
          processUpload(url); 
      } else {
          showToast("Please enter a valid Image URL", "error");
      }
  }

  // --- 5. Main Upload Logic ---
  function processUpload(source) {
    mainInputArea.style.display = 'none';
    loadingArea.style.display = 'block';

    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', source);

    const customName = customNameInput.value.trim();
    if(customName) {
        formData.append('name', customName);
    }

    fetch('https://api.imgbb.com/1/upload', { 
        method: 'POST', 
        body: formData 
    })
    .then(res => res.json())
    .then(data => {
      loadingArea.style.display = 'none';
      if (data.success) {
        apiData = data.data;
        resultArea.style.display = 'block';
        imgPreview.src = apiData.url;
        updateCode();
        showToast("Image Uploaded Successfully!", "success");
      } else {
        showToast("Upload Failed: " + (data.error ? data.error.message : data.status), "error");
        resetUploader();
      }
    })
    .catch(err => {
      console.error(err);
      loadingArea.style.display = 'none';
      showToast("Network Error: Please check your connection", "error");
      resetUploader();
    });
  }

  // --- 6. Code Generation ---
  function updateCode() {
    if (!apiData) return;

    const type = document.getElementById('linkType').value;
    const url = apiData.url;
    const viewer = apiData.url_viewer;
    const title = apiData.title || 'Image';
    
    let output = '';

    switch (type) {
      case 'viewer': output = viewer; break;
      case 'direct': output = url; break;
      case 'html-img': output = `<img src="${url}" alt="${title}" border="0">`; break;
      case 'html-full': output = `<a href="${viewer}"><img src="${url}" alt="${title}" border="0"></a>`; break;
      case 'bb-full': output = `[img]${url}[/img]`; break;
      case 'bb-full-link': output = `[url=${viewer}][img]${url}[/img][/url]`; break;
    }

    document.getElementById('outputCode').value = output;
  }

  function copyCode() {
    const copyText = document.getElementById("outputCode");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    
    const btn = document.getElementById('copyBtn');
    
    btn.innerHTML = '<i class="fa-solid fa-check-double"></i> Copied!';
    btn.style.background = '#10b981'; // Green color
    
    showToast("Code copied to clipboard!", "success");

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
      btn.style.background = 'var(--primary)';
    }, 2000);
  }

  function resetUploader() {
    apiData = null;
    imgInput.value = '';
    urlInput.value = '';
    customNameInput.value = '';
    
    resultArea.style.display = 'none';
    mainInputArea.style.display = 'block';
    loadingArea.style.display = 'none';
    
    document.getElementById('linkType').value = 'direct';
  }
</script>
