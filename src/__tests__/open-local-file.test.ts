import { describe, it, expect } from 'vitest'
import {
  isLocalMarkdownLink,
  resolveLocalMarkdownPath,
} from '../lib/local-markdown-link'

describe('isLocalMarkdownLink', () => {
  it('returns true for relative .md paths', () => {
    expect(isLocalMarkdownLink('./foo.md')).toBe(true)
    expect(isLocalMarkdownLink('foo.md')).toBe(true)
    expect(isLocalMarkdownLink('../other/bar.md')).toBe(true)
  })

  it('returns true for .markdown extension', () => {
    expect(isLocalMarkdownLink('./foo.markdown')).toBe(true)
  })

  it('returns true for absolute paths starting with /', () => {
    expect(isLocalMarkdownLink('/docs/foo.md')).toBe(true)
  })

  it('returns false for http/https URLs', () => {
    expect(isLocalMarkdownLink('https://example.com/foo.md')).toBe(false)
    expect(isLocalMarkdownLink('http://example.com/page.md')).toBe(false)
  })

  it('returns false for non-markdown files', () => {
    expect(isLocalMarkdownLink('./foo.txt')).toBe(false)
    expect(isLocalMarkdownLink('./image.png')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isLocalMarkdownLink('')).toBe(false)
  })

  it('returns false for bare external URLs without extension', () => {
    expect(isLocalMarkdownLink('https://example.com')).toBe(false)
  })
})

describe('resolveLocalMarkdownPath', () => {
  const currentFile = '/Users/alice/wiki/google-adk.md'

  it('resolves a relative ./path relative to current file directory', () => {
    expect(resolveLocalMarkdownPath('./agn-service.md', currentFile)).toBe(
      '/Users/alice/wiki/agn-service.md'
    )
  })

  it('resolves a bare relative path without ./', () => {
    expect(resolveLocalMarkdownPath('agn-service.md', currentFile)).toBe(
      '/Users/alice/wiki/agn-service.md'
    )
  })

  it('resolves ../ paths correctly', () => {
    expect(resolveLocalMarkdownPath('../other/doc.md', currentFile)).toBe(
      '/Users/alice/other/doc.md'
    )
  })

  it('returns absolute path unchanged', () => {
    expect(resolveLocalMarkdownPath('/docs/foo.md', currentFile)).toBe('/docs/foo.md')
  })

  it('returns the url as-is when currentFilePath is null', () => {
    expect(resolveLocalMarkdownPath('./foo.md', null)).toBe('./foo.md')
  })

  it('handles deeply nested relative paths', () => {
    const deep = '/Users/alice/wiki/sub/dir/file.md'
    expect(resolveLocalMarkdownPath('../../top.md', deep)).toBe(
      '/Users/alice/wiki/top.md'
    )
  })
})
