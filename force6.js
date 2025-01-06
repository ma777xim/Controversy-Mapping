// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Initialize Firebase
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

// Fetch data from Firestore
async function fetchNetworkData() {
    const nodes = [];
    const links = [];

    try {
        const snapshot = await getDocs(collection(db, "mappers"));
        snapshot.forEach(doc => {
            const node = doc.data();
            node.id = doc.id; // Use document ID as node ID
            nodes.push(node);
        });

        // Create links between nodes based on common words in any field
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (hasCommonWordsAcrossFields(nodes[i], nodes[j])) {
                    links.push({ source: nodes[i].id, target: nodes[j].id });
                }
            }
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return { nodes, links };
}

// Check for common words across all fields
function hasCommonWordsAcrossFields(nodeA, nodeB) {
    const combinedA = combineFields(nodeA);
    const combinedB = combineFields(nodeB);

    const commonWords = getWords(combinedA).filter(word => getWords(combinedB).includes(word));
    return commonWords.length > 0;
}

// Combine all fields into a single string for a node
function combineFields(node) {
    return Object.values(node).join(" ").toLowerCase(); // Combine all fields as a lowercase string
}

// Helper: split string into words
function getWords(str) {
    return str.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
}

// Add drag behavior
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

// Update the graph
async function updateNetwork() {
    const { nodes, links } = await fetchNetworkData();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#F9F9F9")
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .attr("stroke", "#191919")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 15)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
        .call(drag(simulation)); // Add drag behavior to nodes

    const labels = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", -20) // Position above the circle
        .attr("font-size", "14px")
        .attr("fill", "#f9f9f9")
        .text(d => d.username); // Use the username property from node data

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y + 25); // Adjust label position
    });

    // Toggle button functionality
    document.getElementById("toggle-display").addEventListener("click", () => {
        const showLabels = labels.style("display") === "none" ? "block" : "none";
        labels.style("display", showLabels);
    });
}

// Initialize the graph
updateNetwork();
