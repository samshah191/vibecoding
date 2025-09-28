"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactGenerators = void 0;
function file(path, content) { return { path, content }; }
class ArtifactGenerators {
    static codeBundle(input) {
        const ext = input.language === 'TypeScript' ? 'tsx' : 'jsx';
        const nameSlug = input.name.toLowerCase().replace(/\s+/g, '-');
        const files = [
            file(`src/App.${ext}`, `import React, { useEffect } from 'react';\nimport { FeatureFlagProvider, useFeatureFlag } from './lib/featureFlags';\nimport { I18nProvider, useT } from './i18n';\nimport { initAnalytics, trackPageview } from './lib/analytics';\nimport LanguageSwitcher from './components/LanguageSwitcher';\nimport Onboarding from './components/Onboarding';\nimport PricingPlans from './components/PricingPlans';\nimport AccessibilityScanner from './components/AccessibilityScanner';\n\nfunction Root(){\n  useEffect(()=>{ initAnalytics({ app: '${nameSlug}' }); trackPageview('/'); },[]);\n  const t = useT();\n  const hasPro = useFeatureFlag('pro');\n  return (\n    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>\n      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>\n        <h1>${input.name}</h1>\n        <LanguageSwitcher/>\n      </header>\n      <p>{t('welcome')}</p>\n      <Onboarding/>\n      <PricingPlans/>\n      {hasPro ? <div style={{marginTop:16,padding:12,border:'1px solid #ddd'}}>Pro feature area</div> : <div style={{marginTop:16}}>Upgrade to Pro to unlock more features.</div>}\n      <div style={{marginTop:24}}><AccessibilityScanner/></div>\n    </div>\n  );\n}\n\nexport default function App(){\n  return (\n    <FeatureFlagProvider flags={{ pro: false, beta: true }}>\n      <I18nProvider defaultLocale="en">\n        <Root/>\n      </I18nProvider>\n    </FeatureFlagProvider>\n  );\n}`),
            file('src/lib/featureFlags.ts', `import React, { createContext, useContext, useMemo } from 'react';\nexport type Flags = Record<string, boolean>;\nconst Ctx = createContext<Flags>({});\nexport function FeatureFlagProvider({ flags, children }: { flags: Flags; children: React.ReactNode }){\n  const value = useMemo(()=>flags,[flags]);\n  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;\n}\nexport function useFeatureFlag(flag: string){ const flags = useContext(Ctx); return !!flags[flag]; }\nexport function Gate({ flag, children }: { flag: string; children: React.ReactNode }){ return useFeatureFlag(flag) ? <>{children}</> : null; }`),
            file('src/lib/analytics.ts', `type Cfg = { app: string };\nlet cfg: Cfg | null = null;\nconst q: any[] = [];\nexport function initAnalytics(c: Cfg){ cfg = c; }\nfunction emit(type: string, payload: any){ q.push({ ts: Date.now(), type, payload }); if (q.length > 500) q.shift(); if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', type, payload); }\nexport function trackEvent(name: string, props?: Record<string, any>){ emit('event', { app: cfg?.app, name, props }); }\nexport function trackPageview(path: string){ emit('pageview', { app: cfg?.app, path }); }\nexport function getQueue(){ return q.slice(); }`),
            file('src/i18n/index.ts', `import React, { createContext, useContext, useMemo, useState } from 'react';\nimport en from './locales/en.json';\nimport es from './locales/es.json';\nconst resources: Record<string, Record<string, string>> = { en, es };\ninterface Ctx { locale: string; t: (k: string) => string; setLocale: (l: string)=>void }\nconst I18nCtx = createContext<Ctx>({ locale: 'en', t: (k)=>k, setLocale: ()=>{} });\nexport function I18nProvider({ defaultLocale='en', children }:{ defaultLocale?: string; children: React.ReactNode }){\n  const [locale, setLocale] = useState(defaultLocale);\n  const t = (k: string) => (resources[locale] && resources[locale][k]) || k;\n  const value = useMemo(()=>({ locale, t, setLocale }),[locale]);\n  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;\n}\nexport function useI18n(){ return useContext(I18nCtx); }\nexport function useT(){ return useI18n().t; }`),
            file('src/i18n/locales/en.json', JSON.stringify({ welcome: 'Welcome to the app!', getStarted: 'Get Started', next: 'Next', previous: 'Previous', finish: 'Finish', basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise', selectPlan: 'Select Plan', users: 'Users', language: 'Language' }, null, 2)),
            file('src/i18n/locales/es.json', JSON.stringify({ welcome: '¡Bienvenido a la aplicación!', getStarted: 'Comenzar', next: 'Siguiente', previous: 'Anterior', finish: 'Finalizar', basic: 'Básico', pro: 'Pro', enterprise: 'Empresarial', selectPlan: 'Seleccionar Plan', users: 'Usuarios', language: 'Idioma' }, null, 2)),
            file(`src/components/LanguageSwitcher.${ext}`, `import React from 'react';\nimport { useI18n } from '../i18n';\nexport default function LanguageSwitcher(){\n  const { locale, setLocale } = useI18n();\n  return (<label style={{display:'inline-flex', gap:8, alignItems:'center'}}>\n    <span>🌐</span>\n    <select value={locale} onChange={e=>setLocale(e.target.value)}>\n      <option value="en">EN</option>\n      <option value="es">ES</option>\n    </select>\n  </label>);\n}`),
            file(`src/components/Onboarding.${ext}`, `import React, { useState } from 'react';\nimport { useT } from '../i18n';\nexport default function Onboarding(){\n  const t = useT();\n  const [step,setStep] = useState(0);\n  const steps = [t('getStarted'),'Profile','Preferences'];\n  return (<div style={{border:'1px solid #eee', padding:12, marginTop:12}}>\n    <h3>Onboarding</h3>\n    <p>Step {step+1} / {steps.length}: {steps[step]}</p>\n    <div style={{display:'flex', gap:8}}>{step>0 && <button onClick={()=>setStep(step-1)}>{t('previous')}</button>}<button onClick={()=>setStep(Math.min(step+1, steps.length-1))}>{step===steps.length-1?t('finish'):t('next')}</button></div>\n  </div>);\n}`),
            file(`src/components/PricingPlans.${ext}`, `import React from 'react';\nimport { useT } from '../i18n';\nexport default function PricingPlans(){\n  const t = useT();\n  const plans = [{key:'basic', price:'$0', features:['Community']},{key:'pro', price:'$12', features:['Pro features','Priority support']},{key:'enterprise', price:'$99', features:['SLA','SSO']}];\n  return (<div style={{marginTop:12}}>\n    <h3>Plans</h3>\n    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:12}}>{plans.map(p=>\n      <div key={p.key} style={{border:'1px solid #eee', padding:12}}><strong>{t(p.key)}</strong><div>{p.price}</div><ul>{p.features.map(f=> <li key={f}>{f}</li>)}</ul><button>{t('selectPlan')}</button></div>)}\n    </div>\n  </div>);\n}`),
            file(`src/components/UserManagement.${ext}`, `import React from 'react';\nexport default function UserManagement(){\n  const users = [{id:'1', email:'user@example.com', role:'owner'}];\n  return (<div style={{marginTop:12}}>\n    <h3>User Management</h3>\n    <table><thead><tr><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(u=> <tr key={u.id}><td>{u.email}</td><td>{u.role}</td></tr>)}</tbody></table>\n  </div>);\n}`),
            file(`src/components/AccessibilityScanner.${ext}`, `import React, { useState } from 'react';\ninterface Issue { type: string; selector: string; note: string }\nfunction scan(): Issue[]{\n  const issues: Issue[] = [];\n  document.querySelectorAll('img').forEach((el)=>{ if(!el.getAttribute('alt')) issues.push({ type:'image-alt', selector:'img', note:'Image missing alt' }); });\n  document.querySelectorAll('a').forEach((el)=>{ const href = el.getAttribute('href'); if(href === '#' && !el.getAttribute('aria-label')) issues.push({ type:'link-aria', selector:'a', note:'Link missing accessible name' }); });\n  return issues;\n}\nexport default function AccessibilityScanner(){\n  const [issues,setIssues] = useState<Issue[]>([]);\n  return (<div>\n    <button onClick={()=>setIssues(scan())}>Run Accessibility Scan</button>\n    {issues.length>0 && <div style={{marginTop:8}}><strong>{issues.length} issue(s) found:</strong><ul>{issues.map((i,idx)=><li key={idx}>[{i.type}] {i.note} ({i.selector})</li>)}</ul></div>}\n  </div>);\n}`),
            file('package.json', JSON.stringify({ name: nameSlug, version: '1.0.0', private: true }, null, 2)),
            // Minimal backend scaffold (deterministic)
            file('server/package.json', JSON.stringify({
                name: 'backend',
                version: '1.0.0',
                private: true,
                type: 'module',
                scripts: { dev: 'ts-node src/index.ts', build: 'tsc', start: 'node dist/index.js' },
                dependencies: { express: '^4.18.2' },
                devDependencies: { 'ts-node': '^10.9.2', typescript: '^5.4.0' }
            }, null, 2)),
            file('server/tsconfig.json', JSON.stringify({
                compilerOptions: {
                    target: 'ES2020',
                    module: 'ES2020',
                    moduleResolution: 'Node',
                    outDir: 'dist',
                    esModuleInterop: true,
                    strict: true,
                    skipLibCheck: true
                },
                include: ['src']
            }, null, 2)),
            file('server/src/index.ts', `import express from 'express';\nconst app = express();\napp.use(express.json());\napp.get('/health', (_req, res) => res.json({ ok: true }));\nconst port = process.env.PORT ? Number(process.env.PORT) : 8080;\napp.listen(port, () => {\n  console.log('Backend listening on port ' + port);\n});`)
        ];
        const tests = [
            file(`tests/smoke.test.${input.language === 'TypeScript' ? 'ts' : 'js'}`, `describe('smoke',()=>{ it('runs',()=>{ expect(1+1).toBe(2); }); });`)
        ];
        return { name: input.name, files, tests };
    }
    static db(description) {
        const schema = `// Prisma schema for ${description}\nmodel User {\n  id String @id @default(cuid())\n  email String @unique\n  createdAt DateTime @default(now())\n}`;
        const migrations = [file('migrations/0001_init.sql', '-- create tables; deterministic stub')];
        return { schema, migrations };
    }
    static infra(name) {
        const dockerfiles = [file('Dockerfile', 'FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nCMD ["npm","start"]')];
        const ci = [file('.github/workflows/ci.yml', 'name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 18\n      - run: npm ci')];
        const terraform = [
            file('infra/terraform/provider.tf', `terraform {\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "~> 5.0" }\n  }\n  required_version = ">= 1.5.0"\n}\n\nprovider "aws" {\n  region = var.region\n}`),
            file('infra/terraform/variables.tf', `variable "region" {\n  type    = string\n  default = "us-east-1"\n}\n\nvariable "project" {\n  type = string\n}`),
            file('infra/terraform/main.tf', `resource "aws_s3_bucket" "artifacts" {\n  bucket = "${name.toLowerCase().replace(/\s+/g, '-')}-artifacts"\n}`),
            file('infra/terraform/outputs.tf', `output "bucket" {\n  value = aws_s3_bucket.artifacts.id\n}`)
        ];
        return { dockerfiles, ci, terraform };
    }
    static docs(name, description) {
        const readme = `# ${name}\n\n${description}\n\n## Getting Started\n\n- npm install\n- npm run dev\n\n## Feature Flags\n\n- Provider: src/lib/featureFlags.ts\n- Usage: Gate components with <Gate flag=\"pro\"/> or useFeatureFlag('pro')\n\n## Analytics SDK\n\n- Initialize in App: initAnalytics({ app: '${name.toLowerCase().replace(/\s+/g, '-')}' })\n- Track events: trackEvent('signup', { plan: 'pro' })\n- Inspect queue (dev): getQueue()\n\n## i18n\n\n- Provider: src/i18n/index.ts\n- Locales: src/i18n/locales/*.json\n- Switcher: <LanguageSwitcher/>\n\n## Accessibility\n\n- Run scanner component: <AccessibilityScanner/>\n- Extend scan() for more rules\n`;
        const apiDocs = '## API\n\n- GET /health';
        const architecture = '```mermaid\nflowchart TD; User-->UI; UI-->API; API-->DB;\n```';
        return { readme, apiDocs, architecture };
    }
    static bundleAll(input) {
        return {
            code: this.codeBundle(input),
            db: this.db(input.description),
            infra: this.infra(input.name),
            docs: this.docs(input.name, input.description)
        };
    }
}
exports.ArtifactGenerators = ArtifactGenerators;
//# sourceMappingURL=artifactGenerators.js.map