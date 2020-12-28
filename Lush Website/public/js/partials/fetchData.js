export default function fetchData(
  type,
  url,
  artistReqData,
  cbSuccess,
  cbError
) {
  $.ajax({
    type: type,
    url: url,
    data: JSON.stringify(artistReqData),
    contentType: "application/json",
    dataType: "json",
    success: cbSuccess,
    error: cbError,
  });
}

export function fetchBlob(reqImageBlob, imageWrapper) {
  fetch("/imageBlob", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqImageBlob),
  })
    .then((response) => response.body)
    .then((rs) => {
      const reader = rs.getReader();

      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            controller.enqueue(value);
          }

          controller.close();
          reader.releaseLock();
        },
      });
    })
    .then((rs) => new Response(rs))
    .then((response) => response.blob())
    .then((blob) => (blob.size ? URL.createObjectURL(blob) : null))
    .then((url) => {
      if (url) {
        imageWrapper.style.background = `url("${url}") center / cover no-repeat`;
      }
    })
    .catch(console.error);
}

export function fetchTemplate(
  type,
  url,
  element,
  artistReqData,
  cbSuccess,
  cbError
) {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.open(type, url, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          artistLi = template.getElementsByClassName(element)[0];

        resolve(artistLi);
      }
    };
  });
}
