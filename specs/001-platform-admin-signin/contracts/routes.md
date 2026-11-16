# Contract: Routes

| Route | Access | Rendering | Behavior |
|---|---|---|---|
| `/` | public | server | Static "coming soon" placeholder; no sign-in link; indexable |
| `/sign-in` | public | client widget | Google sign-in only; sign-up not offered |
| `/admin` and `/admin/*` | administrator | client | Signed-out: redirect to `/sign-in`. Signed-in non-admin: access-denied view. Administrator: admin shell with placeholder dashboard |
| `/robots.txt` | public | generated | Disallows `/admin` |

## Admin shell requirements

- Sidebar (sidebar tokens; active item deep-blue background), signed-in user indicator, sign-out control, placeholder dashboard card.
- Session end or sign-out redirects straight to `/sign-in`.
- Responsive: sidebar collapses on small screens; no horizontal scroll at phone width; 40px minimum touch targets; visible focus ring.
- Admin pages emit `noindex, nofollow`.
