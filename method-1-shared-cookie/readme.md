method-1-shared-cookie/README.md
markdown
# Method 1: Shared Domain Cookie (Frontend Approach)

## 🧠 How It Works
Both applications run on subdomains of the same parent domain.
When a user logs in on `app1.localtest.com`, a cookie is set on
`.localtest.com` (parent domain). Since `app2.localtest.com` is under
the same parent domain, the browser automatically sends this cookie
to app2 as well.

## Flow Diagram
User → app1.localtest.com (Login)
→ Cookie set on ".localtest.com"
→ Navigate to app2.localtest.com
→ Browser sends same cookie automatically
→ app2 reads cookie → User is logged in!

text

## ✅ Pros
- **Simplest implementation** - minimal code required
- **No backend coordination needed** between apps
- **Automatic** - browser handles cookie sharing natively
- **Fast** - no extra network requests for SSO
- **Stateless** - JWT in cookie, no session store needed
- **Works with any frontend framework** (React, Vue, Angular, vanilla)

## ❌ Cons
- **Only works on same parent domain** (app1.example.com + app2.example.com)
- **Does NOT work across different domains** (siteA.com + siteB.com)
- **Cookie size limit** (~4KB) limits token payload
- **Shared secret** - both apps need same JWT secret for verification
- **Security risk** - if one subdomain is compromised, all are affected
- **Cookie settings must match** across all subdomains
- **No single logout** by default (need extra implementation)

## When to Use
- Multiple apps under same company domain
- Microservices behind same domain with different subdomains
- Simple projects where all apps are controlled by same team

## When NOT to Use
- Apps on completely different domains
- Apps owned by different organizations
- High-security applications

## Setup & Run

```bash
cd method-1-shared-cookie
npm install

# Terminal 1
node server-app1.js
# Running on http://app1.localtest.com:3001

# Terminal 2
node server-app2.js
# Running on http://app2.localtest.com:3002
Test Flow
