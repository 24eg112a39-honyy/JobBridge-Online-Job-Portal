const API_BASE = "http://localhost:8080/api";

const jobList = document.getElementById("jobList");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const heroJobCount = document.getElementById("heroJobCount");
const postFeedback = document.getElementById("postFeedback");
const applyDialog = document.getElementById("applyDialog");
const applyFeedback = document.getElementById("applyFeedback");

let allJobs = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function formatSalary(salary) {
  if (salary === null || salary === undefined || salary === "") return "Salary not specified";
  return "₹" + Number(salary).toLocaleString("en-IN") + " / year";
}

function renderJobs(jobs) {
  if (!jobs.length) {
    jobList.innerHTML = '<div class="empty-state">No jobs found. Try another search or check back later.</div>';
    return;
  }

  jobList.innerHTML = jobs.map(job => {
    const initials = String(job.company || "JB").split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase();
    return `
      <article class="job-card">
        <div class="job-card-head">
          <div class="company-mark">${escapeHtml(initials)}</div>
          <div>
            <h3>${escapeHtml(job.title)}</h3>
            <div class="company-name">${escapeHtml(job.company)}</div>
          </div>
        </div>
        <div class="job-tags">
          <span class="tag">⌖ ${escapeHtml(job.location || "Location not specified")}</span>
          <span class="tag">${escapeHtml(job.employmentType || "Not specified")}</span>
        </div>
        <p class="job-description">${escapeHtml(job.description || "No description provided.")}</p>
        <div class="job-card-bottom">
          <span class="salary">${escapeHtml(formatSalary(job.salary))}</span>
          <button class="apply-btn" data-apply-id="${Number(job.id)}" data-apply-title="${escapeHtml(job.title)}">Apply now →</button>
        </div>
      </article>`;
  }).join("");
}

function filterJobs() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = allJobs.filter(job =>
    [job.title, job.company, job.location, job.employmentType, job.description]
      .some(value => String(value || "").toLowerCase().includes(query))
  );
  renderJobs(filtered);
  statusMessage.textContent = query
    ? `Showing ${filtered.length} of ${allJobs.length} jobs`
    : `${allJobs.length} job${allJobs.length === 1 ? "" : "s"} loaded`;
}

async function loadJobs() {
  jobList.innerHTML = '<div class="loading-card">Loading available jobs…</div>';
  statusMessage.textContent = "Connecting to backend…";
  try {
    const response = await fetch(`${API_BASE}/jobs`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected response from /api/jobs");
    allJobs = data;
    heroJobCount.textContent = allJobs.length;
    filterJobs();
  } catch (error) {
    jobList.innerHTML = `
      <div class="empty-state">
        <strong>Could not load jobs.</strong><br><br>
        Make sure Spring Boot is running on port 8080 and the GET /api/jobs endpoint works.<br>
        If you opened this page with a different local port, add that frontend origin to @CrossOrigin in your controller.<br><br>
        <small>${escapeHtml(error.message)}</small>
      </div>`;
    statusMessage.textContent = "Backend connection failed";
    heroJobCount.textContent = "0";
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadJobs);
document.getElementById("searchBtn").addEventListener("click", filterJobs);
document.getElementById("clearSearchBtn").addEventListener("click", () => {
  searchInput.value = "";
  filterJobs();
});
searchInput.addEventListener("input", filterJobs);

jobList.addEventListener("click", event => {
  const button = event.target.closest("[data-apply-id]");
  if (!button) return;
  document.getElementById("applyJobTitle").textContent = button.dataset.applyTitle;
  document.querySelector('#applyForm [name="jobId"]').value = button.dataset.applyId;
  applyFeedback.textContent = "";
  applyFeedback.className = "form-feedback";
  applyDialog.showModal();
});

document.getElementById("closeDialog").addEventListener("click", () => applyDialog.close());

document.getElementById("postJobForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = {
    title: values.title.trim(),
    company: values.company.trim(),
    location: values.location.trim(),
    employmentType: values.employmentType,
    salary: values.salary === "" ? null : Number(values.salary),
    description: values.description.trim()
  };
  postFeedback.textContent = "Publishing job…";
  postFeedback.className = "form-feedback";

  try {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Server returned ${response.status}`);
    }
    const created = await response.json();
    postFeedback.textContent = `Job published successfully${created.id ? ` (ID: ${created.id})` : ""}.`;
    form.reset();
    await loadJobs();
    document.getElementById("jobs").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    postFeedback.textContent = `Could not publish job: ${error.message}. Check the backend and CORS settings.`;
    postFeedback.className = "form-feedback error";
  }
});

document.getElementById("applyForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = {
    jobId: Number(values.jobId),
    applicantName: values.applicantName.trim(),
    applicantEmail: values.applicantEmail.trim(),
    resumeUrl: values.resumeUrl.trim() || null
  };
  applyFeedback.textContent = "Submitting application…";
  applyFeedback.className = "form-feedback";

  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Server returned ${response.status}`);
    }
    applyFeedback.textContent = "Application submitted successfully!";
    form.reset();
    setTimeout(() => applyDialog.close(), 1200);
  } catch (error) {
    applyFeedback.textContent = `Could not submit application: ${error.message}. Check that the job exists and the backend is running.`;
    applyFeedback.className = "form-feedback error";
  }
});

loadJobs();
