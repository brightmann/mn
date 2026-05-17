type PostLike = {
  draft?: boolean;
  _raw: {
    flattenedPath: string;
  };
};

export const isDevelopmentEnvironment = (environment = process.env.NODE_ENV) =>
  environment === 'development';

export const isVisiblePost = (
  post: PostLike,
  environment = process.env.NODE_ENV
) => isDevelopmentEnvironment(environment) || !post.draft;

export const filterVisiblePosts = <T extends PostLike>(
  posts: T[],
  environment = process.env.NODE_ENV
) => posts.filter((post) => isVisiblePost(post, environment));

export const findVisiblePostByFlattenedPath = <T extends PostLike>(
  posts: T[],
  flattenedPath: string,
  environment = process.env.NODE_ENV
) =>
  posts.find(
    (post) =>
      post._raw.flattenedPath === flattenedPath &&
      isVisiblePost(post, environment)
  );
