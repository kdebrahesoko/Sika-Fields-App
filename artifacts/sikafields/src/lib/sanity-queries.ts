export const ALL_ARTICLES_QUERY = `
  *[_type in ["blog", "news", "event"]] | order(coalesce(publishedAt, eventDate) desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    coverColor,
    "author": author->{
      name,
      role,
      "photo": photo.asset->url
    },
    authorInline,
    tags,
    category,
    featured,
    template,
    publishedAt,
    eventDate,
    endDate,
    location,
    virtualLink,
    recurrence,
    recurrenceEnd
  }
`;

export const ARTICLE_BY_SLUG_QUERY = `
  *[_type in ["blog", "news", "event"] && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    coverColor,
    "author": author->{
      name,
      role,
      bio,
      linkedin,
      "photo": photo.asset->url
    },
    authorInline,
    tags,
    category,
    featured,
    template,
    publishedAt,
    eventDate,
    endDate,
    location,
    virtualLink,
    recurrence,
    recurrenceEnd,
    content
  }
`;

export const RELATED_ARTICLES_QUERY = `
  *[_type in ["blog", "news", "event"] && slug.current != $slug && count(tags[@ in $tags]) > 0] | order(coalesce(publishedAt, eventDate) desc)[0...3] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    "author": author->{ name, role },
    authorInline,
    tags,
    publishedAt,
    eventDate
  }
`;

export const GALLERY_IMAGES_QUERY = `
  *[_type == "galleryImage"] | order(featured desc, publishedAt desc)[0...12] {
    _id,
    title,
    category,
    description,
    "imageUrl": image.asset->url,
    "alt": image.alt,
    location,
    featured,
    publishedAt
  }
`;

export const ALL_EVENTS_QUERY = `
  *[_type == "event"] | order(startsAt desc) {
    _id,
    title,
    "slug": slug.current,
    format,
    summary,
    "coverImage": coverImage.asset->url,
    "coverAlt": coverImage.alt,
    startsAt,
    endsAt,
    durationMinutes,
    location,
    host,
    registerUrl,
    mediaUrl,
    tags,
    featured
  }
`;

export const GALLERY_IMAGES_BY_CATEGORY_QUERY = `
  *[_type == "galleryImage" && category == $category] | order(featured desc, publishedAt desc)[0...12] {
    _id,
    title,
    category,
    description,
    "imageUrl": image.asset->url,
    "alt": image.alt,
    location,
    featured,
    publishedAt
  }
`;
