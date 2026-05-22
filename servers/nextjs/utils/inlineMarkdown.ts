/**
 * Convert inline markdown (bold/italic) to HTML.
 * Used in slide templates where text fields may contain **bold** or _italic_ syntax.
 */
export function inlineMarkdownToHtml(text: string): string {
    return text
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/_(.+?)_/g, "<em>$1</em>");
}
