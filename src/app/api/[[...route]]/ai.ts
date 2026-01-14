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
        negativePrompt: z.string().optional(),
        apiKey: z.string().optional(),
        aspectRatio: z.enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"]).optional(),
      }),
    ),
    async (c) => {
      const { prompt, negativePrompt, apiKey, aspectRatio } = c.req.valid("json");

      // Use Stability AI API
      const stabilityApiKey = apiKey || process.env.STABILITY_API_KEY;

      if (!stabilityApiKey) {
        return c.json({ error: "Stability AI API key is required. Please set your API key." }, 400);
      }

      try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("output_format", "webp");
        formData.append("aspect_ratio", aspectRatio || "16:9");

        if (negativePrompt) {
          formData.append("negative_prompt", negativePrompt);
        }

        // Using Stable Diffusion 3.5 Flash - fastest and most credit-efficient model
        const response = await fetch(
          "https://api.stability.ai/v2beta/stable-image/generate/sd3.5-flash",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stabilityApiKey}`,
              Accept: "image/*",
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Stability AI error:", errorText);
          throw new Error(`Stability AI request failed: ${response.status}`);
        }

        // Convert image to base64
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const dataUrl = `data:image/webp;base64,${base64}`;

        return c.json({ data: dataUrl });
      } catch (error) {
        console.error("Image generation error:", error);
        return c.json({
          error: error instanceof Error ? error.message : "Failed to generate image"
        }, 500);
      }
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

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1, // Low temperature for more deterministic outputs
          topP: 0.8,
          topK: 20,
        },
      });

      const systemPrompt = `You are an AI assistant that modifies Fabric.js canvas JSON based on user instructions.

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Just pure JSON.

Canvas dimensions: ${width}px wide x ${height}px tall
Center of canvas: left=${width / 2}, top=${height / 2}

RULES YOU MUST FOLLOW:
1. Return ONLY raw JSON (no \`\`\`json, no \`\`\`, no extra text)
2. Preserve the "version" field
3. Preserve the "objects" array structure
4. NEVER modify or delete the workspace/clip object (usually first in objects array with "name": "clip")
5. All new objects must be added AFTER the workspace/clip object

For modifications:
- Text changes: modify "text" property of textbox objects
- Color changes: modify "fill" (rgba format: "rgba(255,0,0,1)" or hex: "#ff0000")
- Adding shapes: append to "objects" array after workspace/clip
- Position: modify "left" and "top" (center = ${width / 2}, ${height / 2})
- Size: modify "width", "height", "scaleX", "scaleY"
- Delete: remove from objects array (except workspace/clip)

Common Fabric.js object structures:
{
  "type": "textbox",
  "text": "Hello",
  "left": 100,
  "top": 100,
  "fill": "rgba(0,0,0,1)",
  "fontSize": 40,
  "fontFamily": "Arial",
  "width": 200
}

{
  "type": "rect",
  "left": 100,
  "top": 100,
  "width": 200,
  "height": 100,
  "fill": "rgba(255,0,0,1)"
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

      const extractJSON = (text: string): string => {
        // Remove markdown code blocks
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Try to find JSON between curly braces
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return jsonMatch[0];
        }

        return text;
      };

      const validateCanvasJSON = (jsonString: string, originalJSON: string): boolean => {
        try {
          const parsed = JSON.parse(jsonString);
          const original = JSON.parse(originalJSON);

          // Check required fields
          if (!parsed.version || !Array.isArray(parsed.objects)) {
            console.error("Missing required fields: version or objects array");
            return false;
          }

          // Check if workspace/clip object is preserved
          const originalClip = original.objects?.find((obj: any) => obj.name === "clip");
          const newClip = parsed.objects?.find((obj: any) => obj.name === "clip");

          if (originalClip && !newClip) {
            console.error("Workspace/clip object was removed");
            return false;
          }

          return true;
        } catch (e) {
          console.error("JSON validation error:", e);
          return false;
        }
      };

      try {
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;

        while (attempts < maxAttempts) {
          attempts++;

          try {
            const result = await model.generateContent([
              systemPrompt,
              `Current canvas JSON:\n${canvasJson}\n\nUser instruction: ${prompt}\n\nReturn ONLY the modified JSON (start with { and end with }):`
            ]);

            const response = result.response;
            let text = response.text();

            console.log(`Attempt ${attempts} - Raw response length:`, text.length);

            // Extract and clean JSON
            text = extractJSON(text);

            // Validate JSON structure
            JSON.parse(text); // Basic JSON validation

            // Validate canvas-specific requirements
            if (!validateCanvasJSON(text, canvasJson)) {
              throw new Error("Invalid canvas JSON structure");
            }

            console.log(`Attempt ${attempts} - Success`);
            return c.json({ data: text });

          } catch (attemptError) {
            console.error(`Attempt ${attempts} failed:`, attemptError);
            lastError = attemptError;

            if (attempts < maxAttempts) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }

        // All attempts failed, return error
        console.error("All attempts failed. Last error:", lastError);
        return c.json({
          error: "Failed to process AI edit after multiple attempts. Please try rephrasing your instruction."
        }, 500);

      } catch (error) {
        console.error("AI edit error:", error);
        return c.json({ error: "Failed to process AI edit" }, 500);
      }
    },
  )
  .post(
    "/aesthetic-score",
    zValidator(
      "json",
      z.object({
        image: z.string(),
        designRules: z.string().optional(),
      }),
    ),
    async (c) => {
      const { image, designRules } = c.req.valid("json");

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const defaultPrompt = `You are an expert design critic and aesthetic evaluator.
Analyze this design/image and provide an aesthetic score from 0-100 based on the following criteria:
1. Visual Balance & Composition (25 points)
2. Color Harmony & Contrast (25 points)
3. Typography & Readability (if applicable) (20 points)
4. White Space & Layout (15 points)
5. Overall Visual Appeal & Impact (15 points)

Provide your response in the following JSON format only:
{
  "score": <number between 0-100>,
  "breakdown": {
    "balance": <0-25>,
    "color": <0-25>,
    "typography": <0-20>,
    "layout": <0-15>,
    "appeal": <0-15>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "summary": "<brief 2-3 sentence overall assessment>"
}`;

      const prompt = designRules ? `You are an expert design critic and aesthetic evaluator.
Analyze this design/image and provide an aesthetic score from 0-100 based on the following custom design rules and criteria:

${designRules}

Provide your response in the following JSON format only:
{
  "score": <number between 0-100>,
  "breakdown": {
    "balance": <0-25>,
    "color": <0-25>,
    "typography": <0-20>,
    "layout": <0-15>,
    "appeal": <0-15>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "summary": "<brief 2-3 sentence overall assessment>"
}` : defaultPrompt;

      try {
        // Convert base64 image to proper format for Gemini
        const imageData = image.split(',')[1] || image;

        const imagePart = {
          inlineData: {
            data: imageData,
            mimeType: "image/png",
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Validate it's valid JSON
        const parsedData = JSON.parse(text);

        return c.json({ data: parsedData });
      } catch (error) {
        console.error("Aesthetic score error:", error);
        return c.json({ error: "Failed to calculate aesthetic score" }, 500);
      }
    },
  );

export default app;
