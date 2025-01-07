// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase setup
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.appspot.com",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// D3 setup
const svg = d3.select("#contromap");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Fetch nodes from Firestore
async function fetchNetworkData() {
    const nodes = [];

    try {
        const snapshot = await getDocs(collection(db, "mappers"));
        snapshot.forEach(doc => {
            const node = doc.data();
            node.id = doc.id; // Document ID as unique node ID
            nodes.push(node);
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return nodes;
}

// Create links dynamically based on selected field
function createLinksByField(nodes, field) {
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (hasCommonWordsInField(nodes[i], nodes[j], field)) {
                links.push({ source: nodes[i].id, target: nodes[j].id });
            }
        }
    }
    return links;
}

// Check for common words in a specific field, ensuring the field exists
function hasCommonWordsInField(nodeA, nodeB, field) {
    if (!nodeA[field] || !nodeB[field]) {
        // If the field doesn't exist for either node, don't connect them
        return false;
    }

    const wordsA = getWords(nodeA[field]);
    const wordsB = getWords(nodeB[field]);

    return wordsA.some(word => wordsB.includes(word));
}


// Helper: split string into words
function getWords(str) {
    return str.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Update graph dynamically
async function updateNetwork(selectedField) {
    const nodes = await fetchNetworkData();
    const links = selectedField === "all" ? [] : createLinksByField(nodes, selectedField);

    // Clear existing elements
    svg.selectAll("*").remove();

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Render links
    const link = svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2);

    // Render nodes
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
        .call(drag(simulation));

    // Render labels
    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", -15)
        .attr("font-size", "10px")
        .attr("fill", "#f9f9f9")
        .text(d => d.username);

    // Update positions on each tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}

// Field filter listener
document.getElementById("field-filter").addEventListener("change", (event) => {
    const selectedField = event.target.value;
    updateNetwork(selectedField);
});

// Initialize graph
updateNetwork("all");
