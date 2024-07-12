import { useForm } from 'react-hook-form';

export const ProjectForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="project_name">Project Name</label>
        <input 
          id="project_name" 
          type="text" 
          {...register('project_name', { required: true })}
        />
        {errors.project_name && <p>Project name is required</p>}
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <textarea 
          id="description" 
          {...register('description', { required: true })}
        />
        {errors.description && <p>Description is required</p>}
      </div>
      
      <div>
        <label htmlFor="network">Network</label>
        <input 
          id="network" 
          type="file" 
          {...register('network', { required: true })}
        />
        {errors.network && <p>Network file is required</p>}
      </div>
      
      <button type="submit">Submit Project</button>
    </form>
  );
};
