const ProjectCard = ({ project }) => (
  <article>
    <h3>{project?.name ?? "Project"}</h3>
    <p>{project?.description}</p>
  </article>
);

export default ProjectCard;
