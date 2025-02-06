type PlainObject = Record<string, any>

type CommandArgs = Array<string>

type DirectoryInfo = {
  home: string
  tpl: string
  cwd: string
}

type Builder = {
  (
    config: {
      env: 'development' | 'production'
    },
    PlainObject
  ): void
}

type Template = {
  url: string
  name: string
  description: string
  version: string
}

declare module 'download-git-repo' {
  interface Options {
    clone: boolean;
    headers: Record<string, string>;
  }
  function download(repo: string, dest: string, opts: Options): string;
  function download(repo: string, dest: string, opts: Options, cb: (err?: Error) => void): string;

  export = download;
}
