import { chalk, readJsonSync } from "./util"
import { getRegistry, getOptions } from "./contains"

export default function ls() {
  // 展示当前源
  const options = getOptions()
  const keys = Object.keys(options)
  const max = Math.max(...keys.map(v => Number(v.length)))
  const current = getRegistry()
  const currentExit = Object.values(options).includes(current)
  keys.forEach(key => {
    console.log(`${current === options[key] ? chalk.success('*') : ' '} ${key} ${'-'.repeat(max - key.length + 8)} ${options[key]}`);
  })
  if (!currentExit) {
    console.log(`${chalk.error('ERROR')}: The current npm source does not exist. Please use ${chalk.info('nzm add [name] [url]')} to add it`);
    console.log(`CURRENT URL: ${chalk.info(current)}`);
  }
};
