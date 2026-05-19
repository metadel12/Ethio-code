const ChatPanel = ({ messages = [] }) => (
  <section>
    {messages.map((message) => (
      <p key={message.id ?? message.text}>{message.text ?? message}</p>
    ))}
  </section>
);

export default ChatPanel;
