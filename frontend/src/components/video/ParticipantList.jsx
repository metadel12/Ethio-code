const ParticipantList = ({ participants = [] }) => (
  <ul>
    {participants.map((participant) => (
      <li key={participant.id ?? participant.name}>{participant.name ?? participant}</li>
    ))}
  </ul>
);

export default ParticipantList;
