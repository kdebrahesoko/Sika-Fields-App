import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

export default defineConfig({
  name: "sikafields-cms",
  title: "SikaFields CMS",

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Blog Articles")
              .child(
                S.documentList()
                  .title("Blog Articles")
                  .filter('_type == "blog"')
              ),
            S.listItem()
              .title("News & Updates")
              .child(
                S.documentList()
                  .title("News & Updates")
                  .filter('_type == "news"')
              ),
            S.listItem()
              .title("Events")
              .child(
                S.documentList()
                  .title("Events")
                  .filter('_type == "event"')
              ),
            S.divider(),
            S.listItem()
              .title("Authors")
              .child(
                S.documentList()
                  .title("Authors")
                  .filter('_type == "author"')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
