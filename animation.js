// Define your projects here. The script will automatically create nodes for them.
const projects = [
    {
        title: "Project 1: Algo Trader",
        category: "System Development",
        url: "project1.html"
    },
    {
        title: "Project 2: Volatility Analysis",
        category: "Strategy Development",
        url: "project2.html"
    },
    {
        title: "Project 3: Kaggle Competition",
        category: "Competition Results",
        url: "project3.html"
    },
    {
        title: "Project 4: Backtesting Engine",
        category: "System Development",
        url: "project4.html"
    },
    {
        title: "Project 5: Options Pricing Model",
        category: "Strategy Development",
        url: "project5.html"
    }
];

// This is the configuration for the particles.js library
particlesJS('particles-js', {
    "particles": {
        "number": {
            // Adjust the number of particles (dots)
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#333333" // Color of the particles and lines
        },
        "shape": {
            "type": "circle",
        },
        "opacity": {
            "value": 0.5,
            "random": false,
        },
        "size": {
            "value": 3, // Default size of particles
            "random": true,
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#555555",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2, // Speed of the particle movement
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab" // Creates a grab effect on hover
            },
            "onclick": {
                "enable": true,
                "mode": "push" // Pushes particles away on click
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_opacity": 1
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});

// --- Logic to add your projects as interactive nodes ---
document.addEventListener('DOMContentLoaded', () => {
    const pJS = window.pJSDom[0].pJS;
    const particles = pJS.particles.array;

    // Make the first few particles larger and represent your projects
    for (let i = 0; i < projects.length; i++) {
        if (particles[i]) {
            const p = particles[i];
            p.size = 12; // Make project nodes bigger
            p.color = { value: '#0056b3' }; // Make them a distinct color
            p.isProject = true;
            p.projectData = projects[i];
            
            // On click, navigate to the project page
            p.interactivity.events.onclick.callback = () => {
                 window.location.href = p.projectData.url;
            };
        }
    }
    
    // Custom hover effect to show project info
    const canvas = document.querySelector('#particles-js canvas');
    const ctx = canvas.getContext('2d');

    pJS.fn.modes.grabLine = function(p) {
        if (p.isProject) {
            // Draw a tooltip above the project node on hover
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.rect(p.x - 75, p.y - 50, 150, 40);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = '12px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText(p.projectData.title, p.x, p.y - 35);
            ctx.font = '10px Georgia';
            ctx.fillText(p.projectData.category, p.x, p.y - 20);
        }
        // Original grab line logic from particles.js
        var dx = pJS.interactivity.mouse.pos_x - p.x,
            dy = pJS.interactivity.mouse.pos_y - p.y,
            dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= pJS.particles.line_linked.distance) {
            var opacity = pJS.particles.line_linked.opacity - (dist / (1 / pJS.particles.line_linked.opacity)) / pJS.particles.line_linked.distance;
            if (opacity > 0) {
                var color_line = pJS.particles.line_linked.color_rgb_line;
                ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + opacity + ')';
                ctx.lineWidth = pJS.particles.line_linked.width;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(pJS.interactivity.mouse.pos_x, pJS.interactivity.mouse.pos_y);
                ctx.stroke();
            }
        }
    };
});
