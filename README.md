# @cv-cli

The global command for `cli` is: `cv`

| CMD     | Description          | Note      |
|---------|----------------------|-----------|
| create  | Initialize a project | Alias: c  |
| install | Install a template   | Alias: i  |
| yo      | Initialize a Yeoman template |   |

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

The `npm` package for templates should have the prefix `@otdrfu/generator-`.

```bash
cv install @otdrfu/generator-pc-xxx
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

A folder named `@otdrfu-generator-test-yo` will be created in the current directory, containing the code for creating project templates suitable for `cv`.

➜  cd @otdrfu-generator-test-yo

➜  tree -L 1

```plaintext
.
├── README.md
├── index.js
├── package.json  # The package name must have the prefix @otdrfu/generator-
├── questions.js  # Yeoman script, can be adjusted as needed
└── template      # Project template code should be placed in this directory
```
