# Pre-open-source Audit — Gandhi Order Tool

Scope: everything currently tracked in this repo, plus full git history (since
history ships with the repo the moment it's public). Goal: flag what should be
fixed, scrubbed, or consciously accepted before flipping this to public.

## 🔴 Fix before going public

### 1. Google Sheet shared as "anyone with the link can edit"
`index.html:51` and `full_order/index.html:107` link to
`docs.google.com/spreadsheets/d/1u5HdwJuoFV40RaJuqw6emRy0F7fUUFEEPnP9-PL2MU0/edit?usp=sharing`.
Today that link only leaks to whoever views page source or your JS console.
Once the repo is public and indexed by GitHub code search / crawlers, it's
one grep away for anyone on the internet, who can then edit or corrupt the
order data. Either switch the share setting to read-only (or remove edit
access entirely and go through the app), or drop the link and point people
at a request process instead.

Note: commit `4f8e0f9` already removed this link once, and `37858c8`
reverted that removal — so it's back on `HEAD`. Worth deciding for real this
time before the history (which will also be public) preserves the flip-flop.

### 2. Unauthenticated n8n webhooks that mutate data
All of these are called straight from client-side JS with zero auth token,
CORS restriction, or rate limiting:

- `n8n.yrieix.com/webhook/40c16458-56bc-4aa1-bb63-5fab4c4e0327` — add order (`order/index.html:190`)
- `n8n.yrieix.com/webhook/gandhi-delete-item` — delete an order item (`full_order/index.html:157`)
- `n8n.yrieix.com/webhook/gandhi-fetch-orders`, `gandhi-get-all` — read all orders (`full_order/index.html:126`, `stats/index.html:106`)
- `n8n.yrieix.com/webhook/463e849d-1a72-43fe-8abb-aa18957816f6` — reads the SMS chat thread with the restaurant (`full_order/index.html:209`)
- `n8n.yrieix.com/webhook/0ef9d95d-4576-445d-9d6c-3fc371fc9cfc` — view-tracking beacon (`n8n.js:4`)
- `script.google.com/macros/s/AKfycbxuRINtkSRYAC7Kle9g5urtW5GBWbjrvS4YCQo-LT9yWqD_Ed9MZ_FAaJcx4EgdvK0xlg/exec` — Apps Script endpoint, unused dead code now but still live (`full_order/index.html:111`)

Same reasoning as #1: today these IDs are obscure strings buried in JS;
public + indexed means anyone can find and hit `gandhi-delete-item` or spam
`gandhi-fetch-orders` at will. Minimum fix: add a shared-secret header or
token param n8n checks before executing, since these are same-origin-only
tools anyway. Longer term, consider putting them behind a lightweight
backend that can rate-limit and validate payloads.

### 3. Colleague's and your own work email in git history
`git log --all` shows commits authored with `y.leprince@criteo.com` and
`l.thebault@criteo.com`, alongside your personal `yrieix.leprince@gmail.com`
and GitHub noreply address. Git history is immutable once pushed and fully
visible on a public repo (`git log`, blame, GitHub's "Contributors" list).
This exposes:
- Your employer's internal email format/domain.
- A colleague's work email without them having opted into this repo being
  public — worth checking with them first.

If this matters, you'd need to rewrite history (`git filter-repo`) to scrub
author emails before the flip to public — can't be patched after the fact
without breaking every fork/clone.

### 4. No LICENSE file
There's no `LICENSE` in the repo. Without one, "open source" is really just
"source visible" — colleagues technically can't legally reuse, fork, or
contribute under any defined terms, and GitHub will show the "no license"
warning. Pick one (MIT/Apache-2.0 are the low-friction defaults for a small
tool like this) and add it.

## 🟡 Worth cleaning up

### 5. Internal Criteo references baked into a personal side project
`index.html:52` links to an internal `criteo.achievers.com/event/...` URL,
`full_order/index.html:223` references `n8n.yrieix.com/form/criteo`, and the
UI is literally labelled "Criteo command" (`index.html:34`). If the intent
is "share with colleagues," this is fine as context, but it does mean a
public repo now publicly ties your employer's name to your personal
side-project infra (self-hosted n8n, Google Apps Script, Twilio trial
account). Worth a conscious "yes I'm okay with that" rather than an
oversight.

### 6. Restaurant SMS thread piped through a "Twilio trial account"
`full_order/index.html:209-223` fetches and renders an SMS conversation
with "Sophie" (apparently the restaurant contact) via a Twilio trial
number, stripping the trial-account disclaimer text. Low severity, but
it's a live person's business communications being displayed on a public
tool — confirm she's fine with that, and note a Twilio trial account has
low message limits so this could break under any real load.

### 7. No `robots.txt` / access control on `/stats` and `/full_order`
These pages expose per-user ordering history (first names, dish choices,
spend) to anyone with the URL, no auth. Fine for a trusted-colleague tool,
but going public means the *code* becomes public even if the *site* stays
semi-obscure — don't assume obscurity is a control once the webhook IDs and
URL structure are visible in the repo.

### 8. No build/repro instructions
`.gitignore` excludes `tailwindcss`, `.venv/`, and `data/*`, implying there's
a build step (Tailwind/daisyUI) and possibly a Python component that never
made it into the repo or a README. A contributor cloning this today can't
build or run it — there's no `package.json`, no setup section in `Readme.md`
beyond "live at gandhi.yrieix.com." If you want colleagues to actually
contribute, add setup/build instructions (or commit the missing tooling
config).

### 9. Large committed binary
`static/profile_gibli.png` is 2.3MB for what's used as a small chat avatar.
Not a security issue, just repo bloat — worth compressing/resizing before
it's the first thing new contributors `git clone`.

## 🟢 Looks fine as-is

- `daisyui.js` / `daisyui-theme.js` / `static/build.css` are vendored
  library/build output — normal to commit for a no-build-step static site,
  just note they'll dominate any diff/blame noise.
- `static/menu.json`, `menu-2025-10.json` — just menu data, no PII.
- Restaurant phone number (`tel:0438129957`) is public business info, not a
  concern.
- No hardcoded API keys, cloud credentials, or `.env` files found in the
  working tree or history via a broad secret grep.

## Suggested order of operations

1. Decide the Google Sheet + n8n webhook exposure (#1, #2) — these are the
   only items that let a stranger actually corrupt live data.
2. Add a LICENSE (#4).
3. Decide whether colleague/employer info in history is acceptable, or plan
   a `git filter-repo` pass before the repo goes public — this must happen
   *before* the flip, not after (#3).
4. Everything else (#5–#9) is polish, safe to do incrementally after going
   public.
