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
function showPreview() {
  document.querySelector('.section--intro').classList.add('show--preview')
}

function hidePreview() {
  this.classList.remove('show--preview')
}

module.exports.init = function() {
  document.querySelector('.js-show-preview').addEventListener('click', showPreview)
  document.querySelector('.section--intro').addEventListener('click', hidePreview)
}

},{}],15:[function(require,module,exports){
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
  var directionalLight = new THREE.DirectionalLight(0xffffd1)
	directionalLight.position.set(0, 1, 1)
	scene.add(new THREE.AmbientLight(0x00002E))
	scene.add(directionalLight)
}

function addControls(scene, camera, callback) {
  var controls = new THREE.OrbitControls(camera)
	controls.damping = 0.2
  controls.noKeys = true
  controls.noZoom = true
  controls.noPan = true
  controls.noRotateUp = false
  controls.minAzimuthAngle = -Math.PI/5
	controls.maxAzimuthAngle = Math.PI/1.5
  controls.addEventListener('change', callback)
  return controls
}

function addDeviceControls(camera) {
  return new THREE.DeviceOrientationControls(camera)
}

function createRenderer() {
  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true
  })
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
  var controls = window.innerWidth > 768 ?
        addControls(scene, camera, update) :
        addDeviceControls(camera)

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

},{}],16:[function(require,module,exports){
var createScene = require('./scene').init
var colours = require('./colours')
var finishes = require('./finishes')
var sidebar = require('./sidebar')
var preview = require('./preview')
var tearsheet = require('./tearsheet')

document.addEventListener('DOMContentLoaded', function() {
  var scene = createScene()
  colours.init(scene.scene, scene.update)
  finishes.init(scene.scene, scene.update)
  sidebar.init()
  preview.init()
  tearsheet.init(scene)
})

},{"./colours":2,"./finishes":3,"./preview":14,"./scene":15,"./sidebar":17,"./tearsheet":18}],17:[function(require,module,exports){
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

},{"./lib/eventlisteners":7,"./lib/liberate":8,"./lib/scrollto":9}],18:[function(require,module,exports){
function saveTearSheet(renderer, camera, update, controls) {
  return function() {
    var prevPosition = [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ]
    camera.position.fromArray([0, 0, 40])
    controls.update()
    console.log(renderer.domElement.toDataURL())
    camera.position.fromArray(prevPosition)
    controls.update()
  }
}

module.exports.init = function (scene) {
  document.querySelector('.js-save-tearsheet').addEventListener('click', saveTearSheet(scene.renderer, scene.camera, scene.update, scene.controls))
}

},{}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZWFzaW5nLmpzIiwic3JjL2pzL2xpYi9ldmVudGxpc3RlbmVycy5qcyIsInNyYy9qcy9saWIvbGliZXJhdGUuanMiLCJzcmMvanMvbGliL3Njcm9sbHRvLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc3RvcmFnZSA9IFtmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZV1cblxubW9kdWxlLmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gc3RvcmFnZVtpZF1cbn1cblxubW9kdWxlLmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKGlkLCBnZW8pIHtcbiAgc3RvcmFnZVtpZF0gPSBnZW9cbn1cbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJylcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpXG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpXG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKVxuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChlbGVtZW50KSB7XG4gIHZhciBjb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpXG4gIHZhciBjb2xvdXJOYW1lID0gZWxlbWVudC5kYXRhc2V0Lm5hbWVcbiAgY29sb3VyLnRleHRDb250ZW50ID0gY29sb3VyTmFtZVxufVxuXG52YXIgZ2V0Q29sb3VyID0gbW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgY2xhc3NlcyA9IHNsaWNlKGVsZW1lbnQuY2xhc3NMaXN0KVxuICByZXR1cm4gJyMnICsgY2xhc3Nlcy5yZWR1Y2UoZnVuY3Rpb24gKGNvbG91ciwgY2xhc3NOYW1lKSB7XG4gICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdjb2xvdXItLScpICE9PSAtMSlcbiAgICAgIGNvbG91ciA9IGNsYXNzTmFtZS5zcGxpdCgnY29sb3VyLS0nKVsxXVxuICAgIHJldHVybiBjb2xvdXJcbiAgfSwgJycpXG59XG5cbmZ1bmN0aW9uIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuXG4gICAgdmFyIGNvbG91ciA9IGdldENvbG91cih0aGlzKVxuICAgIHZhciBncmFkaWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmFkaWVudC5jb2xvdXItLScgKyBjb2xvdXIuc3Vic3RyaW5nKDEpKVxuICAgIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tZmluaXNoZXMgLmJ1dHRvbi5pcy1hY3RpdmUnKVxuICAgIGFjdGl2YXRlKHRoaXMpXG4gICAgYWN0aXZhdGUoZ3JhZGllbnQpXG4gICAgc2V0VGV4dENvbnRlbnQodGhpcylcbiAgICBpZiAoZmluaXNoKVxuICAgICAgbWVzaC5zZXRDb2xvdXIoc2NlbmUsIGNvbG91ciwgcGFpbnRpbmdzW2ZpbmlzaC5kYXRhc2V0LmlkXSlcbiAgICB1cGRhdGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBjb2xvdXJCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWNvbG91cnMgbGknKSlcbiAgY29sb3VyQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkpKVxuICBjb2xvdXJCdXR0b25zW2NvbG91ckJ1dHRvbnMubGVuZ3RoIC0gMV0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpXG59XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKVxudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJylcbnZhciBsb2FkID0gcmVxdWlyZSgnLi9sb2FkJylcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJylcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJylcbnZhciBsb2FkaW5nID0gZmFsc2VcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpIHtcbiAgdmFyIGluZm9ybWF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItaW5mb3JtYXRpb24nKVxuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKVxuICBpbmZvcm1hdGlvbi50ZXh0Q29udGVudCA9IHBhaW50aW5nLmluZm9ybWF0aW9uXG4gIGZpbmlzaC50ZXh0Q29udGVudCA9ICdGaW5pc2ggJyArIChwYWludGluZy5pZCArIDEpXG59XG5cbmZ1bmN0aW9uIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHBhaW50aW5nID0gcGFpbnRpbmdzW3RoaXMuZGF0YXNldC5pZF1cbiAgICBpZiAobG9hZGluZykgcmV0dXJuIGZhbHNlXG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuIGZhbHNlXG4gICAgbG9hZGluZyA9IGxvYWQuc3RhcnQoKVxuICAgIG1lc2gucmVtb3ZlKHNjZW5lLCB1cGRhdGUpXG4gICAgc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpXG4gICAgbG9hZC5wYWludGluZyhwYWludGluZywgZ290R2VvKHNjZW5lLCB1cGRhdGUpKVxuICAgIHJldHVybiBhY3RpdmF0ZSh0aGlzKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGFpbnRpbmcsIGdlbykge1xuICAgIHZhciBhY3RpdmVDb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tY29sb3VycyBsaS5pcy1hY3RpdmUnKVxuICAgIHZhciBjb2xvdXIgPSBjb2xvdXJzLmdldChhY3RpdmVDb2xvdXIpXG4gICAgdmFyIHptZXNoID0gbWVzaC5uZXcoZ2VvLCBjb2xvdXIsIHBhaW50aW5nKVxuICAgIHNjZW5lLmFkZCh6bWVzaClcbiAgICBsb2FkaW5nID0gbG9hZC5lbmQoKVxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGZpbmlzaEJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSlcbiAgZmluaXNoQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkpKVxuICBmaW5pc2hCdXR0b25zWzBdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKVxufVxuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vY2xhc3NsaXN0JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHNsaWNlKGVsZW1lbnQucGFyZW50Tm9kZS5jaGlsZE5vZGVzKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKVxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpXG59XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy50b2dnbGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUobmFtZSlcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG4gIHQgLz0gZC8yXG4gIGlmICh0IDwgMSkge1xuICAgIHJldHVybiBjLzIqdCp0ICsgYlxuICB9XG4gIHQtLVxuICByZXR1cm4gLWMvMiAqICh0Kih0LTIpIC0gMSkgKyBiXG59XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbkN1YmljID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdGMgPSAodC89ZCkqdCp0XG4gIHJldHVybiBiK2MqKHRjKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRzID0gKHQvPWQpKnRcbiAgdmFyIHRjID0gdHMqdFxuICByZXR1cm4gYitjKig2KnRjKnRzICsgLTE1KnRzKnRzICsgMTAqdGMpXG59XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24uYmluZC5iaW5kKEZ1bmN0aW9uLmNhbGwpXG4iLCJ2YXIgZWFzaW5nID0gcmVxdWlyZSgnLi9lYXNpbmcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRvLCBjYWxsYmFjaywgZHVyYXRpb24sIGVhc2luZ05hbWUpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5XG4gIHZhciBzdGFydCA9IGRvYy5zY3JvbGxUb3BcbiAgdmFyIGNoYW5nZSA9IHRvIC0gc3RhcnRcbiAgdmFyIGN1cnJlbnRUaW1lID0gMFxuICB2YXIgaW5jcmVtZW50ID0gMjBcblxuICB2YXIgYW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRUaW1lICs9IGluY3JlbWVudFxuICAgIHZhciB2YWwgPSBlYXNpbmdbZWFzaW5nTmFtZV0oY3VycmVudFRpbWUsIHN0YXJ0LCBjaGFuZ2UsIGR1cmF0aW9uKVxuICAgIGRvYy5zY3JvbGxUb3AgPSB2YWxcbiAgICBpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKVxuICAgIHJldHVybiBjYWxsYmFjaygpXG4gIH1cbiAgYW5pbWF0ZVNjcm9sbCgpXG59XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKVxudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpXG52YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKVxuXG5mdW5jdGlvbiBvblByb2dyZXNzICh4aHIpIHtcbiAgdmFyIHBlcmNlbnRDb21wbGV0ZSA9IHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDBcbiAgdmFyIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmctcHJvZ3Jlc3MnKVxuICBwcm9ncmVzc0Jhci5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXG4gIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyY2VudENvbXBsZXRlICsgJyUnXG59XG5cbmZ1bmN0aW9uIGhpZGVCYXIoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbn1cblxuZnVuY3Rpb24gZmluaXNoZXNCdXR0b25zKCkge1xuICByZXR1cm4gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpXG59XG5cbm1vZHVsZS5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LmFkZCgnaXMtbG9hZGluZycpKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cy5lbmQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJykpXG4gIGhpZGVCYXIoKVxuICByZXR1cm4gZmFsc2Vcbn1cblxubW9kdWxlLmV4cG9ydHMucGFpbnRpbmcgPSBmdW5jdGlvbiAocGFpbnRpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBjYWNoZWRHZW8gPSBjYWNoZS5mcm9tKHBhaW50aW5nLmlkKVxuICBpZiAoY2FjaGVkR2VvKSByZXR1cm4gY2FsbGJhY2socGFpbnRpbmcsIGNhY2hlZEdlbylcbiAgbG9hZGVyLmxvYWQocGFpbnRpbmcudXJsLCBmdW5jdGlvbihnZW8pIHtcbiAgICBnZW8ubWVyZ2VWZXJ0aWNlcygpXG4gICAgZ2VvLmNlbnRlcigpXG4gICAgY2FjaGUudXBkYXRlKHBhaW50aW5nLmlkLCBnZW8pXG4gICAgY2FsbGJhY2socGFpbnRpbmcsIGdlbylcbiAgfSwgb25Qcm9ncmVzcylcbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9pbWcvdGV4dHVyZXMvd29vZC5qcGVnJylcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIHJldHVybiBbXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pLFxuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoY29sb3VyKSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KVxuICBdXG59XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIG1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0ZXJpYWxzJylcblxuZnVuY3Rpb24gZ2V0TWVzaChzY2VuZSkge1xuICByZXR1cm4gc2NlbmUuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZCBpbnN0YW5jZW9mIFRIUkVFLk1lc2hcbiAgfSlbMF1cbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Q29sb3VyID0gZnVuY3Rpb24oc2NlbmUsIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKVxuICBpZiAoIW1lc2gpIHJldHVyblxuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpXG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKClcbiAgbWVzaC5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdClcbn1cblxubW9kdWxlLmV4cG9ydHMubmV3ID0gZnVuY3Rpb24oZ2VvLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cilcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKVxuICB2YXIgem1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW8sIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCkpXG4gIHptZXNoLnJvdGF0aW9uLmZyb21BcnJheShwYWludGluZy5yb3RhdGlvbilcbiAgem1lc2guc2NhbGUuZnJvbUFycmF5KHBhaW50aW5nLnNjYWxlKVxuICByZXR1cm4gem1lc2hcbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpXG4gIHNjZW5lLnJlbW92ZShtZXNoKVxuICB1cGRhdGUoKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBbe1xuICBpZDogMCxcbiAgdXJsOiAnL29iai9wYWludGluZy0xLmpzJyxcbiAgcm90YXRpb246IFswLjEsIC0xLjE1LCAwLjAyXSxcbiAgc2NhbGU6IFsxLCAxLCAxXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDEsXG4gIHVybDogJy9vYmovcGFpbnRpbmctMi5qcycsXG4gIHJvdGF0aW9uOiBbLTEuMTUsIDIuNjUsIC0wLjE1XSxcbiAgc2NhbGU6IFsxLjIsIDEuMiwgMS4yXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDIsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4xNSwgMS4xNSwgMS4xNV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTUuanMnLFxuICByb3RhdGlvbjogWzAuODIsIDAuMTUsIDEuNDFdLFxuICBzY2FsZTogWzEuMywgMS4zLCAxLjNdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59XVxuIiwiZnVuY3Rpb24gc2hvd1ByZXZpZXcoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpLmNsYXNzTGlzdC5hZGQoJ3Nob3ctLXByZXZpZXcnKVxufVxuXG5mdW5jdGlvbiBoaWRlUHJldmlldygpIHtcbiAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93LS1wcmV2aWV3Jylcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2hvdy1wcmV2aWV3JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UHJldmlldylcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlUHJldmlldylcbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpIHtcbiAgdmFyIHJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgdmFyIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgcmF0aW8sIDEsIDIwMDApXG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMFxuICBjYW1lcmEucG9zaXRpb24ueSA9IDBcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSA0MFxuICByZXR1cm4gY2FtZXJhXG59XG5cbmZ1bmN0aW9uIGFkZExpZ2h0cyhzY2VuZSkge1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmQxKVxuXHRkaXJlY3Rpb25hbExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAxKVxuXHRzY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDAwMDAyRSkpXG5cdHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KVxufVxuXG5mdW5jdGlvbiBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCBjYWxsYmFjaykge1xuICB2YXIgY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyhjYW1lcmEpXG5cdGNvbnRyb2xzLmRhbXBpbmcgPSAwLjJcbiAgY29udHJvbHMubm9LZXlzID0gdHJ1ZVxuICBjb250cm9scy5ub1pvb20gPSB0cnVlXG4gIGNvbnRyb2xzLm5vUGFuID0gdHJ1ZVxuICBjb250cm9scy5ub1JvdGF0ZVVwID0gZmFsc2VcbiAgY29udHJvbHMubWluQXppbXV0aEFuZ2xlID0gLU1hdGguUEkvNVxuXHRjb250cm9scy5tYXhBemltdXRoQW5nbGUgPSBNYXRoLlBJLzEuNVxuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaylcbiAgcmV0dXJuIGNvbnRyb2xzXG59XG5cbmZ1bmN0aW9uIGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSkge1xuICByZXR1cm4gbmV3IFRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHMoY2FtZXJhKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVSZW5kZXJlcigpIHtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgIGFscGhhOiB0cnVlLFxuICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZVxuICB9KVxuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIHJldHVybiByZW5kZXJlclxufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKGNhbWVyYSwgcmVuZGVyZXIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpXG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKVxuICB2YXIgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKClcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuICB2YXIgdXBkYXRlID0gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKVxuICB2YXIgY29udHJvbHMgPSB3aW5kb3cuaW5uZXJXaWR0aCA+IDc2OCA/XG4gICAgICAgIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIHVwZGF0ZSkgOlxuICAgICAgICBhZGREZXZpY2VDb250cm9scyhjYW1lcmEpXG5cbiAgYWRkTGlnaHRzKHNjZW5lKVxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudClcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGFuaW1hdGUoc2NlbmUuY29udHJvbHMpXG4gIHNjZW5lLnVwZGF0ZSgpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZShcbiAgICBzY2VuZS5jYW1lcmEsXG4gICAgc2NlbmUucmVuZGVyZXIsXG4gICAgc2NlbmUudXBkYXRlXG4gICkpXG4gIHJldHVybiBzY2VuZVxufVxuXG5mdW5jdGlvbiBhbmltYXRlKGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZShjb250cm9scykpXG4gICAgY29udHJvbHMudXBkYXRlKClcbiAgfVxufVxuIiwidmFyIGNyZWF0ZVNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZScpLmluaXRcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJylcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKVxudmFyIHNpZGViYXIgPSByZXF1aXJlKCcuL3NpZGViYXInKVxudmFyIHByZXZpZXcgPSByZXF1aXJlKCcuL3ByZXZpZXcnKVxudmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0JylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGNvbG91cnMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKVxuICBmaW5pc2hlcy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpXG4gIHNpZGViYXIuaW5pdCgpXG4gIHByZXZpZXcuaW5pdCgpXG4gIHRlYXJzaGVldC5pbml0KHNjZW5lKVxufSlcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpXG52YXIgc2Nyb2xsVG8gPSByZXF1aXJlKCcuL2xpYi9zY3JvbGx0bycpXG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcFxuICB2YXIgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIChzY3JvbGwgPj0gd2luSGVpZ2h0KSBkb0ZpeCgpXG59XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKVxuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2ZpeC1wYWdlJylcbiAgYm9keS5zY3JvbGxUb3AgLT0gd2luZG93LmlubmVySGVpZ2h0XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKVxufVxuXG5mdW5jdGlvbiBjbGlja05hdihlKSB7XG4gIHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB2YXIgaXNGaXhlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpeC1wYWdlJylcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihocmVmKS5vZmZzZXRUb3BcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKVxuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc2Nyb2xsJykpXG4gIGUucHJldmVudERlZmF1bHQoKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuYXZzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXItLWxlZnQgYScpKVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbClcbiAgbmF2cy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjbGlja05hdikpXG59XG4iLCJmdW5jdGlvbiBzYXZlVGVhclNoZWV0KHJlbmRlcmVyLCBjYW1lcmEsIHVwZGF0ZSwgY29udHJvbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcmV2UG9zaXRpb24gPSBbXG4gICAgICBjYW1lcmEucG9zaXRpb24ueCxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi55LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnpcbiAgICBdXG4gICAgY2FtZXJhLnBvc2l0aW9uLmZyb21BcnJheShbMCwgMCwgNDBdKVxuICAgIGNvbnRyb2xzLnVwZGF0ZSgpXG4gICAgY29uc29sZS5sb2cocmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKSlcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHByZXZQb3NpdGlvbilcbiAgICBjb250cm9scy51cGRhdGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNhdmUtdGVhcnNoZWV0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlVGVhclNoZWV0KHNjZW5lLnJlbmRlcmVyLCBzY2VuZS5jYW1lcmEsIHNjZW5lLnVwZGF0ZSwgc2NlbmUuY29udHJvbHMpKVxufVxuIl19
