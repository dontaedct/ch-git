export function wrapHtml(inner: string) {
  return `<!doctype html><meta charset="utf-8" />
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;padding:16px">
    ${inner}
    <hr style="margin-top:16px;border:none;border-top:1px solid #eee"/>
    <p style="color:#666;font-size:12px">This is a transactional message from Your Micro App.</p>
  </div>`
}

