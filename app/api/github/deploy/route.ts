import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      htmlContent: string;
      pat: string;
      repoName: string;    // e.g. "username.github.io" or "my-portfolio"
      isUserPage: boolean; // true = username.github.io root; false = project page
    };

    const { htmlContent, pat, repoName, isUserPage } = body;
    if (!htmlContent || !pat || !repoName) {
      return NextResponse.json({ error: "htmlContent, pat, and repoName are required" }, { status: 400 });
    }

    const octokit = new Octokit({ auth: pat });

    // Get authenticated user — if this fails the PAT is invalid/expired
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const owner = user.login;

    // Check whether the repo already exists — only treat a 404 as "doesn't exist".
    // Any other error (e.g. 401 token scope, network) should propagate.
    let repoExists = false;
    try {
      await octokit.rest.repos.get({ owner, repo: repoName });
      repoExists = true;
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if (status !== 404) {
        // Not a "not found" — re-throw so the real error surfaces
        throw e;
      }
      // 404 → repo doesn't exist, we'll create it below
    }

    if (!repoExists) {
      try {
        await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          // auto_init=true seeds one commit so the blob/tree APIs work on fresh repos.
          // The initial README will be replaced when we overwrite with our tree.
          auto_init: true,
          description: "My portfolio website — built with Portfolio Builder",
          private: false,
        });
      } catch (e: unknown) {
        const status = (e as { status?: number })?.status;
        if (status === 422) {
          // 422 means the name is already taken (race condition or the get() was misdirected)
          // Treat it as "repo exists" and continue — the commit path handles existing repos fine
          repoExists = true;
        } else {
          throw e;
        }
      }
      if (!repoExists) {
        // Wait for GitHub to finish initialising the newly created repo
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    const branch = isUserPage ? "main" : "gh-pages";

    // ── Use the low-level Git Tree API to commit index.html ──────────────
    // The Contents API has a 1 MB per-file limit; the Tree API has none.
    // We always go through here so both new and existing repos follow the
    // same path.

    const contentBase64 = Buffer.from(htmlContent, "utf-8").toString("base64");

    // 1. Create a blob for index.html
    const { data: blob } = await octokit.rest.git.createBlob({
      owner,
      repo: repoName,
      content: contentBase64,
      encoding: "base64",
    });

    // 2. Find the current HEAD commit for the branch (if branch exists)
    let parentSha: string | undefined;
    let baseTreeSha: string | undefined;

    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: `heads/${branch}`,
      });
      parentSha = ref.object.sha;

      const { data: parentCommit } = await octokit.rest.git.getCommit({
        owner,
        repo: repoName,
        commit_sha: parentSha,
      });
      baseTreeSha = parentCommit.tree.sha;
    } catch {
      // Branch doesn't exist yet — first commit, no parent
    }

    // 3. Create a new tree with index.html
    const { data: tree } = await octokit.rest.git.createTree({
      owner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree: [
        {
          path: "index.html",
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        },
      ],
    });

    // 4. Create the commit — include timestamp in message so each deploy is a distinct commit
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const { data: commit } = await octokit.rest.git.createCommit({
      owner,
      repo: repoName,
      message: `Update portfolio via Portfolio Builder (${timestamp})`,
      tree: tree.sha,
      ...(parentSha ? { parents: [parentSha] } : {}),
    });

    // 5. Update (or create) the branch ref to point to the new commit.
    // Try updateRef first (works for existing branch), fall back to createRef for brand-new branches.
    // force:true lets us fast-forward even if history diverged (e.g. a manual push happened).
    try {
      await octokit.rest.git.updateRef({
        owner,
        repo: repoName,
        ref: `heads/${branch}`,
        sha: commit.sha,
        force: true,
      });
    } catch {
      // Branch doesn't exist yet — create it
      await octokit.rest.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/heads/${branch}`,
        sha: commit.sha,
      });
    }

    // 6. Enable GitHub Pages for project pages (not needed for user pages — GitHub auto-detects)
    if (!isUserPage) {
      try {
        await octokit.rest.repos.createPagesSite({
          owner,
          repo: repoName,
          source: { branch: "gh-pages", path: "/" },
        });
      } catch {
        // Pages already enabled — ignore
      }
    }

    const pagesUrl = isUserPage
      ? `https://${owner}.github.io`
      : `https://${owner}.github.io/${repoName}`;

    return NextResponse.json({
      success: true,
      url: pagesUrl,
      repo: `https://github.com/${owner}/${repoName}`,
    });
  } catch (err: unknown) {
    console.error("GitHub deploy error:", err);
    // Surface a human-readable message for common GitHub API errors
    const status = (err as { status?: number })?.status;
    let message = err instanceof Error ? err.message : "GitHub deployment failed";
    if (status === 401) message = "GitHub token is invalid or expired — please clear your saved token and generate a new one.";
    if (status === 403) message = "GitHub token lacks the required 'repo' permission scope.";
    if (status === 404) message = "Repository not found — check the repo name and that your token has access.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
