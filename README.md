# Virtual DOM

[![Greenkeeper badge](https://badges.greenkeeper.io/pepebecker/virtual-dom.svg)](https://greenkeeper.io/)

[![dependency status](https://img.shields.io/david/pepebecker/virtual-dom.svg)](https://david-dm.org/pepebecker/virtual-dom)
[![dev dependency status](https://img.shields.io/david/dev/pepebecker/virtual-dom.svg)](https://david-dm.org/pepebecker/virtual-dom#info=devDependencies)
[![MIT-licensed](https://img.shields.io/github/license/pepebecker/virtual-dom.svg)](https://opensource.org/licenses/MIT)
[![chat on gitter](https://badges.gitter.im/pepebecker.svg)](https://gitter.im/pepebecker)

## Install

```shell
npm install pepebecker/virtual-dom
```

## Usage

```js
const {h, createElement, update} = require('virtual-dom')

const rootElement = document.querySelector('#main')

let count = 0

function createVirtualDom () {
  return h('div', {class: 'container'},
    h('h2', null, 'Virtual DOM Example'),
    h('p', null, 'Count: ' + count),
    h('button', {onclick: 'increaseCount()'}, 'Count up')
  )
}

let virtualDom = createVirtualDom()

rootElement.appendChild(createElement(virtualDom))

function increaseCount () {
  count ++
  virtualDom = update(rootElement, createVirtualDom(), virtualDom)
}
```

## [Online Demo](https://cdn.rawgit.com/pepebecker/virtual-dom/master/example/index.html)

## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/pepebecker/virtual-dom/issues).