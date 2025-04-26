document.addEventListener('DOMContentLoaded', function() {
    
    const refreshBtn = document.getElementById('refresh-btn');
    const filterSelect = document.getElementById('filter-select');
    const feedbackList = document.getElementById('feedback-list');
    const loading = document.getElementById('loading');
    const noData = document.getElementById('no-data');
    
   
    let allFeedback = [];
    
    
    loadFeedback();
    
    
    refreshBtn.addEventListener('click', loadFeedback);
    filterSelect.addEventListener('change', filterFeedback);
    
   
    function loadFeedback() {
       
        loading.classList.remove('hidden');
        noData.classList.add('hidden');
        
        
        feedbackList.innerHTML = '';
        
       
        fetch('/admin/feedback')
            .then(response => response.json())
            .then(data => {
                
                loading.classList.add('hidden');
                
                if (!data || data.length === 0) {
                    noData.classList.remove('hidden');
                    return;
                }
                
                allFeedback = data;
                filterFeedback();
            })
            .catch(error => {
                console.error('Error:', error);
                loading.classList.add('hidden');
                alert('An error occurred while loading feedback data.');
            });
    }
    
 
    function filterFeedback() {
     
        feedbackList.innerHTML = '';
        
        const filterValue = filterSelect.value;
        let filteredFeedback = allFeedback;
        
        if (filterValue === 'unreviewed') {
            filteredFeedback = allFeedback.filter(item => !item.is_admin_reviewed);
        } else if (filterValue === 'reviewed') {
            filteredFeedback = allFeedback.filter(item => item.is_admin_reviewed);
        }
        
        if (filteredFeedback.length === 0) {
            noData.classList.remove('hidden');
            return;
        }
        
        noData.classList.add('hidden');
        
       
        filteredFeedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        
        filteredFeedback.forEach(renderFeedbackItem);
    }
    
    
    function renderFeedbackItem(feedback) {
        const item = document.createElement('div');
        item.className = 'feedback-item';
    
        const time = feedback.timestamp ? new Date(feedback.timestamp).toLocaleString() : 'No timestamp';
        const reviewStatus = feedback.is_admin_reviewed ? 'Reviewed' : 'Pending Review';
    
        item.innerHTML = `
            <p><strong>Text:</strong> ${feedback.text}</p>
            <p><strong>Feedback:</strong> ${feedback.user_feedback}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Status:</strong> ${reviewStatus}</p>
            <button class="approve-btn" data-id="${feedback._id}">Approve</button>
            <button class="remove-btn" data-id="${feedback._id}">Remove</button>
        `;
    
        feedbackList.appendChild(item);

       
        item.querySelector('.approve-btn').addEventListener('click', () => approveFeedback(feedback.text, feedback.user_feedback));


        item.querySelector('.remove-btn').addEventListener('click', () => removeFeedback(feedback._id));
    }

    
    function approveFeedback(text, label) {
        fetch('/admin/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, admin_label: label }) 
        })
    
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Feedback approved successfully!');
                loadFeedback();
            } else {
                alert('Error: ' + data.error); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while approving feedback.');
        });
    }

    function removeFeedback(id) {
        fetch('/admin/remove_feedback', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();  
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    }
    
    
    
});
