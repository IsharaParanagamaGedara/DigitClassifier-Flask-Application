const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// Initialize canvas with a white background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Event listeners to handle drawing on the canvas
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();  // Reset the path for smooth strokes
});
canvas.addEventListener('mousemove', draw);

// Function to handle drawing on the canvas
function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
}

// Erase canvas function
document.getElementById('eraseButton').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
});

// Clear prediction text
document.getElementById('clearPrediction').addEventListener('click', () => {
    const predictionElement = document.getElementById('prediction');
    predictionElement.innerHTML = 'Prediction: ';
    predictionElement.classList.remove('updated');
});

// Function to preprocess the canvas image
function preprocessCanvasImage() {
    // Create a hidden canvas to resize the drawn image to 28x28
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = 28;
    resizeCanvas.height = 28;
    const resizeCtx = resizeCanvas.getContext('2d');

    // Fill the resize canvas with white background
    resizeCtx.fillStyle = 'white';
    resizeCtx.fillRect(0, 0, resizeCanvas.width, resizeCanvas.height);

    // Draw the original image onto the 28x28 canvas
    resizeCtx.drawImage(canvas, 0, 0, 28, 28);

    // Get the resized image data
    const resizedImageData = resizeCtx.getImageData(0, 0, 28, 28);

    // Convert image data to grayscale and invert colors
    const grayscaleData = [];
    for (let i = 0; i < resizedImageData.data.length; i += 4) {
        const r = resizedImageData.data[i];
        const g = resizedImageData.data[i + 1];
        const b = resizedImageData.data[i + 2];

        // Convert to grayscale using standard formula
        const grayscaleValue = 255 - (0.299 * r + 0.587 * g + 0.114 * b);
        grayscaleData.push(grayscaleValue);  // Inverted grayscale to match MNIST
    }

    return grayscaleData;
}

// Classify the digit drawn on the canvas
document.getElementById('classifyButton').addEventListener('click', () => {
    const processedImage = preprocessCanvasImage();

    fetch('/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: processedImage })  // Send the processed grayscale image
    })
    .then(response => response.json())
    .then(data => {
        const predictionElement = document.getElementById('prediction');
        predictionElement.innerHTML = `Prediction: ${data.prediction}`;
        
        // Add class to flash green background for prediction update
        predictionElement.classList.add('updated');
        
        // Remove the class after a short delay to reset the style
        setTimeout(() => {
            predictionElement.classList.remove('updated');
        }, 1000);
    })
    .catch(error => console.error('Error:', error));
});
