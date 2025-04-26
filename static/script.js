document.addEventListener('DOMContentLoaded', function() {
    const newsTextArea = document.getElementById('news-text');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultDiv = document.getElementById('result');
    const predictionText = document.getElementById('prediction-text');
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceText = document.getElementById('confidence-text');
    const feedbackContainer = document.getElementById('feedback-container');
    const realBtn = document.getElementById('real-btn');
    const fakeBtn = document.getElementById('fake-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    
    let currentNewsText = '';
    
    analyzeBtn.addEventListener('click', function() {
        const newsText = newsTextArea.value.trim();
        if (!newsText) {
            alert('Please enter some news text to analyze');
            return;
        }
        currentNewsText = newsText;
        analyzeNews(newsText);
    });
    
    realBtn.addEventListener('click', function() {
        submitFeedback('REAL');
    });
    
    fakeBtn.addEventListener('click', function() {
        submitFeedback('FAKE');
    });
    
    function analyzeNews(text) {
        resultDiv.classList.add('hidden');
        feedbackMessage.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        resultContainer.classList.remove('hidden');
        
        fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
        })
        .then(response => response.json())
        .then(data => {
            loadingSpinner.classList.add('hidden');
            resultDiv.classList.remove('hidden');
            predictionText.textContent = data.prediction;
            predictionText.className = `prediction ${data.prediction.toLowerCase()}`;
            
            const confidencePercent = Math.round(data.probability * 100);
            confidenceBar.style.width = `${confidencePercent}%`;
            confidenceText.textContent = `${confidencePercent}% confidence`;
            confidenceBar.className = `confidence-bar ${confidencePercent >= 70 ? 'high' : confidencePercent >= 40 ? 'medium' : 'low'}`;
            
            feedbackContainer.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.classList.add('hidden');
            alert('An error occurred while analyzing the news. Please try again.');
        });z
    }
    
    function submitFeedback(feedback) {
        fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: currentNewsText,
                feedback: feedback
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                feedbackContainer.classList.add('hidden');
                feedbackMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting feedback. Please try again.');
        });
    }
  
    
});
