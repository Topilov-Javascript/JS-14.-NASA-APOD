const resultsNav = document.getElementById("resultsNav");
const favouritesNav = document.getElementById("favouritesNav");
const imagesContainer = document.querySelector(".images-container");
const saveConfirmed = document.querySelector(".save-confirmed");
const loader = document.querySelector(".loader");

// NASA API
const count = 10;
const apiKey = "DEMO_KEY";
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}&thumbs=false`;
const errorImageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png";

let resultsArray = [];
let favourites = {};
let shouldGoToTop = true;

const noImage = document.createElement("div");
noImage.classList.add("noImage");
noImage.textContent = "No Favourite Image";

function showContent(page) {
  if (shouldGoToTop) {
    window.scrollTo({top: 0,behavior: 'instant'})
  }
  shouldGoToTop = true;
  if (page === 'results') {
    resultsNav.classList.remove('hidden')
    favouritesNav.classList.add('hidden')
  } else {
    favouritesNav.classList.remove('hidden')
    resultsNav.classList.add('hidden')
  }
  loader.classList.add('hidden')
}

function createDOMNodes(page) {
  const currentArray =
    page === "results" ? resultsArray : Object.values(favourites);
  console.log(Object.values(favourites).length);
  if (Object.values(favourites).length === 0 && page === "favourites") {
    imagesContainer.appendChild(noImage);
  }
  currentArray.forEach(result => {
    // Card Container
    const card = document.createElement("div");
    card.classList.add("card");
    // Link
    const link = document.createElement("a");
    link.href = `${result.media_type !== "image"
      ? errorImageUrl
      : result.hdurl}`;
    link.title = "View Full Image";
    link.target = "_blank";
    // Image
    const image = document.createElement("img");
    image.src = `${result.media_type !== "image" ? errorImageUrl : result.url}`;
    image.alt = "NASA Picture of the Day";
    image.loading = "lazy";
    image.classList.add("card-img-top");
    // Card Body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    // Card Title
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = result.title;
    // Save Text
    const saveText = document.createElement("p");
    saveText.classList.add("clickable");
    if (page === "results") {
      saveText.textContent = "Add to Favourites";
      saveText.setAttribute("onclick", `saveFavourite('${result.url}')`);
    } else {
      saveText.textContent = "Remove Favourite";
      saveText.setAttribute("onclick", `removeFavourite('${result.url}')`);
    }
    // Card Text
    const cardText = document.createElement("p");
    cardText.textContent = result.explanation;
    // Footer Container
    const footer = document.createElement("small");
    footer.classList.add("text-muted");
    // Date
    const date = document.createElement("strong");
    date.textContent = result.date;
    // Copyright
    const copyrightResult =
      result.copyright === undefined ? "" : result.copyright;
    const copyright = document.createElement("span");
    copyright.textContent = ` ${copyrightResult}`;

    // Append
    footer.append(date, copyright);
    cardBody.append(cardTitle, saveText, cardText, footer);
    link.appendChild(image);
    card.append(link, cardBody);
    imagesContainer.appendChild(card);
  });
}

function updateDOM(page) {
  // Get Favourites from localStorage
  if (localStorage.getItem("nasaFavourites")) {
    favourites = JSON.parse(localStorage.getItem("nasaFavourites"));
  }
  imagesContainer.textContent = "";
  createDOMNodes(page);
  showContent(page)
}

// Get 10 Images from NASA API
async function getNasaPictures() {
  // Show Loader
  loader.classList.remove('hidden')
  try {
    const response = await fetch(apiUrl);
    resultsArray = await response.json();
    updateDOM("results");
  } catch (error) {
    // Catch Error Here
  }
}

// Add result to Favourites
function saveFavourite(itemUrl) {
  // Loop through Results Array to select Favourite
  resultsArray.forEach(item => {
    if (item.url.includes(itemUrl) && !favourites[itemUrl]) {
      favourites[itemUrl] = item;
      // Show Save Confirmation for 2 seconds
      saveConfirmed.classList.remove("hidden");
      setTimeout(() => {
        saveConfirmed.classList.add("hidden");
      }, 2000);
      // Set Favourites in Local Storage
      localStorage.setItem("nasaFavourites", JSON.stringify(favourites));
    }
  });
}

// Remove Item from Favourites
function removeFavourite(itemUrl) {
  shouldGoToTop = false;
  if (favourites[itemUrl]) {
    delete favourites[itemUrl];
    // Set Favourites in Local Storage
    localStorage.setItem("nasaFavourites", JSON.stringify(favourites));
    updateDOM("favourites");
  }
}

// On Load
getNasaPictures();
