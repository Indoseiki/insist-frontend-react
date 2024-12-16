const getToken = () => localStorage.getItem("accessToken");

const setToken = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
};

const removeToken = () => {
  localStorage.removeItem("accessToken");
};

export { getToken, setToken, removeToken };
