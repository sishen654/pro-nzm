import { chalk, writeJsonSync } from "./util"
import { NZMRC, getOptions } from "./contains"

export default function rename(name: string, newName: string) {
  const options = getOptions()
  const keyExit = Object.keys(options).includes(name)
  options[newName] = options[name]
  delete options[name]
  writeJsonSync(NZMRC, options)
  console.log(keyExit ? `${chalk.success('SUCCESS')}: Rename success.` : `${chalk.warn('WARN')}: The name is not exit.`);
};
