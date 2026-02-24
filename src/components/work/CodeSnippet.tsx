interface CodeSnippetProps {
    label: string;
    code: string;
}

export function CodeSnippet({ label, code }: CodeSnippetProps) {
    return (
        <div className="bg-[#F5F5F3] p-6 rounded-sm border border-[#E5E5E5] font-mono text-sm overflow-x-auto">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#6F6F6F] select-none">
        // {label}
            </div>
            <pre className="text-[#111111]">
                <code>{code}</code>
            </pre>
        </div>
    );
}
