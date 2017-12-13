const htmlparser = require('htmlparser2')

const REMOVE_TAGS = ['center', 'font', 'script', 'style']
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
  return REMOVE_TAGS.indexOf(node.name) !== -1
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
  // if (shouldRemove(node) && !isEmpty(node)) return render(node.children)

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
  var html = ''

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

module.exports = function (html) {
  if (!html || html.trim().length === 0) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) return reject(error)
      const html = render(dom).trim()
      resolve(html)
    })

    var parser = new htmlparser.Parser(handler, {decodeEntities: true})
    parser.write(html)
    parser.done()
  })
}
