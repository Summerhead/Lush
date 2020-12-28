async function handleFileSelect(e) {
  const files = e.target.files;

  if (files.length < 1) {
    return 0;
  }

  for (const file of files) {
    await Promise.resolve(uploadImage(file));
  }
}

function uploadImage(file) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();

    xhr.open("POST", "/uploadImage", true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        console.log("Response:", response);

        resolve(xhr.responseText);
      }
    };

    fd.append("image", file);
    xhr.send(fd);
  });
}

function onFileLoaded(e) {
  var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
  if (match == null) {
    throw "Could not parse result";
  }
}
