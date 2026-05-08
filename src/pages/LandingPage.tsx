import { useMemo } from "react";
import landingHtml from "../landing.html?raw";

function extractSection(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ?? "";
}

export function LandingPage() {
  const styleMarkup = useMemo(() => extractSection(landingHtml, "style"), []);
  const bodyMarkup = useMemo(() => extractSection(landingHtml, "body"), []);

  return (
    <>
      <style>{styleMarkup}</style>
      <div dangerouslySetInnerHTML={{ __html: bodyMarkup }} />
    </>
  );
}
