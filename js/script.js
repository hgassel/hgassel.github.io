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

},{"./lib/activate":4,"./lib/eventlisteners":7,"./lib/liberate":8,"./mesh":12,"./paintings":13}],3:[function(require,module,exports){
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

},{"./colours":2,"./lib/activate":4,"./lib/eventlisteners":7,"./lib/liberate":8,"./load":10,"./mesh":12,"./paintings":13}],4:[function(require,module,exports){
var slice = require('./liberate')([].slice)
var classlist = require('./classlist')

module.exports = function(element) {
  slice(element.parentNode.childNodes).forEach(classlist.remove('is-active'))
  element.classList.add('is-active')
}

},{"./classlist":5,"./liberate":8}],5:[function(require,module,exports){
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
module.exports.easeInOutQuad = function (t, b, c, d) {
  t /= d/2
  if (t < 1) {
    return c/2*t*t + b
  }
  t--
  return -c/2 * (t*(t-2) - 1) + b
}

module.exports.easeInCubic = function(t, b, c, d) {
  var tc = (t/=d)*t*t
  return b+c*(tc)
}

module.exports.easeInOutQuint = function(t, b, c, d) {
  var ts = (t/=d)*t
  var tc = ts*t
  return b+c*(6*tc*ts + -15*ts*ts + 10*tc)
}

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
module.exports = Function.bind.bind(Function.call)

},{}],9:[function(require,module,exports){
var easing = require('./easing')

module.exports = function(to, callback, duration, easingName) {
  var doc = document.documentElement.scrollTop ? document.documentElement : document.body
  var start = doc.scrollTop
  var change = to - start
  var currentTime = 0
  var increment = 20

  var animateScroll = function() {
    currentTime += increment
    var val = easing[easingName](currentTime, start, change, duration)
    doc.scrollTop = val
    if (currentTime < duration) return requestAnimationFrame(animateScroll)
    return callback()
  }
  animateScroll()
}

},{"./easing":6}],10:[function(require,module,exports){
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

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":8}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./materials":11}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

function addDeviceControls(camera) {
  return new THREE.DeviceOrientationControls(camera)
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
  var deviceControls = addDeviceControls(camera)

  addLights(scene)
  container.appendChild(renderer.domElement)
  return {
    camera: camera,
    controls: controls,
    deviceControls: deviceControls,
    renderer: renderer,
    update: update,
    scene: scene
  }
}

module.exports.init = function init() {
  var scene = createScene()
  animate(scene.controls, scene.deviceControls)
  scene.update()
  window.addEventListener('resize', onWindowResize(
    scene.camera,
    scene.renderer,
    scene.update
  ))
  return scene
}

function animate(controls, deviceControls) {
  return function() {
    requestAnimationFrame(animate(controls, deviceControls))
    controls.update()
    deviceControls.update()
  }
}

},{}],15:[function(require,module,exports){
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

},{"./colours":2,"./finishes":3,"./scene":14,"./sidebar":16}],16:[function(require,module,exports){
var slice = require('./lib/liberate')([].slice)
var eventListeners = require('./lib/eventlisteners')
var scrollTo = require('./lib/scrollto')

function onScroll() {
  var scroll = document.querySelector('body').scrollTop
  var winHeight = window.innerHeight
  if (scroll >= winHeight) doFix()
}

function doFix() {
  var body = document.querySelector('body')
  body.classList.add('fix-page')
  body.scrollTop -= window.innerHeight
  document.removeEventListener('scroll', onScroll)
}

function clickNav(e) {
  var href = this.getAttribute('href')
  var isFixed = document.querySelector('body').classList.contains('fix-page')
  var to = document.querySelector(href).offsetTop
  scrollTo(to, function() {}, 600, 'easeInOutQuad')
  document.dispatchEvent(new Event('scroll'))
  e.preventDefault()
}

module.exports.init = function() {
  var navs = slice(document.querySelectorAll('.sidebar--left a'))
  document.addEventListener('scroll', onScroll)
  navs.forEach(eventListeners.add('click', clickNav))
}

},{"./lib/eventlisteners":7,"./lib/liberate":8,"./lib/scrollto":9}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZWFzaW5nLmpzIiwic3JjL2pzL2xpYi9ldmVudGxpc3RlbmVycy5qcyIsInNyYy9qcy9saWIvbGliZXJhdGUuanMiLCJzcmMvanMvbGliL3Njcm9sbHRvLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3NjZW5lLmpzIiwic3JjL2pzL3NjcmlwdC5qcyIsInNyYy9qcy9zaWRlYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN0b3JhZ2UgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdXG5cbm1vZHVsZS5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHN0b3JhZ2VbaWRdXG59XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgZ2VvKSB7XG4gIHN0b3JhZ2VbaWRdID0gZ2VvXG59XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKVxudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKVxudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJylcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQoZWxlbWVudCkge1xuICB2YXIgY29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKVxuICB2YXIgY29sb3VyTmFtZSA9IGVsZW1lbnQuZGF0YXNldC5uYW1lXG4gIGNvbG91ci50ZXh0Q29udGVudCA9IGNvbG91ck5hbWVcbn1cblxudmFyIGdldENvbG91ciA9IG1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGNsYXNzZXMgPSBzbGljZShlbGVtZW50LmNsYXNzTGlzdClcbiAgcmV0dXJuICcjJyArIGNsYXNzZXMucmVkdWNlKGZ1bmN0aW9uIChjb2xvdXIsIGNsYXNzTmFtZSkge1xuICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZignY29sb3VyLS0nKSAhPT0gLTEpXG4gICAgICBjb2xvdXIgPSBjbGFzc05hbWUuc3BsaXQoJ2NvbG91ci0tJylbMV1cbiAgICByZXR1cm4gY29sb3VyXG4gIH0sICcnKVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVyblxuICAgIHZhciBjb2xvdXIgPSBnZXRDb2xvdXIodGhpcylcbiAgICB2YXIgZ3JhZGllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JhZGllbnQuY29sb3VyLS0nICsgY29sb3VyLnN1YnN0cmluZygxKSlcbiAgICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWZpbmlzaGVzIC5idXR0b24uaXMtYWN0aXZlJylcbiAgICBhY3RpdmF0ZSh0aGlzKVxuICAgIGFjdGl2YXRlKGdyYWRpZW50KVxuICAgIHNldFRleHRDb250ZW50KHRoaXMpXG4gICAgaWYgKGZpbmlzaClcbiAgICAgIG1lc2guc2V0Q29sb3VyKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nc1tmaW5pc2guZGF0YXNldC5pZF0pXG4gICAgdXBkYXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgY29sb3VyQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1jb2xvdXJzIGxpJykpXG4gIGNvbG91ckJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpKSlcbiAgY29sb3VyQnV0dG9uc1tjb2xvdXJCdXR0b25zLmxlbmd0aCAtIDFdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKVxufVxuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKVxudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJylcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpXG52YXIgbG9hZCA9IHJlcXVpcmUoJy4vbG9hZCcpXG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpXG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpXG52YXIgbG9hZGluZyA9IGZhbHNlXG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KHBhaW50aW5nKSB7XG4gIHZhciBpbmZvcm1hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLWluZm9ybWF0aW9uJylcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJylcbiAgaW5mb3JtYXRpb24udGV4dENvbnRlbnQgPSBwYWludGluZy5pbmZvcm1hdGlvblxuICBmaW5pc2gudGV4dENvbnRlbnQgPSAnRmluaXNoICcgKyAocGFpbnRpbmcuaWQgKyAxKVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIHZhciBwYWludGluZyA9IHBhaW50aW5nc1t0aGlzLmRhdGFzZXQuaWRdXG4gICAgaWYgKGxvYWRpbmcpIHJldHVybiBmYWxzZVxuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybiBmYWxzZVxuICAgIGxvYWRpbmcgPSBsb2FkLnN0YXJ0KClcbiAgICBtZXNoLnJlbW92ZShzY2VuZSwgdXBkYXRlKVxuICAgIHNldFRleHRDb250ZW50KHBhaW50aW5nKVxuICAgIGxvYWQucGFpbnRpbmcocGFpbnRpbmcsIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSlcbiAgICByZXR1cm4gYWN0aXZhdGUodGhpcylcbiAgfVxufVxuXG5mdW5jdGlvbiBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBhaW50aW5nLCBnZW8pIHtcbiAgICB2YXIgYWN0aXZlQ29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWNvbG91cnMgbGkuaXMtYWN0aXZlJylcbiAgICB2YXIgY29sb3VyID0gY29sb3Vycy5nZXQoYWN0aXZlQ29sb3VyKVxuICAgIHZhciB6bWVzaCA9IG1lc2gubmV3KGdlbywgY29sb3VyLCBwYWludGluZylcbiAgICBzY2VuZS5hZGQoem1lc2gpXG4gICAgbG9hZGluZyA9IGxvYWQuZW5kKClcbiAgICB1cGRhdGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBmaW5pc2hCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpXG4gIGZpbmlzaEJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpKSlcbiAgZmluaXNoQnV0dG9uc1swXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSlcbn1cbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2NsYXNzbGlzdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICBzbGljZShlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcykuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSlcbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKVxufVxuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICB0IC89IGQvMlxuICBpZiAodCA8IDEpIHtcbiAgICByZXR1cm4gYy8yKnQqdCArIGJcbiAgfVxuICB0LS1cbiAgcmV0dXJuIC1jLzIgKiAodCoodC0yKSAtIDEpICsgYlxufVxuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRjID0gKHQvPWQpKnQqdFxuICByZXR1cm4gYitjKih0Yylcbn1cblxubW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0cyA9ICh0Lz1kKSp0XG4gIHZhciB0YyA9IHRzKnRcbiAgcmV0dXJuIGIrYyooNip0Yyp0cyArIC0xNSp0cyp0cyArIDEwKnRjKVxufVxuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYylcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLmJpbmQuYmluZChGdW5jdGlvbi5jYWxsKVxuIiwidmFyIGVhc2luZyA9IHJlcXVpcmUoJy4vZWFzaW5nJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0bywgY2FsbGJhY2ssIGR1cmF0aW9uLCBlYXNpbmdOYW1lKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogZG9jdW1lbnQuYm9keVxuICB2YXIgc3RhcnQgPSBkb2Muc2Nyb2xsVG9wXG4gIHZhciBjaGFuZ2UgPSB0byAtIHN0YXJ0XG4gIHZhciBjdXJyZW50VGltZSA9IDBcbiAgdmFyIGluY3JlbWVudCA9IDIwXG5cbiAgdmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50VGltZSArPSBpbmNyZW1lbnRcbiAgICB2YXIgdmFsID0gZWFzaW5nW2Vhc2luZ05hbWVdKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbilcbiAgICBkb2Muc2Nyb2xsVG9wID0gdmFsXG4gICAgaWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVNjcm9sbClcbiAgICByZXR1cm4gY2FsbGJhY2soKVxuICB9XG4gIGFuaW1hdGVTY3JvbGwoKVxufVxuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9saWIvY2xhc3NsaXN0JylcbnZhciBjYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKVxudmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKClcblxuZnVuY3Rpb24gb25Qcm9ncmVzcyAoeGhyKSB7XG4gIHZhciBwZXJjZW50Q29tcGxldGUgPSB4aHIubG9hZGVkIC8geGhyLnRvdGFsICogMTAwXG4gIHZhciBwcm9ncmVzc0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLXByb2dyZXNzJylcbiAgcHJvZ3Jlc3NCYXIucGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICBwcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHBlcmNlbnRDb21wbGV0ZSArICclJ1xufVxuXG5mdW5jdGlvbiBoaWRlQmFyKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG59XG5cbmZ1bmN0aW9uIGZpbmlzaGVzQnV0dG9ucygpIHtcbiAgcmV0dXJuIHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5hZGQoJ2lzLWxvYWRpbmcnKSlcbiAgcmV0dXJuIHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMuZW5kID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtbG9hZGluZycpKVxuICBoaWRlQmFyKClcbiAgcmV0dXJuIGZhbHNlXG59XG5cbm1vZHVsZS5leHBvcnRzLnBhaW50aW5nID0gZnVuY3Rpb24gKHBhaW50aW5nLCBjYWxsYmFjaykge1xuICB2YXIgY2FjaGVkR2VvID0gY2FjaGUuZnJvbShwYWludGluZy5pZClcbiAgaWYgKGNhY2hlZEdlbykgcmV0dXJuIGNhbGxiYWNrKHBhaW50aW5nLCBjYWNoZWRHZW8pXG4gIGxvYWRlci5sb2FkKHBhaW50aW5nLnVybCwgZnVuY3Rpb24oZ2VvKSB7XG4gICAgZ2VvLm1lcmdlVmVydGljZXMoKVxuICAgIGdlby5jZW50ZXIoKVxuICAgIGNhY2hlLnVwZGF0ZShwYWludGluZy5pZCwgZ2VvKVxuICAgIGNhbGxiYWNrKHBhaW50aW5nLCBnZW8pXG4gIH0sIG9uUHJvZ3Jlc3MpXG59XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcvaW1nL3RleHR1cmVzL3dvb2QuanBlZycpXG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGNvbG91cikge1xuICByZXR1cm4gW1xuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KSxcbiAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKGNvbG91ciksXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSlcbiAgXVxufVxuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBtYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdGVyaWFscycpXG5cbmZ1bmN0aW9uIGdldE1lc2goc2NlbmUpIHtcbiAgcmV0dXJuIHNjZW5lLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQgaW5zdGFuY2VvZiBUSFJFRS5NZXNoXG4gIH0pWzBdXG59XG5cbm1vZHVsZS5leHBvcnRzLnNldENvbG91ciA9IGZ1bmN0aW9uKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSlcbiAgaWYgKCFtZXNoKSByZXR1cm5cbiAgdmFyIG1hdCA9IG1hdGVyaWFscy5nZXQoY29sb3VyKVxuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpXG4gIG1lc2gubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpXG59XG5cbm1vZHVsZS5leHBvcnRzLm5ldyA9IGZ1bmN0aW9uKGdlbywgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpXG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKClcbiAgdmFyIHptZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvLCBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpKVxuICB6bWVzaC5yb3RhdGlvbi5mcm9tQXJyYXkocGFpbnRpbmcucm90YXRpb24pXG4gIHptZXNoLnNjYWxlLmZyb21BcnJheShwYWludGluZy5zY2FsZSlcbiAgcmV0dXJuIHptZXNoXG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKVxuICBzY2VuZS5yZW1vdmUobWVzaClcbiAgdXBkYXRlKClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gW3tcbiAgaWQ6IDAsXG4gIHVybDogJy9vYmovcGFpbnRpbmctMS5qcycsXG4gIHJvdGF0aW9uOiBbMC4xLCAtMS4xNSwgMC4wMl0sXG4gIHNjYWxlOiBbMSwgMSwgMV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59LCB7XG4gIGlkOiAxLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTIuanMnLFxuICByb3RhdGlvbjogWy0xLjE1LCAyLjY1LCAtMC4xNV0sXG4gIHNjYWxlOiBbMS4yLCAxLjIsIDEuMl0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59LCB7XG4gIGlkOiAyLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTQuanMnLFxuICByb3RhdGlvbjogWzAuODUsIDAuMTIsIDEuNDVdLFxuICBzY2FsZTogWzEuMTUsIDEuMTUsIDEuMTVdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMyxcbiAgdXJsOiAnL29iai9wYWludGluZy01LmpzJyxcbiAgcm90YXRpb246IFswLjgyLCAwLjE1LCAxLjQxXSxcbiAgc2NhbGU6IFsxLjMsIDEuMywgMS4zXSxcbiAgcmV2ZXJzZWRNZXNoOiB0cnVlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufV1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpIHtcbiAgdmFyIHJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgdmFyIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgcmF0aW8sIDEsIDIwMDApXG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMFxuICBjYW1lcmEucG9zaXRpb24ueSA9IDBcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSA0MFxuICByZXR1cm4gY2FtZXJhXG59XG5cbmZ1bmN0aW9uIGFkZExpZ2h0cyhzY2VuZSkge1xuICB2YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHgxMDEwMzApXG4gIHZhciBkaXJlY3Rpb25hbExpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpXG5cdGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDEpXG5cdHNjZW5lLmFkZChhbWJpZW50KVxuXHRzY2VuZS5hZGQoZGlyZWN0aW9uYWxMaWdodClcbn1cblxuZnVuY3Rpb24gYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgY2FsbGJhY2spIHtcbiAgdmFyIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhKVxuXHRjb250cm9scy5kYW1waW5nID0gMC4yXG4gIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNhbGxiYWNrKVxuICByZXR1cm4gY29udHJvbHNcbn1cblxuZnVuY3Rpb24gYWRkRGV2aWNlQ29udHJvbHMoY2FtZXJhKSB7XG4gIHJldHVybiBuZXcgVEhSRUUuRGV2aWNlT3JpZW50YXRpb25Db250cm9scyhjYW1lcmEpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWV9KVxuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIHJldHVybiByZW5kZXJlclxufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKGNhbWVyYSwgcmVuZGVyZXIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpXG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKVxuICB2YXIgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKClcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuICB2YXIgdXBkYXRlID0gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKVxuICB2YXIgY29udHJvbHMgPSBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpXG4gIHZhciBkZXZpY2VDb250cm9scyA9IGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSlcblxuICBhZGRMaWdodHMoc2NlbmUpXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KVxuICByZXR1cm4ge1xuICAgIGNhbWVyYTogY2FtZXJhLFxuICAgIGNvbnRyb2xzOiBjb250cm9scyxcbiAgICBkZXZpY2VDb250cm9sczogZGV2aWNlQ29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGFuaW1hdGUoc2NlbmUuY29udHJvbHMsIHNjZW5lLmRldmljZUNvbnRyb2xzKVxuICBzY2VuZS51cGRhdGUoKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKVxuICByZXR1cm4gc2NlbmVcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scywgZGV2aWNlQ29udHJvbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKGNvbnRyb2xzLCBkZXZpY2VDb250cm9scykpXG4gICAgY29udHJvbHMudXBkYXRlKClcbiAgICBkZXZpY2VDb250cm9scy51cGRhdGUoKVxuICB9XG59XG4iLCJ2YXIgY3JlYXRlU2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lJykuaW5pdFxudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKVxudmFyIGZpbmlzaGVzID0gcmVxdWlyZSgnLi9maW5pc2hlcycpXG52YXIgc2lkZWJhciA9IHJlcXVpcmUoJy4vc2lkZWJhcicpXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKVxuICBjb2xvdXJzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSlcbiAgZmluaXNoZXMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKVxuICBzaWRlYmFyLmluaXQoKVxufSlcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpXG52YXIgc2Nyb2xsVG8gPSByZXF1aXJlKCcuL2xpYi9zY3JvbGx0bycpXG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcFxuICB2YXIgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIChzY3JvbGwgPj0gd2luSGVpZ2h0KSBkb0ZpeCgpXG59XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKVxuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2ZpeC1wYWdlJylcbiAgYm9keS5zY3JvbGxUb3AgLT0gd2luZG93LmlubmVySGVpZ2h0XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKVxufVxuXG5mdW5jdGlvbiBjbGlja05hdihlKSB7XG4gIHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB2YXIgaXNGaXhlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpeC1wYWdlJylcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihocmVmKS5vZmZzZXRUb3BcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKVxuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc2Nyb2xsJykpXG4gIGUucHJldmVudERlZmF1bHQoKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuYXZzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXItLWxlZnQgYScpKVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbClcbiAgbmF2cy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjbGlja05hdikpXG59XG4iXX0=
