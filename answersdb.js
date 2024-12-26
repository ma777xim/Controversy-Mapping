document.querySelectorAll(".sidebar button").forEach(button => {
    button.addEventListener("click", () => {
        const user = auth.currentUser; // Fetch current user directly
        if (!user) {
            alert("Pls login first.");
            return;
        }

        const field = button.id.replace("btn-", "form-");
        document.querySelectorAll(".form").forEach(form => form.classList.add("hidden"));
        document.querySelector(`#${field}`).classList.remove("hidden");
        document.querySelector(".forms-container").style.display = "block";
    });
});
