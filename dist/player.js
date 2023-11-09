var total = localStorage.getItem("total");
var currentIndex = -1;
var videosList = JSON.parse(localStorage.getItem("videosList"));
var videosOrder = Array.from({ length: total }, (_, i) => i + 1);
var currentVideo = "";
var draggables = null;
displayList();
if (
  localStorage.getItem("accessToken") !== null &&
  localStorage.getItem("accessToken").length > 0
) {
  var signOutBtn = document.createElement("button");
  signOutBtn.textContent = "Sign Out";
  signOutBtn.id = "sign-out";
  signOutBtn.tabIndex = 0;
  signOutBtn.alt = "sign out of account";
  signOutBtn.onclick = function () {
    signOut();
  };
  document.getElementById("header-right").append(signOutBtn);
}

// Create Youtube player
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    playerVars: {
      autoplay: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onErrorState,
    },
  });
}

// Autoplay video
function onPlayerReady(event) {
  event.target.unMute();
  event.target.playVideo();
}

// When video ends
function onPlayerStateChange(event) {
  if (event.data == 0) {
    queueVideo();
  }
}

// When video is unavailable
function onErrorState(event) {
  queueVideo();
}

// Creates playlist display based on playlist order
function displayList() {
  // wipe old playlist display
  const list = document.getElementById("list");
  list.innerHTML = "";

  // add each video from playlist into playlist display as playlist items
  for (let index = 0; index < videosOrder.length; ++index) {
    // create new playlist item
    let listItem = document.createElement("button");
    listItem.classList.add("listItem");
    if (localStorage.getItem("isDarkMode") === "true") {
      listItem.classList.add("dark-mode");
    }
    listItem.tabIndex = 0;
    listItem.draggable = true;

    // grab Youtube video ID
    let video = videosList[videosOrder[index]];
    listItem.id = video.id;

    // add clickable and keyboard interactive elements to change videos from display
    listItem.onclick = function () {
      changeVideo(video.id, index);
    };
    listItem.onkeydown = function (event) {
      if (event.key === "Enter") {
        changeVideo(video.id, index);
      }
    };

    // add video title and thumbnail to playlist item
    let title = document.createElement("p");
    title.innerText = video.title;
    let image = document.createElement("img");
    image.src = video.thumbnail.url;
    image.alt = `thumbnail of ${video.title}`;
    listItem.appendChild(image);
    listItem.appendChild(title);

    // add playlist item to playlist display
    list.appendChild(listItem);
  }
  draggables = [...document.querySelectorAll(".listItem")];
  var oldSpot = null;
  draggables.forEach((listItem) => {
    listItem.addEventListener("dragstart", () => {
      listItem.classList.add("isDragging");
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });
    listItem.addEventListener("dragend", () => {
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      newSpot = draggables.findIndex((element) => element.id === listItem.id);

      if (oldSpot === currentIndex) {
        currentIndex = newSpot;
      }

      var element = videosOrder.splice(oldSpot, 1);
      videosOrder.splice(newSpot, 0, element[0]);
    });
  });
}

// Changes title of video being played
function changeTitle() {
  const title = document.getElementById("video-title");
  title.innerHTML = videosList[videosOrder[currentIndex]].title;
}

// Play new video based on where the video in playlist is
function changeVideo(videoId, index) {
  if (currentIndex == index) {
    return;
  }

  // unselect video on playlist if being viewed
  if (currentVideo) {
    const oldVideo = document.getElementById(currentVideo);
    oldVideo.classList.remove("selectedListItem");
  }

  // select new video on playlist
  const listItem = document.getElementById(videoId);
  listItem.classList.add("selectedListItem");
  currentVideo = videoId;
  currentIndex = index;
  changeTitle();
  player.loadVideoById(currentVideo);
}

// Queue to next video
function queueVideo() {
  // goto next video queued in playlist
  if (currentIndex + 1 < total) {
    const nextSong = videosList[videosOrder[currentIndex + 1]];
    changeVideo(nextSong.id, currentIndex + 1);
  }
  return;
}

// Play video before or after currently playing video
function gotoPrevNext(option) {
  // Either viewing first video of playlist or not watching anything
  if (
    (currentIndex === 0 && option === "previous") ||
    (currentIndex === total - 1 && option === "next") ||
    currentVideo === ""
  ) {
    return;
  }

  // unselect currently playing video on playlist
  if (currentVideo) {
    const oldVideo = document.getElementById(currentVideo);
    oldVideo.classList.remove("selectedListItem");
  }

  switch (option) {
    case "previous":
      currentIndex -= 1;
      break;
    case "next":
      currentIndex += 1;
      break;
  }
  currentVideo = videosList[videosOrder[currentIndex]].id;

  // scroll to new video on playlist
  const list = document.getElementById("list");
  if (list.scrollHeight > list.clientHeight) {
    document.getElementById(currentVideo).scrollIntoView();
  }

  // select new video on playlist
  const listItem = document.getElementById(currentVideo);
  listItem.classList.add("selectedListItem");
  changeTitle();
  player.loadVideoById(currentVideo);
}

// Goto currently playing video
function gotoCurrentVideo() {
  const list = document.getElementById("list");
  if (list.scrollHeight > list.clientHeight) {
    document.getElementById(currentVideo).scrollIntoView();
  }
}

// Randomizes order of playlist
function shufflePlaylist() {
  var newList = [];

  // start randomizing duplicated playlist order
  while (videosOrder.length > 0) {
    let videoIndex = Math.floor(Math.random() * videosOrder.length);
    let video = videosOrder.splice(videoIndex, 1)[0];
    newList.push(video);
  }

  // save and update playlist display
  videosOrder = newList;
  currentIndex = -1;
  displayList();

  // queue the first video of new playlist order
  changeVideo(videosList[videosOrder[0]].id, 0);
  document.getElementById("list").scroll(0, 0);
}

// Switches to original playlist order
function revertPlaylist() {
  videosOrder = Array.from({ length: total }, (_, i) => i + 1);
  currentIndex = -1;
  displayList();
  changeVideo(videosList[videosOrder[0]].id, 0);
  document.getElementById("list").scroll(0, 0);
}

/////////////
const list = document.getElementById("list");
list.addEventListener("dragover", (e) => {
  e.preventDefault();
  const bottomItem = insertAboveItem(list, e.clientY);
  const currItem = document.querySelector(".isDragging");
  if (!bottomItem) {
    list.appendChild(currItem);
  } else {
    list.insertBefore(currItem, bottomItem);
  }
});

const insertAboveItem = (list, mouseY) => {
  const others = [...list.querySelectorAll(".listItem:not(.isDragging)")];

  return others.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2.6;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
};
