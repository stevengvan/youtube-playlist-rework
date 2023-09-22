var newPlaylist = "";
var total = 0;
var currentIndex = -1;
var videosList = {};
var randomizedList = [];
var originalList = [];
var currentVideo = "";

// Retrieves all videos in playlist
const fetchVideos = async () => {
  const response = await fetch(
    `/.netlify/functions/playlist?id=${newPlaylist}`
  );
  const data = await response.json();

  videosList = { ...data.videosList };
  total = Object.keys(data.videosList).length;
  originalList = Array.from(
    { length: Object.keys(data.videosList).length },
    (_, i) => i + 1
  );

  return response.status;
};

function toggleLoading(toggle) {
  const loading = document.getElementById("loading");
  switch (toggle) {
    case 0: {
      loading.style.visibility = "hidden";
      break;
    }
    case 1: {
      loading.style.visibility = "visible";
      break;
    }
  }
}

// Uses given URL to search for existing playlist
const searchPlaylist = async (event, submit = false) => {
  if ((event && event.keyCode == 13) || submit == true) {
    document.getElementById("playlist-query").blur();
    // grab playlist ID from URL retrieved
    let input = document.getElementById("playlist-query").value;
    let startPos = input.search("=") + 1;
    let endPos = input.search("&");
    if (endPos > 0) {
      newPlaylist = input.slice(startPos, endPos);
    } else {
      newPlaylist = input.slice(startPos);
    }

    toggleLoading(1);

    // create playlist display once playlist is retrieved
    fetchVideos().then((statusCode) => {
      if (statusCode == 200) {
        document.getElementById("main-content").style.visibility = "visible";
        document.getElementById("app-title").style.visibility = "hidden";
        document.getElementById("playlist-selector").style.visibility =
          "hidden";
        displayList();
      } else if (statusCode == 404) {
        let error_message = document.getElementById("error-message");
        error_message.innerHTML =
          "Could not find playlist with the given URL/ID: Check if the playlist URL or ID is incorrect or if the playlist is private";
        error_message.style.display = "";
      }

      toggleLoading(0);
    });
  }
};

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

// Goes back to options to either select playlist or search a playlist
function gotoMenu() {
  toggleLoading(1);
  player.loadVideoById("");
  currentVideo = "";
  currentIndex, (total = 0);
  videosList = {};
  originalList, (randomizedList = []);
  document.getElementById("video-title").innerHTML =
    "Currently not playing anything";
  document.getElementById("playlist-query").value = "";
  document.getElementById("main-content").style.visibility = "hidden";
  document.getElementById("list").innerHTML = "";
  document.getElementById("playlist-selector").style.visibility = "visible";
  toggleLoading(0);
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
