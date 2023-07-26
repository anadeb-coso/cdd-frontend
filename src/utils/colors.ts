export const colors = {
  primary: '#24c38b',
  disabled: '#eeeeee',
  inProgress: '#f5ba74',
  lightgray: '#dedede',
  error: '#ef6a78',
};


export const getTaskStatusColor = (task: any) => {
  return (task.completed && task.validated) ? '#24c38b' : (
    (task.completed && task.validated === false) ? 'red' : (
      (task.completed && [undefined, null].includes(task.validated)) ? 'blue' : (
        !task.completed ? 'orange' : 'red'
        )
      )
  );
}