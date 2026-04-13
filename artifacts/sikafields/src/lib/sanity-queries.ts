export const ALL_ARTICLES_QUERY = `
  *[_type in ["blog", "news"]] | order(publishedAt desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    "author": author->{
      name,
      role,
      "photo": photo.asset->url
    },
    tags,
    category,
    featured,
    template,
    publishedAt
  }
`;

export const ARTICLE_BY_SLUG_QUERY = `
  *[_type in ["blog", "news"] && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    "author": author->{
      name,
      role,
      bio,
      linkedin,
      "photo": photo.asset->url
    },
    tags,
    category,
    featured,
    template,
    publishedAt,
    content
  }
`;

export const RELATED_ARTICLES_QUERY = `
  *[_type in ["blog", "news"] && slug.current != $slug && count(tags[@ in $tags]) > 0] | order(publishedAt desc)[0...3] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, summary),
    "coverImage": coverImage.asset->url,
    "author": author->{ name, role },
    tags,
    publishedAt
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
