Guard middleware for role-based pages

This project uses a global middleware that inspects a page's layout meta and enforces role-based access only for pages that explicitly set that meta. The middleware file is `middleware/layoutGuard.global.ts`.

How it works

- Pages that should be restricted set a layout meta naming the role, e.g. `definePageMeta({ layout: 'quiz-master' })` or `definePageMeta({ layout: 'quizee' })`.
- The global middleware checks `to.meta.layout`, ensures the user is loaded via the existing Pinia `useAuthStore`, and compares the user's role to the required layout role.
- If the user is not authenticated it redirects to `/login?next=...` so the login page can return them.
- If the user is authenticated but has the wrong role it redirects to `/login?next=...` so they can sign in with the correct role or re-authenticate.

Examples

- Protect a quiz-master page (global middleware will run automatically when layout is present):

	<script setup>
	definePageMeta({ layout: 'quiz-master' })
	</script>

- Protect a quizee-only page:

	<script setup>
	definePageMeta({ layout: 'quizee' })
	</script>

Customising

- Role names map in `middleware/layoutGuard.global.ts` with `layoutRoleMap`. Add other mappings there if you use different layout keys.
- If you use a different auth mechanism (for example Nuxt Auth module), replace `useAuthStore()` usage with your auth API. The middleware expects to be able to:
	- detect whether the user is authenticated
	- obtain the user's role (string)
	- optionally fetch the user when a token exists but the user is not loaded

Edge cases & notes

- Admins are allowed to access any frontend page by default.
- The middleware attempts a `fetchUser()` when a token exists in `localStorage` but the Pinia store hasn't been populated yet; adjust to your auth storage if tokens are stored elsewhere (cookies, secure storage).
- Because the middleware is global it will run for every navigation, but it quickly returns for pages that don't set `meta.layout`, so public pages aren't affected.

Files added/changed

- `middleware/layoutGuard.global.ts` — role-based guard implementation
- (role-mismatch now redirects to the login page)
- `docs/guards.md` — this document

Testing

1. Start the dev server (nuxt dev) and open in browser.
2. Visit a page with `layout: 'quiz-master'` while logged out — you should be redirected to `/login`.
3. Login as a `quizee` user and visit the same page — when the middleware detects a role mismatch you'll be redirected to `/login?next=...` so you can sign in with a different account.
4. Login as a `quiz-master` user — you should be allowed.

If you want, I can run the dev server and verify redirects locally. If so, tell me which user credentials to use for test logins or whether I should mock the auth store.

