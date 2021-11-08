const turnOnCameraButton = document.querySelector("#turnOnCameraButton");
const turnOffCameraButton = document.querySelector("#turnOffCameraButton");
const takePictureButton = document.querySelector("#takePictureButton");
const cameraFacingButton = document.querySelector("#cameraFacingButton");
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

if ("mediaDevices" in navigator) {
  turnOnCameraButton.addEventListener("click", turnCameraOn);
  turnOffCameraButton.addEventListener("click", turnCameraOff);
  takePictureButton.addEventListener("click", takePicture);
  cameraFacingButton.addEventListener("click", changeFacing);
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
    cameraFacingButton.innerHTML = `Environment mode`
    facing = {exact: "environment"};
  } else {
    cameraFacingButton.innerHTML = `User mode`
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
}

if (window.innerWidth <= 800) {
    cameraFacingButton.classList.remove("hide");
}
