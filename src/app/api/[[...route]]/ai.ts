import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { fal } from "@/lib/fal";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const app = new Hono()
  .post(
    "/remove-bg",
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    async (c) => {
      const { image } = c.req.valid("json");

      const result = await fal.subscribe("fal-ai/birefnet", {
        input: {
          image_url: image,
        },
      }) as { image: { url: string } };

      return c.json({ data: result.image.url });
    },
  )
  .post(
    "/generate-image",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");

      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "landscape_16_9",
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
        },
      }) as { images: Array<{ url: string }> };

      return c.json({ data: result.images[0].url });
    },
  )
  .post(
    "/edit-canvas",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
        canvasJson: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    ),
    async (c) => {
      const { prompt, canvasJson, width, height } = c.req.valid("json");

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemPrompt = `You are an AI assistant that modifies Fabric.js canvas JSON based on user instructions.
You will receive the current canvas state as JSON and a user instruction.
Your task is to modify the JSON according to the instruction and return ONLY the modified JSON.

Canvas dimensions: ${width}px wide x ${height}px tall
Center of canvas: left=${width / 2}, top=${height / 2}

CRITICAL RULES:
1. Return ONLY valid JSON, no explanations or markdown
2. Preserve the overall structure of the canvas including "version" and "objects" array
3. ABSOLUTELY NEVER delete or modify the workspace object (the rect with "name": "clip"). This object defines the canvas boundaries and MUST remain unchanged with all its properties intact.
4. The workspace/clip object is usually the first object in the array - always keep it exactly as it is

Editing rules:
5. For text changes: modify the "text" property of textbox objects
6. For color changes: modify "fill" or "stroke" properties (use rgba format like "rgba(255,0,0,1)" or hex like "#ff0000")
7. For adding shapes: add new objects to the "objects" array AFTER the workspace/clip object
8. For moving objects: modify "left" and "top" properties
9. For resizing: modify "width", "height", "scaleX", "scaleY" properties
10. For deleting: remove objects from the array (but NEVER the clip object)
11. When positioning elements, use the canvas dimensions to place them correctly
12. "center" means left=${width / 2}, top=${height / 2}
13. When adding new objects, position them within the canvas bounds (0 to ${width} for left, 0 to ${height} for top)

Common Fabric.js object types:
- textbox: { type: "textbox", text: "...", left, top, fill, fontSize, fontFamily, width, height, ... }
- rect: { type: "rect", left, top, width, height, fill, stroke, strokeWidth, ... }
- circle: { type: "circle", left, top, radius, fill, stroke, strokeWidth, ... }
- triangle: { type: "triangle", left, top, width, height, fill, stroke, strokeWidth, ... }

Return the complete modified canvas JSON with the clip object preserved exactly as received.`;

      try {
        const result = await model.generateContent([
          systemPrompt,
          `Current canvas JSON:\n${canvasJson}\n\nUser instruction: ${prompt}\n\nReturn the modified JSON:`
        ]);

        const response = result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Validate it's valid JSON
        JSON.parse(text);

        return c.json({ data: text });
      } catch (error) {
        console.error("AI edit error:", error);
        return c.json({ error: "Failed to process AI edit" }, 500);
      }
    },
  );

export default app;
