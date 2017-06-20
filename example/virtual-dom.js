(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.VirtualDOM = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

const CREATE = 'CREATE'
const REMOVE = 'REMOVE'
const REPLACE = 'REPLACE'
const UPDATE = 'UPDATE'
const SET_PROP = 'SET_PROP'
const REMOVE_PROP = 'REMOVE_PROP'

const SVG_TAGS = [
	'a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'audio',
	'canvas', 'circle', 'clipPath', 'color-profile', 'cursor',
	'defs', 'desc', 'discard',
	'ellipse',
	'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject',
	'g', 'glyph', 'glyphRef',
	'hatch', 'hatchpath', 'hkern',
	'iframe', 'image',
	'line', 'linearGradient',
	'marker', 'mask', 'mesh', 'meshgradient',
	'meshpatch', 'meshrow', 'metadata', 'missing-glyph', 'mpath',
	'path', 'pattern', 'polygon', 'polyline',
	'radialGradient', 'rect',
	'script', 'set', 'solidcolor', 'stop', 'style', 'svg', 'switch', 'symbol',
	'text', 'textPath', 'title', 'tref', 'tspan',
	'unknown', 'use',
	'video', 'view', 'vkern'
]

// DIFF

function changed (node1, node2) {
	return typeof node1 !== typeof node2 ||
		   typeof node1 === 'string' && node1 !== node2 ||
		   node1.type !== node2.type
}

function diffProps (newNode, oldNode) {
	const patches = []
	const props = Object.assign({}, newNode.props, oldNode.props)
	Object.keys(props).forEach(name => {
		const newVal = newNode.props[name]
		const oldVal = oldNode.props[name]
		if (!newVal) {
			patches.push({ type: REMOVE_PROP, name, value: oldVal })
		} else if (!oldVal || newVal !== oldVal) {
			patches.push({ type: SET_PROP, name, value: newVal })
		}
	})
	return patches
}

function diffChildren (newNode, oldNode) {
	const patches = []
	const patchesLength = Math.max(
		newNode.children.length,
		oldNode.children.length
	)
	for (let i = 0; i < patchesLength; i++) {
		patches[i] = diff(
			newNode.children[i],
			oldNode.children[i]
		)
	}
	return patches
}

function diff (newNode, oldNode) {
	if (!oldNode) {
		return { type: CREATE, newNode }
	}
	if (!newNode) {
		return { type: REMOVE }
	}
	if (changed(newNode, oldNode)) {
		return { type: REPLACE, newNode}
	}
	if (newNode.type) {
		return {
			type: UPDATE,
			children: diffChildren(newNode, oldNode),
			props: diffProps(newNode, oldNode)
		}
	}
}

// PATCH

function createElement (node) {
	// Handle nodes which are just a string or a number
	if (typeof node === 'string' || typeof node === 'number') {
		return document.createTextNode(node)
	}

	// Create DOM element from the node
	let el = document.createElement(node.type)

	if (SVG_TAGS.includes(node.type)) {
		el = document.createElementNS('http://www.w3.org/2000/svg', node.type)
		el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink')
	}

	// Set properties of this DOM element
	setProps(el, node.props)

	// Recursively create children and append them to this DOM element.
	node.children
		.map(createElement)
		.forEach(el.appendChild.bind(el))

	// Return DOM element
	return el
}

function setProp (target, name, value) {
	target.setAttribute(name, value)
}

function setProps (target, props) {
	Object.keys(props).forEach(name => {
		setProp(target, name, props[name])
	})
}

function removeProp (target, name, value) {
	target.removeAttribute(name)
}

function patchProps (parent, patches) {
	for (let i = 0; i < patches.length; i++) {
		const propPatch = patches[i]
		const {type, name, value} = propPatch
		if (type === SET_PROP) {
			setProp(parent, name, value)
		}
		if (type === REMOVE_PROP) {
			removeProp(parent, name, value)
		}
	}
}

function patch (parent, patches, index = 0) {
	if (!patches) return
	const el = parent.childNodes[index]
	switch (patches.type) {
		case CREATE: {
			const {newNode} = patches
			const newEl = createElement(newNode)
			return parent.appendChild(newEl)
		}
		case REMOVE: {
			return parent.removeChild(el)
		}
		case REPLACE: {
			const {newNode} = patches
			const newEl = createElement(newNode)
			return parent.replaceChild(newEl, el)
		}
		case UPDATE: {
			const {children, props} = patches
			patchProps(el, props)
			for (let i = 0; i < children.length; i++) {
				patch(el, children[i], i)
			}
		}
	}
}

function update (rootElement, newNode, oldNode) {
	const pathes = diff(newNode, oldNode)
	patch(rootElement, pathes)
	return newNode

}

function flatten (arr) {
	return [].concat.apply([], arr)
}

function h (type, props, ...children) {
	props = props || {}
	return { type, props, children: flatten(children) }
}

module.exports = {
	createElement,
	diff,
	patch,
	update,
	h
}

},{}]},{},[1])(1)
});