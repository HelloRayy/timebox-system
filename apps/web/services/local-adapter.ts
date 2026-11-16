import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const STORAGE_KEY = "plane_tauri_local_db_v1";

interface LocalDB {
  user: any;
  userSettings: any;
  workspace: any;
  projects: any[];
  states: Record<string, any[]>;
  labels: Record<string, any[]>;
  issues: Record<string, any[]>;
  stickies: any[];
}

const DEFAULT_USER = {
  id: "user-1",
  first_name: "Raditya",
  last_name: "Rayhan",
  email: "rayhan@timebox.local",
  display_name: "raditya-rayhan",
  username: "raditya-rayhan",
  avatar: "",
  avatar_url: "",
  is_active: true,
  is_email_verified: true,
  is_onboarded: true,
  is_tour_completed: true,
  onboarding_step: {
    workspace_join: true,
    profile_complete: true,
    workspace_create: true,
    workspace_invite: true,
  },
  user_timezone: "Asia/Jakarta",
  role: "Engineering",
  theme: { theme: "dark" },
};

const DEFAULT_WORKSPACE = {
  id: "ws-1",
  name: "raditya-rayhan",
  slug: "raditya-rayhan",
  owner: "user-1",
  logo: "",
  logo_url: "",
  organization_size: "1-10",
  role: 20,
  total_members: 1,
  total_projects: 2,
};

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    name: "Snaps",
    identifier: "SNAP",
    description: "Main workspace project",
    workspace: "ws-1",
    workspace_detail: DEFAULT_WORKSPACE,
    network: 2,
    member_role: 20,
    is_member: true,
    is_favorite: false,
    cycle_view: true,
    module_view: true,
    issue_views_view: true,
    page_view: true,
    intake_view: false,
    sort_order: 1000,
    total_members: 1,
    total_cycles: 0,
    total_modules: 0,
    default_state: "proj-1-state-todo",
    emoji: "1f4ac",
    icon_prop: { name: "MessageSquare", color: "#3F76FF" },
  },
  {
    id: "proj-2",
    name: "Timebox Core",
    identifier: "TIME",
    description: "Desktop timeboxing workspace",
    workspace: "ws-1",
    workspace_detail: DEFAULT_WORKSPACE,
    network: 2,
    member_role: 20,
    is_member: true,
    is_favorite: false,
    cycle_view: true,
    module_view: true,
    issue_views_view: true,
    page_view: true,
    intake_view: false,
    sort_order: 2000,
    total_members: 1,
    total_cycles: 0,
    total_modules: 0,
    default_state: "proj-2-state-todo",
    emoji: "23f1",
    icon_prop: { name: "Timer", color: "#10B981" },
  },
];

const createDefaultStates = (projectId: string) => [
  {
    id: `${projectId}-state-backlog`,
    name: "Backlog",
    color: "#6B7280",
    group: "backlog",
    sequence: 15000,
    default: false,
    project_id: projectId,
    workspace_id: "ws-1",
  },
  {
    id: `${projectId}-state-todo`,
    name: "Todo",
    color: "#9EA3AE",
    group: "unstarted",
    sequence: 25000,
    default: true,
    project_id: projectId,
    workspace_id: "ws-1",
  },
  {
    id: `${projectId}-state-inprogress`,
    name: "In Progress",
    color: "#F59E0B",
    group: "started",
    sequence: 35000,
    default: false,
    project_id: projectId,
    workspace_id: "ws-1",
  },
  {
    id: `${projectId}-state-done`,
    name: "Done",
    color: "#10B981",
    group: "completed",
    sequence: 45000,
    default: false,
    project_id: projectId,
    workspace_id: "ws-1",
  },
];

const createDefaultIssues = (): Record<string, any[]> => ({
  "proj-1": [
    {
      id: "iss-1",
      name: "Fix memory leak di Tauri WebKit backend",
      description_html: "<p>Audit alokasi IPC dan event listener window.</p>",
      priority: "urgent",
      state_id: "proj-1-state-inprogress",
      project_id: "proj-1",
      workspace_id: "ws-1",
      sequence_id: 1,
      sort_order: 10000,
      assignee_ids: ["user-1"],
      label_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "user-1",
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    },
    {
      id: "iss-2",
      name: "Integrasi Timebox Board & Corner Timer Popup",
      description_html: "<p>Tambahkan popup timer draggable di pojok layar.</p>",
      priority: "high",
      state_id: "proj-1-state-todo",
      project_id: "proj-1",
      workspace_id: "ws-1",
      sequence_id: 2,
      sort_order: 20000,
      assignee_ids: ["user-1"],
      label_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "user-1",
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    },
    {
      id: "iss-3",
      name: "Review PR backend optimization",
      description_html: "<p>Cek query index dan pagination list work items.</p>",
      priority: "medium",
      state_id: "proj-1-state-backlog",
      project_id: "proj-1",
      workspace_id: "ws-1",
      sequence_id: 3,
      sort_order: 30000,
      assignee_ids: ["user-1"],
      label_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "user-1",
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    },
  ],
  "proj-2": [
    {
      id: "iss-4",
      name: "Setup Timebox Sprint Hari Ini",
      description_html: "<p>Fokus 25 menit per sesi tanpa distraksi.</p>",
      priority: "high",
      state_id: "proj-2-state-inprogress",
      project_id: "proj-2",
      workspace_id: "ws-1",
      sequence_id: 1,
      sort_order: 10000,
      assignee_ids: ["user-1"],
      label_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "user-1",
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    },
  ],
});

function loadDB(): LocalDB {
  const fallback: LocalDB = {
    user: DEFAULT_USER,
    userSettings: {
      id: "settings-1",
      email: DEFAULT_USER.email,
      workspace: {
        last_workspace_id: "ws-1",
        last_workspace_slug: "raditya-rayhan",
        fallback_workspace_id: "ws-1",
        fallback_workspace_slug: "raditya-rayhan",
      },
    },
    workspace: DEFAULT_WORKSPACE,
    projects: DEFAULT_PROJECTS,
    states: {
      "proj-1": createDefaultStates("proj-1"),
      "proj-2": createDefaultStates("proj-2"),
    },
    labels: { "proj-1": [], "proj-2": [] },
    issues: createDefaultIssues(),
    stickies: [],
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  saveDB(fallback);
  return fallback;
}

function saveDB(db: LocalDB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

function makeResponse(config: InternalAxiosRequestConfig, data: any, status = 200): AxiosResponse {
  return { data, status, statusText: "OK", headers: {}, config };
}

export const localOfflineAdapter: AxiosAdapter = async (config) => {
  const db = loadDB();
  const method = (config.method || "get").toLowerCase();
  const rawUrl = config.url || "/";
  const path = rawUrl.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  // 1. Instance & Auth
  if (path === "/auth/get-csrf-token/" || path === "/auth/get-csrf-token") {
    return makeResponse(config, { csrf_token: "local-tauri-csrf" });
  }
  if (path === "/api/instances/" || path === "/api/instances") {
    return makeResponse(config, {
      instance: {
        id: "inst-1",
        instance_name: "Timebox Ray",
        is_setup_done: true,
        is_signup_enabled: false,
        edition: "COMMUNITY",
      },
      config: {
        is_google_enabled: false,
        is_github_enabled: false,
        is_gitlab_enabled: false,
        is_magic_login_enabled: false,
        is_smtp_configured: false,
        enable_signup: false,
      },
    });
  }

  // 2. Current User, Profile & Settings
  if (path === "/api/users/me/" || path === "/api/users/me") {
    if (method === "patch") {
      db.user = { ...db.user, ...body };
      saveDB(db);
    }
    return makeResponse(config, db.user);
  }
  if (path === "/api/users/me/profile/" || path === "/api/users/me/profile") {
    if (method === "patch") {
      db.user = { ...db.user, ...body, is_onboarded: true };
      saveDB(db);
    }
    return makeResponse(config, {
      ...db.user,
      is_onboarded: true,
      last_workspace_id: "ws-1",
      onboarding_step: {
        workspace_join: true,
        profile_complete: true,
        workspace_create: true,
        workspace_invite: true,
      },
    });
  }
  if (path === "/api/users/me/accounts/" || path === "/api/users/me/accounts") {
    return makeResponse(config, []);
  }
  if (path === "/api/users/me/settings/" || path === "/api/users/me/settings") {
    return makeResponse(config, db.userSettings);
  }
  if (path === "/api/users/me/workspaces/" || path === "/api/users/me/workspaces") {
    return makeResponse(config, [db.workspace]);
  }
  if (path === "/api/users/me/workspaces/invitations/") {
    return makeResponse(config, []);
  }
  if (path === "/api/users/me/instance-admin/") {
    return makeResponse(config, { is_instance_admin: true });
  }

  // 3. Workspace Info & Members
  if (path.match(/^\/api\/workspaces\/[^/]+\/?$/)) {
    return makeResponse(config, db.workspace);
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/workspace-members\/?$/)) {
    return makeResponse(config, [{ id: "wm-1", member: db.user, role: 20, is_active: true }]);
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/workspace-members\/me\/?$/)) {
    return makeResponse(config, { id: "wm-1", member: db.user, role: 20, is_active: true });
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/user-favorite-projects\/?$/)) {
    return makeResponse(config, []);
  }

  // 4. Projects
  if (path.match(/^\/api\/workspaces\/[^/]+\/projects\/?$/)) {
    if (method === "post") {
      const newProj = {
        id: `proj-${Date.now()}`,
        name: body.name || "Untitled Project",
        identifier: (body.identifier || "NEW").toUpperCase(),
        description: body.description || "",
        workspace: "ws-1",
        workspace_detail: db.workspace,
        network: 2,
        member_role: 20,
        is_member: true,
        is_favorite: false,
        cycle_view: true,
        module_view: true,
        issue_views_view: true,
        page_view: true,
        sort_order: (db.projects.length + 1) * 1000,
      };
      db.projects.push(newProj);
      db.states[newProj.id] = createDefaultStates(newProj.id);
      db.labels[newProj.id] = [];
      db.issues[newProj.id] = [];
      saveDB(db);
      return makeResponse(config, newProj, 201);
    }
    return makeResponse(config, db.projects);
  }

  const projDetailMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/?$/);
  if (projDetailMatch) {
    const pid = projDetailMatch[1];
    return makeResponse(config, db.projects.find((p) => p.id === pid) || db.projects[0]);
  }

  if (path.match(/^\/api\/workspaces\/[^/]+\/projects\/[^/]+\/project-members\/me\/?$/)) {
    return makeResponse(config, {
      id: "pm-1",
      member: db.user,
      role: 20,
      preferences: {
        view_props: {
          filters: {},
          display_filters: { layout: "kanban", group_by: "state" },
          display_properties: {
            assignee: true,
            due_date: true,
            key: true,
            labels: true,
            priority: true,
            state: true,
          },
        },
      },
    });
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/projects\/[^/]+\/members\/?$/)) {
    return makeResponse(config, [{ id: "pm-1", member: db.user, role: 20 }]);
  }

  // 5. States & Labels
  const statesMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/states\/?$/);
  if (statesMatch) {
    const pid = statesMatch[1];
    return makeResponse(config, db.states[pid] || createDefaultStates(pid));
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/states\/?$/)) {
    return makeResponse(config, Object.values(db.states).flat());
  }
  const labelsMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/labels\/?$/);
  if (labelsMatch) {
    const pid = labelsMatch[1];
    return makeResponse(config, db.labels[pid] || []);
  }

  // 6. Issues
  const issuesListMatch = path.match(
    /^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/(?:v2\/)?issues(?:-detail)?\/?$/
  );
  if (issuesListMatch) {
    const pid = issuesListMatch[1];
    const list = db.issues[pid] || [];

    if (method === "post") {
      const nextSeq = list.length + 1;
      const newIssue = {
        id: `iss-${Date.now()}`,
        name: body.name || "Untitled Work Item",
        description_html: body.description_html || "<p></p>",
        priority: body.priority || "none",
        state_id: body.state_id || `${pid}-state-todo`,
        project_id: pid,
        workspace_id: "ws-1",
        sequence_id: nextSeq,
        sort_order: nextSeq * 10000,
        assignee_ids: body.assignee_ids || ["user-1"],
        label_ids: body.label_ids || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user-1",
        sub_issues_count: 0,
        attachment_count: 0,
        link_count: 0,
      };
      if (!db.issues[pid]) db.issues[pid] = [];
      db.issues[pid].unshift(newIssue);
      saveDB(db);
      return makeResponse(config, newIssue, 201);
    }

    return makeResponse(config, {
      results: list,
      total_results: list.length,
      total_pages: 1,
      next_page_results: false,
      prev_page_results: false,
      grouped_results: null,
    });
  }

  const issueDetailMatch = path.match(
    /^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/issues\/([^/]+)\/?$/
  );
  if (issueDetailMatch) {
    const [, pid, issueId] = issueDetailMatch;
    const list = db.issues[pid] || [];
    const idx = list.findIndex((i) => i.id === issueId);

    if (method === "patch" || method === "put") {
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...body, updated_at: new Date().toISOString() };
        saveDB(db);
        return makeResponse(config, list[idx]);
      }
    }
    if (method === "delete") {
      if (idx >= 0) {
        list.splice(idx, 1);
        saveDB(db);
      }
      return makeResponse(config, {}, 204);
    }
    return makeResponse(config, idx >= 0 ? list[idx] : {});
  }

  // 7. Stickies
  if (path.match(/^\/api\/workspaces\/[^/]+\/stickies\/?$/)) {
    if (method === "post") {
      const sticky = { id: `st-${Date.now()}`, ...body, created_at: new Date().toISOString() };
      db.stickies.unshift(sticky);
      saveDB(db);
      return makeResponse(config, sticky, 201);
    }
    return makeResponse(config, { results: db.stickies, total_results: db.stickies.length });
  }

  // 8. Fallback list vs object
  if (
    path.includes("views") ||
    path.includes("cycles") ||
    path.includes("modules") ||
    path.includes("favorites") ||
    path.includes("notifications") ||
    path.includes("estimates")
  ) {
    return makeResponse(config, []);
  }

  return makeResponse(config, {});
};
