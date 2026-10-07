function on() {
    document.getElementById("overlayContainer").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlayContainer").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

async function getReview() {
    try {
        const response = await fetch(`/api/review/${reviewId}`);
        if (response.ok) {
            const data = await response.json(); 
            console.log(data);
            document.getElementById("restaurant").textContent = data.restaurant;
            document.getElementById("review").textContent = data.review;
            document.getElementById("rating").textContent = data.rating;
            document.getElementById("visited_date").textContent = data.visited_date;
            document.getElementById("upload_date").textContent = data.upload_date;
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error:', error); 
    }
}
getReview();