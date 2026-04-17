import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const event = defineType({
  name: "event",
  title: "Event / Webinar / Podcast",
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
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "Live Event", value: "event" },
          { title: "Webinar", value: "webinar" },
          { title: "Podcast Episode", value: "podcast" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Art",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "startsAt",
      title: "Starts At",
      type: "datetime",
      description:
        "When the live session begins, when the webinar was recorded, or the podcast publish date.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endsAt",
      title: "Ends At",
      type: "datetime",
      description: "Optional — only used for live events to show end time.",
    }),
    defineField({
      name: "durationMinutes",
      title: "Duration (minutes)",
      type: "number",
      description: "Length in minutes — used for podcasts and on-demand webinars.",
      validation: (Rule) => Rule.min(1).max(600),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "City / venue for live events, or 'Online' for webinars.",
    }),
    defineField({
      name: "virtualLink",
      title: "Virtual link",
      type: "url",
      description: "Optional join link for virtual sessions.",
    }),
    defineField({
      name: "host",
      title: "Host / Speaker",
      type: "string",
    }),
    defineField({
      name: "registerUrl",
      title: "Register / RSVP URL",
      type: "url",
      description: "For upcoming events and webinars — link to the registration page.",
    }),
    defineField({
      name: "mediaUrl",
      title: "Media URL",
      type: "url",
      description:
        "For podcasts: a direct audio file URL (mp3) for inline playback. For on-demand webinars: a YouTube/Vimeo or hosted player link.",
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
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
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
      format: "format",
      media: "coverImage",
      startsAt: "startsAt",
      location: "location",
    },
    prepare({ title, format, media, startsAt, location }) {
      const date = startsAt
        ? new Date(startsAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Unscheduled";
      const formatLabel =
        format === "podcast"
          ? "Podcast"
          : format === "webinar"
            ? "Webinar"
            : "Event";
      return {
        title,
        subtitle: `${formatLabel} · ${date}${location ? ` · ${location}` : ""}`,
        media,
      };
    },
  },
});
