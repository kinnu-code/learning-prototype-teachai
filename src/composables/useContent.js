import { marked } from 'marked'

/**
 * Parse the teachAI markdown format.
 * Frontmatter (---...---) is extracted for title + concepts.
 * <skim>...</skim> tags mark content visible in skim mode.
 */
export function parseContent(raw) {
  // Extract YAML frontmatter
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n/)
  let title = ''
  let concepts = []
  let body = raw

  if (frontmatterMatch) {
    const fm = frontmatterMatch[1]
    body = raw.slice(frontmatterMatch[0].length)

    const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (titleMatch) title = titleMatch[1]

    const conceptsMatch = fm.match(/^concepts:\s*\n((?:\s+-\s*.+\n?)+)/m)
    if (conceptsMatch) {
      concepts = conceptsMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s*-\s*/, '').replace(/["']/g, '').trim())
        .filter(Boolean)
    }
  }

  return { title, concepts, body }
}

/**
 * Render markdown body to HTML for full-read mode.
 * Strips <skim> tags (renders content normally).
 */
export function renderFullHtml(body) {
  const cleaned = body.replace(/<skim>([\s\S]*?)<\/skim>/g, '$1')
  return marked.parse(cleaned)
}

/**
 * Render markdown body to HTML for skim mode.
 * <skim>text</skim> tags become .skim-highlight spans.
 * Dimming of everything else is handled purely via CSS on .skim-content.
 */
export function renderSkimHtml(body) {
  const withSpans = body.replace(
    /<skim>([\s\S]*?)<\/skim>/g,
    '<span class="skim-highlight">$1</span>'
  )
  return marked.parse(withSpans)
}
