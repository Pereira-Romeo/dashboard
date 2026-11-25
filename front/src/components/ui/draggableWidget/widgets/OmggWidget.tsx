export function OmggWidget() {
  const url = "https://omgg.fr/fr";

  return (
    <>
      <iframe
        src={url}
        className="widget-preview"
        title="OMGG"
      />

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="widget-preview-overlay"
      />
    </>
  );
}