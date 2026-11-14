import { CanvasContentData } from '../../../services/api';
import { CANVAS_BLOCK_DEFINITIONS } from '../constants/blockDefinitions';

export const formatCanvasAsMarkdown = (title: string, canvas?: CanvasContentData): string => {
  const lines: string[] = [
    `# ${title} — Business Model Canvas`,
    `*Lean Startup Methodology Visualization*`,
    '',
  ];

  for (const block of CANVAS_BLOCK_DEFINITIONS) {
    const text = canvas?.[block.key]?.trim() || 'Not specified';
    lines.push(`## ${block.index}. ${block.title} (${block.category})`);
    lines.push(text);
    lines.push('');
  }

  return lines.join('\n');
};
