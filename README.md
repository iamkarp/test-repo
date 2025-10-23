Handwriting OCR Overlay App
===========================

A web application that reads handwritten text from documents and creates an interactive overlay showing the recognized text over the original handwriting.

## Features

- Upload images of handwritten documents
- Automatic handwriting recognition using Tesseract.js OCR engine
- Real-time text overlay positioned over detected handwriting
- Toggle overlay visibility on/off
- Adjustable overlay opacity
- Responsive design that works on desktop and mobile devices (including iPhone)
- No backend required - runs entirely in the browser

## How to Use

1. Open `index.html` in a web browser
2. Click "Choose Image" to upload a document with handwriting
3. Click "Process Handwriting" to run OCR analysis
4. View the recognized text overlay on your document
5. Use the controls to toggle overlay visibility and adjust opacity

## Running the App

### Option 1: Direct File Access
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
For better performance and to avoid CORS issues:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Mobile Support

The app works on mobile devices including iPhone and Android phones. When using on mobile:
- The file picker will allow you to take a new photo or choose from your gallery
- OCR processing may take longer on mobile devices
- The interface automatically adapts to smaller screens

## Technologies Used

- HTML5
- CSS3 with responsive design
- JavaScript (ES6+)
- Tesseract.js v5 (OCR engine)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (including iOS Safari)
- Opera

## Performance Notes

- Initial OCR engine loading may take a few seconds
- Processing time depends on image size and complexity
- For best results, use clear, well-lit images of handwriting
- Recommended image formats: JPG, PNG, WebP

## Tips for Best Results

1. Use high-quality, well-lit images
2. Ensure handwriting is clear and legible
3. Avoid overly stylized or cursive handwriting for better recognition
4. Keep images at a reasonable resolution (not too small or excessively large)

## License

MIT License
