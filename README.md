# Remedys.ai

AI consultancy website for practical AI consulting, education, and implementation.

## Tech Stack

- **Static HTML** - Multi-page site with clean URLs
- **Vanilla CSS + JavaScript** - Shared design system and interactions
- **PostHog** - Analytics and event tracking
- **Supabase REST endpoint** - Inquiry capture
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
├── index.html                # Homepage
├── consulting/index.html     # AI Consulting page
├── education/index.html      # AI Education page
├── implementation/index.html # AI Implementation page
├── get-started/index.html    # Inquiry form flow
├── assets/
│   ├── site.css              # Shared visual system
│   ├── site.js               # Shared interactions, analytics, form logic
│   └── favicon.svg           # Favicon
├── netlify.toml              # Netlify configuration
└── README.md                 # This file
```

### Making Changes

1. Edit the relevant page HTML or shared assets
2. Test locally before deploying
3. Push changes to GitHub or deploy manually

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
git add .
git commit -m "Description of changes"
git push origin <branch-name>
```

## Domain & DNS

- **Domain:** remedys.ai
- **DNS:** Managed by Netlify
- **SSL:** Auto-provisioned by Netlify

## Support

For issues or questions:
- Check Netlify build logs: https://app.netlify.com/sites/remedys-ai/deploys
- View PostHog dashboard for analytics
- GitHub repo: https://github.com/danialhasan/Remedys.ai
