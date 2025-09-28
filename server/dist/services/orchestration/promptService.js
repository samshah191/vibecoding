"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptService = void 0;
function nowIso() { return new Date().toISOString(); }
function pickWeighted(items) {
    const total = items.reduce((s, it) => s + (it.weight ?? 1), 0);
    let r = Math.random() * total;
    for (const it of items) {
        r -= (it.weight ?? 1);
        if (r <= 0)
            return it;
    }
    return items[0];
}
class PromptService {
    constructor() {
        this.templates = new Map();
    }
    // Deterministic template storage in-memory. Can be swapped with DB later.
    upsertTemplate(tpl) {
        this.templates.set(tpl.name, tpl);
    }
    getTemplate(name) {
        return this.templates.get(name);
    }
    listTemplates() {
        return Array.from(this.templates.values());
    }
    render(name, env, placeholders) {
        const tpl = this.templates.get(name);
        if (!tpl)
            throw new Error(`Prompt template not found: ${name}`);
        // Latest version by semantic-ish order (fallback to last)
        const version = tpl.versions[tpl.versions.length - 1];
        const variant = pickWeighted(version.variants);
        let content = variant.content;
        // Apply env overrides
        const override = tpl.environmentOverrides?.find(o => o.env === env);
        if (override?.content)
            content = override.content;
        if (override?.merge) {
            for (const [k, v] of Object.entries(override.merge)) {
                content = content.split(`{{${k}}}`).join(v);
            }
        }
        // Apply placeholders
        if (placeholders) {
            for (const [k, v] of Object.entries(placeholders)) {
                content = content.split(`{{${k}}}`).join(v);
            }
        }
        return {
            name: tpl.name,
            version: version.version,
            variant: variant.id,
            env,
            content
        };
    }
    // Helper to seed some default templates for testing
    seedDefaults() {
        const base = {
            name: 'codegen.app',
            description: 'Frontend+Backend code generation',
            tags: ['codegen', 'app'],
            versions: [
                {
                    version: '1.0.0',
                    createdAt: nowIso(),
                    variants: [
                        { id: 'A', content: 'Generate app: name={{name}} desc={{description}}' },
                        { id: 'B', weight: 0.5, content: 'Build full stack app for: {{description}}' }
                    ]
                }
            ],
            environmentOverrides: [
                { env: 'dev', merge: { name: 'DevApp' } }
            ]
        };
        this.upsertTemplate(base);
    }
}
exports.PromptService = PromptService;
//# sourceMappingURL=promptService.js.map