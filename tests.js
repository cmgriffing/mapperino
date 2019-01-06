const {
  mapPixelData,
  pixelHeightTransformer,
  pixelSlopeTransformer,
  createPixelFrictionAndDensityTransformer,
  createPixelLandmarkTransformer,
} = require('./lib');

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
    { ...blackPixel, height: 0.84, x: 0, y: 0 },
    { ...blackPixel, height: 0.85, x: 1, y: 0 },
    { ...blackPixel, height: 0.86, x: 2, y: 0 },
  ],
  [
    { ...blackPixel, height: 0.85, x: 0, y: 1 },
    { ...whitePixel, height: 0.86, x: 1, y: 1 },
    { ...blackPixel, height: 0.87, x: 2, y: 1 },
  ],
  [
    { ...blackPixel, height: 0.86, x: 0, y: 2 },
    { ...blackPixel, height: 0.87, x: 1, y: 2 },
    { ...blackPixel, height: 0.88, x: 2, y: 2 },
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

const sampleLandmarkMetaData = {
  '000000': {
    type: 'pixel',
    key: 'hole',
    value: true,
  },
  // red
  'FF0000': {
    type: 'start',
  },
  // blue
  '0000FF': {
    type: 'pixel',
    key: 'water',
    value: true,
  },
};

const sampleRawPixelData = [
  [
    {
      red: 167,
      green: 167,
      blue: 167,
    },
    {
      red: 168,
      green: 168,
      blue: 168,
    },
    {
      red: 169,
      green: 169,
      blue: 169,
    },
  ],
  [
    {
      red: 168,
      green: 168,
      blue: 168,
    },
    {
      red: 169,
      green: 169,
      blue: 169,
    },
    {
      red: 170,
      green: 170,
      blue: 170,
    },
  ],
  [
    {
      red: 169,
      green: 169,
      blue: 169,
    },
    {
      red: 170,
      green: 170,
      blue: 170,
    },
    {
      red: 171,
      green: 171,
      blue: 171,
    },
  ],
];

function testPixelHeightTransformer() {

  const pixelHeightLowResult = pixelHeightTransformer(blackPixel);
  if(pixelHeightLowResult.pixel.height !== 0) {
    throw new Error(`Lowest Result should be 0. Got: ${pixelHeightLowResult.pixel.height}`);
  }

  const pixelHeightHighResult = pixelHeightTransformer(whitePixel);
  if(pixelHeightHighResult.pixel.height !== 1) {
    throw new Error(`Highest Result should be 1. Got: ${pixelHeightHighResult.pixel.height}`);
  }

}

function testPixelSlopeTransformer() {
  const heightTransformedPixel = pixelHeightTransformer(sampleFlatData[1][1]);
  const pixelSlopeFlatResult = pixelSlopeTransformer(heightTransformedPixel, sampleFlatData);

  if(pixelSlopeFlatResult.pixel.slopeIntensity !== 0) {
    throw new Error(`A flat map should have zero slopeIntensity at the second pixel of the second row. Got: ${pixelSlopeFlatResult.pixel.slopeIntensity}`);
  }

  const pixelSlopeSlopedResult = pixelSlopeTransformer(sampleSlopedData[1][1], sampleSlopedData);

  console.log('pixelSlopedResult:', pixelSlopeSlopedResult);

  if(pixelSlopeSlopedResult.pixel.slopeIntensity === 0) {
    throw new Error(`A flat map should not have zero slopeIntensity at the second pixel of the second row. Got: ${pixelSlopeSlopedResult.pixel.slopeIntensity}`);
  }
}

function testPixelFrictionAndDensityTransformer() {

  const transformer = createPixelFrictionAndDensityTransformer(samplePixelMetaData);
  const blackPixelResult = transformer(blackPixel);
  if(!blackPixelResult.pixel.friction || !blackPixelResult.pixel.density) {
    throw new Error(`A mapped pixel should have a non-zero friction and density value (based on the sample data) . Got friction:${blackPixelResult.pixel.friction} and density: ${blackPixelResult.pixel.density}`);
  }

}

function testLandmarkMetaDataTransformer() {
  const transformer = createPixelLandmarkTransformer(sampleLandmarkMetaData);
  const blackPixelResult = transformer(blackPixel, {}, {});
  if(!blackPixelResult.pixel.hole === true) {
    throw new Error(`A black pixel should have been identified as a hole.`);
  }
}

function testMapPixelData() {
  const result = mapPixelData(sampleRawPixelData);
  console.log('pixelResult', result.pixels);
}

// Run the tests
testPixelHeightTransformer();
testPixelSlopeTransformer();
testPixelFrictionAndDensityTransformer();
testLandmarkMetaDataTransformer();
testMapPixelData();

console.log('Success?');



// let flatResultIsValid = true;
// pixelHeightFlatResult.map(row => {
//   row.map((pixel, index) => {
//     if(pixel.height !== 0) {
//       flatResultIsValid = false;
//     }
//   });
// });