// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase configuration
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

// Fetch data from Firestore and build a D3-compatible hierarchy
async function fetchCirclePackingData() {
    const querySnapshot = await getDocs(collection(db, "circlepacking"));

    // Convert Firestore data into a D3-compatible hierarchy
    const data = [];
    querySnapshot.forEach((doc) => {
        const { name, value, parent } = doc.data();
        data.push({
            id: doc.id,
            name,
            value,
            parent
        });
    });

    // Create the hierarchy for D3
    const root = { id: "root", name: "Root", children: [] };
    const map = { root };

    // Initialize all nodes
    data.forEach((item) => {
        map[item.id] = { ...item, children: [] };
    });

    // Build the hierarchy by linking parents and children
    data.forEach((item) => {
        if (item.parent && map[item.parent]) {
            map[item.parent].children.push(map[item.id]);
        } else {
            root.children.push(map[item.id]);
        }
    });

    return root;
}

// Render the circle packing visualization with zoom functionality
async function renderCirclePacking() {
    const data = await fetchCirclePackingData();

    const width = 1400;
    const height = 1400;
    const color = d3.scaleOrdinal(["red", "#191919", "red", "blue"]);

    const svg = d3.select("#circlepacking")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style("margin", "auto")
        .style("background", "#191919")
        .style("cursor", "pointer");

    const root = d3.hierarchy(data)
        .sum((d) => d.value || 1)
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
        .size([width, height])
        .padding(5);

    pack(root);

    let focus = root;
    let view;

    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("fill", (d) => (d.children ? color(d.depth) : "blue"))
        .attr("stroke", "#ffffff") // Change this to any color you want
        .attr("stroke-width", 2) // Adjust stroke width if needed
        .attr("pointer-events", (d) => (!d.children ? "none" : null))
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    const label = svg.append("g")
        .style("font", "14px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill", "white")  // Make labels visible
        .text((d) => d.data.name)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

    svg.on("click", (event) => zoom(event, root));

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {
        const k = width / v[2];
        view = v;

        // Adjust the transform for both labels and circles
        label.attr("transform", (d) => `translate(${(d.x - v[0]) * k + width / 2},${(d.y - v[1]) * k + height / 2})`);
        node.attr("transform", (d) => `translate(${(d.x - v[0]) * k + width / 2},${(d.y - v[1]) * k + height / 2})`);
        node.attr("r", (d) => d.r * k);
    }

    function zoom(event, d) {
        focus = d;

        const transition = svg.transition()
            .duration(1400)
            .tween("zoom", (d) => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return (t) => zoomTo(i(t));
            });

        label
            .filter(function (d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .transition(transition)
            .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
            .on("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }
}

// Render the visualization
renderCirclePacking();
