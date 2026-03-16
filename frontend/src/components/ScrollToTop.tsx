import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer"
      style={{
        background: 'var(--ps-bg-elevated)',
        border: '1px solid var(--ps-border-glow)',
        color: 'var(--ps-neon-cyan)',
        boxShadow: 'var(--ps-shadow-glow)',
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
