import { ZodError, ZodIssue } from "zod";

export function zodResponse(error: ZodError) {
  return { error: error.issues.map((issue) => issue.message) };
}

export function zodIssueToString(issue: ZodIssue) {
  // Code borrowed from https://github.com/andrewvo89/zod-error/blob/main/src/utils/get-object-notation/index.ts
  // Licensed under MIT
  const components = [];
  components.push(
    issue.path.reduce<string>((str, key) => {
      if (typeof key === "number") {
        return `${str}[${key}]`;
      }

      return [str, key].filter((s) => typeof s === "number" || !!s).join(".");
    }, "")
  );

  return components.join(" ") + ": " + issue.message;
}
