import { AgentTaskInput, AgentTaskResult, GeneratedArtifacts } from '../../types/orchestration';

function updateDocsWithChangelog(artifacts: GeneratedArtifacts, message: string): GeneratedArtifacts {
  const docs = artifacts.docs ? { ...artifacts.docs } : { readme: '', apiDocs: '', architecture: '' };
  docs.readme += `\n\n## Changelog\n- ${new Date().toISOString()}: ${message}`;
  return { ...artifacts, docs };
}

export class Agents {
  static async bugfix(input: AgentTaskInput): Promise<AgentTaskResult> {
    const updated = updateDocsWithChangelog(input.artifacts, `Applied bugfix on ${input.target}: ${input.issue ?? 'N/A'}`);
    return { updatedArtifacts: updated, summary: 'Bugfix applied deterministically (stub).' };
  }

  static async performance(input: AgentTaskInput): Promise<AgentTaskResult> {
    const updated = updateDocsWithChangelog(input.artifacts, `Perf tuning on ${input.target}: ${input.issue ?? 'N/A'}`);
    return { updatedArtifacts: updated, summary: 'Performance improvements applied (stub).' };
  }

  static async style(input: AgentTaskInput): Promise<AgentTaskResult> {
    const updated = updateDocsWithChangelog(input.artifacts, `Style polish on ${input.target}: ${input.issue ?? 'N/A'}`);
    return { updatedArtifacts: updated, summary: 'Style polish applied (stub).' };
  }
}
