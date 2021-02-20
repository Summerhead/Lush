export const resetHeaderStyles = () => {
  const header = document.getElementById("header");
  header.style.backgroundColor = "";
  // header.style.borderBottom = "1px solid rgb(197, 197, 197)";
  header.querySelectorAll("a").forEach((a) => (a.style.color = "black"));
};
