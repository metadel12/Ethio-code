const CommentSection = ({ comments = [] }) => (
  <section>
    {comments.map((comment) => (
      <p key={comment.id ?? comment.body}>{comment.body ?? comment}</p>
    ))}
  </section>
);

export default CommentSection;
