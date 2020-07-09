import superagent from 'superagent';
import path from 'path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import glob from 'glob';
import Throttle from 'superagent-throttle';

const cheerio = require('cheerio');
const fs = require('fs').promises;

const download = async (opts = {}) => {
  const dest = path.resolve(opts.destination || 'emojis');

  const emojis = glob.sync('src/emojis/slackmojis/**/*.json');

  let throttle = new Throttle({
    active: true, // set false to pause queue
    rate: 1, // how many requests can be sent every `ratePer`
    ratePer: 1000, // number of ms in which `rate` requests may be sent
    concurrent: 2 // how many requests can be sent concurrently
  });

  const loading = new cliProgress.SingleBar(
    {
      format:
        'CLI Progress |' +
        chalk.blue('{bar}') +
        '| {percentage}% || {value}/{total} chunks',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );

  const uris = [
    'https://slackmojis.com/',
    'https://slackmojis.com/emojis/popular',
    'https://slackmojis.com/emojis/recent',
    'https://slackmojis.com/categories/17-hangouts-blob-emojis',
    'https://slackmojis.com/categories/2-logo-emojis',
    'https://slackmojis.com/categories/3-meme-emojis',
    'https://slackmojis.com/categories/7-party-parrot-emojis',
    'https://slackmojis.com/categories/10-skype-emojis',
    'https://slackmojis.com/categories/19-random-emojis'
  ];

  loading.start(uris.length, 0);

  let requests = [];

  const getUris = async () => {
    return Promise.all(
      uris.map(async uri => {
        const request = await superagent.get(uri).use(throttle.plugin());

        loading.increment();

        request.uri = uri;

        requests.push(request);
      })
    );
  };

  await getUris();

  loading.stop();

  console.log(chalk.green('Finished fetching'));

  let list = [];
  let errors = [];

  const fetch = async () => {
    return Promise.all(
      requests.map(async (request = {}) => {
        const { uri } = request;

        console.log('');
        console.log(chalk.yellow(`Parsing page and fetching ${uri} emojis`));

        const $ = cheerio.load(request.text);

        const emojiSelector = $('li .emoji');

        console.log('');
        console.log(chalk.green(`Found ${emojiSelector.length} on ${uri}!`));

        console.log('');
        console.log(chalk.yellow(`Compiling emojis from ${uri}...`));

        emojiSelector.each((_index, element) => {
          const name = $(element).attr('title');
          const url = $(element).find('a').attr('href');
          const filename = $(element).find('a').attr('download');

          if (!emojis.includes(`src/emojis/slackmojis/${name}.json`)) {
            list.push({ name, url, filename });
          }
        });

        console.log('');
        console.log(chalk.green('Done!'));
      })
    );
  };

  await fetch();

  const fetching = new cliProgress.SingleBar(
    {
      format: `Progress | ${chalk.blue(
        '{bar}'
      )} '| {percentage}% || ${chalk.yellow(
        '{value}/{total} emojis'
      )} || ${chalk.blue('{filename}')}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );

  fetching.start(list.length, 0, {
    filename: 'N/A'
  });

  const fetchData = async () => {
    console.log('');
    console.log(
      chalk.bgYellow.black(`Beginning mass fetch of ${list.length} records...`)
    );

    return Promise.all(
      list.map(async item => {
        const { name, url, filename } = item;

        try {
          fetching.update({ filename: chalk.green(url) });

          const request = await superagent
            .get(`https://slackmojis.com${url}`)
            .use(throttle.plugin());

          const { body } = request;

          const buffer = Buffer.from(body);
          const base64 = buffer.toString('base64');

          await fs.writeFile(
            `${dest}/${name}.json`,
            JSON.stringify({ name, url, filename, base64 }, null, 2)
          );
        } catch (error) {
          errors.push({
            name,
            code: error.code,
            errno: error.errno,
            uri: `https://slackmojis.com${url}`
          });
        }

        fetching.increment();
      })
    );
  };

  await fetchData();

  fetching.stop();

  console.log('');
  console.log('');
  console.log('===');
  console.log('');
  console.log(chalk.green('Finished. Bye!'));

  if (errors.length) {
    console.log(chalk.yellow('Errors were encountered during download'));
    console.table(errors);
  }
};

(async () => {
  try {
    await download({
      destination: `${process.cwd()}/src/emojis/slackmojis`
    });

    return process.exit(0);
  } catch (e) {
    console.error(e);

    return process.kill(process.pid);
  }
})();
