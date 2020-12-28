// (() => {
//   var blobID = 1401;
//   const reqBlobID = { blobID: blobID };

//   const dur = () => {
//     console.log(reqBlobID);

//     fetch("/audioBlob", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(reqBlobID),
//     })
//       .then((response) => response.body)
//       .then((rs) => {
//         const reader = rs.getReader();

//         return new ReadableStream({
//           async start(controller) {
//             while (true) {
//               const { done, value } = await reader.read();

//               if (done) {
//                 break;
//               }

//               controller.enqueue(value);
//             }

//             controller.close();
//             reader.releaseLock();
//           },
//         });
//       })
//       .then((rs) => new Response(rs))
//       .then((response) => response.blob())
//       .then((blob) => (blob.size ? URL.createObjectURL(blob) : null))
//       .then((url) => {
//         const audioPlayer = document.createElement("audio");
//         audioPlayer.src = url;
//         audioPlayer.onloadedmetadata = async () => {
//           console.log("Duration:", audioPlayer.duration);

//           reqBlobID.duration = audioPlayer.duration;
//           URL.revokeObjectURL(url);
//           var result = await fetch("/uploadAudioDurations", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(reqBlobID),
//           });

//           reqBlobID.blobID++;
//           if (reqBlobID.blobID <= 13082) {
//             dur(reqBlobID);
//           }
//         };
//       })
//       .catch((err) => console.log(err));
//   };

//   dur(reqBlobID);
// })();
