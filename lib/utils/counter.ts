export default () => {
  let counter = 0;
  return { next: () => counter++ };
};
