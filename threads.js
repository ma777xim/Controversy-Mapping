// Function to open the modal and show comments for a dot
function showThread(dotId) {
    // Set the modal title to the clicked dot's ID
    document.getElementById("dotTitle").textContent = dotId;

    // Show the modal
    document.getElementById("commentModal").style.display = "block";

    // Fetch and display the comments for the clicked dot
    const commentsRef = db.collection("locationThreads").doc(dotId).collection("comments");
    commentsRef.orderBy("timestamp").get().then(snapshot => {
        const commentList = document.getElementById("commentList");
        commentList.innerHTML = ''; // Clear any previous comments

        snapshot.forEach(doc => {
            const data = doc.data();
            const commentDiv = document.createElement("div");
            commentDiv.innerHTML = `<strong>${data.author}</strong>: ${data.commentText}`;

            // Display the photo if available
            if (data.photoUrl) {
                const img = document.createElement("img");
                img.src = data.photoUrl;
                img.height = 50; // Thumbnail size
                commentDiv.appendChild(img);
            }
            commentList.appendChild(commentDiv);
        });
    });
}

// Function to submit a comment
async function submitComment() {
    const dotId = document.getElementById("dotTitle").textContent;
    const commentText = document.getElementById("commentInput").value;
    const photoInput = document.getElementById("photoInput");
    const author = "Anonymous"; // Or replace with the logged-in user's name

    let photoUrl = "";
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const storageRef = storage.ref("photos/" + file.name);
        await storageRef.put(file);
        photoUrl = await storageRef.getDownloadURL();
    }

    // Add comment to Firestore
    const commentsRef = db.collection("locationThreads").doc(dotId).collection("comments");
    await commentsRef.add({
        author: author,
        commentText: commentText,
        photoUrl: photoUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Reload the comments for the dot
    showThread(dotId);

    // Clear input fields
    document.getElementById("commentInput").value = '';
    document.getElementById("photoInput").value = '';
}

// Function to close the modal
function closeModal() {
    document.getElementById("commentModal").style.display = "none";
}

// Event listener for dots
document.getElementById("Goeppingen").addEventListener("click", function() {
    showThread("Goeppingen");
});

document.getElementById("Mannheim").addEventListener("click", function() {
    showThread("Mannheim");
});