var trackList = "";
var firstItem = true;
var trackSeed = "";
var count = 0;
var finalRecList = [];
var i = 0;
var initialised = false;
var done = false;
var danceability = 0;
var energy = 0;
var valence = 0;
var numSamples = 0;

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

// Set token
let _token = hash.access_token;

const authEndpoint = "https://accounts.spotify.com/authorize";
const clientId = "07ed4f4d271841feaad5d16e7ea9a9f6";
const redirectUri = "https://student.csc.liv.ac.uk/~sgcmccur/player.html";
const scopes = [
  "streaming",
  "user-modify-playback-state",
  "user-library-modify",
  "user-top-read",
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token`;
}

// Set up the Web Playback SDK
let deviceId;

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: "Match Melody",
    getOAuthToken: (cb) => {
      cb(_token);
    },
  });

  // Error handling
  player.on("initialization_error", (e) => console.error(e));
  player.on("authentication_error", (e) => console.error(e));
  player.on("account_error", (e) => console.error(e));
  player.on("playback_error", (e) => console.error(e));

  // Playback status updates
  player.on("player_state_changed", (state) => {
    if (
      state.paused &&
      state.position === 0 &&
      state.restrictions.disallow_resuming_reasons &&
      state.restrictions.disallow_resuming_reasons[0] === "not_paused"
    ) {
      console.log("finished");
      // Generate the recommendation array
      
    }
  });

  // Ready
  player.on("ready", (data) => {
    //console.log("Ready with Device ID", data.device_id);
    deviceId = data.device_id;
  });

  // Connect to the player!
  player.connect();
};


// Play a specified track on the Web Playback SDK's device ID
function play(device_id, track) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: `{"uris": ["${track}"]}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function (data) {
      //console.log(data);
    },
  });
}

function generateQuery(length) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function requestSetAlbumArt() {
  if (initialised == false){
    getTopTracks();
    initialised = true;
  }
  if (i < finalRecList.length-1){
    const currentUri = finalRecList[i];
    play(deviceId, currentUri);
    $("#titleInit").attr(
      "style",
      "opacity:0"
    );
    $("#embed-uri").attr(
       "src",
      "https://open.spotify.com/embed/track/" + currentUri);
    $("#current-track-name-save").attr("data-song", "spotify:track:"+currentUri);
    $("#current-track-name-save").attr(
       "src",
       "heart.png"
    );
    $("#embed-uri").attr(
       "src",
      "https://open.spotify.com/embed/track/" + currentUri
    );
    $("#embed-uri").attr(
       "style",
       "opacity:1"
    );
    $("#current-track-name-save").css("display", "block");
    setAlbumArt("spotify:track:"+currentUri);
  } else {
    // If none of the top songs found in dataset then use random generation
    let random_seed = generateQuery(2);
    let random_offset = Math.floor(Math.random() * 500); // returns a random integer from 0 to 500
    $.ajax({
      url:
        "https://api.spotify.com/v1/search?type=track&offset=" +
        random_offset +
        "&limit=1&q=" +
        random_seed,
     type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + _token);
      },
      success: function (data) {
      console.log(data);
      let trackUri = data.tracks.items[0].uri;
      $("#titleInit").attr(
        "style",
        "opacity:0"
      );
      play(deviceId, trackUri);
      $("#current-track-name-save").attr("data-song", data.tracks.items[0].uri);
      $("#current-track-name-save").attr(
        "src",
        "heart.png"
      );
      $("#embed-uri").attr(
        "src",
        "https://open.spotify.com/embed/track/" + data.tracks.items[0].id
      );
      $("#embed-uri").attr(
        "style",
        "opacity:1"
      );
      $("#current-track-name-save").css("display", "block");
      setAlbumArt(data.tracks.items[0].uri);
    },
  });
  }
  
  i++;
}

function saveTrack(tid) {
  var track = $("#" + tid)
    .attr("data-song")
    .split(":")
    .pop();
  $.ajax({
    url: "https://api.spotify.com/v1/me/tracks?ids=" + track,
    type: "PUT",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function (data) {
      console.log(data);
      $("#" + tid).attr(
        "src",
        "heart1.png"
      );
    },
  });
}

function setAlbumArt(uri) {
    // Create full url
    const prefix = "https://open.spotify.com/oembed?url="
    const url = prefix + uri
    // Get data from url
    fetch(url)
    .then(res => res.json())
    .then(out =>
    // Find the thumbnail url
    // Set the image url to be that
    setImages(out.thumbnail_url, uri))
    .catch(err => { throw err });
}

function setImages(source, uri){
    document.getElementById("thumbnail").src = source
    document.getElementById("bg").src = source
    document.getElementById("player").src = "https://open.spotify.com/embed/track/"+uri.substring(500)+"?utm_source=generator"
}

function getTopTracks(){
  $.ajax({
    url:
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
    type: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function (data) {
      data.items.forEach(getTrackUri);
      trackList = trackList.slice(0, -1);
      console.log(data);
      requestAtrributes();
      getRecommendations();
    },
  });
}

function getTrackUri(item) {
  // substring of uri to get just track ID
  const c = item.uri.substring(14);
  if (firstItem){
    trackList += c+"%";
    firstItem = false;
    if (count < 5 ) {
      trackSeed += c+"%";
      count++;
    }
  } else {
    trackList += "2C"+c+"%";
    if (count < 5 ) {
      trackSeed += "2C"+c+"%";
      count++;
    }
  }
}

function requestAtrributes() {
  // Form api call to get track attributes as JSON
  $.ajax({
    url:
    "https://api.spotify.com/v1/audio-features?ids=" + trackList,
    type: "GET",
    
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function (data) {
      //console.log("attributes");
      //console.log(data);
      data.audio_features.forEach(processValues);
      numSamples = data.audio_features.length;
    },
  });
}

function processValues(item) {
  // danceability
  danceability += item.danceability;
  // energy
  energy += item.energy;
  // valence
  valence += item.valence;
}

function getRecommendations() {
  // Final api call to retrieve song recommendations
  danceability = danceability / numSamples;
  energy = energy /numSamples;
  valence = valence /numSamples;
  var v = valence.toFixed(3);
  var e = energy.toFixed(3);
  var d = danceability.toFixed(3);
  trackSeed = trackSeed.slice(0, -1);
  $.ajax({
    url:
    "https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=" + trackSeed + "&target_danceability="+d+"&target_energy="+e+"&target_valence="+v,
    type: "GET",
    
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function (data) {
      console.log("recommendations");
      console.log(data);
      data.tracks.forEach(createRecList);
      done = true;
    },
  });
}

function createRecList(item) {
  finalRecList.push(item.uri.substring(14));
}