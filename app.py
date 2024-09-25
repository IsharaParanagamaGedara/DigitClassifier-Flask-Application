from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np

app = Flask(__name__)

# Load the trained MNIST model
model = load_model('mnist_model.h5')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify_digit():
    # Get the image data from the request (already preprocessed as a 1D array)
    data = request.get_json()
    img_data = np.array(data['image'], dtype=np.float32)  # Convert to numpy array
    
    # Reshape to (28, 28, 1) for the model
    img_array = img_data.reshape(28, 28, 1)
    
    # Normalize the image data (scale pixel values to the range 0-1)
    img_array /= 255.0
    
    # Make prediction
    prediction = np.argmax(model.predict(img_array.reshape(1, 28, 28, 1)))
    
    # Return the prediction result as a JSON response
    return jsonify({'prediction': int(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
