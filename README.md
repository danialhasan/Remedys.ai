# Remedys.ai

AI consultancy landing page for operational intelligence and autonomous agents.

## Tech Stack

- **Static HTML** - Single page site with vanilla JavaScript
- **Tailwind CSS** - Utility-first CSS via CDN
- **PostHog** - Analytics and event tracking
- **Netlify** - Hosting and deployment

## Development

### Local Development

Start a local dev server with auto-refresh:

```bash
npx serve -l 3000 .
```

The site will be available at `http://localhost:3000`

### Project Structure

```
Remedys.ai/
├── index.html      # Main landing page
├── netlify.toml    # Netlify configuration
└── README.md       # This file
```

### Making Changes

1. Edit `index.html` directly
2. Changes auto-reload in browser
3. Test locally before deploying

## Deployment

### Production URL
https://remedys.ai

### Deploy Workflow

**Automatic (CI/CD):**
- Push to `main` branch on GitHub
- Netlify auto-deploys changes
- Typically takes 1-2 minutes

**Manual Deploy:**
```bash
npx netlify-cli deploy --prod --dir=.
```

### Netlify Configuration

The site is configured with:
- **Base directory:** `.` (root)
- **Build command:** None (static HTML)
- **Publish directory:** `.`
- **Auto-deploy:** ✅ Enabled on `main` branch

## Analytics

### PostHog Integration

- **Project:** Remedys.ai
- **API Key:** `phc_CEGE11ffVSoStkKyi3vngbXaQUo2Bpw1BEzGZ5AnTOf`
- **Dashboard:** https://us.posthog.com

**Events tracked:**
- Page views
- Button clicks (CTA, navigation)
- Form submissions
- Scroll depth

**Updating analytics:**
Changes to PostHog configuration require redeployment to take effect.

## Git Workflow

### Making Changes

```bash
# Make your changes to index.html
git add index.html
git commit -m "Description of changes"
git push origin main
```

### Deployment happens automatically after push

## Domain & DNS

- **Domain:** remedys.ai
- **DNS:** Managed by Netlify
- **SSL:** Auto-provisioned by Netlify

## Support

For issues or questions:
- Check Netlify build logs: https://app.netlify.com/sites/remedys-ai/deploys
- View PostHog dashboard for analytics
- GitHub repo: https://github.com/danialhasan/Remedys.ai
