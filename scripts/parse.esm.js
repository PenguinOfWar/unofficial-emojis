import superagent from 'superagent';
import path from 'path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import glob from 'glob';

const fs = require('fs').promises;
const converter = require('number-to-words');
const camelCase = require('camelcase');

const parse = async () => {
  const emojis = glob.sync('src/emojis/slackmojis/**/*.json');

  const parsing = new cliProgress.SingleBar(
    {
      format: `Progress | ${chalk.blue(
        '{bar}'
      )} '| {percentage}% || ${chalk.yellow(
        '{value}/{total} emojis'
      )} || ${chalk.blue('{filename}')}\n`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );

  if (emojis.length) {
    let list = [];
    let file = [];
    let cached = {};

    parsing.start(emojis.length, 0, {
      filename: 'N/A'
    });

    emojis.map(async emoji => {
      parsing.update({ filename: chalk.green(emoji) });

      const name = emoji
        .replace('src/emojis/slackmojis/', '')
        .replace('.json', '');

      // const exportName = camelCase(converter.toWords(name));

      let exportName = name;

      let regex = /\d+/g;
      let m;

      while ((m = regex.exec(exportName)) != null) {
        exportName = exportName.replace(
          String(m[0]),
          ` ${converter.toWords(m[0])} `
        );
      }

      exportName = camelCase(exportName.trim());

      list.push({ name, exportName });

      if (!cached[exportName]) {
        file.push(
          `export { default as ${exportName} } from './${name}.json';\n`
        );

        cached[exportName] = true;
      } else {
        console.log(chalk.blue(`Skipping ${exportName}`));
      }

      return parsing.increment();
    });

    file.push(`export const ueFullList = ${JSON.stringify(list)};`);

    await fs.writeFile(
      `${process.cwd()}/src/emojis/slackmojis/index.js`,
      file.join('')
    );
  }
};

(async () => {
  try {
    await parse();

    return process.exit(0);
  } catch (e) {
    console.error(e);

    return process.kill(process.pid);
  }
})();