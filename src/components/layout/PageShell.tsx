interface PageShellProps {
  label?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function PageShell({ label, title, description, children, wide }: PageShellProps) {
  return (
    <div className={wide ? "page-internal-wide" : "page-internal"}>
      {label && <p className="label mb-3 text-[#7c6aef]">{label}</p>}
      {title && <h1 className="title-page-internal">{title}</h1>}
      {description && (
        <p className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-[#8A8A8A]">
          {description}
        </p>
      )}
      <div className={title || description ? "mt-12" : ""}>{children}</div>
    </div>
  );
}
