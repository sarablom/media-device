const turnOnCameraButton = document.querySelector("#turnOnCameraButton");
const turnOffCameraButton = document.querySelector("#turnOffCameraButton");
const takePictureButton = document.querySelector("#takePictureButton");
const cameraFacingButton = document.querySelector("#cameraFacingButton");
const startRecordingButton = document.querySelector("#startRecordingButton");
const stopRecordingButton = document.querySelector("#stopRecordingButton");
// const pauseRecordingButton = document.querySelector("#pauseRecordingButton");
const statusBar = document.querySelector("#status");
let videoElement = document.querySelector("#cameraVideo");
const downloadPara = document.querySelector("#download");
const imgGallery = document.querySelector("#img-gallery");
const imgContainer = document.querySelector(".img-container");
let canvas = document.querySelector("#canvas");

let videoStream = null;
let facing = "user";
let recorder = null;
let chunks = null;

if ("serviceWorker" in navigator) {
  // Assumes your service worker has file name "sw.js"
  navigator.serviceWorker.register("sw.js").then((reg) => {
    console.log("Registration succeeded. Scope is " + reg.scope);
  });
}

if ("mediaDevices" in navigator) {
  turnOnCameraButton.addEventListener("click", turnCameraOn);
  turnOffCameraButton.addEventListener("click", turnCameraOff);
  takePictureButton.addEventListener("click", countdown);
  cameraFacingButton.addEventListener("click", changeFacing);
  startRecordingButton.addEventListener("click", startRecording);
  stopRecordingButton.addEventListener("click", stopRecording);
  // pauseRecordingButton.addEventListener("click", pauseRecording);
}

async function turnCameraOn() {
  const constraints = {
    video: { width: 320, height: 240, facingMode: facing },
  };

  const md = navigator.mediaDevices;

  try {
    //Access the users webcam
    videoStream = await md.getUserMedia(constraints);
    videoElement.srcObject = videoStream;
    videoElement.addEventListener("loadedmetadata", () => {
      videoElement.play();
    });
    toggleCamera();
  } catch (error) {
    console.log("Failed access", error);
    statusBar.innerHTML = `Didn't get permission to use the camera.`;
  }
}

function turnCameraOff() {
  if (!videoStream) return;

  let tracks = videoStream.getTracks();
  tracks.forEach((track) => track.stop());
  statusBar.innerHTML = "";
  toggleCamera();
}

function changeFacing() {
  if (facing === "user") {
    cameraFacingButton.innerHTML = `<i class="fas fa-mountain"></i>`;
    facing = { exact: "environment" };
  } else {
    cameraFacingButton.innerHTML = `<i class="fas fa-grin-beam"></i>`;
    facing = "user";
  }
}

async function takePicture() {
  if ("ImageCapture" in window) {
    try {
      let imageCapture = new ImageCapture(videoStream.getVideoTracks()[0]);
      let blob = await imageCapture.takePhoto();
      imgGallery.classList.remove("hide");
      imgContainer.classList.remove("hide");
      const htmlString = `
        <li class="img-item">
            <img src="${URL.createObjectURL(
              blob
            )}" alt="Taken picture" class="takenPicture" />
        </li>`;
      imgContainer.insertAdjacentHTML("afterbegin", htmlString);
    } catch (error) {
      console.log("Cant take picture", error);
      statusBar.innerHTML = `Couldn't take picture`;
    }
  } else {
    try {
      canvas
        .getContext("2d")
        .drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
      canvas.toDataURL("image/jpeg");
    } catch (error) {
      console.log("Cant take picture", error);
      statusBar.innerHTML = `Couldn't take picture`;
    }
  }
}

function toggleCamera() {
  turnOnCameraButton.classList.toggle("hide");
  turnOffCameraButton.classList.toggle("hide");
  takePictureButton.classList.toggle("hide");
  startRecordingButton.classList.toggle("hide");
  stopRecordingButton.classList.toggle("hide");
  // pauseRecordingButton.classList.toggle("hide");
}

if (window.innerWidth <= 800) {
  cameraFacingButton.classList.remove("hide");
}

function startRecording() {
  if (!videoStream) return;

  recorder = new MediaRecorder(videoStream);
  chunks = [];

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  recorder.addEventListener("stop", () => {
    const masterBlob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(masterBlob);

    const a = document.createElement("a");
    a.innerHTML = `Click to download recording`;
    a.href = url;
    a.download = "Awesome-video.webm";
    a.className = "download-link";
    downloadPara.appendChild(a);

    a.addEventListener("click", () => {
      downloadPara.innerHTML = "";
    });
  });

  downloadPara.innerHTML = "";
  statusBar.innerHTML = `Recording in progress`;
  recorder.start();
}

function stopRecording() {
  recorder.stop();
  statusBar.innerHTML = ``;
}

// function pauseRecording() {
//   statusBar.innerHTML = `Recording paused`;
//   recorder.pause();
//   recorder.paused();
// }

function countdown() {
  if (window.innerWidth >= 800) {
    statusBar.classList.add("animation");
    statusBar.innerText = 3;
    let count = 3;
    const timer = setInterval(() => {
      count--;
      statusBar.innerText = count;
    }, 1000);

    setTimeout(() => {
      if (count <= 0) {
        statusBar.innerText = count;
        takePicture();
        clearInterval(timer);
      }
      setTimeout(() => {
        statusBar.innerText = "";
        statusBar.classList.remove("animation");
      }, 1000);
    }, count * 1000);
  } else {
    takePicture();
  }
}
