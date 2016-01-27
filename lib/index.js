import minimist from 'minimist';
import webdriverio from 'webdriverio';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import metrics from './metrics';
import utils from './utils';

const fsPromisified = Promise.promisifyAll(fs);
let actions = {};
let results = {};

const DEFAULTS = {
  url: 'http://www.bbc.co.uk/news',
  selenium_host: 'localhost',
  selenium_port: 3000,
};
let options = Object.assign({},
                  DEFAULTS,
                  minimist(process.argv.slice(2)));


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

try {
  actions = require(path.join(process.cwd(), 'perf', 'actions'));
} catch(e) {
  console.warn('perf: no actions found.');
}

let client = webdriverio
  .remote(wdOptions)
  .init();

Object.keys(metrics).forEach((key) => client.addCommand(key, metrics[key](client)));
Object.keys(utils).forEach((key) => client.addCommand(key, utils[key](client)));

Promise.resolve(Object.keys(actions))
  .mapSeries((key) => {
    return actions(client, results);
  }).then((results) => {
    return fsPromisified.writeFileSync('perf.json', JSON.stringify(results, null, 2), 'utf8');
  });

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
