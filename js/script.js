const form = document.getElementById("form");
const logsContainer = document.getElementById("logsContainer");
let logs = JSON.parse(localStorage.getItem("logs")) || [];

function on() {
    document.getElementById("overlayContainer").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlayContainer").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function displayLogs() {
    logsContainer.innerHTML = "";
    logs.sort((a, b) => b.uploaded - a.uploaded);
    logs.forEach(log => {
        stars = ""
        if (log.rating === "1") {
            stars = "&#9733;&#9734;&#9734;&#9734;&#9734;"
        } else if (log.rating === "2") {
            stars = "&#9733;&#9733;&#9734;&#9734;&#9734;"
        } else if (log.rating === "3") {
            stars = "&#9733;&#9733;&#9733;&#9734;&#9734;"
        } else if (log.rating === "4") {
            stars = "&#9733;&#9733;&#9733;&#9733;&#9734;"
        } else if (log.rating === "5") {
            stars = "&#9733;&#9733;&#9733;&#9733;&#9733;"
        }

        const logElement = document.createElement("div");
        logElement.innerHTML = `
            <div class="imageBox">
                <img src="${log.picture}">
            </div>
            <p id="logTitle">${log.restaurant}</p>
            <p id="logStars">${stars}</p>
            <p id="logCaption">Visited On: ${new Date(log.uploaded).toLocaleString('en-CA', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })}</p>
        `;
        logElement.classList.add("log");
        logsContainer.appendChild(logElement);
    });
}

function submitForm() {
    const restaurant = document.getElementById("restaurant").value;
    const rating = document.forms["logForm"]["star-radio"].value;
    const review = document.getElementById("review").value;
    const picture = document.getElementById("picture").files[0];

    const reader = new FileReader();
    reader.readAsDataURL(picture);
    reader.onload = function(event) {
        const newLog = {
            restaurant: restaurant,
            rating: rating,
            review: review,
            picture: reader.result,
            uploaded: Date.now()
        };
        logs.push(newLog);
        localStorage.setItem("logs", JSON.stringify(logs));

        displayLogs();

        form.reset();
    };
}

displayLogs();

form.addEventListener("submit", function(event) {
    event.preventDefault();
    submitForm();
});