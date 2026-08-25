import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EmailInput = z.object({
  brief: z.string().min(1),
  tone: z.enum(["formal", "friendly", "persuasive"]),
  recipient: z.string().optional(),
  sender: z.string().optional(),
});

const NotesInput = z.object({
  transcript: z.string().min(1),
  title: z.string().optional(),
});

const PlanInput = z.object({
  actionItems: z.array(z.string()).min(1),
  busySlots: z.array(z.string()).default([]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { getAssistantModel } = await import("./ai-gateway.server");

    const schema = z.object({
      subjectOptions: z.array(z.string()),
      greeting: z.string(),
      body: z.array(z.string()),
      closing: z.string(),
      signOff: z.string(),
    });

    try {
      const result = streamText({
        model: getAssistantModel(),
        output: Output.object({ schema }),
        prompt: [
          `Write a professional email from this short brief: "${data.brief}".`,
          `Tone: ${data.tone}.`,
          data.recipient ? `Recipient: ${data.recipient}.` : "",
          data.sender ? `Sender name: ${data.sender}.` : "",
          "Give 3 short subject line options (max 70 characters each).",
          "greeting is one line. body is 2-4 short paragraphs of context and next steps.",
          "closing is one polite closing line. signOff is e.g. 'Warm regards,' plus the sender name on a new line.",
        ]
          .filter(Boolean)
          .join(" "),
      });
      const output = await result.output;
      return {
        ...output,
        subjectOptions: output.subjectOptions.slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The assistant returned an unexpected format. Try again.");
      }
      throw error;
    }
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { getAssistantModel } = await import("./ai-gateway.server");

    const schema = z.object({
      title: z.string(),
      summary: z.string(),
      decisions: z.array(z.string()),
      actionItems: z.array(
        z.object({
          task: z.string(),
          owner: z.string().nullable(),
          due: z.string().nullable(),
        }),
      ),
      deadlines: z.array(z.object({ what: z.string(), when: z.string() })),
    });

    try {
      const result = streamText({
        model: getAssistantModel(),
        output: Output.object({ schema }),
        prompt: [
          "Summarize this meeting transcript or notes for quick review.",
          data.title ? `Suggested title: ${data.title}.` : "Infer a short meeting title.",
          "summary is 1-2 sentences. decisions, actionItems and deadlines are concise bullet-ready strings.",
          "Use null for unknown owner or due date. Keep at most 6 items per list.",
          "---",
          data.transcript.slice(0, 24000),
        ].join("\n"),
      });
      const output = await result.output;
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The assistant returned an unexpected format. Try again.");
      }
      throw error;
    }
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { getAssistantModel } = await import("./ai-gateway.server");

    const schema = z.object({
      tasks: z.array(
        z.object({
          title: z.string(),
          category: z.enum(["work", "personal", "urgent"]),
          priority: z.enum(["low", "medium", "high"]),
          due: z.string().nullable(),
          suggestedSlot: z.string(),
          estimateMinutes: z.number(),
        }),
      ),
    });

    const today = new Date().toISOString().slice(0, 10);

    try {
      const result = streamText({
        model: getAssistantModel(),
        output: Output.object({ schema }),
        prompt: [
          `Today is ${today}. Turn these action items into schedulable tasks:`,
          ...data.actionItems.map((item, i) => `${i + 1}. ${item}`),
          data.busySlots.length
            ? `Calendar is already busy at: ${data.busySlots.join("; ")}. Avoid those windows.`
            : "Assume a normal 9:00-18:00 working day.",
          "due must be an ISO date (YYYY-MM-DD) or null. suggestedSlot is a short human time window like 'Tue 09:30-10:15'.",
          "estimateMinutes is a realistic whole number of minutes.",
        ].join("\n"),
      });
      const output = await result.output;
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The assistant returned an unexpected format. Try again.");
      }
      throw error;
    }
  });
