export const resetHeaderStyles = () => {
  const header = document.getElementById("header");
  header.style.backgroundColor = "";
  header.querySelectorAll("a").forEach((a) => (a.style.color = "black"));
};
