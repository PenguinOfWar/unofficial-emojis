import superagent from 'superagent';
import path from 'path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import glob from 'glob';

const cheerio = require('cheerio');
const fs = require('fs').promises;

const download = async (opts = {}) => {
  const dest = path.resolve(opts.destination || 'emojis');

  console.log(`${dest}/emojis/slackmojis/*.json`);

  const emojis = glob.sync('emojis/slackmojis/**/*.json');

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

  loading.start(100, 50);

  const request = await superagent.get('https://slackmojis.com').timeout({
    response: 5000,
    deadline: 60000
  });

  loading.update(100);

  loading.stop();

  const $ = cheerio.load(request.text);

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

  const emojiSelector = $('li .emoji');

  fetching.start(emojiSelector.length, 0, {
    filename: 'N/A'
  });

  let list = [];
  let errors = [];

  emojiSelector.each((_index, element) => {
    const name = $(element).attr('title');
    const url = $(element).find('a').attr('href');
    const filename = $(element).find('a').attr('download');

    if (!emojis.includes(`emojis/slackmojis/${name}.json`)) {
      list.push({ name, url, filename });
    } else {
      fetching.increment();
    }
  });

  for (const item of list) {
    const { name, url, filename } = item;
    fetching.update({ filename: chalk.green(filename) });

    try {
      const request = await superagent
        .get(`https://slackmojis.com${url}`)
        .timeout({
          response: 5000,
          deadline: 60000
        });

      const { body } = request;

      const buffer = Buffer.from(body);
      const base64 = buffer.toString('base64');

      await fs.writeFile(
        `${dest}/${name}.json`,
        JSON.stringify({ name, url, filename, base64 }, null, 2)
      );
    } catch (error) {
      errors.push({ name, error });
    }

    fetching.increment();
  }

  console.log(chalk.green('Done!'));

  if (errors.length) {
    console.log(chalk.yellow('Errors were encountered during download'));
    console.table(errors);
  }
};

(async () => {
  try {
    await download({
      destination: `${process.cwd()}/emojis/slackmojis`
    });

    return process.exit(0);
  } catch (e) {
    console.error(e);

    return process.kill(process.pid);
  }
})();
