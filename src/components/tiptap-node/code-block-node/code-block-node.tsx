import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react"

export function CodeBlockNode({
  node,
  updateAttributes,
  extension,
}: ReactNodeViewProps) {
  const defaultLanguage = node.attrs.language as string | null

  return (
    <NodeViewWrapper className="code-block">
      <select
        contentEditable={false}
        defaultValue={defaultLanguage ?? "null"}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {(extension.options.lowlight.listLanguages() as string[]).map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <NodeViewContent as={"code" as any} />
      </pre>
    </NodeViewWrapper>
  )
}
