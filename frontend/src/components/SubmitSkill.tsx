import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShieldCheck, Zap, Check } from "lucide-react";
import { CrayfishIcon } from "./icons/CrayfishIcon";
import { submitSkill } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { TransKey } from "../i18n/translations";

export function SubmitSkill() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <section className="mt-10 mb-4">
      <div className="ps-card p-5 sm:p-6">
        <SkillForm t={t} navigate={navigate} />
      </div>
    </section>
  );
}

/* ── Skill Submission Form ── */
function SkillForm({ t, navigate }: { t: (key: TransKey) => string; navigate: ReturnType<typeof useNavigate> }) {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string; skill_id?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitSkill(url.trim());
      setResult(res);
      if (res.status === "already_tracked" && res.skill_id) {
        setTimeout(() => navigate(`/skill/${res.skill_id}`), 1500);
      }
      if (res.status === "submitted") {
        setUrl("");
      }
    } catch (err: any) {
      setResult({ status: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <Plus className="w-5 h-5" style={{ color: 'var(--ps-neon-cyan)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--ps-text-primary)' }}>{t("submit.title")}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("submit.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setResult(null); }}
          placeholder="https://github.com/owner/repo"
          className="ps-input flex-1"
          aria-label="GitHub repository URL"
        />
        <button
          type="submit"
          disabled={!url.trim() || submitting}
          className="ps-btn ps-btn-primary shrink-0"
          style={{ fontSize: '14px' }}
        >
          {submitting && (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {t("submit.button")}
        </button>
      </form>

      {result && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${result.status === "submitted"
          ? "ps-badge-new"
          : result.status === "already_tracked"
            ? "ps-badge"
            : result.status === "already_submitted"
              ? "ps-badge-hot"
              : "ps-badge-pink"
          }`} style={{ display: 'block', borderRadius: 'var(--ps-radius-sm)' }}>
          {result.status === "submitted" && (
            <Check className="w-4 h-4 inline -mt-0.5 mr-1.5" />
          )}
          {result.message}
        </div>
      )}
    </>
  );
}

/* ── Master Application Form ── */
function MasterForm({ t }: { t: (key: TransKey) => string }) {
  const [github, setGithub] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [repoUrls, setRepoUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!github.trim() || !name.trim() || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const urls = repoUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await submitMasterApplication(github.trim(), name.trim(), bio.trim(), urls);
      setResult(res);
      if (res.status === "submitted") {
        setGithub("");
        setName("");
        setBio("");
        setRepoUrls("");
      }
    } catch (err: any) {
      setResult({ status: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: 'var(--ps-neon-purple)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--ps-text-primary)' }}>{t("submit.masterTitle")}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("submit.masterSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" value={github} onChange={(e) => { setGithub(e.target.value); setResult(null); }} placeholder={t("submit.masterGithub")} required className="ps-input" aria-label="GitHub username" />
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setResult(null); }} placeholder={t("submit.masterName")} required className="ps-input" aria-label="Display name" />
        </div>
        <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("submit.masterBio")} className="ps-input" aria-label="Bio" />
        <textarea value={repoUrls} onChange={(e) => setRepoUrls(e.target.value)} placeholder={t("submit.masterRepos")} rows={3} className="ps-input resize-none" aria-label="Repository URLs" />
        <button type="submit" disabled={!github.trim() || !name.trim() || submitting} className="ps-btn ps-btn-primary">
          {submitting ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
          ) : (
            <CrayfishIcon className="w-4 h-4 mr-1.5" />
          )}
          {t("submit.masterButton")}
        </button>
      </form>

      {result && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${result.status === "submitted" ? "ps-badge-new" : "ps-badge-pink"
          }`} style={{ display: 'block', borderRadius: 'var(--ps-radius-sm)' }}>
          {result.status === "submitted" && <Check className="w-4 h-4 inline -mt-0.5 mr-1.5" />}
          {result.message}
        </div>
      )}
    </>
  );
}

/* ── Workflow Submission Form ── */
interface WorkflowStep {
  name: string;
  slug: string;
  description: string;
}

function WorkflowForm({ t }: { t: (key: TransKey) => string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { name: "", slug: "", description: "" },
    { name: "", slug: "", description: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);

  const updateStep = (idx: number, field: keyof WorkflowStep, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addStep = () => {
    if (steps.length < 5) {
      setSteps((prev) => [...prev, { name: "", slug: "", description: "" }]);
    }
  };

  const removeStep = (idx: number) => {
    if (steps.length > 2) {
      setSteps((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    const validSteps = steps.filter((s) => s.name.trim() && s.slug.trim());
    if (validSteps.length < 2) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitWorkflow(name.trim(), description.trim(), validSteps);
      setResult(res);
      if (res.status === "submitted") {
        setName("");
        setDescription("");
        setSteps([
          { name: "", slug: "", description: "" },
          { name: "", slug: "", description: "" },
        ]);
      }
    } catch (err: any) {
      setResult({ status: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const validStepCount = steps.filter((s) => s.name.trim() && s.slug.trim()).length;

  return (
    <>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <Zap className="w-5 h-5" style={{ color: 'var(--ps-neon-purple)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--ps-text-primary)' }}>{t("submit.workflowTitle")}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("submit.workflowSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setResult(null); }} placeholder={t("submit.workflowName")} required className="ps-input" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("submit.workflowDesc")} className="ps-input" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: 'var(--ps-text-muted)' }}>{t("submit.workflowSteps")}</label>
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-2.5"
                style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--ps-neon-purple)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                {idx + 1}
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" value={step.name} onChange={(e) => updateStep(idx, "name", e.target.value)} placeholder={t("submit.workflowStepName")} className="ps-input" style={{ padding: '8px 12px' }} />
                <input type="text" value={step.slug} onChange={(e) => updateStep(idx, "slug", e.target.value)} placeholder="owner/repo" className="ps-input" style={{ padding: '8px 12px' }} />
                <input type="text" value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} placeholder={t("submit.workflowStepDesc")} className="ps-input" style={{ padding: '8px 12px' }} />
              </div>
              {steps.length > 2 && (
                <button type="button" onClick={() => removeStep(idx)} className="mt-2 transition-colors cursor-pointer" style={{ color: 'var(--ps-text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-pink)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              )}
            </div>
          ))}
          {steps.length < 5 && (
            <button type="button" onClick={addStep} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--ps-neon-purple)' }}>
              + {t("submit.workflowAddStep")}
            </button>
          )}
        </div>

        <button type="submit" disabled={!name.trim() || validStepCount < 2 || submitting} className="ps-btn ps-btn-primary">
          {submitting && (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {t("submit.workflowButton")}
        </button>
      </form>

      {result && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${result.status === "submitted" ? "ps-badge-new" : "ps-badge-pink"
          }`} style={{ display: 'block', borderRadius: 'var(--ps-radius-sm)' }}>
          {result.status === "submitted" && <Check className="w-4 h-4 inline -mt-0.5 mr-1.5" />}
          {result.message}
        </div>
      )}
    </>
  );
}
