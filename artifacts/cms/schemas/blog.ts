import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons";

export const blog = defineType({
  name: "blog",
  title: "Blog Article",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(10).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: "Auto-generated from the title. Used in the URL.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "A short summary shown in article cards and search results (120–200 chars).",
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for accessibility and SEO.",
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Carbon Markets",
          "Education",
          "Farmers",
          "Africa",
          "ESG",
          "Buyers",
          "Investment",
          "Technology",
          "MRV",
          "Blockchain",
          "Regenerative Agriculture",
          "Finance",
          "Ghana",
          "Impact",
          "Science",
          "Policy",
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Featured Article",
      type: "boolean",
      initialValue: false,
      description: "Featured articles appear prominently at the top of the listing.",
    }),
    defineField({
      name: "template",
      title: "Article Template",
      type: "string",
      initialValue: "standard",
      description: "Controls the visual layout of the article page.",
      options: {
        list: [
          { title: "Standard — default two-column layout", value: "standard" },
          { title: "Hero — full-viewport cinematic cover image", value: "hero" },
          { title: "Visual Story — magazine-style with oversized pull quotes", value: "visual" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt Text" }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "metaTitle",
      title: "SEO: Meta Title",
      type: "string",
      description: "Overrides the article title in search engines (50–60 chars).",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "metaDescription",
      title: "SEO: Meta Description",
      type: "text",
      rows: 2,
      description: "Description shown in search engine results (120–160 chars).",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, author, media, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Unpublished";
      return {
        title,
        subtitle: `${author ?? "Unknown author"} · ${date}`,
        media,
      };
    },
  },
});
