import { defineField, defineType } from "sanity";
import { ComposeIcon } from "@sanity/icons";

export const news = defineType({
  name: "news",
  title: "News & Updates",
  type: "document",
  icon: ComposeIcon,
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
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "A short summary for news cards and listings (120–200 chars).",
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
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Announcement", value: "announcement" },
          { title: "Market Update", value: "market" },
          { title: "Press Release", value: "press" },
          { title: "Regulation", value: "regulation" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Featured news items are highlighted at the top.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Announcement",
          "Growth",
          "Market",
          "Carbon Prices",
          "Regulatory",
          "Press",
          "Finance",
          "Ghana",
          "Africa",
          "ESG",
        ],
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
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt Text" }),
            defineField({ name: "caption", type: "string", title: "Caption" }),
          ],
        },
      ],
    }),
    defineField({
      name: "metaTitle",
      title: "SEO: Meta Title",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "metaDescription",
      title: "SEO: Meta Description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      media: "coverImage",
      publishedAt: "publishedAt",
      featured: "featured",
    },
    prepare({ title, category, media, publishedAt, featured }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Draft";
      return {
        title: `${featured ? "⭐ " : ""}${title}`,
        subtitle: `${category ?? "Uncategorised"} · ${date}`,
        media,
      };
    },
  },
});
