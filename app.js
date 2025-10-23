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
                if (m.status === 'recognizing text') {
                    updateProgress(m.progress * 100, `Recognizing text: ${Math.round(m.progress * 100)}%`);
                }
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

// Load and display image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
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
    reader.readAsDataURL(file);
}

// Process image with OCR
processBtn.addEventListener('click', async () => {
    if (!currentImage) return;

    try {
        // Disable button and show progress
        processBtn.disabled = true;
        progressSection.style.display = 'block';
        overlayControls.style.display = 'none';
        infoSection.style.display = 'none';

        updateProgress(0, 'Initializing OCR engine...');

        // Initialize worker
        const ocrWorker = await initializeWorker();

        updateProgress(10, 'Loading image...');

        // Recognize text
        const result = await ocrWorker.recognize(currentImage);
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
        updateProgress(0, 'Error processing image. Please try again.');
    } finally {
        processBtn.disabled = false;
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
