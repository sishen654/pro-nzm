import { runSync } from "@src/util";

const run = (command: string, options?: any) => {
  let { stdout } = runSync([command], options);
  return stdout
}
const npm = "npm get registry"
const cnpm = "cnpm get registry"
const yarn1 = "yarn config get registry"
const yarn2 = "yarn config get npmRegistryServer"
const pnpm = "pnpm get registry"
const defaultOptions = {
  npm: "https://registry.npmjs.org/",
  tencent: "https://mirrors.cloud.tencent.com/npm/",
  cnpm: "https://r.cnpmjs.org/",
  taobao: "https://registry.npmmirror.com/",
}

describe("nzm cli", () => {
  describe("Common command", () => {
    it("Help command output font length of more than 1000", () => {
      let { stdout } = runSync(["nzm -h"])
      expect(stdout.length).toBeGreaterThan(1000)
    })
    it("Chekc address list", () => {
      let { stdout } = runSync(["nzm ls"])
      expect(stdout.includes('npm')).toBeTruthy()
      expect(stdout.includes('tencent')).toBeTruthy()
      expect(stdout.includes('cnpm')).toBeTruthy()
      expect(stdout.includes('taobao')).toBeTruthy()
    })
  })

  describe("Add address", () => {
    it("Add new address with http url", () => {
      let { stdout: add } = runSync(["nzm add test http://demo.com"])
      expect(add.includes('SUCCESS')).toBeTruthy()
      let { stdout: list } = runSync(["nzm ls"])
      expect(list.includes('test')).toBeTruthy()
      let { stdout: del } = runSync(["nzm del test"])
      expect(del.includes('SUCCESS')).toBeTruthy()
    })
    it("Add new address with https url", () => {
      let { stdout: add } = runSync(["nzm add test https://demo.com"])
      expect(add.includes('SUCCESS')).toBeTruthy()
      let { stdout: list } = runSync(["nzm ls"])
      expect(list.includes('test')).toBeTruthy()
      let { stdout: del } = runSync(["nzm del test"])
      expect(del.includes('SUCCESS')).toBeTruthy()
    })
    it("Use error url to add new address", () => {
      let { stdout: add1 } = runSync(["nzm add error 123"])
      expect(add1.includes('ERROR')).toBeTruthy()
      let { stdout: add2 } = runSync(["nzm add error abc"])
      expect(add2.includes('ERROR')).toBeTruthy()
      let { stdout: add3 } = runSync(["nzm add error .//."])
      expect(add3.includes('ERROR')).toBeTruthy()
    })
  })

  describe("Modify name", () => {
    it("Modify address based on existing name", () => {
      runSync(["nzm add test https://demo.com"])
      runSync(["nzm rename test change-abc"])
      let { stdout } = runSync(["nzm ls"])
      expect(stdout.includes('test')).toBeFalsy()
      expect(stdout.includes('change-abc')).toBeTruthy()
      runSync(["nzm del change-abc"])
    })
    it("Modify address based on not existing name", () => {
      let { stdout } = runSync(["nzm rename testtest change-abc"])
      expect(stdout.includes('WARN')).toBeTruthy()
    })
  })

  describe("Delete name", () => {
    it("Delete address based on existing name", () => {
      runSync(["nzm add test https://demo.com"])
      let { stdout } = runSync(["nzm del test"])
      expect(stdout.includes('SUCCESS')).toBeTruthy()
      let { stdout: ls } = runSync(["nzm ls"])
      expect(ls.includes('test')).toBeFalsy()
    })
    it("Delete address based on not existing name", () => {
      let { stdout } = runSync(["nzm del testtest"])
      expect(stdout.includes('WARN')).toBeTruthy()
    })
  })

  describe("Toggle address", () => {
    it("Toggle address based on existing name", () => {
      const cnpmRegistry = defaultOptions['cnpm']
      const yarn = Number(run('yarn -v')[0]) <= 1 ? yarn1 : yarn2
      expect(run("nzm use cnpm").includes('SUCCESS')).toBeTruthy()
      expect(run(npm)).toEqual(cnpmRegistry)
      expect(run(cnpm)).toEqual(cnpmRegistry)
      expect(run(yarn)).toEqual(cnpmRegistry)
      expect(run(pnpm)).toEqual(cnpmRegistry)
      const npmRegistry = defaultOptions['npm']
      expect(run("nzm use npm").includes('SUCCESS')).toBeTruthy()
      expect(run(npm)).toEqual(npmRegistry)
      expect(run(cnpm)).toEqual(npmRegistry)
      expect(run(yarn)).toEqual(npmRegistry)
      expect(run(pnpm)).toEqual(npmRegistry)
    })
    it("Toggle address based on not existing name", () => {
      let stdout = run("nzm use abc-demo")
      expect(stdout.includes('WARN')).toBeTruthy()
    })
  })
})