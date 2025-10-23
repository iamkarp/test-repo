// Global variables
let worker = null;
let currentImage = null;
let ocrResults = null;

// DOM elements
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const controls = document.getElementById('controls');
const processBtn = document.getElementById('process-btn');
const overlayControls = document.getElementById('overlay-controls');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const viewerSection = document.getElementById('viewer-section');
const imageContainer = document.getElementById('image-container');
const previewImage = document.getElementById('preview-image');
const overlayCanvas = document.getElementById('overlay-canvas');
const toggleOverlay = document.getElementById('toggle-overlay');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');
const infoSection = document.getElementById('info-section');
const recognizedText = document.getElementById('recognized-text');

// Initialize Tesseract worker
async function initializeWorker() {
    if (!worker) {
        worker = await Tesseract.createWorker('eng', 1, {
            logger: (m) => {
                console.log(m);
                if (m.status === 'loading tesseract core') {
                    updateProgress(10, 'Loading OCR engine...');
                } else if (m.status === 'initializing tesseract') {
                    updateProgress(20, 'Initializing OCR...');
                } else if (m.status === 'loading language traineddata') {
                    updateProgress(30 + (m.progress * 30), `Downloading language data: ${Math.round(m.progress * 100)}%`);
                } else if (m.status === 'initializing api') {
                    updateProgress(60, 'Setting up OCR...');
                } else if (m.status === 'recognizing text') {
                    updateProgress(70 + (m.progress * 30), `Recognizing text: ${Math.round(m.progress * 100)}%`);
                }
            },
            errorHandler: (err) => {
                console.error('Tesseract error:', err);
            }
        });
    }
    return worker;
}

// Update progress bar
function updateProgress(percentage, message) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message;
}

// File input handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        loadImage(file);
    }
});

// Resize image if too large (for mobile performance)
function resizeImage(img, maxWidth = 2000, maxHeight = 2000) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}

// Load and display image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
            // Resize if needed for better mobile performance
            currentImage = await resizeImage(img);
            previewImage.src = currentImage;

            // Show controls and viewer
            controls.style.display = 'flex';
            viewerSection.style.display = 'block';

            // Reset overlay
            overlayControls.style.display = 'none';
            infoSection.style.display = 'none';

            // Setup canvas dimensions after image loads
            previewImage.onload = () => {
                overlayCanvas.width = previewImage.width;
                overlayCanvas.height = previewImage.height;
            };
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Process image with OCR
processBtn.addEventListener('click', async () => {
    if (!currentImage) return;

    try {
        // Disable button and show progress
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';
        progressSection.style.display = 'block';
        overlayControls.style.display = 'none';
        infoSection.style.display = 'none';

        updateProgress(5, 'Starting OCR engine...');

        // Initialize worker with timeout
        const ocrWorker = await Promise.race([
            initializeWorker(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: OCR initialization took too long. Check your internet connection.')), 60000)
            )
        ]);

        updateProgress(65, 'Analyzing image...');

        // Recognize text with timeout
        const result = await Promise.race([
            ocrWorker.recognize(currentImage),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: Text recognition took too long.')), 120000)
            )
        ]);

        ocrResults = result.data;

        updateProgress(100, 'Processing complete!');

        // Display results
        displayResults();

        // Hide progress after a delay
        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 1000);

    } catch (error) {
        console.error('OCR Error:', error);

        let errorMessage = 'Error processing image.';
        if (error.message.includes('Timeout')) {
            errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('memory')) {
            errorMessage = 'Image too large. Try a smaller image.';
        }

        updateProgress(0, errorMessage);
        progressText.style.color = '#e74c3c';

        setTimeout(() => {
            progressSection.style.display = 'none';
            progressText.style.color = '#666';
        }, 5000);
    } finally {
        processBtn.disabled = false;
        processBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Process Handwriting`;
    }
});

// Display OCR results
function displayResults() {
    if (!ocrResults) return;

    // Show controls and info
    overlayControls.style.display = 'flex';
    infoSection.style.display = 'block';

    // Display recognized text
    recognizedText.textContent = ocrResults.text || 'No text recognized';

    // Draw overlay
    drawOverlay();
}

// Draw text overlay on canvas
function drawOverlay() {
    if (!ocrResults) return;

    const canvas = overlayCanvas;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!toggleOverlay.checked) return;

    // Get image dimensions
    const img = previewImage;
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

    // Set opacity
    const opacity = opacitySlider.value / 100;

    // Draw boxes and text for each word
    ocrResults.words.forEach(word => {
        const bbox = word.bbox;

        // Scale bounding box coordinates
        const x = bbox.x0 * scaleX;
        const y = bbox.y0 * scaleY;
        const width = (bbox.x1 - bbox.x0) * scaleX;
        const height = (bbox.y1 - bbox.y0) * scaleY;

        // Draw semi-transparent background
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.fillRect(x, y, width, height);

        // Draw border
        ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw text
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;

        // Calculate font size based on box height
        const fontSize = Math.max(12, height * 0.7);
        ctx.font = `${fontSize}px Arial`;

        // Center text in box
        const textMetrics = ctx.measureText(word.text);
        const textX = x + (width - textMetrics.width) / 2;
        const textY = y + height * 0.75;

        ctx.fillText(word.text, textX, textY);
    });
}

// Toggle overlay visibility
toggleOverlay.addEventListener('change', () => {
    drawOverlay();
});

// Opacity slider handler
opacitySlider.addEventListener('input', (e) => {
    const value = e.target.value;
    opacityValue.textContent = `${value}%`;
    drawOverlay();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (currentImage && previewImage.complete) {
        overlayCanvas.width = previewImage.width;
        overlayCanvas.height = previewImage.height;
        drawOverlay();
    }
});

// Clean up worker on page unload
window.addEventListener('beforeunload', async () => {
    if (worker) {
        await worker.terminate();
    }
});
