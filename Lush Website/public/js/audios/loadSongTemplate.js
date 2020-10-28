var xmlhttp = new XMLHttpRequest();
var template, script, songDiv;

export default function loadSongTemplate() {
    return new Promise((resolve, reject) => {
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                template = new DOMParser().parseFromString(
                    this.responseText,
                    "text/html"
                );
                script = template.getElementsByTagName("script")[0];
                songDiv = template.getElementsByClassName("audio-container")[0];

                resolve(songDiv);
            }
        };

        xmlhttp.open("GET", `/public/html/partials/songTemplate.html`, true);
        xmlhttp.send();
    });
}

export { songDiv, script };
