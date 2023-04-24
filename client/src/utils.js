import axios from "axios";

////Durstenfeld shuffle, copied from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffleArray = (array) => {
    let arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
}

const characters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','!','@','#','$','%','&','=','?'];

export const generateJoinCode = () => {
    let code = '';
    while (code.length < 12) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

/////////////////////////////////Copied from https://github.com/clarencepenz/easy-crop////////////////////////////////////
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

//   As Base64 string
  return canvas.toDataURL('image/jpeg');

}







/////////////////////////////Copied from https://github.com/mudassirmaqbool/Resize-And-Compress-Image-In-JavaScript/blob/main/app.js/////////////////
export const urlToFile = (url) => {

    let arr = url.split(",")
    // console.log(arr)
    let mime = arr[0].match(/:(.*?);/)[1]
    let data = arr[1]
	console.log(typeof data);

    let dataStr = atob(data)
	console.log(typeof dataStr);
    let n = dataStr.length
    let dataArr = new Uint8Array(n)
	console.log(typeof dataArr);

    while(n--)
    {
        dataArr[n] = dataStr.charCodeAt(n)
    }

    let file  = new File([dataArr], 'File.jpg', {type: mime})

    return file



}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const sortDecks = (sortCriteria, array) => {
  switch(sortCriteria) {
      case "a-z":
          return array.slice().sort((a, b) => {
              if(a.deckName < b.deckName) {
                  return -1;
              } else if(a.deckName > b.deckName) {
                  return 1;
              } else {
                  return 0;
              }
          })
      case "z-a": 
          return array.slice().sort((a, b) => {
              if(a.deckName > b.deckName) {
                  return -1;
              } else if(a.deckName < b.deckName) {
                  return 1;
              } else {
                  return 0;
              }
          });
      case "card-count-up": 
          return array.slice().sort((a, b) => {
              if(a.cardCount > b.cardCount) {
                  return -1;
              } else if(a.cardCount < b.cardCount) {
                  return 1;
              } else {
                  return 0;
              }
          });
      case "card-count-down": 
          return array.slice().sort((a, b) => {
              if(a.cardCount < b.cardCount) {
                  return -1;
              } else if(a.cardCount > b.cardCount) {
                  return 1;
              } else {
                  return 0;
              }
          });
      case "newest":
          return array.slice().sort((a, b) => {
              let aDate = new Date(a.dateCreated);
              let bDate = new Date(b.dateCreated);
              if(aDate < bDate) {
                  return -1;
              } else if(aDate > bDate) {
                  return 1;
              } else {
                  return 0;
              }
          });
      case "oldest":
          return array.slice().sort((a, b) => {
              let aDate = new Date(a.dateCreated);
              let bDate = new Date(b.dateCreated);
              if(aDate > bDate) {
                  return -1;
              } else if(aDate < bDate) {
                  return 1;
              } else {
                  return 0;
              }
          });
      default: 
          return array;
  }
}

const client = axios.create({
    headers: {
        "Content-Type": 'application/json'
    },
});

client.interceptors.request.use(config => {
    // config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    config.headers["Authorization"] = `Bearer ${getJwtCookie()}`;

    return config;
});

export { client };

export const getJwtCookie = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; jwt=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const openLinkInNewTab = (url, func) => {
    const newTab = window.open(url, "_blank");

    if(newTab) {
        newTab.focus();
    } else {
        func(url);
    }
}

export const addMultipleEventListeners = (target, events, callback) => {
    for(let event of events) {
        target.addEventListener(event, callback)
    }
}

export const removeMultipleEventListeners = (target, events, callback) => {
    for(let event of events) {
        target.removeEventListener(event, callback);
    }
}