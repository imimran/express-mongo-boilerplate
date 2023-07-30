export default (err) => {
  const errors = {};
  err.inner.forEach((e) => {
    if (!errors[e.path]) {
      errors[e.path] = e.message;
    } else {
      switch (typeof errors[e.path]) {
        case "string": {
          errors[e.path] = [errors[e.path], e.message];
          break;
        }
        case "object": {
          errors[e.path].push(e.message);
          break;
        }
        default:
          break;
      }
    }
  });

  return errors;
};
