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

COORDINATE SYSTEM (IMPORTANT):
- The workspace/clip object defines the canvas boundaries
- The workspace may have negative or offset top/left values - preserve these EXACTLY
- When adding new objects, look at the workspace's "left" and "top" values
- Position new objects RELATIVE to the workspace position
- Example: If workspace.left=234 and workspace.top=-316, and you want an object at visual center:
  - Object left should be: workspace.left + (workspace.width / 2) = 234 + 450 = 684
  - Object top should be: workspace.top + (workspace.height / 2) = -316 + 600 = 284

RULES YOU MUST FOLLOW:
1. Return ONLY raw JSON (no \`\`\`json, no \`\`\`, no extra text)
2. Preserve ALL properties of the workspace/clip object EXACTLY (do not modify left, top, width, height, shadow, etc.)
3. Preserve the "version" field
4. Preserve the "objects" array structure
5. Preserve the "clipPath" object if it exists
6. The workspace/clip object is usually first in the objects array with "name": "clip"
7. All new objects must be added AFTER the workspace/clip object

For modifications:
- Text changes: modify ONLY the "text" property of textbox objects, keep all other properties
- Color changes: modify "fill" property (use rgba format: "rgba(255,0,0,1)" or hex: "#ff0000")
- Position changes: modify "left" and "top" properties. For "center", calculate relative to workspace position
- Size: modify "width", "height", "scaleX", "scaleY" as needed
- Delete: remove objects from array (but NEVER remove workspace/clip or clipPath)
- When user says "change text", find existing textbox objects and modify their "text" property
- When user says "add", create new objects with proper positioning relative to workspace

IMPORTANT: When modifying existing objects, preserve ALL their existing properties (originX, originY, stroke, strokeWidth, shadow, etc.). Only change what the user specifically asked for.

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

          // Verify clip object properties haven't been modified
          if (originalClip && newClip) {
            const criticalProps = ['left', 'top', 'width', 'height'];
            for (const prop of criticalProps) {
              if (originalClip[prop] !== newClip[prop]) {
                console.error(`Workspace/clip ${prop} was modified: ${originalClip[prop]} -> ${newClip[prop]}`);
                return false;
              }
            }
          }

          // Check if clipPath is preserved (if it existed)
          if (original.clipPath && !parsed.clipPath) {
            console.error("clipPath was removed");
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
            const fewShotExamples = `
EXAMPLES OF CORRECT MODIFICATIONS:

Example 1 - Change text color:
User: "Change the text to red"
You should: Find textbox objects and change ONLY their "fill" property to "rgba(255,0,0,1)". Keep all other properties unchanged.

Example 2 - Change text content:
User: "Change the text to say Hello World"
You should: Find textbox objects and change ONLY their "text" property to "Hello World". Keep all other properties unchanged.

Example 3 - Add a shape:
User: "Add a blue circle"
You should: Add a new circle object AFTER the workspace/clip, using coordinates RELATIVE to the workspace position.

CRITICAL: When modifying existing objects, preserve ALL properties except the one being changed!`;

            const result = await model.generateContent([
              systemPrompt,
              fewShotExamples,
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
  )
  .post(
    "/content-recommender",
    zValidator(
      "json",
      z.object({
        productBrief: z.string(),
        canvasWidth: z.number().optional(),
        canvasHeight: z.number().optional(),
      }),
    ),
    async (c) => {
      const { productBrief, canvasWidth, canvasHeight } = c.req.valid("json");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.8, // Higher temperature for more creative content
          topP: 0.95,
        },
      });

      const prompt = `You are a creative marketing content strategist. Based on the product description provided, generate compelling marketing content.

Product Description: ${productBrief}

${canvasWidth && canvasHeight ? `Canvas dimensions: ${canvasWidth}px × ${canvasHeight}px` : ''}

Generate marketing content with the following elements:
1. Main Heading (short, punchy, max 5 words)
2. Subheading (compelling value proposition, max 10 words)
3. Body Text (2-3 short sentences describing benefits)
4. Call-to-Action (action-oriented button text, 2-4 words)
5. Additional Caption (optional tagline or secondary message)

Consider the canvas dimensions when suggesting content length. Keep text concise and impactful.

Return ONLY valid JSON in this exact format:
{
  "heading": "Main catchy heading",
  "subheading": "Compelling subheading",
  "body": "Brief description highlighting key benefits and value.",
  "cta": "Action Button",
  "caption": "Optional tagline",
  "styling": {
    "headingSize": "text-4xl",
    "subheadingSize": "text-xl",
    "bodySize": "text-base",
    "tone": "professional/casual/luxury"
  }
}`;

      try {
        const result = await model.generateContent([prompt]);
        const response = result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Validate JSON
        const parsedData = JSON.parse(text);

        return c.json({ data: parsedData });
      } catch (error) {
        console.error("Content recommender error:", error);
        return c.json({ error: "Failed to generate content recommendations" }, 500);
      }
    },
  );

export default app;
