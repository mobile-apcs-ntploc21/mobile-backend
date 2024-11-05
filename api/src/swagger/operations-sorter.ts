const operationsSorter = (a: any, b: any) => {
  const methodsOrder = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "trace",
  ];
  let result =
    methodsOrder.indexOf(a.get("method")) -
    methodsOrder.indexOf(b.get("method"));

  if (result === 0) {
    result = a.get("path").localeCompare(b.get("path"));
  }

  return result;
};

export default operationsSorter;
