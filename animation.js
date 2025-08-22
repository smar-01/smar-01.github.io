document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SETUP THE PARTICLE BACKGROUND ---
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#888888" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#aaaaaa", "opacity": 0.4, "width": 1 },
            "move": {
                "enable": true, // This makes the particles move
                "speed": 1.5,   // Set a gentle speed
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "bounce", // Particles bounce off the container edges
                "bounce": true,
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true },
            "modes": { "grab": { "distance": 140, "line_opacity": 1 } }
        },
        "retina_detect": true
    });


    // --- 2. CREATE AND ANIMATE THE CLICKABLE PROJECT NODES ---
    const projects = [
        { title: "Project 1", category: "System Development", url: "project1.html" },
        { title: "Project 2", category: "Strategy Development", url: "project2.html" },
        { title: "Project 3", category: "Competition Results", url: "project3.html" },
        { title: "Project 4", category: "System Development", url: "project4.html" },
        { title: "Project 5", category: "Strategy Development", url: "project5.html" }
    ];

    const nodesContainer = document.getElementById('project-nodes');
    const containerRect = nodesContainer.getBoundingClientRect();

    projects.forEach((project, index) => {
        // Create the list item (the node)
        const node = document.createElement('li');
        node.className = 'project-node';

        // Create the link and tooltip
        node.innerHTML = `
            <a href="${project.url}">P${index + 1}</a>
            <div class="tooltip">
                <span class="tooltip-title">${project.title}</span>
                <span class="tooltip-category">${project.category}</span>
            </div>
        `;

        // Set a random initial position within the container
        node.style.left = `${Math.random() * (containerRect.width - 80)}px`;
        node.style.top = `${Math.random() * (containerRect.height - 80)}px`;

        nodesContainer.appendChild(node);

        // Animate the node with a gentle, random floating motion
        animateNode(node);
    });

    function animateNode(node) {
        anime({
            targets: node,
            translateX: () => `+=${anime.random(-40, 40)}`,
            translateY: () => `+=${anime.random(-40, 40)}`,
            duration: anime.random(3000, 5000),
            easing: 'easeInOutQuad',
            complete: () => animateNode(node) // Loop the animation
        });
    }
});
