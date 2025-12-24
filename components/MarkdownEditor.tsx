"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  name?: string;
  initialValue?: string;
  required?: boolean;
}

export default function MarkdownEditor({
  name = "content",
  initialValue = "",
  required = true,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Writing Area */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Content (Markdown) {required && <span className="text-red-400">*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
          rows={22}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          placeholder={`# Post Title

Start writing your content here...

## Subheading
- Bullet point
- Another item

\`\`\`javascript
console.log("Hello Markdown!");
\`\`\`

| Table | Example |
|------|---------|
| Cell | Another |`}
        />
        <p className="mt-2 text-xs text-gray-400">
          Full Markdown support: tables, code blocks, quotes, task lists, and more.
        </p>
      </div>

      {/* Live Preview */}
      <div>
        <label className="block text-sm font-medium mb-2">Live Preview</label>
        <div className="prose prose-invert lg:prose-lg max-w-none min-h-[620px] bg-gray-800 border border-gray-700 rounded-lg p-8 overflow-y-auto">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">
              The preview will appear here as you type...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}