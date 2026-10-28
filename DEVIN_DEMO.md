# Devin demo: "Only on iPhone" bug reproduced with video

**What it shows:** Devin starts a macOS child session, reproduces a bug that only happens in iOS Safari in the iOS Simulator, records it next to Chrome, fixes it, and records the fix.

**Needs:** GitHub

More demos: [devin-advanced-demos](https://github.com/thequantexplorer/devin-advanced-demos)

## Set it up

1. Click **Use this template → Create a new repository**, choose your GitHub account or org as the owner, and keep the name `devin-demo-safari-bug`. The links and prompt below assume that name. Use the template rather than a fork: pull requests on a fork go to the original repo by default.
2. In Devin, open [**Settings → Connections → GitHub**](https://app.devin.ai/settings/connections/github) and make sure Devin can access the new repository.

## Prompt

Start a new Devin session and paste this. Replace `<you>` with your GitHub user or org.

```text
Support ticket: "Booking page shows 'Loading available times…' forever on my iPhone. Works fine on my laptop." Repo: https://github.com/<you>/devin-demo-safari-bug

Reproduce this in iOS Safari: start a macOS child session, open the page in Safari on the iOS Simulator, and record video of the bug happening there versus working in Chrome. Find the root cause, fix it with a cross-browser-safe approach, add a test that would have caught it, and re-record in the iOS Simulator showing the fix. Open a PR with both recordings described and linked.
```
