# GitHub Pages setup — one-time

These steps are for **you** to run once. The scheduled task cannot push to GitHub on its own — that needs your auth.

## 1. Create the GitHub repo

Pick a repo name (e.g. `investing-briefings`). Either:

- **Web UI:** github.com → New repository → name it → Public → Create.
- **CLI (`gh`):**
  ```bash
  cd /Users/mmertan/Desktop/Projects/Investing
  gh repo create investing-briefings --public --source=. --remote=origin
  ```

## 2. Initialize git and push

```bash
cd /Users/mmertan/Desktop/Projects/Investing
git init -b main
git add .nojekyll index.html README.md GITHUB-SETUP.md briefings/ buy-targets/ portfolio/
git commit -m "Initial commit — daily briefings + Pages structure"
# If you used the web UI to create the repo, add the remote manually:
# git remote add origin https://github.com/<your-username>/investing-briefings.git
git push -u origin main
```

> **Privacy note:** `portfolio/my-portofilo.md` contains your actual holdings. If you'd rather not publish that publicly, either (a) make the repo **private** (Pages still works on private repos for paid plans — or use a GitHub Org with Pages enabled), or (b) add `portfolio/` to `.gitignore` before committing.

## 3. Enable GitHub Pages

In the repo on github.com:

1. **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` / `/` (root)
4. Save

Within ~1 minute the site goes live at:

```
https://<your-username>.github.io/investing-briefings/
```

The root redirects to `/briefings/` which lists every daily briefing.

## 4. After each daily run

The scheduled task writes new files locally. To publish them:

```bash
cd /Users/mmertan/Desktop/Projects/Investing
git add briefings/ buy-targets/
git commit -m "Briefing $(date +%F)"
git push
```

### Optional: automate the push

Add a step at the end of the scheduled task so every run pushes automatically. In your scheduled-task SKILL.md (or in a wrapping hook), append:

```bash
cd /Users/mmertan/Desktop/Projects/Investing && \
  git add briefings/ buy-targets/ && \
  git diff --cached --quiet || git commit -m "Briefing $(date +%F)" && \
  git push
```

This is safe to run from a scheduled task **once** the repo + remote are set up and your machine has cached GitHub credentials (HTTPS PAT in keychain, or SSH key). Without cached creds the push will silently fail — test it once interactively before relying on it.

## Files in this commit

- `index.html` — root redirect to `/briefings/`
- `briefings/index.html` — landing page listing every daily briefing
- `briefings/2026-05-13.html` — today's briefing (first one)
- `buy-targets/2026-05-13.md` — today's 10 targets (first one)
- `buy-targets/latest.md` — pointer to the most recent targets file
- `portfolio/my-portofilo.md` — your holdings (review the privacy note above)
- `.nojekyll` — tells GitHub Pages to skip Jekyll processing
- `README.md` — repo overview
