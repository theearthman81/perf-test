import minimist from 'minimist';
import webdriverio from 'webdriverio';
import Promise from 'bluebird';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import metrics from './metrics';
import utils from './utils';

const fsPromisified = Promise.promisifyAll(fs);
let actions = {};
let results = {};
let client;

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
  console.warn(chalk.red('perf: no actions found.'));
}


function startClient() {
  console.log(chalk.green('starting webdriver client...'));

  client = webdriverio
    .remote(wdOptions)
    .init();

  console.log(chalk.green('adding custom commands...'));

  Object.keys(metrics).forEach((key) => client.addCommand(key, metrics[key](client)));
  Object.keys(utils).forEach((key) => client.addCommand(key, utils[key](client)));

  return client.url(options.url);
}

function runActions(client) {
  console.log(chalk.green('running actions...'));

  return Promise.resolve(Object.keys(actions))
    .mapSeries((key) => {
      console.log(chalk.green('running action %s.'), key);

      results[key] = {};
      return actions[key](client, results[key]);
    }).then(() => results);
}

function writeResults(results) {
  console.log(chalk.green('writing results...'));

  return fsPromisified.writeFileSync('perf.json', JSON.stringify(results, null, 2), 'utf8');
}

startClient()
  .then(() => {
    return runActions(client)
        .then((results) => {
          console.log(chalk.green('closing webdriver client...'));

          client.end();
          return results;
        });
  })
  .then((result) => {
    return writeResults(result);
  })
  .then(() => {
    console.log(chalk.green('complete.'));
  })
  .catch(() => {
    console.log(chalk.red('something went wrong.'));
  });
