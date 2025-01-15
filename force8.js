// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

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

// Static nodes and their specific questions
let staticNodes = [
    { id: "depStoNode", label: "Department Store", question: "What are your thoughts on department stores?" },
    { id: "signaNode", label: "SIGNA", question: "What do you think about SIGNA?" },
    { id: "shoppersNode", label: "Shoppers", question: "How do shoppers influence this topic?" },
    // Add more static nodes and their questions as needed
];
let links = []; // Dynamic links will come from Firestore

// Fetch data from Firestore
async function fetchFirebaseData() {
    try {
        const querySnapshot = await getDocs(collection(db, "answers"));
        let dynamicNodes = [];

        querySnapshot.forEach(doc => {
            const source = doc.id; // Document ID as source node
            const data = doc.data();

            // Add dynamic nodes and links
            Object.entries(data).forEach(([target, label]) => {
                const targetNode = { id: target, label };

                // Add target node if it doesn't exist
                if (!dynamicNodes.find(node => node.id === target)) {
                    dynamicNodes.push(targetNode);
                }

                // Add link
                links.push({ source, target });
            });
        });

        // Combine static and dynamic nodes
        const nodes = [...staticNodes, ...dynamicNodes];

        // Render the graph
        renderGraph(nodes, links);
    } catch (error) {
        console.error("Error fetching Firebase data:", error);
    }
}

// Render the graph
function renderGraph(nodes, links) {
    // Clear the SVG before rendering
    svg.selectAll("*").remove();

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Render links
    svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1);

    // Render nodes
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", d => (staticNodes.find(n => n.id === d.id) ? "#69b3a2" : "#ff7f0e"))
        .call(drag(simulation))
        .on("click", handleNodeClick);

    // Render labels
    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", -15)
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text(d => d.label);

    // Update positions on each tick
    simulation.on("tick", () => {
        svg.selectAll("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        svg.selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        svg.selectAll("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}

// Handle node click
async function handleNodeClick(event, d) {
    const staticNode = staticNodes.find(node => node.id === d.id);

    // Static node: ask the predefined question
    const question = staticNode ? staticNode.question : `What do you want to add about ${d.label}?`;
    const answer = prompt(question);

    if (answer) {
        try {
            // Add new document to Firestore
            const newDoc = {};
            newDoc[d.id] = answer;

            await addDoc(collection(db, "answers"), newDoc);
            alert("Answer saved!");

            // Refresh the graph after adding the answer
            await fetchFirebaseData();
        } catch (error) {
            console.error("Error saving answer:", error);
            alert("Failed to save answer. Check console for details.");
        }
    }
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

// Initialize graph with Firebase data
fetchFirebaseData();
