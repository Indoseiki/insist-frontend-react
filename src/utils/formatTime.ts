import dayjs from "dayjs";

export const formatDateTime = (date: any) => {
  return dayjs(date).format("DD-MM-YYYY HH:mm");
};

export const formatDate = (date: any) => {
  return dayjs(date).format("DD-MM-YYYY");
};
