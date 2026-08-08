import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitasi HTML tak tepercaya (mis. deskripsi produk dari seller marketplace)
 * sebelum dirender via dangerouslySetInnerHTML. Membuang <script>, handler
 * event (onerror/onclick), dan sink berbahaya lain — mencegah stored XSS.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
