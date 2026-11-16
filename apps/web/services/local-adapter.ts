import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const WORKSPACE_SLUG = import.meta.env.VITE_PLANE_WORKSPACE || "raditya-rayhan";
const WORKSPACE_ID = "ws-raditya-rayhan";

const FALLBACK_USER = {
  id: "cbbb6466-954a-43e3-91bf-5dc0a84116ac",
  first_name: "Raditya",
  last_name: "Rayhan",
  email: "rayhanyogiswara133@gmail.com",
  display_name: "rayhanyogiswara133",
  username: "rayhanyogiswara133",
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

const WORKSPACE_OBJ = {
  id: WORKSPACE_ID,
  name: WORKSPACE_SLUG,
  slug: WORKSPACE_SLUG,
  owner: FALLBACK_USER.id,
  logo: "",
  logo_url: "",
  organization_size: "1-10",
  role: 20,
  total_members: 1,
  total_projects: 4,
};

let cachedUser: any = null;
let cachedProjects: any[] | null = null;
const cachedStates: Record<string, any[]> = {};
const cachedLabels: Record<string, any[]> = {};

async function cloudFetch(v1Path: string, init?: RequestInit) {
  const res = await fetch(`/plane-cloud${v1Path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Plane Cloud ${res.status}`);
  return res.json();
}

function makeResponse(config: InternalAxiosRequestConfig, data: any, status = 200): AxiosResponse {
  return { data, status, statusText: "OK", headers: {}, config };
}

export const localOfflineAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const rawUrl = config.url || "/";
  const path = rawUrl.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  // 1. Instance & Auth
  if (path === "/auth/get-csrf-token/" || path === "/auth/get-csrf-token") {
    return makeResponse(config, { csrf_token: "plane-pat-csrf" });
  }
  if (path === "/api/instances/" || path === "/api/instances") {
    return makeResponse(config, {
      instance: {
        id: "inst-1",
        instance_name: "Timebox Ray (Plane Cloud)",
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

  // 2. Current User (Live from Plane Cloud via PAT)
  if (path === "/api/users/me/" || path === "/api/users/me") {
    if (!cachedUser) {
      try {
        const me = await cloudFetch("/users/me/");
        cachedUser = { ...FALLBACK_USER, ...me, is_onboarded: true };
      } catch {
        cachedUser = FALLBACK_USER;
      }
    }
    return makeResponse(config, cachedUser);
  }
  if (path === "/api/users/me/profile/" || path === "/api/users/me/profile") {
    const user = cachedUser || FALLBACK_USER;
    return makeResponse(config, {
      ...user,
      is_onboarded: true,
      last_workspace_id: WORKSPACE_ID,
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
    return makeResponse(config, {
      id: "settings-1",
      email: (cachedUser || FALLBACK_USER).email,
      workspace: {
        last_workspace_id: WORKSPACE_ID,
        last_workspace_slug: WORKSPACE_SLUG,
        fallback_workspace_id: WORKSPACE_ID,
        fallback_workspace_slug: WORKSPACE_SLUG,
      },
    });
  }
  if (path === "/api/users/me/workspaces/" || path === "/api/users/me/workspaces") {
    return makeResponse(config, [WORKSPACE_OBJ]);
  }
  if (path === "/api/users/me/workspaces/invitations/") {
    return makeResponse(config, []);
  }
  if (path === "/api/users/me/instance-admin/") {
    return makeResponse(config, { is_instance_admin: true });
  }

  // 3. Workspace Info & Members
  if (path.match(/^\/api\/workspaces\/[^/]+\/?$/)) {
    return makeResponse(config, WORKSPACE_OBJ);
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/workspace-members\/?$/)) {
    return makeResponse(config, [
      { id: "wm-1", member: cachedUser || FALLBACK_USER, role: 20, is_active: true },
    ]);
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/workspace-members\/me\/?$/)) {
    return makeResponse(config, {
      id: "wm-1",
      member: cachedUser || FALLBACK_USER,
      role: 20,
      is_active: true,
    });
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/user-favorite-projects\/?$/)) {
    return makeResponse(config, []);
  }

  // 4. Projects (Live from Plane Cloud via PAT)
  if (path.match(/^\/api\/workspaces\/[^/]+\/projects\/?$/)) {
    if (method === "get") {
      if (!cachedProjects) {
        try {
          const data = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/`);
          const list = Array.isArray(data) ? data : data.results || [];
          cachedProjects = list.map((p: any) => ({
            ...p,
            workspace: WORKSPACE_ID,
            workspace_detail: WORKSPACE_OBJ,
            is_member: true,
            member_role: p.member_role || 20,
          }));
        } catch {
          cachedProjects = [];
        }
      }
      return makeResponse(config, cachedProjects);
    }
    if (method === "post") {
      const created = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      cachedProjects = null;
      return makeResponse(config, created, 201);
    }
  }

  const projDetailMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/?$/);
  if (projDetailMatch) {
    const pid = projDetailMatch[1];
    const found = (cachedProjects || []).find((p) => p.id === pid);
    if (found) return makeResponse(config, found);
    try {
      const proj = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/`);
      return makeResponse(config, { ...proj, is_member: true, member_role: 20 });
    } catch {
      return makeResponse(config, {});
    }
  }

  if (path.match(/^\/api\/workspaces\/[^/]+\/projects\/[^/]+\/project-members\/me\/?$/)) {
    return makeResponse(config, {
      id: "pm-1",
      member: cachedUser || FALLBACK_USER,
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
    return makeResponse(config, [{ id: "pm-1", member: cachedUser || FALLBACK_USER, role: 20 }]);
  }

  // 5. States & Labels (Live from Plane Cloud)
  const statesMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/states\/?$/);
  if (statesMatch) {
    const pid = statesMatch[1];
    if (!cachedStates[pid]) {
      try {
        const data = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/states/`);
        cachedStates[pid] = Array.isArray(data) ? data : data.results || [];
      } catch {
        cachedStates[pid] = [];
      }
    }
    return makeResponse(config, cachedStates[pid]);
  }
  if (path.match(/^\/api\/workspaces\/[^/]+\/states\/?$/)) {
    return makeResponse(config, Object.values(cachedStates).flat());
  }

  const labelsMatch = path.match(/^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/labels\/?$/);
  if (labelsMatch) {
    const pid = labelsMatch[1];
    if (!cachedLabels[pid]) {
      try {
        const data = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/labels/`);
        cachedLabels[pid] = Array.isArray(data) ? data : data.results || [];
      } catch {
        cachedLabels[pid] = [];
      }
    }
    return makeResponse(config, cachedLabels[pid]);
  }

  // 6. Issues / Work Items (Live from Plane Cloud)
  const issuesListMatch = path.match(
    /^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/(?:v2\/)?issues(?:-detail)?\/?$/
  );
  if (issuesListMatch) {
    const pid = issuesListMatch[1];
    if (method === "post") {
      const created = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/work-items/`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return makeResponse(config, created, 201);
    }

    try {
      const data = await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/work-items/`);
      const results = Array.isArray(data) ? data : data.results || [];
      return makeResponse(config, {
        results,
        total_results: results.length,
        total_pages: 1,
        next_page_results: false,
        prev_page_results: false,
        grouped_results: null,
      });
    } catch {
      return makeResponse(config, { results: [], total_results: 0, total_pages: 1 });
    }
  }

  const issueDetailMatch = path.match(
    /^\/api\/workspaces\/[^/]+\/projects\/([^/]+)\/issues\/([^/]+)\/?$/
  );
  if (issueDetailMatch) {
    const [, pid, issueId] = issueDetailMatch;
    if (method === "patch" || method === "put") {
      const updated = await cloudFetch(
        `/workspaces/${WORKSPACE_SLUG}/projects/${pid}/work-items/${issueId}/`,
        { method: "PATCH", body: JSON.stringify(body) }
      );
      return makeResponse(config, updated);
    }
    if (method === "delete") {
      await cloudFetch(`/workspaces/${WORKSPACE_SLUG}/projects/${pid}/work-items/${issueId}/`, {
        method: "DELETE",
      });
      return makeResponse(config, {}, 204);
    }
    const detail = await cloudFetch(
      `/workspaces/${WORKSPACE_SLUG}/projects/${pid}/work-items/${issueId}/`
    );
    return makeResponse(config, detail);
  }

  // 7. Workspace project roles / permissions
  if (path.includes("user-project-roles") || path.includes("project-roles")) {
    const rolesMap: Record<string, number> = {};
    (cachedProjects || []).forEach((p) => {
      rolesMap[p.id] = 20;
    });
    return makeResponse(config, rolesMap);
  }

  // 8. Fallback list vs object
  if (
    path.includes("views") ||
    path.includes("cycles") ||
    path.includes("modules") ||
    path.includes("favorites") ||
    path.includes("notifications") ||
    path.includes("estimates") ||
    path.includes("stickies")
  ) {
    return makeResponse(config, []);
  }

  return makeResponse(config, {});
};
