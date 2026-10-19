import { isValidRepoFullName, getInstallCommands } from "../utils/installation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { Skill } from "../types/skill";

interface Props {
  skill: Skill;
}

export function InstallCommand({ skill }: Props) {
  const { lang } = useI18n();
  const isZh = lang === "zh";

  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const isValid = isValidRepoFullName(skill.repo_full_name);
  const repoName = isValid ? skill.repo_full_name : "";
  const cloneCommand = getInstallCommands(skill)[0]?.command || "";
  const readmeUrl = isValid ? `https://github.com/${repoName}#readme` : "";

  const handleCopy = async () => {
    if (!cloneCommand) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let success = false;
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(cloneCommand);
        success = true;
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch {
      let textarea: HTMLTextAreaElement | null = null;
      try {
        textarea = document.createElement("textarea");
        textarea.value = cloneCommand;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
      } catch {
        success = false;
      } finally {
        if (textarea && textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
      }
    }

    setCopyStatus(success ? "success" : "error");
    timerRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
      timerRef.current = null;
    }, 2500);
  };

  if (!isValid) {
    return (
      <div className="w-full p-4 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg-elevated)] text-[var(--ps-text-secondary)] text-sm">
        {isZh ? "未提供有效的仓库路径。" : "No valid repository path provided."}
      </div>
    );
  }

  return (
    <div className="w-full mt-6 pt-5 border-t border-[var(--ps-border)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ps-text-muted)]">
          {isZh ? "获取源码 (Git Clone)" : "Source Code (Git Clone)"}
        </span>
        <a
          href={readmeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--ps-neon-cyan)] hover:underline"
        >
          <span>{isZh ? "官方文档与指引" : "Official Guide"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="flex items-center min-w-0 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg-elevated)] p-1.5 focus-within:border-[var(--ps-border-glow)] transition-colors">
        <span className="pl-2.5 pr-2 select-none text-xs font-mono text-[var(--ps-neon-cyan)] opacity-75">
          $
        </span>
        <div className="flex-1 min-w-0 overflow-x-auto py-1 scrollbar-thin">
          <code className="font-mono text-xs sm:text-sm whitespace-nowrap text-[var(--ps-text-primary)] select-all">
            {cloneCommand}
          </code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 h-8 px-3 min-w-[70px] flex items-center justify-center gap-1.5 rounded-md border border-[var(--ps-border)] bg-[var(--ps-bg-surface)] text-xs font-medium text-[var(--ps-text-secondary)] hover:text-[var(--ps-neon-cyan)] hover:border-[var(--ps-border-glow)] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--ps-neon-cyan)]"
          aria-label={isZh ? "复制克隆命令" : "Copy clone command"}
          title={isZh ? "复制克隆命令" : "Copy clone command"}
        >
          {copyStatus === "success" ? (
            <>
              <svg className="w-3.5 h-3.5 text-[var(--ps-neon-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[var(--ps-neon-green)]">{isZh ? "已复制" : "Copied"}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{isZh ? "复制" : "Copy"}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--ps-text-muted)] mt-1.5">
        <span>
          {isZh
            ? "克隆命令仅下载源代码，依赖配置请以官方 README 为准"
            : "Cloning only downloads source code; check README for requirements"}
        </span>
        {copyStatus === "error" && (
          <span className="text-red-400 font-medium">
            {isZh ? "复制失败，请手动选取" : "Copy failed"}
          </span>
        )}
      </div>
    </div>
  );
}
