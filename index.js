function decToHex(dec) {
  let hexString = dec.toString(16);
  if (hexString.length % 2) {
    hexString = '0' + hexString;
  }
  return hexString;
};
/*
 * Args:
 * pixels: double layered array of pixel data. (rgba values)
 * eg:
 * [
 *  [{red: 255, green: 255, blue: 255, alpha: 0.5, }]
 * ]
 *
 * TODO: OTHER ARGS
 *
 * returns:
 *  any: depends on the return of the passed mapping function
 */

// TODO: Refactor to use transform functions in an array. They add properties to the pixel object based on (x, y, and rgba)
// They are run synchronously during the same iteration of the pixel loop
//

function validateArray(theArray, arrayName) {
  if(
    !theArray.length ||
    theArray.length <= 0 ||
    typeof theArray.length !== 'number'
  ) {
    throw new Error(`${arrayName} must be an array with a positive length`);
  }
}

function mapPixelData(
  pixels,
  transformFunctions,
  postTransformFunctions,
) {

  if(!transformFunctions) {
    transformFunctions = [pixelHeightTransformer];
  }

  if(!postTransformFunctions) {
    postTransformFunctions = [pixelSlopeTransformer];
  }

  validateArray(pixels, 'pixels');
  validateArray(transformFunctions, 'transformFunctions');
  validateArray(postTransformFunctions, 'postTransformFunctions');

  const mapped = pixels.map(function(pixelRow, pixelRowIndex) {
    if(!pixelRow.length || pixelRow.length <= 0) {
      throw new Error('pixelRow must be an array with a positive length');
    }

    const transformedPixels = pixelRow.map(function(pixel, pixelIndex) {

      let _pixel = Object.assign({}, pixel);

      _pixel.x = pixelIndex;
      _pixel.y = pixelRowIndex;

      transformFunctions.forEach(function(fn) {
        _pixel = fn(_pixel, pixels);
      });

      return _pixel;
    });

    return transformedPixels.map(function(pixel) {

      let _pixel = Object.assign({}, pixel);

      postTransformFunctions.forEach(function(fn) {
        _pixel = fn(_pixel, transformedPixels);
      });

      return _pixel;
    })
  });

  return mapped;

}

/*
 * Args:
 * pixel: an object with rgba values
 * eg:
 * {red: 255, green: 255, blue: 255, alpha: 0.5, }
 *
 * returns:
 *   number (float beteen 0 and 1)
 */
function pixelHeightTransformer(pixel, pixels) {
  const _pixel = Object.assign({}, pixel);
  const maxValue = 255 + 255 + 255;
  _pixel.height = (pixel.red + pixel.green + pixel.blue) / maxValue;
  return _pixel;
}

function _getHeightDifferential(pixel, pixels, translateX, translateY) {
  const newX = pixel.x + translateX;
  const newY = pixel.y + translateY;
  if(pixels[newY] && pixels[newY][newX]) {
    return pixels[newY][newX].height - pixel.height;
  } else {
    return 0;
  }
}

function pixelSlopeTransformer(pixel, pixels) {

  const _pixel = Object.assign({}, pixel);

  const topLeftHeightDifferential = _getHeightDifferential(_pixel, pixels, -1, -1);
  const topRightHeightDifferential = _getHeightDifferential(_pixel, pixels, 1, -1);
  const bottomLeftHeightDifferential = _getHeightDifferential(_pixel, pixels, -1, 1);
  const bottomRightHeightDifferential = _getHeightDifferential(_pixel, pixels, 1, 1);

  const differentials = [
    topLeftHeightDifferential,
    topRightHeightDifferential,
    bottomRightHeightDifferential,
    bottomLeftHeightDifferential,
  ];

  const angles = [
    315,
    45,
    135,
    225,
  ];

  const lowestCornerIndex = differentials.indexOf(Math.min(...differentials));
  const oppositeCornerIndex = (lowestCornerIndex + 2) % 4;

  // console.log('lowestCornerIndex', lowestCornerIndex);
  // console.log('oppositeCornerIndex', oppositeCornerIndex);

  const leftValue = typeof differentials[lowestCornerIndex - 1] !== 'undefined' ?
    differentials[lowestCornerIndex - 1] :
    differentials[differentials.length - 1];
  const rightValue = typeof differentials[lowestCornerIndex + 1] !== 'undefined' ?
    differentials[lowestCornerIndex + 1] :
    differentials[0];

  const angleInfluence = leftValue - rightValue;

  _pixel.slopeAngle = angles[lowestCornerIndex] + (angleInfluence * 45);

  const diffAdjustment = differentials[lowestCornerIndex] > differentials[oppositeCornerIndex] ?
    differentials[lowestCornerIndex] - differentials[oppositeCornerIndex] :
    differentials[oppositeCornerIndex] - differentials[lowestCornerIndex];

  _pixel.slopeIntensity = (differentials[lowestCornerIndex] + differentials[oppositeCornerIndex] + diffAdjustment) / 2;

  return _pixel;

}

function createPixelFrictionAndDensityTransformer(pixelMetaDataMap) {

  const newPixelDataMap = {};
  Object.entries(pixelMetaDataMap).map(([key, value]) => {
    newPixelDataMap[key.toLowerCase()] = value;
  });

  return function(pixel, pixels) {
    const _pixel = Object.assign({}, pixel);

    const red = decToHex(_pixel.red);
    const green = decToHex(_pixel.green);
    const blue = decToHex(_pixel.blue);

    const color = `${red}${green}${blue}`;
    const colorData = newPixelDataMap[color];

    if(colorData) {
      _pixel.friction = colorData.friction;
      _pixel.density = colorData.density;
    }

    return _pixel;
  }
}

/*
 * Args:
 *
 * start: point object
 * eg: { x,: 10, y: 42 }
 *
 * end: point object
 * eg: { x,: 10, y: 42 }
 *
 * pixelMap: double layered array of pixel data. (rgba values)
 * eg:
 * [
 *  [{red: 255, green: 255, blue: 255, alpha: 0.5, }]
 * ]
 *
 * returns: an array of points
 * [{  }]
 */
function getSliceFromMap(start, end, pixelMap) {
  const slope = (start.y - end.y) / (start.x - end.x);

  if(!pixelMap.length || pixelMap.length < 0) {
    throw new Error('pixelMap must be an array with a non-zero length');
  }

  const yOrigin = start.y - (slope * start.x);

  return pixelMap[0].map(function(pixel) {
    return (slope * pixel.x) + yOrigin;
  });

}

module.exports = {
  mapPixelData,
  pixelHeightTransformer,
  pixelSlopeTransformer,
  createPixelFrictionAndDensityTransformer,
}