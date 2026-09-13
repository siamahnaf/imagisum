# Imagisum — redirect only

This project no longer hosts the Imagisum app. It exists only to forward traffic
from the old Vercel deployment to the current home on Netlify:

**https://imagisum.netlify.app**

## How it works

[next.config.ts](next.config.ts) declares a single catch-all redirect:

```
/:path*  →  https://imagisum.netlify.app/:path*   (308 permanent)
```

The path and query string are preserved, so old deep links keep working.
[src/app/page.tsx](src/app/page.tsx) is a fallback redirect for the root; no
other routes, components, or API endpoints remain.

## The old app

The full source is still in git history — see the commit before this one
(`bfdb192`) or `git log` to restore it.

## Notes

- The redirect is **permanent (308)** and browsers cache it aggressively. If you
  ever need to serve real content from this domain again, change the redirect to
  `permanent: false` first and allow time for caches to expire.
- The Vercel project's Framework Preset must stay **Next.js**.
