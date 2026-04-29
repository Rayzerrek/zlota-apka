import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

export function ScanResult({ text }: Props) {
  return (
    <div className="enter enter-d1 bg-paper-2 border border-rule rounded-sm p-6">
      <p className="mono text-[11px] uppercase font-bold text-amber mb-4 tracking-widest">
        Twoja Notatka
      </p>
      <div className="text-ink text-[17px] leading-relaxed prose prose-amber max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
