export const excerpt = (content: string, mask = "...") =>
  content.substring(0, 150).concat(mask);
