export function explainCompatibility(reason: string, zh = false): string {
  const labels = (reason || '').split('+').flatMap(part => {
    const framework = /^shared_fw\(([^)]+)\)$/.exec(part);
    if (framework) return [zh ? `共用框架：${framework[1]}` : `Shared framework: ${framework[1]}`];
    if (part === 'same_lang') return [zh ? '相同程式語言' : 'Same language'];
    if (part === 'shared_platform') return [zh ? '共用執行平台' : 'Shared platform'];
    if (part === 'complementary') return [zh ? '功能互補' : 'Complementary features'];
    return [];
  });
  return [...new Set(labels)].join(' · ') || (zh ? '依專案資訊估算的相關推薦' : 'Related by automated metadata analysis');
}
