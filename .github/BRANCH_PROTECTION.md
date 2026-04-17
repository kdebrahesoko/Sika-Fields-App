# Branch protection for `main`

The CI workflow at [`.github/workflows/ci.yml`](./workflows/ci.yml) runs the
test suite on every push and pull request, but GitHub will still allow a pull
request to be merged even if the workflow is failing. To actually block merges
when tests fail, branch protection has to be enabled on `main` in the
repository's GitHub settings. This is a one-time configuration change in the
GitHub UI — it cannot be set from inside the repo's code.

## Steps (GitHub UI)

1. Open the repository on GitHub.
2. Go to **Settings → Branches**.
3. Under **Branch protection rules**, click **Add branch protection rule**
   (or **Add rule**).
4. **Branch name pattern:** `main`
5. Enable **Require a pull request before merging**.
6. Enable **Require status checks to pass before merging**.
   - Also enable **Require branches to be up to date before merging**
     (recommended).
   - In the **Status checks that are required** search box, type `Test` and
     select the **Test** check (this is the `test` job in `ci.yml`, whose
     display name is `Test`).
   - Note: the check only appears in the picker after it has run at least once
     on a branch or PR. If you don't see it, push a commit or open a PR first
     so the check reports its status, then come back to this screen.
7. (Recommended) Enable **Do not allow bypassing the above settings** so
   admins are also blocked from merging red PRs.
8. Click **Create** / **Save changes**.

## Verifying it works

1. Open a pull request that intentionally breaks a test.
2. Wait for the **Test** check to run and report failure.
3. The **Merge** button on the PR should be disabled, with a message that
   required status checks have not passed.

## Alternative: configure via the GitHub API

If you'd rather script it, the same rule can be created with a token that has
`repo` admin scope:

```bash
gh api -X PUT \
  repos/<OWNER>/<REPO>/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks.strict=true \
  -f 'required_status_checks.contexts[]=Test' \
  -f enforce_admins=true \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f restrictions=
```

Replace `<OWNER>/<REPO>` with the actual repository slug.
