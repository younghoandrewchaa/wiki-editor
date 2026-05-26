import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"

import { FrontmatterNode } from "./frontmatter-node"

export const Frontmatter = Node.create({
  name: "frontmatter",
  group: "block",
  content: "text*",
  code: true,
  defining: true,
  isolating: true,

  renderMarkdown(node: { textContent: string }, helpers: { renderChildren: (nodes: unknown) => string }) {
    void helpers
    return `---\n${node.textContent}\n---`
  },

  parseHTML() {
    return [{ tag: 'pre[data-type="frontmatter"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes, { "data-type": "frontmatter" }),
      ["code", 0],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FrontmatterNode)
  },
})

export default Frontmatter
