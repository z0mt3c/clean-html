const htmlparser = require('htmlparser2')

const REMOVE_TAGS = ['center', 'script', 'style']
const UNWRAP_TAGS = ['font']
const REMOVE_EMPTY_TAGS = ['p', 'strong']
const VOID_ELEMENTS = [
  'area',
  'base',
  'basefont',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',

  // common self closing svg elements
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use'
]

function isEmpty (node) {
  if (node.type === 'text') return !node.data.trim()
  if (node.type === 'comment') return !node.data.trim()
  return !node.children.length || node.children.every(isEmpty)
}

function shouldRemove (node) {
  if (node.type === 'text') return isEmpty(node)
  if (REMOVE_EMPTY_TAGS.indexOf(node.name) !== -1) return isEmpty(node)
  return REMOVE_TAGS.indexOf(node.name) !== -1
}

function shouldUnwrap (node) {
  return UNWRAP_TAGS.indexOf(node.name) !== -1 && !isEmpty(node)
}

function renderText (node) {
  if (shouldRemove(node)) return ''
  let text = node.data
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/\s+/g, ' ')
  return text
}

function renderTag (node) {
  if (shouldRemove(node)) return ''
  if (shouldUnwrap(node)) return render(node.children)

  const attributes = Object.keys(node.attribs).map(attrib => {
    const value = node.attribs[attrib]
    return ` ${attrib}="${value}"`
  }).join('')

  const openTag = `<${node.name}${attributes}>`
  if (VOID_ELEMENTS.indexOf(node.name) !== -1) return openTag
  const closeTag = '</' + node.name + '>'
  return openTag + render(node.children) + closeTag
}

function renderDirective (node) {
  return '<' + node.data + '>'
}

function render (nodes) {
  let html = ''

  nodes.forEach(function (node) {
    if (node.type === 'root') {
      html += render(node.children)
      return
    }

    if (node.type === 'text') {
      html += renderText(node)
      return
    }

    if (node.type === 'comment') {
      return
    }

    if (node.type === 'directive') {
      html += renderDirective(node)
      return
    }

    html += renderTag(node)
  })

  // remove extra line breaks
  return html.replace(/\n+/g, '\n')
}

module.exports = function (html, options = {}) {
  if (!html || html.trim().length === 0) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) return reject(error)
      const html = render(dom).trim()
      resolve(html)
    })

    const parser = new htmlparser.Parser(handler, { decodeEntities: false, ...options })
    parser.write(html)
    parser.done()
  })
}
