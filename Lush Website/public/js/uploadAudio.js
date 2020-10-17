async function handleFileSelect(e) {
  const files = e.target.files;

  if (files.length < 1) {
    return;
  }

  const failedUploads = [];
  for (const file of files) {
    await Promise.resolve(uploadAudio(file)).catch(() =>
      failedUploads.push(file)
    );
  }

  // console.log("Failed to upload:", failedUploads);
}

function uploadAudio(file) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();

    xhr.open("POST", "/upload", true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        console.log("Response:", response);

        resolve(xhr.responseText);
      }
    };

    fd.append("audio", file);

    try {
      xhr.send(fd);
    } catch (err) {
      console.log("Error:", err);

      reject(err);
    }
  });
}

function onFileLoaded(e) {
  var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
  if (match == null) {
    throw "Could not parse result";
  }
  var mimeType = match[1];
  var content = match[2];
}

$(function () {
  $("#import-pfx-button").click(function (e) {
    $("#file-input").click();
  });
  $("#file-input").change(handleFileSelect);
});
