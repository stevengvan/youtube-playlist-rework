var playlists = [];

const fetchPlaylists = async () => {
  const queryStrings = window.location.hash
    .substring(1)
    .split("&")
    .reduce(function (obj, str, index) {
      let parts = str.split("=");
      if (parts[0] && parts[1]) {
        obj[parts[0].replace(/\s+/g, "")] = parts[1].trim();
      }
      return obj;
    }, {});

  const response = await fetch(
    `/.netlify/functions/fetchPlaylists?access_token=${queryStrings["access_token"]}`
  );
  const data = await response.json();
  playlists = [...data.playlists];
};

function showPlaylists() {
  console.log(playlists);
}

function displayPlaylists() {
  const list = document.getElementById("playlists-list");

  for (let i in playlists) {
    let container = document.createElement("div");
    container.classList.add("playlist-container");
    container.onclick = function () {
      searchPlaylist(null, true, String(playlists[i].id), playlists[i].title);
    };
    let thumbnail = document.createElement("img");
    thumbnail.src = playlists[i].thumbnail.url;
    let title = document.createElement("h4");
    title.textContent = playlists[i].title;

    container.appendChild(thumbnail);
    container.appendChild(title);
    list.appendChild(container);
  }
}
