// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteField } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase setup
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
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
let nodes = [];
let links = [];

// Mode variables
let addEdgeMode = false;
let removeEdgeMode = false;
let firstNode = null;

// Fetch data from Firestore
async function fetchFirebaseData() {
    try {
        const nodesSnapshot = await getDocs(collection(db, "nodes"));
        const nodeMap = {};

        nodes = nodesSnapshot.docs.map(doc => {
            const data = doc.data();
            nodeMap[doc.id] = { id: doc.id, label: data.name };
            return { id: doc.id, label: data.name, question: data.question };
        });

        links = [];
        nodesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            Object.entries(data).forEach(([field, value]) => {
                if (value === "edge" && nodeMap[field]) {
                    links.push({ source: doc.id, target: field });
                }
            });
        });

        renderGraph();
    } catch (error) {
        console.error("Error fetching Firebase data:", error);
    }
}

// Render the graph
function renderGraph() {
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-1200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2);

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => {
            const degree = links.filter(link => link.source.id === d.id || link.target.id === d.id).length;
            return 5 + degree * 3;
        })
        .attr("fill", d => d.question ? "blue" : "red")
        .call(drag(simulation))
        .on("click", (event, d) => {
            if (addEdgeMode) {
                handleNodeClickForEdge(d);
            } else if (removeEdgeMode) {
                handleNodeClickForEdgeRemoval(d);
            } else {
                handleNodeClick(d);
            }
        });

    const text = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", 3)
        .attr("font-size", "14px")
        .attr("fill", "#f9f9f9")
        .text(d => d.label)
        .on("click", (event, d) => {
            // Ensure label clicks behave like node clicks
            if (addEdgeMode) {
                handleNodeClickForEdge(d);
            } else if (removeEdgeMode) {
                handleNodeClickForEdgeRemoval(d);
            } else {
                handleNodeClick(d);
            }
        });

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}

// Handle node click for adding an edge
async function handleNodeClickForEdge(d) {
    if (!firstNode) {
        firstNode = d;
        alert(`${d.label} selected`);
    } else if (firstNode.id === d.id) {
        alert("Cannot connect a topic to itself");
    } else {
        try {
            await updateDoc(doc(db, "nodes", firstNode.id), {
                [d.id]: "edge"
            });
            alert(`${firstNode.label} and ${d.label} connected`);
            firstNode = null;
            addEdgeMode = false; // Deactivate after creation
            fetchFirebaseData();
        } catch (error) {
            console.error("Error adding connection:", error);
            alert("Failed to add connection. Check the console for details.");
        }
    }
}

// Handle node click for removing an edge
async function handleNodeClickForEdgeRemoval(d) {
    if (!firstNode) {
        firstNode = d;
        alert(` ${d.label} selected`);
    } else if (firstNode.id === d.id) {
        alert("Cannot remove a connection to itself");
    } else {
        try {
            const firstNodeDoc = doc(db, "nodes", firstNode.id);
            const firstNodeData = (await getDoc(firstNodeDoc)).data();

            if (firstNodeData[d.id] === "edge") {
                // Remove the edge from the Firestore document
                await updateDoc(firstNodeDoc, { [d.id]: deleteField() });
                alert(`${firstNode.label} and ${d.label} disconnected`);
                firstNode = null;
                removeEdgeMode = false; // Deactivate after removal
                fetchFirebaseData();
            } else {
                alert("No connection exists between the selected topics");
                firstNode = null;
            }
        } catch (error) {
            console.error("Error removing connection:", error);
            alert("Failed to remove connection. Check the console for details.");
        }
    }
}

// Handle node click (normal mode)
function handleNodeClick(d) {
    openCustomPopup(d.id, d.question || `What would you like to say about ${d.label}?`);
}

// Open custom popup
function openCustomPopup(nodeId, question) {
    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.padding = "35px";
    popup.style.backgroundColor = "#191919";
    popup.style.color = "#f9f9f9";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
    popup.style.zIndex = "9999";

    popup.innerHTML = `
        <form style="z-index: 9999;" id="popup-form">
            <h3>${question}</h3>
            <br>
            <input type="text" id="node-name" placeholder="Type what you think" required />
            <button type="submit">Submit</button>
            <button type="button" id="close-popup">cancel</button>
        </form>
    `;

    document.body.appendChild(popup);

    document.getElementById("close-popup").addEventListener("click", () => {
        document.body.removeChild(popup);
    });

    document.getElementById("popup-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nodeName = document.getElementById("node-name").value.trim();

        try {
            // Create a new node document
            const newNodeRef = await addDoc(collection(db, "nodes"), { name: nodeName });
            const newNodeId = newNodeRef.id;

            // Update the current node to link to the new node
            await updateDoc(doc(db, "nodes", nodeId), { [newNodeId]: "edge" });

            alert("Topic added successfully!");
            document.body.removeChild(popup);
            fetchFirebaseData(); // Reload data to include new node
        } catch (error) {
            console.error("Error adding topic:", error);
            alert("Failed to add topic. Check the console for details.");
        }
    });
}

// Drag functionality
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

// Add Edge Button Listener
document.getElementById("addEdgeButton").addEventListener("click", () => {
    addEdgeMode = !addEdgeMode;
    firstNode = null; // Reset first node
    alert(addEdgeMode ? "Connection mode activated - Select topics to connect" : "Connection Mode Deactivated");
});

// Add Remove Edge Button Listener
document.getElementById("removeEdgeButton").addEventListener("click", () => {
    removeEdgeMode = !removeEdgeMode;
    firstNode = null; // Reset first node
    alert(removeEdgeMode ? "Disconnection mode activated - Select topics to connect" : "Disconnection mode deactivated");
});

// Fetch data on load
fetchFirebaseData();
