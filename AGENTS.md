<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Editorial sections/subsections are defined only in src/lib/sections.ts — one source for menu, routes and admin.
- Article body is a JSON array of typed blocks (src/lib/articles.ts `Block`) so editors can place media anywhere without code.
- Uploaded media lives in a private bucket and is referenced by long-lived signed URLs, because public buckets are blocked in this workspace.
- Staff access is via user_roles + is_staff(); the first account created becomes admin.
