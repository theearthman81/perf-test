import minimist from 'minimist';
import webdriverio from 'webdriverio';
import metrics from './metrics';
import utils from './utils';

const DEFAULTS = {
  url: 'http://www.bbc.co.uk/news',
  selenium_host: 'localhost',
  selenium_port: 3000,
};
let options = Object.assign({},
                  DEFAULTS,
                  minimist(process.argv.slice(2)));
let results = {};

const wdOptions = {
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--enable-precise-memory-info',
        '--js-flags=--expose-gc',
        '--allow-file-access',
        '--user-data-dir=null',
        '--no-sandbox'
      ]
    }
  }
};

let client = webdriverio
  .remote(wdOptions)
  .init();

Object.keys(metrics).forEach((key) => client.addCommand(key, metrics[key](client)));
Object.keys(utils).forEach((key) => client.addCommand(key, utils[key](client)));

client
  .url(options.url)
  .collectGarbage()
  .startMeasureHeap()
  .startMeasureFPS()
  .scroll(0, 300)
  .endMeasureHeap()
  .then((results) => {
    console.log(`memory: ${results.value}`);
  })
  .endMeasureFPS()
  .then((results) => {
    console.log(`FPS: ${results.value}`);
  })
  .end();
