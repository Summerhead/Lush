// export default function insertNoResults() {
//   const xmlhttp = new XMLHttpRequest();

//   xmlhttp.onreadystatechange = function () {
//     if (this.readyState == 4 && this.status == 200) {
//       const template = new DOMParser().parseFromString(
//           this.responseText,
//           "text/html"
//         ),
//         noResults = template.getElementById("no-results");

//       document.getElementsByTagName("main")[0].appendChild(noResults);
//     }
//   };

//   xmlhttp.open("GET", "/public/html/partials/noResults.html", true);
//   xmlhttp.send();
// }
