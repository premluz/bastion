function save(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  save(dataUrl, filename);
}

export function downloadText(text: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  save(url, filename);
  // Revoke after the click has been handled, so the download can start.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportName(parts: readonly string[], extension: string): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `${['bastion', ...parts, stamp].join('-')}.${extension}`;
}
