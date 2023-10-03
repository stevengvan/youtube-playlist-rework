var newPlaylist = "";

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

// Goes back to options to either select playlist or search a playlist
function gotoMenu() {
  location.href = "index.html";
}

// Retrieves all videos in playlist
const fetchVideos = async () => {
  const response = await fetch(
    `/.netlify/functions/fetchVideos?id=${newPlaylist}`
  );
  const data = await response.json();

  if ("error" in data) {
    return 404;
  }

  videosList = { ...data.videosList };
  total = Object.keys(data.videosList).length;
  originalList = Array.from(
    { length: Object.keys(data.videosList).length },
    (_, i) => i + 1
  );

  return 200;
};

// Uses given URL to search for existing playlist
const searchPlaylist = async (event, submit = false, id = "", title = "") => {
  if ((event && event.keyCode == 13) || submit == true) {
    if (id.length == 0) {
      document.getElementById("search-bar").blur();
    }

    let input =
      id.length > 0 ? id : document.getElementById("search-bar").value;

    // check for any invalid inputs
    if (input.length < 11 && input.length > 0) {
      document.getElementById("error-message").innerHTML =
        "Must enter valid URL or playlist ID; check for mispelling.";
      return;
    } else if (input.length === 0) {
      document.getElementById("error-message").innerHTML =
        "No URL or ID was provided";
      return;
    }

    // grab playlist ID from URL retrieved
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
        document.getElementById("error-message").innerText = "";
        if (id.length === 0) {
          document.getElementById("search-bar").value = "";
        }
        localStorage.clear();
        localStorage.setItem("playlistTitle", title);
        localStorage.setItem("videosList", JSON.stringify(videosList));
        localStorage.setItem("originalList", JSON.stringify(originalList));
        localStorage.setItem("total", total);
        window.location.href = "player.html";
      } else if (statusCode == 404) {
        document.getElementById("error-message").innerHTML =
          "Could not find playlist with the given URL/ID: Check if the playlist URL or ID is incorrect or if the playlist is private";
      }

      toggleLoading(0);
    });
  }
};
