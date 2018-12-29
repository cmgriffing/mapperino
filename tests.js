const {
  mapPixelData,
  pixelHeightTransformer,
  pixelSlopeTransformer,
  createPixelFrictionAndDensityTransformer,
} = require('./index');

const blackPixel = {
  red: 0,
  green: 0,
  blue: 0,
  alpha: 1.0,
};

const whitePixel = {
  red: 255,
  green: 255,
  blue: 255,
  alpha: 1.0,
};

const sampleFlatData = function() {
  return [1,2,3].map((row, rowIndex) => {
    return [1,2,3].map((pixel, pixelIndex) => {
      const newPixel = Object.assign({}, blackPixel);
      newPixel.y = rowIndex;
      newPixel.x = pixelIndex;
      newPixel.height = 0;
      return newPixel;
    });
  });
}();


const sampleSlopedData = [
  [
    { ...blackPixel, height: 0, x: 0, y: 0 },
    { ...blackPixel, height: 0.25, x: 1, y: 0 },
    { ...blackPixel, height: 0.5, x: 2, y: 0 },
  ],
  [
    { ...blackPixel, height: 0.25, x: 0, y: 1 },
    { ...whitePixel, height: 0.5, x: 1, y: 1 },
    { ...blackPixel, height: 0.75, x: 2, y: 1 },
  ],
  [
    { ...blackPixel, height: 0.5, x: 0, y: 2 },
    { ...blackPixel, height: 0.75, x: 1, y: 2 },
    { ...blackPixel, height: 1, x: 2, y: 2 },
  ],
];

const samplePixelMetaData = {
  'FFFfff': {
    friction: 1,
    density: 0.1,
  },
  '000000': {
    friction: 0.3,
    density: 0.8,
  }
};

function testPixelHeightTransformer() {

  const pixelHeightLowResult = pixelHeightTransformer(blackPixel);
  if(pixelHeightLowResult.height !== 0) {
    throw new Error(`Lowest Result should be 0. Got: ${pixelHeightLowResult.height}`);
  }

  const pixelHeightHighResult = pixelHeightTransformer(whitePixel);
  if(pixelHeightHighResult.height !== 1) {
    throw new Error(`Highest Result should be 1. Got: ${pixelHeightHighResult.height}`);
  }

}

function testPixelSlopeTransformer() {
  const heightTransformedPixel = pixelHeightTransformer(sampleFlatData[1][1]);
  const pixelSlopeFlatResult = pixelSlopeTransformer(heightTransformedPixel, sampleFlatData);

  if(pixelSlopeFlatResult.slopeIntensity !== 0) {
    throw new Error(`A flat map should have zero slopeIntensity at the second pixel of the second row. Got: ${pixelSlopeFlatResult.slopeIntensity}`);
  }

  const pixelSlopeSlopedResult = pixelSlopeTransformer(sampleSlopedData[1][1], sampleSlopedData);

  if(pixelSlopeSlopedResult.slopeIntensity === 0) {
    throw new Error(`A flat map should not have zero angleIntensity at the second pixel of the second row. Got: ${pixelSlopeSlopedResult.slopeIntensity}`);
  }
}

function testPixelFrictionAndDensityTransformer() {

  const transformer = createPixelFrictionAndDensityTransformer(samplePixelMetaData);
  const blackPixelResult = transformer(sampleFlatData[0][0]);
  if(!blackPixelResult.friction || !blackPixelResult.density) {
    throw new Error(`A mapped pixel should have a non-zero friction and density value (based on the sample data) . Got friction:${blackPixelResult.friction} and density: ${blackPixelResult.density}`);
  }

}

// Run the tests
testPixelHeightTransformer();
testPixelSlopeTransformer();
testPixelFrictionAndDensityTransformer();

console.log('Success?');



// let flatResultIsValid = true;
// pixelHeightFlatResult.map(row => {
//   row.map((pixel, index) => {
//     if(pixel.height !== 0) {
//       flatResultIsValid = false;
//     }
//   });
// });