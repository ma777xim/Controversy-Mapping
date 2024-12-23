// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.firebasestorage.app",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();  // Using Firestore as the database

let allData={ nodes: [], links: [] }; // For reloading dynamically

const container=d3.select("#mariocoinmap");

// Fetch initial nodes and links from Firebase
function loadFirebaseData() {
    db.collection("comments-mariocoin").get().then(querySnapshot => {
        const data=querySnapshot.docs.map(doc => doc.data());

        // Create nodes and links
        data.forEach(comment => {
            addNewNode(comment.text);
        });

        createGraph(allData, "comments-mariocoin"); // Initial render
    }).catch(error => {
        console.error("Error fetching data: ", error);
    });
}

// Add a new node (comment) to Firebase and update the graph
function addNewNode(userInput) {
    const newId = `node${allData.nodes.length + 1}`;
    const newWords=userInput.toLowerCase().split(/\W+/); // Split into words
    const newNode={ id: newId, name: userInput, degree: 0, words: newWords };

    // Store the new comment in Firebase
    db.collection("comments").add({
        text: userInput,
        words: newWords,
    }).then(docRef => {
        console.log("New comment added with ID: ", docRef.id);

        // Create links to nodes with shared words
        allData.nodes.forEach(existingNode => {
            const sharedWords = existingNode.words.filter(word => newWords.includes(word));
            if (sharedWords.length > 0) {
                allData.links.push({ source: existingNode.id, target: newId, value: sharedWords.length });
                existingNode.degree++;
                newNode.degree++;
            }
        });

        // Add the new node
        allData.nodes.push(newNode);

        // Re-render the graph
        createGraph(allData, "comments-mariocoin");
    }).catch(error => {
        console.error("Error adding comment: ", error);
    });
}

function createGraph(data, columnForColor) {
    const container = document.getElementById("mariocoinmap");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const svg = d3.select("#mariocoinmap").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.nodes.map(d => d[columnForColor]));

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(400))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", d => d.value);

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => 5 + d.degree) // Adjust size
        .attr("fill", d => color(d[columnForColor])) // Dynamic color
        .call(drag(simulation));

    node.append("title")
        .text(d => `${d.name} (Degree: ${d.degree})`);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function drag(simulation) {
        return d3.drag()
            .on("start", event => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            })
            .on("drag", event => {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            })
            .on("end", event => {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            });
    }
}

// Event listener for form submissions
document.getElementById("comments-mariocoin").addEventListener("submit", event => {
    event.preventDefault();
    const userInput = event.target.querySelector("input[name='answer']").value;
    if (userInput.trim()) {
        addNewNode(userInput.trim());
    }
    event.target.reset();
});

// Initialize Firebase and load data
loadFirebaseData();
