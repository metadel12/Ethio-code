const ActivityFeed = ({ items = [] }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id ?? item.title}>{item.title ?? item}</li>
    ))}
  </ul>
);

export default ActivityFeed;
