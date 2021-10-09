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
git config -f .gitmodules submodule.src/nor/ui-services.branch main

git submodule add git@github.com:sendanor/ui-components.git src/nor/ui/components
git config -f .gitmodules submodule.src/nor/ui-components.branch main
```

Only required dependency is to [the Lodash library](https://lodash.com/):

```
npm install --save-dev lodash @types/lodash
```

Some of our code may use reflect metadata. It's optional otherwise.

```
npm install --save-dev reflect-metadata
```

### Stable releases available for a commercial customer

For *tailored commercial release*, you may contact [our sales](mailto:info@sendanor.fi). 

General rule for pricing is 500 € (or $600) / [feature](https://github.com/sendanor/ui/issues). One full stable release containing multiple 
components is 8000 €.

The payment includes a month of agile development with the customer, and a year of
support for that release branch.



## Demo app

UI form builder demo available at [lomake.app](https://www.lomake.app/builder).

### The iframe demo

Here's an iframe POC how to use the form model on outside website:

```html
<div id="iframe-container"></div>

<script src="https://www.lomake.app/libs/nor-ui-frame.min.js"></script>

<script>
(function() {

    const iframe = window.nor.uiFrame.init('iframe-container');

    iframe.on("submit", (data) => {
        console.log('SUBMIT: ', data)
    });

    iframe.on("cancel", () => {
        console.log('CANCEL')
    });

    iframe.setModel({
        "title": "Test form",
        "items": [
            {
                "type": "text-field",
                "key": "customer.firstName",
                "label": "First name"
            },
            {
                "type": "text-field",
                "label": "Last name",
                "key": "customer.lastName"
            },
            {
                "type": "text-field",
                "label": "Email",
                "key": "customer.email"
            },
            {
                "type": "text-area-field",
                "key": "order.summary",
                "placeholder": "Summary of order"
            }
        ]
    });

})();
</script>

```

Although it may already partially work, ***this is just a POC***. We may change the API at any moment!

The model for `iframe.setModel()` can be created using [lomake.app/builder](https://www.lomake.app/builder).

This example is also available at [./examples/test-iframe.html](https://github.com/sendanor/ui/blob/main/examples/test-iframe.html) as well as online at [lomake.app/test-iframe.html](https://www.lomake.app/test-iframe.html).

### React component

We also have a react component to render the form -- but it has not been released yet. Our builder's preview uses it.

```jsx
<Form
    model={formModel}
    value={valueModel}
    change={(value) => {}}
    submit={() => {}}
    cancel={() => {}}
/>
```
