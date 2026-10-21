# Full-page layout and navigation changes

User priority: layout and navigation; use the whole browser page.

- Keep the existing slate/teal visual direction; raise navigation, form and table text to practical reading sizes. Base palette: ink #213543, slate #172e3c, teal #147968, white #ffffff, canvas #f6f8fa, amber #a67520. Use the installed Segoe UI family without a remote font dependency.
- Remove the content maximum-width constraint. Desktop sidebar remains a stable 240px navigation rail; the rest of the viewport belongs to the selected workspace.
- Add a dedicated Opportunities route. Make navigation semantic links with current-page state and support for Ctrl/Cmd-click. Preserve filter URLs and browser history.
- Place the opportunity queue immediately after the compact overview panels; put the historical chart below the working list.
- Replace the investigation overlay with a full-page investigation inside the application shell, with a back link and URL-backed tabs. Only source inspection, action review and scenario comparison remain dialogs.
- Mobile navigation uses a dismissible drawer and backdrop, closes after navigation, supports Escape, and exposes expanded state. Avoid hidden sidebar slivers and page-level overflow.
- Add a skip link, visible compound-input focus, overscroll containment and a live status region. Live analysis status, model, citations and token usage remain in the full-page investigation.
- Verify desktop/full-width behavior, mobile navigation, deep links, browser Back and the existing central investigation flow.

References: frontend-design skill and current Vercel Web Interface Guidelines.
