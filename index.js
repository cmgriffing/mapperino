#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const  getPixels = require('get-pixels');

const {
  mapPixelData,
  createPixelFrictionAndDensityTransformer,
  ndarrayToPixels,
} = require('./lib');

require('yargs')
  .usage('$0 <cmd> [args]')
  .command('test [inFilePath] [outFilePath]', '', (yargs) => {

    yargs.positional('inFilePath', {
      type: 'string',
      describe: 'the json file we want to transform'
    });
    yargs.positional('outFilePath', {
      type: 'string',
      describe: 'the json file we want to save to'
    });
  }, function(argv) {

    getPixels(path.resolve(argv.inFilePath), function(err, pixels) {
      if(err) {
        throw new Error(`Error parsing image file at inFilePath: ${argv.inFilePath}`);
      }

      fs.writeFileSync(
        path.resolve(argv.outFilePath),
        //JSON.stringify(pixels, null, 2)
        JSON.stringify(pixels)
      );

    });
  })
  .command('transform [inFilePath] [outFilePath]', 'transform an image of pixels using the default height/slope transformers', (yargs) => {
    yargs.positional('inFilePath', {
      type: 'string',
      describe: 'the json file we want to transform'
    });
    yargs.positional('outFilePath', {
      type: 'string',
      describe: 'the json file we want to save to'
    });
  }, function (argv) {
    if(!argv.inFilePath) {
      throw new Error('inFilePath must be provided');
    }
    if(!argv.outFilePath) {
      throw new Error('outFilePath must be provided');
    }

    getPixels(path.resolve(argv.inFilePath), function(err, pixels) {
      if(err) {
        throw new Error(`Error parsing image file at inFilePath: ${argv.inFilePath}`);
      }

      const inFileContents = ndarrayToPixels(pixels);

      fs.writeFileSync(
        path.resolve(argv.outFilePath),
        JSON.stringify(mapPixelData(inFileContents), null, 2)
      );

    });



  })
  .command('map [inFilePath] [outFilePath] [mapFilePath]', 'transform an image into an array of pixels with metadata defined by the mapFile', (yargs) => {
    yargs.positional('inFilePath', {
      type: 'string',
      describe: 'the image file we want to transform'
    });
    yargs.positional('outFilePath', {
      type: 'string',
      describe: 'the json file we want to save to'
    });
    yargs.positional('mapFilePath', {
      type: 'string',
      describe: 'the json file containing the mapping metadata to be used'
    });
  }, function (argv) {
    if(!argv.inFilePath) {
      throw new Error('inFilePath must be provided');
    }
    if(!argv.outFilePath) {
      throw new Error('outFilePath must be provided');
    }
    if(!argv.mapFilePath) {
      throw new Error('mapFilePath must be provided');
    }

    const pixelDataMap = JSON.parse(fs.readFileSync(path.resolve(argv.mapFilePath)));

    getPixels(path.resolve(argv.inFilePath), function(err, pixels) {
      if(err) {
        throw new Error(`Error parsing image file at inFilePath: ${argv.inFilePath}`);
      }

      const inFileContents = ndarrayToPixels(pixels);

      const mappedPixels = mapPixelData(
        inFileContents,
        [ createPixelFrictionAndDensityTransformer(pixelDataMap) ],
        []
      );

      fs.writeFileSync(
        path.resolve(argv.outFilePath),
        JSON.stringify(mappedPixels, null, 2)
      );

    });

  })
  .help()
  .argv
