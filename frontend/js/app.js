const issueForm = document.querySelector("#issue-form");

const titleInput = document.querySelector("#title");

const descriptionInput = document.querySelector("#description");

const priorityInput = document.querySelector("#priority");

const issuesList = document.querySelector("#issues-list");

const issueCount = document.querySelector("#issue-count");

const formMessage = document.querySelector("#form-message");

const API_BASE_URL = "http://localhost:5000/api/issues";
// const issues = [
//   {
//     id: "ISS-101",

//     title: "Unable to access Wi-Fi",

//     description: "Connection fails in the teaching lab.",

//     priority: "High",

//     status: "Open",

//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "ISS-102",

//     title: "Projector not detected",

//     description: "Laptop cannot detect the classroom projector.",

//     priority: "Medium",

//     status: "Open",

//     createdAt: new Date().toISOString(),
//   },
// ];

// function toggleIssueStatus(issueId) {
//   const issue = issues.find((item) => item.id === issueId);
//   if (!issue) {
//     console.error("Issue not found:", issueId);
//     return;
//   }
//   issue.status = issue.status === "Open" ? "Resolved" : "Open";
//   renderIssues();
// }

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  let body = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  }
  if (!response.ok) {
    const message =
      body?.error?.message ||
      `Request failed
(${response.status})`;
    throw new Error(message);
  }
  return body;
}

function renderIssues(issues) {
  issuesList.replaceChildren();
  issueCount.textContent = issues.length;
  issues.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    const heading = document.createElement("h3");
    heading.textContent = issue.title;
    const description = document.createElement("p");
    description.textContent = issue.description;
    const meta = document.createElement("p");
    meta.textContent = `Priority: ${issue.priority} | Status:
${issue.status}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = issue.status === "Open" ? "Mark Resolved" : "Reopen";
    button.addEventListener("click", () => changeIssueStatus(issue));
    card.append(heading, description, meta, button);
    issuesList.append(card);
  });
}

async function loadIssues() {
  try {
    formMessage.textContent = "Loading issues...";
    const issues = await apiRequest(API_BASE_URL);
    renderIssues(issues);
    formMessage.textContent = "";
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not load issues: ${error.message}`;
  }
}

async function changeIssueStatus(issue) {
  const nextStatus = issue.status === "Open" ? "Resolved" : "Open";
  try {
    await apiRequest(`${API_BASE_URL}/${issue.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadIssues();
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not update issue: ${error.message}`;
  }
}

issueForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
  };
  try {
    formMessage.textContent = "Submitting issue...";
    await apiRequest(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    issueForm.reset();
    priorityInput.value = "Medium";
    await loadIssues();
    formMessage.textContent = "Issue created successfully.";
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not create issue: ${error.message}`;
  }
});

loadIssues();
