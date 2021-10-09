# @sendanor/ui-components

Our enterprise library for ReactJS UI elements.

We will release our UI related components here as compile style library.

For now this repository is mostly for [issue tracking](https://github.com/sendanor/ui/issues) and demo purposes.

### It's MIT licenced

### It doesn't have many runtime dependencies (if any)

This library expects some of our libraries to exist in relative paths:

 * [@sendanor/typescript](https://github.com/sendanor/typescript) to be located in the relative path `../../ts`
 * [@sendanor/ui-services](https://github.com/sendanor/ui-services) to be located in the relative path `../services`

The only 3rd party dependency we have is for [Lodash library](https://lodash.com/).

### It's well tested

Our unit tests exists beside the code. To run tests, check out our test repository [@sendanor/test](https://github.com/sendanor/test).

### We don't have traditional releases

This project evolves directly to our git repository in an agile manner.

This git repository contains only the source code for compile time use case. It is meant to be used as a git submodule 
in a NodeJS or webpack project.

Recommended way to initialize your project is like this:

```
mkdir -p src/nor/ui

git submodule add git@github.com:sendanor/typescript.git src/nor/ts
git config -f .gitmodules submodule.src/nor/ts.branch main

git submodule add git@github.com:sendanor/ui-services.git src/nor/ui/services
git config -f .gitmodules submodule.src/nor/ui/services.branch main

git submodule add git@github.com:sendanor/ui-styles.git src/nor/ui/styles
git config -f .gitmodules submodule.src/nor/ui/styles.branch main

git submodule add git@github.com:sendanor/ui-components.git src/nor/ui/components
git config -f .gitmodules submodule.src/nor/ui/components.branch main
```

Only required dependency is to [the Lodash library](https://lodash.com/):

```
npm install --save-dev lodash @types/lodash
```

Some of our code may use reflect metadata. It's optional otherwise.

```
npm install --save-dev reflect-metadata
```

### Commercial support

For commercial support check [Sendanor's organization page](https://github.com/sendanor).
