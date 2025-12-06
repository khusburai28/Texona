import { Hono } from "hono";

import { unsplash } from "@/lib/unsplash";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

const app = new Hono()
  .get("/", async (c) => {
    const query = c.req.query("query");

    // If there's a search query, use search API
    if (query) {
      const images = await unsplash.search.getPhotos({
        query,
        perPage: DEFAULT_COUNT,
        orientation: "landscape",
      });

      if (images.errors) {
        return c.json({ error: "Failed to search images" }, 400);
      }

      return c.json({ data: images.response.results });
    }

    // Otherwise, get random images from collection
    const images = await unsplash.photos.getRandom({
      collectionIds: DEFAULT_COLLECTION_IDS,
      count: DEFAULT_COUNT,
    });

    if (images.errors) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    let response = images.response;

    if (!Array.isArray(response)) {
      response = [response];
    }

    return c.json({ data: response });
  });

export default app;
