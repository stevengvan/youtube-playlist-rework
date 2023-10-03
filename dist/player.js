var total = 0;
var currentIndex = -1;
var videosList = {};
var randomizedList = [];
var originalList = [];
var currentVideo = "";

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
  // retrieve fetched playlist from previous page
  document.getElementById("playlist-title").textContent =
    localStorage.getItem("playlistTitle");
  videosList = JSON.parse(localStorage.getItem("videosList"));
  originalList = JSON.parse(localStorage.getItem("originalList"));
  total = localStorage.getItem("total");

  // wipe old playlist display
  const list = document.getElementById("list");
  list.innerHTML = "";

  // determine if playlist is shuffled or not
  let currentPlaylist =
    randomizedList.length > 0 ? randomizedList : originalList;

  // add each video from playlist into playlist display as playlist items
  for (let index = 0; index < currentPlaylist.length; ++index) {
    // create new playlist item
    let listItem = document.createElement("div");
    listItem.classList.add("listItem");

    // grab Youtube video ID
    let video = videosList[currentPlaylist[index]];
    listItem.id = video.id;

    // add clickable element to change videos from display
    listItem.onclick = function () {
      changeVideo(video.id, index);
    };

    // add video title and thumbnail to playlist item
    let title = document.createElement("p");
    title.innerText = video.title;
    let image = document.createElement("img");
    image.src = video.thumbnail.url;
    listItem.appendChild(image);
    listItem.appendChild(title);

    // add playlist item to playlist display
    list.appendChild(listItem);
  }
}

// Changes title of video being played
function changeTitle() {
  let currentPlaylist =
    randomizedList.length > 0 ? randomizedList : originalList;
  const title = document.getElementById("video-title");
  title.innerHTML = videosList[currentPlaylist[currentIndex]].title;
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
  // determine if using shuffled playlist or not
  let currentPlaylist =
    randomizedList.length > 0 ? randomizedList : originalList;

  // goto next video queued in playlist
  if (currentIndex + 1 < total) {
    const nextSong = videosList[currentPlaylist[currentIndex + 1]];
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

  const currentPlaylist =
    randomizedList.length > 0 ? randomizedList : originalList;

  switch (option) {
    case "previous":
      currentIndex -= 1;
      break;
    case "next":
      currentIndex += 1;
      break;
  }
  currentVideo = videosList[currentPlaylist[currentIndex]].id;

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
  var sourceList = [...originalList];
  var newList = [];

  // start randomizing duplicated playlist order
  while (sourceList.length > 0) {
    let videoIndex = Math.floor(Math.random() * sourceList.length);
    let video = sourceList.splice(videoIndex, 1)[0];
    newList.push(video);
  }

  // save and update playlist display
  randomizedList = newList;
  currentIndex = -1;
  displayList();

  // queue the first video of new playlist order
  changeVideo(videosList[randomizedList[0]].id, 0);
  document.getElementById("list").scroll(0, 0);
}

// Switches to original playlist order
function revertPlaylist() {
  randomizedList = [];
  currentIndex = -1;
  displayList();
  changeVideo(videosList[originalList[0]].id, 0);
  document.getElementById("list").scroll(0, 0);
}
