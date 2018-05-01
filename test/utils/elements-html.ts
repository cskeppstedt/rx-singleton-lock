export default (elems: NodeListOf<Element>) =>
  Array.from(elems).map(elem => elem.innerHTML);
