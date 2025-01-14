// Firebase imports and configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, doc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

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
const auth = getAuth(app);

// D3 setup
const svg = d3.select("#contromap");
const width = +svg.attr("width");
const height = +svg.attr("height");

let nodes = [
        { id: "depStoNode", label: "Department Store" },
        { id: "signaNode", label: "SIGNA" },
        { id: "shoppersNode", label: "Shoppers" },
        { id: "transportationNode", label: "Transportation" },
        { id: "employeesNode", label: "Employees" },
        { id: "managerNode", label: "Manager" },
        { id: "architectNode", label: "Architect" },
        { id: "urbanPlannerNode", label: "Urban Planner" },
        { id: "politicsNode", label: "Politics" },
        { id: "lawNode", label: "Law" },
        { id: "communityNode", label: "Community" },
        { id: "internetNode", label: "Internet" },
        { id: "onlineShoppingNode", label: "Online Shopping" },
        { id: "mediaNode", label: "Media" },
        { id: "manufacturerNode", label: "Manufacturer" },
        { id: "productNode", label: "Product" },
        { id: "rawMaterialNode", label: "Raw Materials" },
        { id: "brandsNode", label: "Brands" },
];

let links = [
    { source: "depStoNode", target: "signaNode" },
    { source: "depStoNode", target: "shoppersNode" },
    { source: "depStoNode", target: "transportationNode" },
    { source: "depStoNode", target: "employeesNode" },
    { source: "depStoNode", target: "managerNode" },
    { source: "depStoNode", target: "architectNode" },
    { source: "depStoNode", target: "urbanPlannerNode" },
    { source: "depStoNode", target: "politicsNode" },
    { source: "depStoNode", target: "lawNode" },
    { source: "depStoNode", target: "communityNode" },
    { source: "depStoNode", target: "internetNode" },
    { source: "depStoNode", target: "onlineShoppingNode" },
    { source: "depStoNode", target: "mediaNode" },
    { source: "depStoNode", target: "manufacturerNode" },
    { source: "depStoNode", target: "productNode" },
    { source: "depStoNode", target: "rawMaterialNode" },
    { source: "depStoNode", target: "brandsNode" },
];

// Force simulation
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Render links
svg.append("g")
    .attr("stroke", "#aaa")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 2);

// Render nodes
function renderNodes() {
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove();

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", "#69b3a2")
        .call(drag(simulation))
        .on("click", handleNodeClick);

    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", 3)
        .attr("font-size", "12px")
        .attr("fill", "#f9f9f9")
        .text(d => d.label);

    simulation.nodes(nodes).on("tick", () => {
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

    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}
renderNodes();

// Handle node click
async function handleNodeClick(event, d) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to interact with the nodes.");
        return;
    }

    const answer = prompt(`Enter your answer for ${d.label}:`);
    if (answer) {
        const username = user.displayName || user.email;
        const docRef = doc(collection(db, "answers"), d.id);

        try {
            // Add user answer to Firestore
            await updateDoc(docRef, { [username]: answer });

            // Add a new node with the answer
            const newNode = { id: `${d.id}_${answer}`, label: answer };
            nodes.push(newNode);
            links.push({ source: d.id, target: newNode.id });

            renderNodes();
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

// Auth listener
onAuthStateChanged(auth, user => {
    if (user) {
        console.log(`Logged in as ${user.email}`);
    } else {
        console.log("No user logged in.");
    }
});
