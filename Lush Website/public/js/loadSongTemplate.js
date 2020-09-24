var xmlhttp = new XMLHttpRequest();
var template, songDiv;

export default function loadSongTemplate() {
    return new Promise((resolve, reject) => {
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                template = new DOMParser().parseFromString(
                    this.responseText,
                    "text/html"
                );
                songDiv = template.getElementsByClassName("song")[0];

                resolve(songDiv);
                console.log(songDiv);
            }
        };

        xmlhttp.open("GET", `/public/html/partials/songTemplate.html`, true);
        xmlhttp.send();
    });
}

export { songDiv };
