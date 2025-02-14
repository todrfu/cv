# @cv-cli

+ [![Release](https://github.com/todrfu/cv-cli/actions/workflows/release.yml/badge.svg)](https://github.com/todrfu/cv-cli/actions/workflows/release.yml)

The global command for `cli` is: `cv`

```bash
➜  cv -h
Usage: cv [options] [command]

Options:
  -v, --version        output the version number
  -h, --help           display help for command

Commands:
  create|c             create a project
  install|i <pkgName>  install a cv template
  yo|y <projectName>   create cv template
  update               update cv self
  help [command]       display help for command
```

## create

Initialize a project and choose from different project templates. The default template will be downloaded and configured on first use:

- xxx template

If the desired template is not available, you can choose to install [other templates](#install).

```bash
✗  cv create
? Please select a template: (Use arrow keys)
  xxx template 
  yyy template 
❯ Don't have the template you want? Install a new template now?
```

## install

Install other templates, supporting both `npm` packages and `git url` packages.

The `npm` package for templates should have the prefix `cv-generator-`.

```bash
cv install cv-generator-pc-xxx
```

If the project corresponding to the `git url` is not a `yeoman-generator` package as specified by this project, it will be forcibly converted to a `yeoman-generator` package after downloading.

```bash
➜  cv install https://github.com/todrfu/xxx.git

# or specify the branch
➜  cv install https://github.com/todrfu/xxx.git#master
```

## yo

When you need to add template options, you can customize the project template using the `cv yo xxx` command to initialize a `Yeoman` project template. Fill in the content as needed.

```bash
➜  cv yo test-yo
```

A folder named `generator-test-yo` will be created in the current directory, containing the code for creating project templates suitable for `cv`.

➜  cd generator-test-yo

➜  tree -L 1

```plaintext
.
├── README.md
├── index.js
├── package.json  # The package name must have the prefix cv-generator-
├── questions.js  # Yeoman script, can be adjusted as needed
└── template      # Project template code should be placed in this directory
```
