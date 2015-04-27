(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var storage = [false, false, false, false]

module.exports.from = function (id) {
  return storage[id]
}

module.exports.update = function (id, geo) {
  storage[id] = geo
}

},{}],2:[function(require,module,exports){
var eventListeners = require('./lib/eventlisteners')
var slice = require('./lib/liberate')([].slice)
var activate = require('./lib/activate')
var mesh = require('./mesh')
var paintings = require('./paintings')

function setTextContent(element) {
  var colour = document.querySelector('.box-colour')
  var colourName = element.dataset.name
  colour.textContent = colourName
}

var getColour = module.exports.get = function(element) {
  var classes = slice(element.classList)
  return '#' + classes.reduce(function (colour, className) {
    if (className.indexOf('colour--') !== -1)
      colour = className.split('colour--')[1]
    return colour
  }, '')
}

function changeColour(scene, update) {
  return function(e) {
    if (this.classList.contains('is-active')) return
    var colour = getColour(this)
    var gradient = document.querySelector('.gradient.colour--' + colour.substring(1))
    var finish = document.querySelector('.buttons--finishes .button.is-active')
    activate(this)
    activate(gradient)
    setTextContent(this)
    if (finish)
      mesh.setColour(scene, colour, paintings[finish.dataset.id])
    update()
  }
}

module.exports.init = function(scene, update) {
  var colourButtons = slice(document.querySelectorAll('.buttons--colours li'))
  colourButtons.forEach(eventListeners.add('click', changeColour(scene, update)))
  colourButtons[colourButtons.length - 1].dispatchEvent(new Event('click'))
}

},{"./lib/activate":4,"./lib/eventlisteners":6,"./lib/liberate":7,"./mesh":10,"./paintings":11}],3:[function(require,module,exports){
var eventListeners = require('./lib/eventlisteners')
var slice = require('./lib/liberate')([].slice)
var activate = require('./lib/activate')
var paintings = require('./paintings')
var load = require('./load')
var colours = require('./colours')
var mesh = require('./mesh')
var loading = false

function setTextContent(painting) {
  var information = document.querySelector('.sidebar-information')
  var finish = document.querySelector('.box-finish')
  information.textContent = painting.information
  finish.textContent = 'Finish ' + (painting.id + 1)
}

function changeFinish(scene, update) {
  return function(e) {
    var painting = paintings[this.dataset.id]
    if (loading) return false
    if (this.classList.contains('is-active')) return false
    loading = load.start()
    mesh.remove(scene, update)
    setTextContent(painting)
    load.painting(painting, gotGeo(scene, update))
    return activate(this)
  }
}

function gotGeo(scene, update) {
  return function (painting, geo) {
    var activeColour = document.querySelector('.buttons--colours li.is-active')
    var colour = colours.get(activeColour)
    var zmesh = mesh.new(geo, colour, painting)
    scene.add(zmesh)
    loading = load.end()
    update()
  }
}

module.exports.init = function(scene, update) {
  var finishButtons = slice(document.querySelectorAll('.buttons--finishes li'))
  finishButtons.forEach(eventListeners.add('click', changeFinish(scene, update)))
  finishButtons[0].dispatchEvent(new Event('click'))
}

},{"./colours":2,"./lib/activate":4,"./lib/eventlisteners":6,"./lib/liberate":7,"./load":8,"./mesh":10,"./paintings":11}],4:[function(require,module,exports){
var slice = require('./liberate')([].slice)
var classlist = require('./classlist')

module.exports = function(element) {
  slice(element.parentNode.childNodes).forEach(classlist.remove('is-active'))
  element.classList.add('is-active')
}

},{"./classlist":5,"./liberate":7}],5:[function(require,module,exports){
module.exports.add = function (name) {
  return function (element) {
    element.classList.add(name)
  }
}

module.exports.remove = function (name) {
  return function (element) {
    element.classList.remove(name)
  }
}

module.exports.toggle = function (name) {
  return function (element) {
    element.classList.toggle(name)
  }
}

},{}],6:[function(require,module,exports){
module.exports.add = function (event, func) {
  return function (element) {
    element.addEventListener(event, func)
  }
}

module.exports.remove = function (event, func) {
  return function (element) {
    element.removeEventListener(event, func)
  }
}

},{}],7:[function(require,module,exports){
module.exports = Function.bind.bind(Function.call)

},{}],8:[function(require,module,exports){
/*global THREE */
var slice = require('./lib/liberate')([].slice)
var classlist = require('./lib/classlist')
var cache = require('./cache')
var loader = new THREE.JSONLoader()

function onProgress (xhr) {
  var percentComplete = xhr.loaded / xhr.total * 100
  var progressBar = document.querySelector('.loading-progress')
  progressBar.parentNode.classList.remove('hidden')
  progressBar.style.width = percentComplete + '%'
}

function hideBar() {
  document.querySelector('.loading').classList.add('hidden')
}

function finishesButtons() {
  return slice(document.querySelectorAll('.buttons--finishes li'))
}

module.exports.start = function() {
  finishesButtons().forEach(classlist.add('is-loading'))
  return true
}

module.exports.end = function() {
  finishesButtons().forEach(classlist.remove('is-loading'))
  hideBar()
  return false
}

module.exports.painting = function (painting, callback) {
  var cachedGeo = cache.from(painting.id)
  if (cachedGeo) return callback(painting, cachedGeo)
  loader.load(painting.url, function(geo) {
    geo.mergeVertices()
    geo.center()
    cache.update(painting.id, geo)
    callback(painting, geo)
  }, onProgress)
}

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":7}],9:[function(require,module,exports){
/*global THREE */
var texture = THREE.ImageUtils.loadTexture('/img/textures/wood.jpeg')

module.exports.get = function(colour) {
  return [
    new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      color: new THREE.Color(colour),
      side: THREE.DoubleSide
    })
  ]
}

},{}],10:[function(require,module,exports){
/*global THREE */
var materials = require('./materials')

function getMesh(scene) {
  return scene.children.filter(function (child) {
    return child instanceof THREE.Mesh
  })[0]
}

module.exports.setColour = function(scene, colour, painting) {
  var mesh = getMesh(scene)
  if (!mesh) return
  var mat = materials.get(colour)
  if (painting.reversedMesh) mat = mat.reverse()
  mesh.material = new THREE.MeshFaceMaterial(mat)
}

module.exports.new = function(geo, colour, painting) {
  var mat = materials.get(colour)
  if (painting.reversedMesh) mat = mat.reverse()
  var zmesh = new THREE.Mesh(geo, new THREE.MeshFaceMaterial(mat))
  zmesh.rotation.fromArray(painting.rotation)
  zmesh.scale.fromArray(painting.scale)
  return zmesh
}

module.exports.remove = function(scene, update) {
  var mesh = getMesh(scene)
  scene.remove(mesh)
  update()
}

},{"./materials":9}],11:[function(require,module,exports){
module.exports = [{
  id: 0,
  url: '/obj/painting-1.js',
  rotation: [0.1, -1.15, 0.02],
  scale: [1, 1, 1],
  reversedMesh: false,
  cache: false,
  information: 'Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys.'
}, {
  id: 1,
  url: '/obj/painting-2.js',
  rotation: [-1.15, 2.65, -0.15],
  scale: [1.2, 1.2, 1.2],
  reversedMesh: false,
  cache: false,
  information: 'Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys.'
}, {
  id: 2,
  url: '/obj/painting-4.js',
  rotation: [0.85, 0.12, 1.45],
  scale: [1.15, 1.15, 1.15],
  reversedMesh: false,
  cache: false,
  information: 'Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys.'
}, {
  id: 3,
  url: '/obj/painting-5.js',
  rotation: [0.82, 0.15, 1.41],
  scale: [1.3, 1.3, 1.3],
  reversedMesh: true,
  cache: false,
  information: 'Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys.'
}]

},{}],12:[function(require,module,exports){
/*global THREE */

function createCamera() {
  var ratio = window.innerWidth / window.innerHeight
  var camera = new THREE.PerspectiveCamera(60, ratio, 1, 2000)
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 40
  return camera
}

function addLights(scene) {
  var ambient = new THREE.AmbientLight(0x101030)
  var directionalLight = new THREE.DirectionalLight(0xffffff)
	directionalLight.position.set(0, 1, 1)
	scene.add(ambient)
	scene.add(directionalLight)
}

function addControls(scene, camera, callback) {
  var controls = new THREE.OrbitControls(camera)
	controls.damping = 0.2
  controls.addEventListener('change', callback)
  return controls
}

function createRenderer() {
  var renderer = new THREE.WebGLRenderer({alpha: true})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
  return renderer
}

function render(scene, camera, renderer) {
  return function() {
	  renderer.render(scene, camera)
  }
}

function onWindowResize(camera, renderer, callback) {
  return function() {
	  camera.aspect = window.innerWidth / window.innerHeight
	  camera.updateProjectionMatrix()
	  renderer.setSize(window.innerWidth, window.innerHeight)
    callback()
  }
}

function createScene() {
  var container = document.querySelector('.render')
  var camera = createCamera()
  var renderer = createRenderer()
  var scene = new THREE.Scene()
  var update = render(scene, camera, renderer)
  var controls = addControls(scene, camera, update)

  addLights(scene)
  container.appendChild(renderer.domElement)
  return {
    camera: camera,
    controls: controls,
    renderer: renderer,
    update: update,
    scene: scene
  }
}

module.exports.init = function init() {
  var scene = createScene()
  animate(scene.controls)
  scene.update()
  window.addEventListener('resize', onWindowResize(
    scene.camera,
    scene.renderer,
    scene.update
  ))
  return scene
}

function animate(controls) {
  return function() {
    requestAnimationFrame(animate(controls))
    controls.update()
  }
}

},{}],13:[function(require,module,exports){
var createScene = require('./scene').init
var colours = require('./colours')
var finishes = require('./finishes')
var sidebar = require('./sidebar')

document.addEventListener('DOMContentLoaded', function() {
  var scene = createScene()
  colours.init(scene.scene, scene.update)
  finishes.init(scene.scene, scene.update)
  sidebar.init()
})

},{"./colours":2,"./finishes":3,"./scene":12,"./sidebar":14}],14:[function(require,module,exports){
function onScroll() {
  var scroll = document.querySelector('body').scrollTop
  var winHeight = window.innerHeight
  if (scroll > winHeight) doFix()
}

function doFix() {
  var body = document.querySelector('body')
  body.classList.add('fix-page')
  body.scrollTop = 0
  document.removeEventListener('scroll', onScroll)
}

module.exports.init = function() {
  document.addEventListener('scroll', onScroll)
}

},{}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3NjZW5lLmpzIiwic3JjL2pzL3NjcmlwdC5qcyIsInNyYy9qcy9zaWRlYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN0b3JhZ2UgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdXG5cbm1vZHVsZS5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHN0b3JhZ2VbaWRdXG59XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgZ2VvKSB7XG4gIHN0b3JhZ2VbaWRdID0gZ2VvXG59XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKVxudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKVxudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJylcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQoZWxlbWVudCkge1xuICB2YXIgY29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKVxuICB2YXIgY29sb3VyTmFtZSA9IGVsZW1lbnQuZGF0YXNldC5uYW1lXG4gIGNvbG91ci50ZXh0Q29udGVudCA9IGNvbG91ck5hbWVcbn1cblxudmFyIGdldENvbG91ciA9IG1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGNsYXNzZXMgPSBzbGljZShlbGVtZW50LmNsYXNzTGlzdClcbiAgcmV0dXJuICcjJyArIGNsYXNzZXMucmVkdWNlKGZ1bmN0aW9uIChjb2xvdXIsIGNsYXNzTmFtZSkge1xuICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZignY29sb3VyLS0nKSAhPT0gLTEpXG4gICAgICBjb2xvdXIgPSBjbGFzc05hbWUuc3BsaXQoJ2NvbG91ci0tJylbMV1cbiAgICByZXR1cm4gY29sb3VyXG4gIH0sICcnKVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVyblxuICAgIHZhciBjb2xvdXIgPSBnZXRDb2xvdXIodGhpcylcbiAgICB2YXIgZ3JhZGllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JhZGllbnQuY29sb3VyLS0nICsgY29sb3VyLnN1YnN0cmluZygxKSlcbiAgICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWZpbmlzaGVzIC5idXR0b24uaXMtYWN0aXZlJylcbiAgICBhY3RpdmF0ZSh0aGlzKVxuICAgIGFjdGl2YXRlKGdyYWRpZW50KVxuICAgIHNldFRleHRDb250ZW50KHRoaXMpXG4gICAgaWYgKGZpbmlzaClcbiAgICAgIG1lc2guc2V0Q29sb3VyKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nc1tmaW5pc2guZGF0YXNldC5pZF0pXG4gICAgdXBkYXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgY29sb3VyQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1jb2xvdXJzIGxpJykpXG4gIGNvbG91ckJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpKSlcbiAgY29sb3VyQnV0dG9uc1tjb2xvdXJCdXR0b25zLmxlbmd0aCAtIDFdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKVxufVxuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKVxudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJylcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpXG52YXIgbG9hZCA9IHJlcXVpcmUoJy4vbG9hZCcpXG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpXG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpXG52YXIgbG9hZGluZyA9IGZhbHNlXG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KHBhaW50aW5nKSB7XG4gIHZhciBpbmZvcm1hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLWluZm9ybWF0aW9uJylcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJylcbiAgaW5mb3JtYXRpb24udGV4dENvbnRlbnQgPSBwYWludGluZy5pbmZvcm1hdGlvblxuICBmaW5pc2gudGV4dENvbnRlbnQgPSAnRmluaXNoICcgKyAocGFpbnRpbmcuaWQgKyAxKVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIHZhciBwYWludGluZyA9IHBhaW50aW5nc1t0aGlzLmRhdGFzZXQuaWRdXG4gICAgaWYgKGxvYWRpbmcpIHJldHVybiBmYWxzZVxuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybiBmYWxzZVxuICAgIGxvYWRpbmcgPSBsb2FkLnN0YXJ0KClcbiAgICBtZXNoLnJlbW92ZShzY2VuZSwgdXBkYXRlKVxuICAgIHNldFRleHRDb250ZW50KHBhaW50aW5nKVxuICAgIGxvYWQucGFpbnRpbmcocGFpbnRpbmcsIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSlcbiAgICByZXR1cm4gYWN0aXZhdGUodGhpcylcbiAgfVxufVxuXG5mdW5jdGlvbiBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBhaW50aW5nLCBnZW8pIHtcbiAgICB2YXIgYWN0aXZlQ29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWNvbG91cnMgbGkuaXMtYWN0aXZlJylcbiAgICB2YXIgY29sb3VyID0gY29sb3Vycy5nZXQoYWN0aXZlQ29sb3VyKVxuICAgIHZhciB6bWVzaCA9IG1lc2gubmV3KGdlbywgY29sb3VyLCBwYWludGluZylcbiAgICBzY2VuZS5hZGQoem1lc2gpXG4gICAgbG9hZGluZyA9IGxvYWQuZW5kKClcbiAgICB1cGRhdGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBmaW5pc2hCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpXG4gIGZpbmlzaEJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpKSlcbiAgZmluaXNoQnV0dG9uc1swXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSlcbn1cbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2NsYXNzbGlzdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICBzbGljZShlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcykuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSlcbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKVxufVxuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYylcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5iaW5kLmJpbmQoRnVuY3Rpb24uY2FsbClcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpXG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJylcbnZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpXG5cbmZ1bmN0aW9uIG9uUHJvZ3Jlc3MgKHhocikge1xuICB2YXIgcGVyY2VudENvbXBsZXRlID0geGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMFxuICB2YXIgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZy1wcm9ncmVzcycpXG4gIHByb2dyZXNzQmFyLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50Q29tcGxldGUgKyAnJSdcbn1cblxuZnVuY3Rpb24gaGlkZUJhcigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxufVxuXG5mdW5jdGlvbiBmaW5pc2hlc0J1dHRvbnMoKSB7XG4gIHJldHVybiBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSlcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QuYWRkKCdpcy1sb2FkaW5nJykpXG4gIHJldHVybiB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWxvYWRpbmcnKSlcbiAgaGlkZUJhcigpXG4gIHJldHVybiBmYWxzZVxufVxuXG5tb2R1bGUuZXhwb3J0cy5wYWludGluZyA9IGZ1bmN0aW9uIChwYWludGluZywgY2FsbGJhY2spIHtcbiAgdmFyIGNhY2hlZEdlbyA9IGNhY2hlLmZyb20ocGFpbnRpbmcuaWQpXG4gIGlmIChjYWNoZWRHZW8pIHJldHVybiBjYWxsYmFjayhwYWludGluZywgY2FjaGVkR2VvKVxuICBsb2FkZXIubG9hZChwYWludGluZy51cmwsIGZ1bmN0aW9uKGdlbykge1xuICAgIGdlby5tZXJnZVZlcnRpY2VzKClcbiAgICBnZW8uY2VudGVyKClcbiAgICBjYWNoZS51cGRhdGUocGFpbnRpbmcuaWQsIGdlbylcbiAgICBjYWxsYmFjayhwYWludGluZywgZ2VvKVxuICB9LCBvblByb2dyZXNzKVxufVxuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnL2ltZy90ZXh0dXJlcy93b29kLmpwZWcnKVxuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihjb2xvdXIpIHtcbiAgcmV0dXJuIFtcbiAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleHR1cmUsXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSksXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcihjb2xvdXIpLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pXG4gIF1cbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgbWF0ZXJpYWxzID0gcmVxdWlyZSgnLi9tYXRlcmlhbHMnKVxuXG5mdW5jdGlvbiBnZXRNZXNoKHNjZW5lKSB7XG4gIHJldHVybiBzY2VuZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkIGluc3RhbmNlb2YgVEhSRUUuTWVzaFxuICB9KVswXVxufVxuXG5tb2R1bGUuZXhwb3J0cy5zZXRDb2xvdXIgPSBmdW5jdGlvbihzY2VuZSwgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpXG4gIGlmICghbWVzaCkgcmV0dXJuXG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cilcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKVxuICBtZXNoLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KVxufVxuXG5tb2R1bGUuZXhwb3J0cy5uZXcgPSBmdW5jdGlvbihnZW8sIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1hdCA9IG1hdGVyaWFscy5nZXQoY29sb3VyKVxuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpXG4gIHZhciB6bWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KSlcbiAgem1lc2gucm90YXRpb24uZnJvbUFycmF5KHBhaW50aW5nLnJvdGF0aW9uKVxuICB6bWVzaC5zY2FsZS5mcm9tQXJyYXkocGFpbnRpbmcuc2NhbGUpXG4gIHJldHVybiB6bWVzaFxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSlcbiAgc2NlbmUucmVtb3ZlKG1lc2gpXG4gIHVwZGF0ZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFt7XG4gIGlkOiAwLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTEuanMnLFxuICByb3RhdGlvbjogWzAuMSwgLTEuMTUsIDAuMDJdLFxuICBzY2FsZTogWzEsIDEsIDFdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMSxcbiAgdXJsOiAnL29iai9wYWludGluZy0yLmpzJyxcbiAgcm90YXRpb246IFstMS4xNSwgMi42NSwgLTAuMTVdLFxuICBzY2FsZTogWzEuMiwgMS4yLCAxLjJdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZy00LmpzJyxcbiAgcm90YXRpb246IFswLjg1LCAwLjEyLCAxLjQ1XSxcbiAgc2NhbGU6IFsxLjE1LCAxLjE1LCAxLjE1XSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDMsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNS5qcycsXG4gIHJvdGF0aW9uOiBbMC44MiwgMC4xNSwgMS40MV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn1dXG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDYW1lcmEoKSB7XG4gIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIHJhdGlvLCAxLCAyMDAwKVxuICBjYW1lcmEucG9zaXRpb24ueCA9IDBcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAwXG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDBcbiAgcmV0dXJuIGNhbWVyYVxufVxuXG5mdW5jdGlvbiBhZGRMaWdodHMoc2NlbmUpIHtcbiAgdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MTAxMDMwKVxuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKVxuXHRkaXJlY3Rpb25hbExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAxKVxuXHRzY2VuZS5hZGQoYW1iaWVudClcblx0c2NlbmUuYWRkKGRpcmVjdGlvbmFsTGlnaHQpXG59XG5cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIGNhbGxiYWNrKSB7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSlcblx0Y29udHJvbHMuZGFtcGluZyA9IDAuMlxuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaylcbiAgcmV0dXJuIGNvbnRyb2xzXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWV9KVxuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIHJldHVybiByZW5kZXJlclxufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKGNhbWVyYSwgcmVuZGVyZXIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpXG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKVxuICB2YXIgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKClcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuICB2YXIgdXBkYXRlID0gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKVxuICB2YXIgY29udHJvbHMgPSBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpXG5cbiAgYWRkTGlnaHRzKHNjZW5lKVxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudClcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGFuaW1hdGUoc2NlbmUuY29udHJvbHMpXG4gIHNjZW5lLnVwZGF0ZSgpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZShcbiAgICBzY2VuZS5jYW1lcmEsXG4gICAgc2NlbmUucmVuZGVyZXIsXG4gICAgc2NlbmUudXBkYXRlXG4gICkpXG4gIHJldHVybiBzY2VuZVxufVxuXG5mdW5jdGlvbiBhbmltYXRlKGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZShjb250cm9scykpXG4gICAgY29udHJvbHMudXBkYXRlKClcbiAgfVxufVxuIiwidmFyIGNyZWF0ZVNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZScpLmluaXRcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJylcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKVxudmFyIHNpZGViYXIgPSByZXF1aXJlKCcuL3NpZGViYXInKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKClcbiAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpXG4gIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSlcbiAgc2lkZWJhci5pbml0KClcbn0pXG4iLCJmdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3BcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICBpZiAoc2Nyb2xsID4gd2luSGVpZ2h0KSBkb0ZpeCgpXG59XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKVxuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2ZpeC1wYWdlJylcbiAgYm9keS5zY3JvbGxUb3AgPSAwXG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKVxufVxuIl19
