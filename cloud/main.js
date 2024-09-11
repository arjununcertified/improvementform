Parse.Cloud.define("createPost", async (request) => {
  const { content, image } = request.params;
  const user = request.user;

  if (!user) {
    throw new Parse.Error(Parse.Error.NOT_LOGGED_IN, "User must be logged in to create a post.");
  }

  const Post = Parse.Object.extend("Post");
  const post = new Post();

  post.set("content", content);
  post.set("author", user);

  if (image) {
    const parseFile = new Parse.File("image.jpg", { base64: image });
    post.set("image", parseFile);
  }

  try {
    await post.save();
    return post;
  } catch (error) {
    throw new Parse.Error(Parse.Error.OTHER_CAUSE, `Error creating post: ${error.message}`);
  }
});

Parse.Cloud.define("updatePost", async (request) => {
  const { postId, content, image } = request.params;
  const user = request.user;

  if (!user) {
    throw new Parse.Error(Parse.Error.NOT_LOGGED_IN, "User must be logged in to update a post.");
  }

  const query = new Parse.Query("Post");
  query.equalTo("objectId", postId);
  query.equalTo("author", user);

  try {
    const post = await query.first();

    if (!post) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Post not found.");
    }

    post.set("content", content);

    if (image) {
      const parseFile = new Parse.File("image.jpg", { base64: image });
      post.set("image", parseFile);
    }

    await post.save();
    return post;
  } catch (error) {
    throw new Parse.Error(Parse.Error.OTHER_CAUSE, `Error updating post: ${error.message}`);
  }
});

Parse.Cloud.define("deletePost", async (request) => {
  const { postId } = request.params;
  const user = request.user;

  if (!user) {
    throw new Parse.Error(Parse.Error.NOT_LOGGED_IN, "User must be logged in to delete a post.");
  }

  const query = new Parse.Query("Post");
  query.equalTo("objectId", postId);
  query.equalTo("author", user);

  try {
    const post = await query.first();

    if (!post) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Post not found.");
    }

    await post.destroy();
    return "Post deleted successfully.";
  } catch (error) {
    throw new Parse.Error(Parse.Error.OTHER_CAUSE, `Error deleting post: ${error.message}`);
  }
});

Parse.Cloud.define("getAllPosts", async (request) => {
  const query = new Parse.Query("Post");
  query.include("author");
  query.descending("createdAt");

  try {
    const posts = await query.find();
    return posts.map(post => ({
      id: post.id,
      content: post.get("content"),
      image: post.get("image") ? post.get("image").url() : null,
      author: {
        id: post.get("author").id,
        username: post.get("author").get("username"),
      },
      createdAt: post.get("createdAt")
    }));
  } catch (error) {
    throw new Parse.Error(Parse.Error.OTHER_CAUSE, `Error fetching posts: ${error.message}`);
  }
});
