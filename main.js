// This function runs when the entire page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the homepage by looking for the project list container
    const projectListContainer = document.getElementById('project-list-container');
    if (projectListContainer) {
        loadProjectsOnHomepage();
    }

    // Check if we are on a project page by looking for the markdown content container
    const markdownContentContainer = document.getElementById('markdown-content');
    if (markdownContentContainer) {
        loadProjectDetails();
    }
});

// Function to fetch project data and populate the homepage list
function loadProjectsOnHomepage() {
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            const ul = document.getElementById('project-list-container');
            projects.forEach(project => {
                const li = document.createElement('li');
                // Create a link that passes the project's ID in the URL
                li.innerHTML = `<a href="project.html?id=${project.id}">${project.title}</a>`;
                ul.appendChild(li);
            });
        });
}

// Function to load a specific project's markdown file and render it
function loadProjectDetails() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (!projectId) {
        document.getElementById('markdown-content').innerHTML = `<h1>Project not found.</h1>`;
        return;
    }

    // First, get the list of projects to find the correct markdown file path
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            const project = projects.find(p => p.id === projectId);
            if (!project) {
                document.getElementById('markdown-content').innerHTML = `<h1>Project not found.</h1>`;
                return;
            }

            // Update the page title
            document.title = project.title;

            // Now fetch the markdown file for that project
            fetch(project.markdownFile)
                .then(response => response.text())
                .then(markdown => {
                    // Use the Showdown library to convert markdown to HTML
                    const converter = new showdown.Converter();
                    const html = converter.makeHtml(markdown);
                    document.getElementById('markdown-content').innerHTML = html;
                });
        });
}