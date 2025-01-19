// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

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
            return { id: doc.id, label: data.name, human: data.human };
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
        .force("link", d3.forceLink(links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-1200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1);

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => {
            const degree = links.filter(link => link.source.id === d.id || link.target.id === d.id).length;
            return 2 + degree * 4;
        })
        .attr("fill", d => d.human === "true" ? "#69b3a2" : "#964c5d")
        .call(drag(simulation))
        .on("click", (event, d) => {
            if (addEdgeMode) {
                handleNodeClickForEdge(event, d);
            } else if (removeEdgeMode) {
                handleNodeClickForRemoveEdge(event, d);
            } else {
                handleNodeClick(event, d);
            }
        });

    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", 1)
        .attr("font-size", "16px")
        .attr("fill", "#f9f9f9")
        .text(d => d.label)
        .on("click", (event, d) => {
            if (addEdgeMode) {
                handleNodeClickForEdge(event, d);
            } else if (removeEdgeMode) {
                handleNodeClickForRemoveEdge(event, d);
            } else {
                handleNodeClick(event, d);
            }
        });

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

async function handleNodeClick(event, d) {
    if (addEdgeMode || removeEdgeMode) return;

    try {
        const nodeDoc = await getDoc(doc(collection(db, "nodes"), d.id));

        if (nodeDoc.exists()) {
            const data = nodeDoc.data();
            const question = data.question || `No question available for ${d.label}.`;
            openCustomPopup(d.id, question);
        } else {
            alert(`Node data not found for ${d.label}.`);
        }
    } catch (error) {
        console.error("Error handling node click:", error);
        alert("An error occurred while processing the node. Check the console for details.");
    }
}

function openCustomPopup(nodeId, question) {
    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.padding = "30px";
    popup.style.backgroundColor = "#191919";
    popup.style.color = "#f9f9f9";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
    popup.style.zIndex = "1000";

    popup.innerHTML = `
        <h3>${question}</h3>
        <form id="popup-form">
            <input type="text" id="node-name" placeholder="Your answer will become a new node." required />
            <div style="margin: 10px 0;">
                <label><input type="radio" name="human" value="true" required /> Human</label>
                <label style="margin-left: 10px;"><input type="radio" name="human" value="false" required /> Non-Human</label>
            </div>
            <button type="submit">Submit</button>
            <button type="button" id="close-popup">Cancel</button>
        </form>
    `;

    document.body.appendChild(popup);

    document.getElementById("close-popup").addEventListener("click", () => {
        document.body.removeChild(popup);
    });

    document.getElementById("popup-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nodeName = document.getElementById("node-name").value.trim();
        const humanValue = document.querySelector("input[name='human']:checked").value;

        if (nodeName.split(" ").length > 2) {
            alert("Your answer is limited to two words.");
            return;
        }

        try {
            const newNodeRef = await addDoc(collection(db, "nodes"), {
                name: nodeName,
                human: humanValue
            });

            await updateDoc(doc(collection(db, "nodes"), nodeId), {
                [newNodeRef.id]: "edge"
            });

            alert("Node and edge created successfully!");
            document.body.removeChild(popup);
            fetchFirebaseData();
        } catch (error) {
            console.error("Error adding node:", error);
            alert("Failed to add node. Check the console for details.");
        }
    });
}

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

// Add Edge Button
document.getElementById("addEdgeButton").addEventListener("click", () => {
    addEdgeMode = true;
    removeEdgeMode = false;
    firstNode = null;
    alert("Edge-adding mode activated. Click two nodes to connect them.");
});

// Remove Edge Button
document.getElementById("removeEdgeButton").addEventListener("click", () => {
    removeEdgeMode = true;
    addEdgeMode = false;
    alert("Edge-removal mode activated. Select an edge to remove.");
});

// Initialize graph with Firebase data
fetchFirebaseData();
