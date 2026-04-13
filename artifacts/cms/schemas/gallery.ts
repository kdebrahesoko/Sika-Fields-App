import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Gallery Image",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Reforestation", value: "Reforestation" },
          { title: "Agroforestry", value: "Agroforestry" },
          { title: "Community Work", value: "Community Work" },
          { title: "Technology", value: "Technology" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "A short caption or story behind this image (shown in lightbox).",
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for accessibility and SEO.",
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "E.g. Ghana, West Africa or Brong-Ahafo Region, Ghana",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Featured images appear first in the gallery.",
    }),
    defineField({
      name: "publishedAt",
      title: "Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      media: "image",
      location: "location",
    },
    prepare({ title, category, media, location }) {
      return {
        title,
        subtitle: [category, location].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
