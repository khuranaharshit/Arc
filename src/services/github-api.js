/**
 * GitHub REST API wrapper for reading/writing files to a user's repo.
 * All operations authenticated via PAT (Personal Access Token).
 */

const BASE_URL = 'https://api.github.com';
const HEADERS_BASE = {
  Accept: 'application/vnd.github.v3+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

export class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

  _headers() {
    return { ...HEADERS_BASE, Authorization: `Bearer ${this.token}` };
  }

  async _fetch(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const resp = await fetch(url, {
      ...options,
      headers: { ...this._headers(), ...options.headers },
    });

    if (resp.status === 401) {
      throw new GitHubError('Token expired or invalid', 401);
    }
    if (resp.status === 403) {
      throw new GitHubError('Rate limited or forbidden', 403);
    }
    if (resp.status === 404) {
      return null;
    }
    if (resp.status === 409) {
      throw new GitHubError('Conflict — SHA mismatch', 409);
    }
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new GitHubError(`GitHub API error ${resp.status}: ${body}`, resp.status);
    }
    return resp.json();
  }

  /**
   * Get a file's content and SHA.
   * Returns { content: string, sha: string } or null if 404.
   */
  async getFile(path) {
    const data = await this._fetch(`/repos/${this.owner}/${this.repo}/contents/${path}`);
    if (!data) return null;
    // Decode base64 content (GitHub returns content in base64)
    const content = atob(data.content.replace(/\n/g, ''));
    return { content, sha: data.sha };
  }

  /**
   * Create or update a file.
   * If sha is provided, updates existing file. Otherwise creates new.
   * Returns { sha: string } of the new/updated file.
   */
  async putFile(path, content, sha = null, message = 'arc: update') {
    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
    };
    if (sha) body.sha = sha;

    const data = await this._fetch(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return { sha: data.content.sha };
  }

  /**
   * Delete a file. Requires SHA.
   */
  async deleteFile(path, sha, message = 'arc: delete') {
    await this._fetch(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({ message, sha }),
    });
  }

  /**
   * List files in a directory.
   * Returns [{ name, path, sha }]
   */
  async listFiles(path) {
    const data = await this._fetch(`/repos/${this.owner}/${this.repo}/contents/${path}`);
    if (!data || !Array.isArray(data)) return [];
    return data.map((f) => ({ name: f.name, path: f.path, sha: f.sha }));
  }

  /**
   * Get repo info. Used to verify access.
   */
  async getRepo() {
    return this._fetch(`/repos/${this.owner}/${this.repo}`);
  }

  /**
   * Get authenticated user info.
   */
  async getUser() {
    return this._fetch('/user');
  }
}

export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}
