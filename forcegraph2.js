// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3VnQ0XC8JM64OszHpNEkvViBxA",
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
const svg = d3.select("#contrograph");
const width = +svg.attr("width") || 1000;
const height = +svg.attr("height") || 1000;
const marginLeft = 150;
const marginRight = 20;
const step = 20;

// Function to fetch data from Firestore
async function fetchNetworkData() {
    const nodes = [];
    const links = [];

    try {
        const snapshot = await getDocs(collection(db, "mappers"));
        snapshot.forEach((doc) => {
            const node = doc.data();
            node.id = doc.id;
            nodes.push(node);
        });

        // Create links based on common words
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

// Helper to check for common words
function hasCommonWords(nodeA, nodeB) {
    const commonWords = getWords(nodeA.email).filter((word) =>
        getWords(nodeB.email).includes(word)
    );
    const commonUsername = getWords(nodeA.username).filter((word) =>
        getWords(nodeB.username).includes(word)
    );
    return commonWords.length > 0 || commonUsername.length > 0;
}

// Helper to split a string into words
function getWords(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
}

// Main Visuals
async function drawArcDiagram() {
    const { nodes, links } = await fetchNetworkData();

    // Scales and positioning
    const y = d3
        .scalePoint()
        .domain(nodes.map((d) => d.id))
        .range([20, height - 10]);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Arc function
    function arc(d) {
        const y1 = y(d.source);
        const y2 = y(d.target);
        const r = Math.abs(y2 - y1) / 2;
        return `M${marginLeft},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${marginLeft},${y2}`;
    }

    // Render arcs
    const arcs = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", arc);

    // Render nodes with labels
    const labels = svg
        .append("g")
        .attr("font-family", "Inter")
        .attr("font-weight", "400")
        .attr("font-size", 15)
        .attr("text-anchor", "end")
        .attr("fill", "#f9f9f9")
        .attr("padding", "20px")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${marginLeft},${y(d.id)})`)
        .call((g) =>
            g
                .append("text")
                .attr("x", -36)
                .attr("dy", "0.35em")
                .text((d) => d.username) // Default to ID
        )
        .call((g) =>
            g
                .append("circle")
                .attr("r", 24)
                .attr("fill", (d) => color(d.gender))
        );

    // Update function for label display
    function updateLabels(labelBy) {
        labels.select("text").text((d) => d[labelBy] || "N/A");
    }

    // Update function for reordering
    function updateOrder(orderBy) {
        const order = nodes
            .slice()
            .sort((a, b) =>
                d3.ascending(a[orderBy]?.toString().toLowerCase(), b[orderBy]?.toString().toLowerCase())
            )
            .map((d) => d.id);

        y.domain(order);

        labels
            .transition()
            .duration(750)
            .attr("transform", (d) => `translate(${marginLeft},${y(d.id)})`);

        arcs
            .transition()
            .duration(750)
            .attr("d", arc);
    }

    // Add event listener for label display dropdown
    d3.select("#labelCriteria").on("change", function () {
        const labelBy = d3.select(this).property("value");
        updateLabels(labelBy);
    });

    // Add event listener for sorting dropdown
    d3.select("#sortCriteria").on("change", function () {
        const orderBy = d3.select(this).property("value");
        updateOrder(orderBy);
    });
}


// Execute
drawArcDiagram();
