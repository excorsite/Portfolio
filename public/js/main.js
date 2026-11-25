const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

const featuredRepositories = [
  {
    title: "PULSE — Spotify Clone",
    description: "A PHP and MySQL music player with separate listener and admin experiences.",
    technologies: ["PHP", "JavaScript", "MySQL"],
    highlights: ["Music player with keyboard shortcuts", "Admin activity dashboard", "8 search and recommendation algorithms"],
    githubUrl: "https://github.com/excorsite/Spotify_Clone-Pulse-",
    monogram: "P"
  },
  {
    title: "DigitalMandu Platform",
    description: "A production-oriented food ordering and eCommerce platform, continuously modernized from its university MIS roots.",
    technologies: ["React", "Express", "MongoDB"],
    highlights: ["Product browsing, cart, checkout and reviews", "Buyer, seller and admin workflows", "JWT authentication and realtime order updates"],
    githubUrl: "https://github.com/excorsite/DigitalMandu_Platform",
    monogram: "D"
  },
  {
    title: "Food Mandu Platform",
    description: "A full-stack food ordering platform with a modern React frontend and Node.js API.",
    technologies: ["React", "Node.js", "Socket.IO"],
    highlights: ["COD and Khalti checkout", "Product and order management", "Role-based access and live order updates"],
    githubUrl: "https://github.com/excorsite/Food_Mandu_Platform",
    monogram: "F"
  },
  {
    title: "Student Career Counsellor",
    description: "A career counselling system that recommends academic and career paths from student results, interests, and preferences.",
    technologies: ["React", "Node.js", "ID3"],
    highlights: ["ID3-powered personalized recommendations", "Guidance for SEE, Plus Two, and Bachelor levels", "Interactive results and data visualizations"],
    githubUrl: "https://github.com/excorsite/Student-Career-Counselor-FYP",
    monogram: "S"
  },
  {
    title: "GharJagga Real Estate",
    description: "A property platform for finding apartments, houses, and land, connecting buyers and sellers directly.",
    technologies: ["PHP", "Real Estate"],
    highlights: ["Browse different types of properties online", "Connect buyers and sellers directly", "Compare property options in one place"],
    githubUrl: "https://github.com/excorsite/Real_State_-GharJagga-",
    monogram: "G"
  },
  {
    title: "ShopHub Food Product",
    description: "A food-ordering project where buyers can discover and order recommended food products.",
    technologies: ["PHP", "Food Ordering"],
    highlights: ["Browse food products", "Discover recommended items", "Order products through a food delivery workflow"],
    githubUrl: "https://github.com/excorsite/Shophub",
    monogram: "S"
  },
  {
    title: "Amazon Sample Store",
    description: "A collaborative semester project for a clothing eCommerce store with customer and seller workflows.",
    technologies: ["eCommerce", "CRUD", "Group Project"],
    highlights: ["Clothing catalog with cart and buy-now flows", "Customer and seller access", "Admin dashboard and product management"],
    githubUrl: "https://github.com/excorsite/Amazon-Sample",
    monogram: "A"
  }
];

const featuredExperience = {
  company: "Silver Lining Pvt. Ltd.",
  role: "Network & Systems Support",
  employmentType: "Internship → Full-Time",
  period: "Dec 2025 – Aug 2026",
  environment: "Linux & Windows",
  tools: "Zabbix · VMware · Firewalls",
  ticketId: "SL-NOC-DEC25-AUG26",
  highlights: [
    "Started as a Data Center intern in December 2025 and moved into a full-time role in March 2026 after strong performance, continuing through August 2026.",
    "Resolved and tracked NOC (Network Operations Center) tickets end-to-end in a formal ticket management system, working with colleagues and clients.",
    "Administered and troubleshot Linux and Windows systems supporting daily data center operations.",
    "Monitored infrastructure health and alerts with Zabbix, identifying and escalating potential issues before they affected clients.",
    "Configured and maintained VMware virtual environments, and used firewalls and system logs to identify and mitigate security threats.",
    "Worked directly with clients on connectivity, hardware, and server utilization issues, building strong client-facing communication skills."
  ]
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en", { month: "short", year: "numeric" });
}

async function loadPortfolio() {
  try {
    const response = await fetch("/api/portfolio");
    if (!response.ok) throw new Error("Could not load portfolio");
    const data = await response.json();
    renderProfile(data.profile);
    renderProjects(data.projects);
    renderExperience(data.experiences);
  } catch {
    renderProjects([]);
    renderExperience([]);
  }
}

function renderProfile(profile) {
  if (!profile) return;
  if (profile.name) {
    document.queryToAll = undefined;
  }
  document.title = `${profile.name || "Suyog"} — Portfolio`;
  if (profile.title) document.querySelector(".hero-subtitle").textContent = profile.title;
  if (profile.bio) {
    document.getElementById("profile-bio").textContent = profile.bio;
    document.getElementById("about-bio").textContent = profile.bio;
  }
  if (profile.location) document.getElementById("profile-location").textContent = profile.location;
  if (profile.email) {
    document.getElementById("profile-email").textContent = profile.email;
    document.getElementById("contact-email").textContent = profile.email;
    document.getElementById("contact-email").href = `mailto:${profile.email}`;
  }
  if (profile.cvUrl) {
    const cvLink = document.getElementById("cv-link");
    cvLink.href = profile.cvUrl;
    cvLink.hidden = false;
  }
  if (profile.skills?.length) {
    const track = document.getElementById("skills-track");
    const items = profile.skills.map((skill) => `<span>${escapeHtml(skill)}</span><i>✦</i>`).join("");
    track.innerHTML = items + items;
  }
  const social = document.getElementById("social-links");
  social.innerHTML = "";
  if (profile.github) social.insertAdjacentHTML("beforeend", `<a href="${escapeHtml(profile.github)}" target="_blank" rel="noopener" aria-label="GitHub">GH</a>`);
  if (profile.linkedin) social.insertAdjacentHTML("beforeend", `<a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">LI</a>`);
}

function renderProjects(projects) {
  const savedProjects = Array.isArray(projects) ? projects : [];
  const featuredUrls = new Set(featuredRepositories.map((project) => project.githubUrl));
  const allProjects = [
    ...featuredRepositories,
    ...savedProjects.filter((project) => !featuredUrls.has(project.githubUrl))
  ];
  document.getElementById("project-count").textContent = `${allProjects.length}+`;
  const grid = document.getElementById("projects-grid");
  if (!allProjects.length) {
    grid.innerHTML = '<p>New projects are coming soon.</p>';
    return;
  }
  grid.innerHTML = allProjects.map((project, index) => {
    const technologies = project.technologies || [];
    const highlights = project.highlights || technologies;
    const repoUrl = safeExternalUrl(project.githubUrl || "");
    const readmeUrl = repoUrl ? `${repoUrl}#readme` : "";
    const filesUrl = repoUrl ? `${repoUrl}/tree/main` : "";
    const monogram = project.monogram || String(project.title || "P").slice(0, 1);
    return `
    <article class="portfolio-project-parent reveal">
      <div class="portfolio-project-card">
        <div class="portfolio-project-logo" aria-hidden="true">
          <span class="portfolio-project-circle portfolio-project-circle1"></span>
          <span class="portfolio-project-circle portfolio-project-circle2"></span>
          <span class="portfolio-project-circle portfolio-project-circle3"></span>
          <span class="portfolio-project-circle portfolio-project-circle4"></span>
          <span class="portfolio-project-circle portfolio-project-circle5">${escapeHtml(monogram)}</span>
        </div>
        <div class="portfolio-project-glass"></div>
        <div class="portfolio-project-content">
          <span class="portfolio-project-kicker">FEATURED PROJECT · ${String(index + 1).padStart(2, "0")}</span>
          <span class="portfolio-project-title">${escapeHtml(project.title)}</span>
          <span class="portfolio-project-text">${escapeHtml(project.description)}</span>
          <div class="portfolio-project-stack">${technologies.slice(0, 3).map((technology) => `<span>${escapeHtml(technology)}</span>`).join("")}</div>
          <ul class="portfolio-project-highlights">${highlights.slice(0, 3).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
        </div>
        <div class="portfolio-project-bottom">
          <div class="portfolio-project-links">
            ${repoUrl ? `<a class="portfolio-project-link" href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(project.title)} repository on GitHub" title="GitHub repository"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.12.68-3.78-1.33-3.78-1.33-.5-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.7 2.62 1.2 3.26.92.1-.72.39-1.2.71-1.48-2.49-.28-5.1-1.25-5.1-5.55 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.07-1.15 3.07-1.15.61 1.55.23 2.7.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.31-2.61 5.27-5.11 5.54.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"></path></svg></a>` : ""}
            ${readmeUrl ? `<a class="portfolio-project-link" href="${escapeHtml(readmeUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escapeHtml(project.title)} README" title="Read project README"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5M8 12h8M8 16h8"></path></svg></a>` : ""}
            ${filesUrl ? `<a class="portfolio-project-link" href="${escapeHtml(filesUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Browse ${escapeHtml(project.title)} source files" title="Browse source files"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10l2 2h7.5A1.5 1.5 0 0 1 21 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13Z"></path></svg></a>` : ""}
          </div>
          <a class="portfolio-project-more" href="${escapeHtml(repoUrl || "#contact")}" ${repoUrl ? 'target="_blank" rel="noopener noreferrer"' : ""}>View more <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></a>
        </div>
      </div>
    </article>
  `;
  }).join("");
  observeReveal();
}

function renderExperience(experiences) {
  const list = document.getElementById("experience-list");
  const savedExperiences = Array.isArray(experiences) ? experiences : [];
  const isFeaturedExperience = (item) =>
    item.company?.trim().toLowerCase() === featuredExperience.company.toLowerCase() &&
    item.role?.trim().toLowerCase() === featuredExperience.role.toLowerCase();
  const allExperiences = [
    featuredExperience,
    ...savedExperiences.filter((item) => !isFeaturedExperience(item))
  ];

  list.innerHTML = allExperiences.map((item, index) => {
    const period = item.period ||
      `${formatDate(item.startDate)} — ${item.current ? "Present" : formatDate(item.endDate)}`;
    const highlights = item.highlights || [item.description].filter(Boolean);
    const employmentType = item.employmentType || (item.current ? "Current Role" : "Experience");
    const environment = item.environment || item.location || "Operations";
    const tools = item.tools || "Systems Support";
    const ticketId = item.ticketId || `EXPERIENCE-${String(index + 1).padStart(2, "0")}`;

    return `
    <article class="experience-ticket-wrapper reveal" aria-label="${escapeHtml(item.role)} at ${escapeHtml(item.company)}">
      <div class="experience-ticket">
        <div class="experience-ticket-main">
          <div class="experience-ticket-content">
            <div class="experience-ticket-header">
              <div class="experience-ticket-logo">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                ${escapeHtml(item.company)}
              </div>
              <div class="experience-ticket-type">${escapeHtml(employmentType)}</div>
            </div>
            <h3 class="experience-ticket-title">${escapeHtml(item.role)}</h3>
            <p class="experience-ticket-subtitle">${escapeHtml(item.company)} · ${escapeHtml(period)}</p>
            <div class="experience-ticket-details">
              <div class="experience-ticket-detail"><span class="experience-ticket-label">Employment</span><span class="experience-ticket-value">${escapeHtml(employmentType)}</span></div>
              <div class="experience-ticket-detail"><span class="experience-ticket-label">Period</span><span class="experience-ticket-value">${escapeHtml(period)}</span></div>
              <div class="experience-ticket-detail"><span class="experience-ticket-label">Environment</span><span class="experience-ticket-value">${escapeHtml(environment)}</span></div>
              <div class="experience-ticket-detail"><span class="experience-ticket-label">Tools</span><span class="experience-ticket-value">${escapeHtml(tools)}</span></div>
            </div>
            ${highlights.length ? `<ul class="experience-ticket-highlights">${highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="experience-ticket-perforation" aria-hidden="true"><div class="experience-ticket-perf-line"></div></div>
        </div>
        <div class="experience-ticket-stub" aria-hidden="true">
          <div class="experience-ticket-barcode-container">
            <div class="experience-ticket-barcode"></div>
            <div class="experience-ticket-barcode-id">${escapeHtml(ticketId)}</div>
          </div>
          <div class="experience-ticket-admit">
            <div class="experience-ticket-admit-text">Department</div>
            <div class="experience-ticket-admit-num">NOC</div>
          </div>
        </div>
      </div>
    </article>`;
  }).join("");
  observeReveal();
}

function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const links = document.querySelector(".nav-links");
  const open = links.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  document.querySelector(".nav-links").classList.remove("open");
}));

document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    status.textContent = data.message;
    form.reset();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
observeReveal();
loadPortfolio();
