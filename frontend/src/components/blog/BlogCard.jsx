const BlogCard = ({ post }) => (
  <article>
    <h3>{post?.title ?? "Blog post"}</h3>
    <p>{post?.excerpt}</p>
  </article>
);

export default BlogCard;
