import type { Skill } from "../types/skill";

export function isValidRepoFullName(name?: string | null): boolean {
  if (!name || typeof name !== "string") return false;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(name)) return false;
  const [owner, repo] = name.split("/");
  if (!owner || !repo) return false;
  if (owner === "." || owner === ".." || repo === "." || repo === "..") return false;
  return true;
}

export function parsePlatforms(platforms: string): string[] {
  try {
    return JSON.parse(platforms || "[]");
  } catch {
    return [];
  }
}

export function getInstallCommands(skill: Skill): { label: string; command: string; primary?: boolean }[] {
  if (!isValidRepoFullName(skill.repo_full_name)) {
    return [];
  }
  return [
    {
      label: "Git Clone",
      command: `git clone https://github.com/${skill.repo_full_name}.git`,
      primary: true,
    },
  ];
}

