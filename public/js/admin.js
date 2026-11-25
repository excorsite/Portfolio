const TOKEN_KEY = "portfolio_admin_token";
let dashboard = null;

const loginScreen = document.getElementById("login-screen");
const adminShell = document.getElementById("admin-shell");

function token() { return localStorage.getItem(TOKEN_KEY); }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token()}` } });
  if (response.status === 401) logout();
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  loginScreen.hidden = false;
  adminShell.hidden = true;
}

async function loadDashboard() {
  dashboard = await api("/api/admin/dashboard");
  loginScreen.hidden = true;
  adminShell.hidden = false;
  fillProfile();
  renderProjects();
  renderExperiences();
  renderMessages();
}

function fillProfile() {
  const profile = dashboard.profile || {};
  const form = document.getElementById("profile-form");
  ["name", "title", "bio", "location", "email", "phone", "github", "linkedin", "website"].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = profile[name] || "";
  });
  form.elements.skills.value = (profile.skills || []).join(", ");
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("login-status");
  const form = event.currentTarget;
  status.textContent = "";
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    localStorage.setItem(TOKEN_KEY, data.token);
    await loadDashboard();
  } catch (error) {
    status.textContent = error.message;
  }
});

document.getElementById("logout-button").addEventListener("click", logout);

document.querySelectorAll(".admin-nav").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".admin-nav").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".admin-panel").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  document.getElementById(`panel-${button.dataset.panel}`).classList.add("active");
  document.getElementById("admin-title").textContent = button.textContent.replace(/\d/g, "").trim();
}));

document.getElementById("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    alert("Profile saved");
  } catch (error) { alert(error.message); }
});

document.getElementById("cv-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    const response = await fetch("/api/admin/cv", { method: "POST", headers: { Authorization: `Bearer ${token()}` }, body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    alert("CV uploaded");
  } catch (error) { alert(error.message); }
});

const projectDialog = document.getElementById("project-dialog");
const projectForm = document.getElementById("project-form");
document.getElementById("add-project").addEventListener("click", () => {
  projectForm.reset();
  projectForm.elements.id.value = "";
  document.getElementById("project-dialog-title").textContent = "Add project";
  projectDialog.showModal();
});

function renderProjects() {
  const root = document.getElementById("admin-projects");
  root.innerHTML = dashboard.projects.map((project) => `
    <div class="admin-list-item">
      <div><h3>${project.title}</h3><p>${project.description}</p></div>
      <div class="admin-actions"><button class="button ghost small" data-edit-project="${project._id}">Edit</button><button class="button ghost small danger-button" data-delete-project="${project._id}">Delete</button></div>
    </div>`).join("") || "<p>No projects yet.</p>";
  root.querySelectorAll("[data-edit-project]").forEach((button) => button.addEventListener("click", () => editProject(button.dataset.editProject)));
  root.querySelectorAll("[data-delete-project]").forEach((button) => button.addEventListener("click", () => deleteItem("project", button.dataset.deleteProject)));
}

function editProject(id) {
  const project = dashboard.projects.find((item) => item._id === id);
  if (!project) return;
  projectForm.elements.id.value = project._id;
  ["title", "description", "image", "githubUrl", "liveUrl", "order"].forEach((name) => projectForm.elements[name].value = project[name] ?? "");
  projectForm.elements.technologies.value = (project.technologies || []).join(", ");
  projectForm.elements.featured.checked = Boolean(project.featured);
  document.getElementById("project-dialog-title").textContent = "Edit project";
  projectDialog.showModal();
}

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(projectForm));
  data.featured = Boolean(data.featured);
  data.technologies = data.technologies.split(",").map((item) => item.trim()).filter(Boolean);
  data.order = Number(data.order) || 0;
  const id = data.id;
  delete data.id;
  try {
    await api(id ? `/api/admin/projects/${id}` : "/api/admin/projects", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    projectDialog.close();
    await loadDashboard();
  } catch (error) { alert(error.message); }
});

async function deleteItem(type, id) {
  if (!confirm(`Delete this ${type}?`)) return;
  try {
    await api(`/api/admin/${type === "project" ? "projects" : "experiences"}/${id}`, { method: "DELETE" });
    await loadDashboard();
  } catch (error) { alert(error.message); }
}

const experienceDialog = document.getElementById("experience-dialog");
const experienceForm = document.getElementById("experience-form");
document.getElementById("add-experience").addEventListener("click", () => {
  experienceForm.reset();
  experienceForm.elements.id.value = "";
  document.getElementById("experience-dialog-title").textContent = "Add experience";
  experienceDialog.showModal();
});

function toDateInput(value) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }
function renderExperiences() {
  const root = document.getElementById("admin-experiences");
  root.innerHTML = dashboard.experiences.map((item) => `
    <div class="admin-list-item">
      <div><h3>${item.role} — ${item.company}</h3><p>${item.description || ""}</p></div>
      <div class="admin-actions"><button class="button ghost small" data-edit-experience="${item._id}">Edit</button><button class="button ghost small danger-button" data-delete-experience="${item._id}">Delete</button></div>
    </div>`).join("") || "<p>No experience yet.</p>";
  root.querySelectorAll("[data-edit-experience]").forEach((button) => button.addEventListener("click", () => editExperience(button.dataset.editExperience)));
  root.querySelectorAll("[data-delete-experience]").forEach((button) => button.addEventListener("click", () => deleteItem("experience", button.dataset.deleteExperience)));
}

function editExperience(id) {
  const item = dashboard.experiences.find((entry) => entry._id === id);
  if (!item) return;
  experienceForm.elements.id.value = item._id;
  ["company", "role", "location", "description"].forEach((name) => experienceForm.elements[name].value = item[name] || "");
  experienceForm.elements.startDate.value = toDateInput(item.startDate);
  experienceForm.elements.endDate.value = toDateInput(item.endDate);
  experienceForm.elements.current.checked = Boolean(item.current);
  document.getElementById("experience-dialog-title").textContent = "Edit experience";
  experienceDialog.showModal();
}

experienceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(experienceForm));
  data.current = Boolean(data.current);
  if (!data.endDate) delete data.endDate;
  const id = data.id;
  delete data.id;
  try {
    await api(id ? `/api/admin/experiences/${id}` : "/api/admin/experiences", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    experienceDialog.close();
    await loadDashboard();
  } catch (error) { alert(error.message); }
});

function renderMessages() {
  const unread = dashboard.unread || 0;
  document.getElementById("unread-count").textContent = unread;
  const root = document.getElementById("admin-messages");
  root.innerHTML = dashboard.messages.map((item) => `
    <article class="message-item ${item.read ? "" : "unread"}">
      <div class="message-meta"><strong>${item.name} — ${item.email}</strong><span>${new Date(item.createdAt).toLocaleString()}</span></div>
      <h3>${item.subject || "No subject"}</h3><p>${item.message}</p>
      <div class="admin-actions">${item.read ? "" : `<button class="button ghost small" data-read="${item._id}">Mark read</button>`}<button class="button ghost small danger-button" data-delete-message="${item._id}">Delete</button></div>
    </article>`).join("") || "<p>No messages yet.</p>";
  root.querySelectorAll("[data-read]").forEach((button) => button.addEventListener("click", async () => {
    await api(`/api/admin/messages/${button.dataset.read}/read`, { method: "PATCH" });
    await loadDashboard();
  }));
  root.querySelectorAll("[data-delete-message]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Delete this message?")) return;
    await api(`/api/admin/messages/${button.dataset.deleteMessage}`, { method: "DELETE" });
    await loadDashboard();
  }));
}

document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));

if (token()) loadDashboard().catch(() => logout());
