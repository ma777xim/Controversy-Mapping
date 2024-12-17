<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapping Controversies</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>

<body>
    <header>
        <h1>Mapping Controversies</h1>
        <div>
            <button id="signup-button">Signup</button>
        </div>
    </header>

    <div>
        <h4>Select scheme</h4>
        <label for="color-switch">Color By:</label>
        <select id="color-switch">
            <option value="gender">By Gender</option>
            <option value="age">By Age</option>
        </select>

        <label for="connection-filter">Filter Connections:</label>
        <select id="connection-filter">
            <option value="all">All Connections</option>
            <option value="job">By Job</option>
            <option value="age">By Age</option>
            <option value="gender">By Gender</option>
        </select>
    </div>

    <div id="diagram-container">
        <div id="controversymap"></div>
    </div>

    <div id="main-container">
        <div id="icons-container">
            <button class="icon" data-topic="ecommerce_traditional">
                <img src="images/mariocoin.png" alt="E-Commerce Icon" width="80">
                <span></span>
            </button>
            <button class="icon" data-topic="sustainability">
                <img src="images/rb_29621.png" alt="Sustainability Icon" width="80">
                <span></span>
            </button>
            <!-- Add more buttons if needed -->
        </div>
    </div>

    <footer>
        <p>TUM Chair of Architectural Informatics</p>
        <p><a href="mailto:maxim@yurin.de">maxim@yurin.de</a></p>
    </footer>

    <script>
        // Prevent default behavior for the signup button
        document.getElementById('signup-button').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Signup button clicked!');
        });

        // Prevent default behavior for any button that might reload the page
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });
    </script>
    <script src="forcegraph1.js"></script>
</body>
</html>
