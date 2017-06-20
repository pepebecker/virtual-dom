const {h, createElement, update} = VirtualDOM

const rootElement = document.querySelector('#main')

const data = {
	nodes: [
		{x: 50, y: 50, direction: 1},
		{x: 75, y: 100, direction: 1},
		{x: 100, y: 150, direction: 1},
		{x: 125, y: 200, direction: 1},
		{x: 150, y: 250, direction: 1},
		{x: 175, y: 300, direction: 1}
	],
	lines: [
		{
			from: {x: 50, y: 50},
			to: {x: 100, y: 100}
		},
		{
			from: {x: 100, y: 50},
			to: {x: 50, y: 100}
		},
		{
			from: {x: 50, y: 100},
			to: {x: 100, y: 150}
		},
		{
			from: {x: 100, y: 100},
			to: {x: 50, y: 150}
		},
		{
			from: {x: 50, y: 150},
			to: {x: 100, y: 200}
		},
		{
			from: {x: 100, y: 150},
			to: {x: 50, y: 200}
		}
	]
}

let direction = 1
let positionX = 50

let maxLines = 1

function createVirtualDom () {
	return h('div', null,
		h('h2', null, 'SVG Animation using Virtual DOM'),
		h('svg', {width: 256, height: 320},
			data.nodes.map(node => {
				return h('circle', {class: 'node', cx: node.x, cy: node.y, r: "16"})
			})
		),
		h('svg', {width: 256, height: 320},
			data.lines.slice(0, maxLines).map(line => {
				return h('line', {
					class: 'line',
					x1: line.from.x,
					y1: line.from.y,
					x2: line.to.x,
					y2: line.to.y,
					onmouseenter: 'onLineHover(this)'
				})
			})
		),
		h('button', {class: 'add-line-btn', onclick: 'onClickAddLine()'}, 'Add line'),
		h('button', {class: 'del-line-btn', onclick: 'onClickDelLine()'}, 'Remove line')
	)
}

let virtualDom = createVirtualDom()

rootElement.appendChild(createElement(virtualDom))

function onLineHover (line) {
	line.parentNode.appendChild(line)
}

function onClickAddLine () {
	if (maxLines < data.lines.length) {
		maxLines ++
	}
}

function onClickDelLine () {
	if (maxLines > 0) {
		maxLines --
	}
}

animate()

function animate (time) {
	data.nodes.forEach(node => {
		node.x += node.direction

		if (node.x > 200) {
			node.direction = -1
		}

		if (node.x < 50) {
			node.direction = 1
		}
	})

	virtualDom = update(rootElement, createVirtualDom(), virtualDom)

	requestAnimationFrame(animate)
}
