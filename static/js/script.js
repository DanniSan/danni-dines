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

    const formData = new FormData(form);

    try {
        const response = await fetch("/api/reviews", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Could not create review');
        }
        console.log("Review created successfully!");
        window.location.href = '/';

    } catch (error) {
        console.error('Error:', error); 
    }
});