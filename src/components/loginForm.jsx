import { useForm } from 'react-hook-form';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input 
          id="name" 
          type="text" 
          {...register('name', { required: true })}
        />
        {errors.name && <p>Name is required</p>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input 
          id="password" 
          type="password" 
          {...register('password', { required: true })}
        />
        {errors.password && <p>Password is required</p>}
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
};
