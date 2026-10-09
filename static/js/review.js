function on() {
    document.getElementById("overlayContainer").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlayContainer").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

const form = document.getElementById("form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const buttonClicked = event.submitter;

    if (buttonClicked.value === "Update") {
        const formData = {
            "restaurant": document.getElementById("restaurant").value,
            "review": document.getElementById("review").value
        };

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Could not update review');
            }
            console.log("Review updated successfully!");
            window.location.reload();

        } catch (error) {
            console.error('Error:', error); 
        }
    } else if (buttonClicked.value === "Delete") {
        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Could not delete review');
            }
            console.log("Review deleted successfully!"); 
            window.location.href = "/";

        } catch (error) {
            console.error('Error:', error); 
        }
    }
});

async function getReview() {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`);
        if (response.ok) {
            const data = await response.json(); 
            console.log(data);
            document.getElementById("restaurant_log").textContent = data.restaurant;
            document.getElementById("review_log").textContent = data.review;
            document.getElementById("rating_log").textContent = data.rating;
            document.getElementById("visited_date_log").textContent = data.visited_date;
            document.getElementById("upload_date_log").textContent = data.upload_date;
            document.getElementById("restaurant").value = data.restaurant;
            document.getElementById("review").value = data.review;
            // document.getElementById("rating").value = data.rating;
            // document.getElementById("visited_date").value = data.visited_date;
            // document.getElementById("upload_date").value = data.upload_date;
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error:', error); 
    }
}
getReview();