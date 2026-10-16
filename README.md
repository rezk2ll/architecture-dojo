# Architect Dojo

Software architecture, one 10-minute chapter a day.

Each chapter starts from a real problem and shows the idea on a diagram you click through. It then points at real code from open-source projects you have likely heard of (Mastodon, Kafka, Kubernetes, Discourse, GitLab, Rails, Spring) at a fixed commit, and ends with a small exercise and three questions. Questions you answer come back 1, 3, 7, 21 and 45 days later. Progress stays in your browser.

## Run it

```sh
npm install
npm run dev
```

## Add a chapter

A chapter is one file in `src/lib/chapters/`, named `NN-slug.js`. The number is the day. The `Chapter` type in `src/lib/chapters/index.js` lists the fields. Diagrams are Mermaid flowchart lines, shown one step at a time.

Every claim about a codebase links to the source at a fixed commit.

## Deploy

A push to `main` checks and builds the site (`.github/workflows/deploy.yml`). When the repo is public, it also publishes it to GitHub Pages. Any static host works too: `npm run build` writes the site to `build/`. Set `BASE_PATH` when the site is served from a sub-path.
