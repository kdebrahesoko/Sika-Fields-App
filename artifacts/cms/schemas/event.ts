import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const event = defineType({
  name: "event",
  title: "Events",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(4).max(140),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "eventDate",
      title: "Start date / time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date / time",
      type: "datetime",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "In-person location, e.g. 'Accra Head Office'.",
    }),
    defineField({
      name: "virtualLink",
      title: "Virtual link",
      type: "url",
    }),
    defineField({
      name: "recurrence",
      title: "Recurrence",
      type: "string",
      options: {
        list: [
          { title: "One-off", value: "none" },
          { title: "Weekly", value: "weekly" },
          { title: "Monthly", value: "monthly" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
    defineField({
      name: "recurrenceEnd",
      title: "Recurrence ends",
      type: "date",
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
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      eventDate: "eventDate",
      location: "location",
      media: "coverImage",
    },
    prepare({ title, eventDate, location, media }) {
      const date = eventDate
        ? new Date(eventDate).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "TBD";
      return {
        title,
        subtitle: `${date}${location ? ` · ${location}` : ""}`,
        media,
      };
    },
  },
});
