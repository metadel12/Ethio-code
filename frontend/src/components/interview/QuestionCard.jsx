const QuestionCard = ({ question }) => (
  <article>
    <h3>{question?.title ?? "Question"}</h3>
    <p>{question?.prompt}</p>
  </article>
);

export default QuestionCard;
