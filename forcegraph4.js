// Firebase configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const svg = d3.select("#controversymap");
const width = +svg.attr("width");
const height = +svg.attr("height");

const colorMap = {
    1: "#0000ff", // Blue - Architects
    2: "#ff0000", // Red - Green activists
    3: "#00ff00", // Green - young peeps
    4: "#ffff00", // Yellow
    5: "#ff00ff", // Magenta
    6: "#00ffff"  // Cyan
};

// Function to fetch data from Firestore
async function fetchNetworkData() {
    const nodes = [];
    const links = [];
    const data = {};

    // Fetch all documents from the "mappers" collection
    const snapshot = await db.collection("mappers").get();
    snapshot.forEach(doc => {
        const node = doc.data();
        node.id = doc.id; // Use document ID as the node ID
        nodes.push(node);

        // Group nodes by username for link creation
        if (!data[node.username]) data[node.username] = [];
        data[node.username].push(node.id);
    });

    // Create links for nodes with the same username
    Object.values(data).forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                links.push({ source: group[i], target: group[j] });
            }
        }
    });

    return { nodes, links };
}

// Update the D3.js network
async function updateNetwork() {
    const { nodes, links } = await fetchNetworkData();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => getNodeSize(d.id, links)) // Calculate radius based on connections
        .attr("fill", d => colorMap[d.group] || "#000000")
        .call(drag(simulation));

    node.append("title").text(d => d.id);

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
}

// Function to calculate node size based on the number of connections
function getNodeSize(nodeId, links) {
    const numConnections = links.filter(link => link.source.id === nodeId || link.target.id === nodeId).length;
    return Math.min(10 + numConnections * 2, 50); // Adjust growth and max size as needed
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(.2).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(.05);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Load the network on page load
updateNetwork();
