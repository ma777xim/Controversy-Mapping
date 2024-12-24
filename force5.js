// Import the necessary Firebase and D3 functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { select, scaleOrdinal, schemeAccent, forceSimulation, forceLink, forceManyBody, forceCenter, drag } from "https://d3js.org/d3.v7.min.js";

// Create a color scale with d3.schemeAccent
const colorScale = scaleOrdinal(schemeAccent);

// Firebase configuration (replace with your actual config)
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// D3 setup
const svg = select("#contromap"); // Ensure there's an element with id="contromap"
const width = +svg.attr("width");
const height = +svg.attr("height");

// Function to fetch data from Firestore
async function fetchNetworkData() {
    const nodes = [];
    const links = [];

    try {
        const snapshot = await getDocs(collection(db, "mappers"));
        snapshot.forEach(doc => {
            const node = doc.data();
            node.id = doc.id;
            nodes.push(node);
        });

        // Create links between nodes with common words in email or username
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (hasCommonWords(nodes[i], nodes[j])) {
                    links.push({ source: nodes[i].id, target: nodes[j].id });
                }
            }
        }

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return { nodes, links };
}

// Function to check if two nodes (users) share common words in their email or username
function hasCommonWords(nodeA, nodeB) {
    const commonWords = getWords(nodeA.email).filter(word => getWords(nodeB.email).includes(word));
    const commonUsername = getWords(nodeA.username).filter(word => getWords(nodeB.username).includes(word));

    // If there's a common word in either email or username, return true
    return commonWords.length > 0 || commonUsername.length > 0;
}

// Function to split a string into words (lowercased and stripped of special characters)
function getWords(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
}

// Function to update the D3 force-directed graph
async function updateNetwork() {
    const { nodes, links } = await fetchNetworkData();

    const simulation = forceSimulation(nodes)
        .force("link", forceLink(links).id(d => d.id))
        .force("charge", forceManyBody().strength(-200))
        .force("center", forceCenter(width / 2, height / 2));

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
        .attr("r", 10)
        .attr("fill", (d, i) => colorScale(d.group || i)); // This uses the colorScale

    node.append("title").text(d => d.id);

    // Define drag behavior
    const dragBehavior = drag()
        .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });

    // Apply drag behavior to nodes
    node.call(dragBehavior);

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

// Initialize the graph
updateNetwork();
