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
