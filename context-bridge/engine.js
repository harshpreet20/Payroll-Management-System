const TokenEngine = (() => {
  function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 3.8);
  }

  function extractSections(text) {
    const sections = {
      decisions: [],
      files: [],
      code: [],
      constraints: [],
      openItems: [],
      findings: [],
      raw: text,
    };

    const lines = text.split("\n");
    let currentSection = null;

    for (const line of lines) {
      const lower = line.toLowerCase().trim();

      if (lower.includes("decision") || lower.includes("decided")) {
        currentSection = "decisions";
      } else if (
        lower.match(/\.(js|ts|py|rs|go|html|css|md|json|yaml|toml)/) ||
        lower.includes("file:") ||
        lower.match(/[a-z]+\/[a-z]/)
      ) {
        sections.files.push(line.trim());
        continue;
      } else if (
        lower.startsWith("```") ||
        lower.startsWith("diff") ||
        lower.startsWith("+") ||
        lower.startsWith("-")
      ) {
        currentSection = "code";
      } else if (
        lower.includes("constraint") ||
        lower.includes("must") ||
        lower.includes("cannot")
      ) {
        currentSection = "constraints";
      } else if (
        lower.includes("todo") ||
        lower.includes("next") ||
        lower.includes("open") ||
        lower.includes("blocker")
      ) {
        currentSection = "openItems";
      } else if (
        lower.includes("found") ||
        lower.includes("discovered") ||
        lower.includes("learned")
      ) {
        currentSection = "findings";
      }

      if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    }

    return sections;
  }

  function compressSection(lines, level) {
    if (level <= 2) return lines;
    if (level === 3) return lines.slice(0, Math.ceil(lines.length * 0.7));
    if (level === 4) return lines.slice(0, Math.ceil(lines.length * 0.4));
    return lines.slice(0, Math.max(3, Math.ceil(lines.length * 0.2)));
  }

  function deduplicateLines(lines) {
    const seen = new Set();
    return lines.filter((line) => {
      const normalized = line.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  function collapseRepeatedPatterns(lines) {
    const patternCounts = {};
    const unique = [];

    for (const line of lines) {
      const pattern = line.replace(/\d+/g, "N").replace(/"[^"]+"/g, '"..."');
      if (patternCounts[pattern]) {
        patternCounts[pattern].count++;
      } else {
        patternCounts[pattern] = { count: 1, example: line };
        unique.push(line);
      }
    }

    return unique.map((line) => {
      const pattern = line.replace(/\d+/g, "N").replace(/"[^"]+"/g, '"..."');
      const info = patternCounts[pattern];
      if (info && info.count > 2) {
        return `${line} (${info.count} similar occurrences)`;
      }
      return line;
    });
  }

  function stripToolInvocations(text) {
    return text
      .replace(/^(Read|Write|Edit|Bash|Glob|Grep|Agent)\(.*?\)$/gm, "")
      .replace(/^<.*?>.*?<\/antml:.*?>$/gms, "")
      .replace(/\n{3,}/g, "\n\n");
  }

  function formatForTarget(sections, target, options) {
    const parts = [];

    switch (target) {
      case "codex":
        parts.push("# Context Handoff for Codex\n");
        parts.push(
          "> Compressed context from a prior session. Resume the task from Open Items.\n"
        );
        parts.push(
          "> Codex works best with explicit file paths and short imperative instructions.\n"
        );
        break;
      case "claude-code":
        parts.push("# Session Context (Optimized Handoff)\n");
        parts.push(
          "> Compressed from a previous Claude Code session. Resume from here.\n"
        );
        break;
      case "cursor":
        parts.push("# Project Context for Cursor\n");
        parts.push(
          "> Paste this into Cursor chat or .cursorrules for continuity.\n"
        );
        break;
      case "copilot":
        parts.push("# Context for Copilot Chat\n");
        break;
      case "chatgpt":
        parts.push("# Continuation Context\n");
        parts.push(
          "> This summarizes prior work. Continue from the Open Items section.\n"
        );
        break;
      default:
        parts.push("# Session Context\n");
    }

    if (options.keepDecisions && sections.decisions.length) {
      parts.push("\n## Decisions Made");
      sections.decisions.forEach((d) => parts.push(`- ${d}`));
    }

    if (options.keepFiles && sections.files.length) {
      parts.push("\n## Files Referenced");
      sections.files.forEach((f) => parts.push(`- \`${f}\``));
    }

    if (options.keepCode && sections.code.length) {
      parts.push("\n## Code Changes");
      parts.push("```");
      sections.code.forEach((c) => parts.push(c));
      parts.push("```");
    }

    if (options.keepConstraints && sections.constraints.length) {
      parts.push("\n## Constraints");
      sections.constraints.forEach((c) => parts.push(`- ${c}`));
    }

    if (options.keepOpenItems && sections.openItems.length) {
      parts.push("\n## Open Items / Next Steps");
      sections.openItems.forEach((o) => parts.push(`- [ ] ${o}`));
    }

    if (sections.findings.length) {
      parts.push("\n## Key Findings");
      sections.findings.forEach((f) => parts.push(`- ${f}`));
    }

    return parts.join("\n");
  }

  function optimize(text, options) {
    const {
      target = "codex",
      compressionLevel = 3,
      maxTokens = 2000,
      keepDecisions = true,
      keepFiles = true,
      keepCode = true,
      keepConstraints = true,
      keepOpenItems = true,
    } = options;

    const inputTokens = estimateTokens(text);
    let cleaned = stripToolInvocations(text);
    let sections = extractSections(cleaned);

    sections.decisions = deduplicateLines(
      compressSection(sections.decisions, compressionLevel)
    );
    sections.files = deduplicateLines(
      compressSection(sections.files, compressionLevel)
    );
    sections.code = compressSection(sections.code, compressionLevel);
    sections.constraints = deduplicateLines(
      compressSection(sections.constraints, compressionLevel)
    );
    sections.openItems = deduplicateLines(
      compressSection(sections.openItems, compressionLevel)
    );
    sections.findings = deduplicateLines(
      compressSection(sections.findings, compressionLevel)
    );

    sections.files = collapseRepeatedPatterns(sections.files);

    let output = formatForTarget(sections, target, {
      keepDecisions,
      keepFiles,
      keepCode,
      keepConstraints,
      keepOpenItems,
    });

    let outputTokens = estimateTokens(output);

    if (outputTokens > maxTokens && compressionLevel < 5) {
      const ratio = maxTokens / outputTokens;
      const truncateAt = Math.floor(output.length * ratio);
      output = output.slice(0, truncateAt) + "\n\n[...truncated to fit budget]";
      outputTokens = estimateTokens(output);
    }

    return {
      output,
      inputTokens,
      outputTokens,
      ratio: inputTokens > 0 ? (inputTokens / outputTokens).toFixed(1) : "0",
    };
  }

  return { optimize, estimateTokens };
})();

if (typeof module !== "undefined") module.exports = TokenEngine;
