export default (elems: NodeListOf<Element>) => {
  const texts = [];
  for (let i = 0; i < elems.length; i++) {
    texts.push(elems[i].innerHTML);
  }
  return texts;
};
