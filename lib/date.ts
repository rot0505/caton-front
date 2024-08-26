export const formatDate = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  const formatedDate =
    date.getFullYear() +
    "-" +
    Number(date.getMonth() + 1) +
    "-" +
    date.getDate() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds();

  return formatedDate;
};
