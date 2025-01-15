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

// Initialize empty nodes and links
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
    { source: "signaNode", target: "employeesNode" },
    { source: "signaNode", target: "managerNode" },
    { source: "signaNode", target: "architectNode" },
    { source: "signaNode", target: "urbanPlannerNode" },
    { source: "signaNode", target: "politicsNode" },
    { source: "signaNode", target: "lawNode" },
    { source: "signaNode", target: "mediaNode" },
    { source: "shoppersNode", target: "transportationNode" },
    { source: "shoppersNode", target: "employeesNode" },
    { source: "shoppersNode", target: "communityNode" },
    { source: "shoppersNode", target: "internetNode" },
    { source: "shoppersNode", target: "onlineShoppingNode" },
    { source: "shoppersNode", target: "mediaNode" },
    { source: "shoppersNode", target: "productNode" },
    { source: "shoppersNode", target: "brandsNode" },
    { source: "transportationNode", target: "employeesNode" },
    { source: "transportationNode", target: "managerNode" },
    { source: "transportationNode", target: "rawMaterialNode" },
    { source: "transportationNode", target: "politicsNode" },
    { source: "transportationNode", target: "lawNode" },
    { source: "transportationNode", target: "communityNode" },
    { source: "transportationNode", target: "onlineShoppingNode" },
    { source: "transportationNode", target: "productNode" },
    { source: "employeesNode", target: "productNode" },
    { source: "employeesNode", target: "managerNode" },
    { source: "employeesNode", target: "politicsNode" },
    { source: "employeesNode", target: "lawNode" },
    { source: "employeesNode", target: "communityNode" },
    { source: "employeesNode", target: "internetNode" },
    { source: "employeesNode", target: "onlineShoppingNode" },
    { source: "employeesNode", target: "mediaNode" },
    { source: "employeesNode", target: "productNode" },
    { source: "employeesNode", target: "brandsNode" },
    { source: "managerNode", target: "politicsNode" },
    { source: "managerNode", target: "lawNode" },
    { source: "managerNode", target: "communityNode" },
    { source: "managerNode", target: "internetNode" },
    { source: "managerNode", target: "onlineShoppingNode" },
    { source: "managerNode", target: "mediaNode" },
    { source: "managerNode", target: "productNode" },
    { source: "managerNode", target: "manufacturerNode" },
    { source: "managerNode", target: "brandsNode" },
    { source: "architectNode", target: "urbanPlannerNode" },
    { source: "architectNode", target: "politicsNode" },
    { source: "architectNode", target: "lawNode" },
    { source: "architectNode", target: "mediaNode" },
    { source: "urbanPlannerNode", target: "politicsNode" },
    { source: "urbanPlannerNode", target: "lawNode" },
    { source: "urbanPlannerNode", target: "communityNode" },
    { source: "urbanPlannerNode", target: "mediaNode" },
    { source: "politicsNode", target: "lawNode" },
    { source: "politicsNode", target: "mediaNode" },
    { source: "politicsNode", target: "communityNode" },
    { source: "politicsNode", target: "internetNode" },
    { source: "communityNode", target: "internetNode" },
    { source: "communityNode", target: "onlineShoppingNode" },
    { source: "communityNode", target: "mediaNode" },
    { source: "communityNode", target: "productNode" },
    { source: "communityNode", target: "brandsNode" },
    { source: "internetNode", target: "onlineShoppingNode" },
    { source: "internetNode", target: "mediaNode" },
    { source: "internetNode", target: "productNode" },
    { source: "internetNode", target: "brandsNode" },
    { source: "onlineShoppingNode", target: "mediaNode" },
    { source: "onlineShoppingNode", target: "productNode" },
    { source: "onlineShoppingNode", target: "brandsNode" },
    { source: "manufacturerNode", target: "productNode" },
    { source: "manufacturerNode", target: "rawMaterialNode" },
    { source: "manufacturerNode", target: "brandsNode" },
    { source: "productNode", target: "rawMaterialNode" },
    { source: "productNode", target: "brandsNode" },
];

// Fetch data from Firestore
async function fetchFirebaseData() {
    try {
        const querySnapshot = await getDocs(collection(db, "answers"));

        querySnapshot.forEach(doc => {
            const parentId = doc.id; // Parent node ID (document ID in Firestore)
            const data = doc.data();

            // Check if parent node already exists
            let parentNode = nodes.find(node => node.id === parentId);
            if (!parentNode) {
                // Add parent node
                parentNode = { id: parentId, label: parentId };
                nodes.push(parentNode);
            }

            // Add child nodes and links
            Object.entries(data).forEach(([username, answer]) => {
                const childId = `${parentId}_${username}`;
                const childNode = { id: childId, label: answer };

                // Add child node if it doesn't exist
                if (!nodes.find(node => node.id === childId)) {
                    nodes.push(childNode);
                }

                // Add link from parent to child
                if (!links.find(link => link.source === parentId && link.target === childId)) {
                    links.push({ source: parentId, target: childId });
                }
            });
        });

        // Render the graph
        renderGraph();
    } catch (error) {
        console.error("Error fetching Firebase data:", error);
    }
}

// Render the graph
function renderGraph() {
    // Clear the SVG before rendering
    svg.selectAll("*").remove();

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(250))
        .force("charge", d3.forceManyBody().strength(-900))
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
        .attr("stroke-width", 1)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => {
            // Calculate radius based on number of connections (degree)
            const degree = links.filter(link => link.source.id === d.id || link.target.id === d.id).length;
            return 5 + degree * 4; // Base size 10, increased with degree
        })
        .attr("fill", "#69b3a2")
        .call(drag(simulation))
        .on("click", handleNodeClick);

    // Render labels
    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", 1)
        .attr("font-size", "14px")
        .attr("fill", "#f9f9f9")
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
    const answer = prompt(`Enter your answer for ${d.label}:`);
    if (answer) {
        try {
            const docRef = doc(collection(db, "answers"), d.id);
            await updateDoc(docRef, { [firebase.auth().currentUser.displayName]: answer });
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
