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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZWFzaW5nLmpzIiwic3JjL2pzL2xpYi9ldmVudGxpc3RlbmVycy5qcyIsInNyYy9qcy9saWIvbGliZXJhdGUuanMiLCJzcmMvanMvbGliL3Njcm9sbHRvLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3NjZW5lLmpzIiwic3JjL2pzL3NjcmlwdC5qcyIsInNyYy9qcy9zaWRlYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBzdG9yYWdlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXVxuXG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBzdG9yYWdlW2lkXVxufVxuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGUgPSBmdW5jdGlvbiAoaWQsIGdlbykge1xuICBzdG9yYWdlW2lkXSA9IGdlb1xufVxuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKVxudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJylcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJylcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpXG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGVsZW1lbnQpIHtcbiAgdmFyIGNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJylcbiAgdmFyIGNvbG91ck5hbWUgPSBlbGVtZW50LmRhdGFzZXQubmFtZVxuICBjb2xvdXIudGV4dENvbnRlbnQgPSBjb2xvdXJOYW1lXG59XG5cbnZhciBnZXRDb2xvdXIgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBjbGFzc2VzID0gc2xpY2UoZWxlbWVudC5jbGFzc0xpc3QpXG4gIHJldHVybiAnIycgKyBjbGFzc2VzLnJlZHVjZShmdW5jdGlvbiAoY29sb3VyLCBjbGFzc05hbWUpIHtcbiAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2NvbG91ci0tJykgIT09IC0xKVxuICAgICAgY29sb3VyID0gY2xhc3NOYW1lLnNwbGl0KCdjb2xvdXItLScpWzFdXG4gICAgcmV0dXJuIGNvbG91clxuICB9LCAnJylcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm5cbiAgICB2YXIgY29sb3VyID0gZ2V0Q29sb3VyKHRoaXMpXG4gICAgdmFyIGdyYWRpZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyYWRpZW50LmNvbG91ci0tJyArIGNvbG91ci5zdWJzdHJpbmcoMSkpXG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1maW5pc2hlcyAuYnV0dG9uLmlzLWFjdGl2ZScpXG4gICAgYWN0aXZhdGUodGhpcylcbiAgICBhY3RpdmF0ZShncmFkaWVudClcbiAgICBzZXRUZXh0Q29udGVudCh0aGlzKVxuICAgIGlmIChmaW5pc2gpXG4gICAgICBtZXNoLnNldENvbG91cihzY2VuZSwgY29sb3VyLCBwYWludGluZ3NbZmluaXNoLmRhdGFzZXQuaWRdKVxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGNvbG91ckJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tY29sb3VycyBsaScpKVxuICBjb2xvdXJCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSkpXG4gIGNvbG91ckJ1dHRvbnNbY29sb3VyQnV0dG9ucy5sZW5ndGggLSAxXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSlcbn1cbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJylcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpXG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKVxudmFyIGxvYWQgPSByZXF1aXJlKCcuL2xvYWQnKVxudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKVxudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKVxudmFyIGxvYWRpbmcgPSBmYWxzZVxuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChwYWludGluZykge1xuICB2YXIgaW5mb3JtYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1pbmZvcm1hdGlvbicpXG4gIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpXG4gIGluZm9ybWF0aW9uLnRleHRDb250ZW50ID0gcGFpbnRpbmcuaW5mb3JtYXRpb25cbiAgZmluaXNoLnRleHRDb250ZW50ID0gJ0ZpbmlzaCAnICsgKHBhaW50aW5nLmlkICsgMSlcbn1cblxuZnVuY3Rpb24gY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcGFpbnRpbmcgPSBwYWludGluZ3NbdGhpcy5kYXRhc2V0LmlkXVxuICAgIGlmIChsb2FkaW5nKSByZXR1cm4gZmFsc2VcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gZmFsc2VcbiAgICBsb2FkaW5nID0gbG9hZC5zdGFydCgpXG4gICAgbWVzaC5yZW1vdmUoc2NlbmUsIHVwZGF0ZSlcbiAgICBzZXRUZXh0Q29udGVudChwYWludGluZylcbiAgICBsb2FkLnBhaW50aW5nKHBhaW50aW5nLCBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkpXG4gICAgcmV0dXJuIGFjdGl2YXRlKHRoaXMpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ290R2VvKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYWludGluZywgZ2VvKSB7XG4gICAgdmFyIGFjdGl2ZUNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1jb2xvdXJzIGxpLmlzLWFjdGl2ZScpXG4gICAgdmFyIGNvbG91ciA9IGNvbG91cnMuZ2V0KGFjdGl2ZUNvbG91cilcbiAgICB2YXIgem1lc2ggPSBtZXNoLm5ldyhnZW8sIGNvbG91ciwgcGFpbnRpbmcpXG4gICAgc2NlbmUuYWRkKHptZXNoKVxuICAgIGxvYWRpbmcgPSBsb2FkLmVuZCgpXG4gICAgdXBkYXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgZmluaXNoQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKVxuICBmaW5pc2hCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSkpXG4gIGZpbmlzaEJ1dHRvbnNbMF0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpXG59XG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9jbGFzc2xpc3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgc2xpY2UoZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpXG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcbn1cbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnRvZ2dsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcbiAgdCAvPSBkLzJcbiAgaWYgKHQgPCAxKSB7XG4gICAgcmV0dXJuIGMvMip0KnQgKyBiXG4gIH1cbiAgdC0tXG4gIHJldHVybiAtYy8yICogKHQqKHQtMikgLSAxKSArIGJcbn1cblxubW9kdWxlLmV4cG9ydHMuZWFzZUluQ3ViaWMgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0YyA9ICh0Lz1kKSp0KnRcbiAgcmV0dXJuIGIrYyoodGMpXG59XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdHMgPSAodC89ZCkqdFxuICB2YXIgdGMgPSB0cyp0XG4gIHJldHVybiBiK2MqKDYqdGMqdHMgKyAtMTUqdHMqdHMgKyAxMCp0Yylcbn1cbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYylcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5iaW5kLmJpbmQoRnVuY3Rpb24uY2FsbClcbiIsInZhciBlYXNpbmcgPSByZXF1aXJlKCcuL2Vhc2luZycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odG8sIGNhbGxiYWNrLCBkdXJhdGlvbiwgZWFzaW5nTmFtZSkge1xuICB2YXIgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IGRvY3VtZW50LmJvZHlcbiAgdmFyIHN0YXJ0ID0gZG9jLnNjcm9sbFRvcFxuICB2YXIgY2hhbmdlID0gdG8gLSBzdGFydFxuICB2YXIgY3VycmVudFRpbWUgPSAwXG4gIHZhciBpbmNyZW1lbnQgPSAyMFxuXG4gIHZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudFRpbWUgKz0gaW5jcmVtZW50XG4gICAgdmFyIHZhbCA9IGVhc2luZ1tlYXNpbmdOYW1lXShjdXJyZW50VGltZSwgc3RhcnQsIGNoYW5nZSwgZHVyYXRpb24pXG4gICAgZG9jLnNjcm9sbFRvcCA9IHZhbFxuICAgIGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTY3JvbGwpXG4gICAgcmV0dXJuIGNhbGxiYWNrKClcbiAgfVxuICBhbmltYXRlU2Nyb2xsKClcbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpXG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJylcbnZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpXG5cbmZ1bmN0aW9uIG9uUHJvZ3Jlc3MgKHhocikge1xuICB2YXIgcGVyY2VudENvbXBsZXRlID0geGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMFxuICB2YXIgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZy1wcm9ncmVzcycpXG4gIHByb2dyZXNzQmFyLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50Q29tcGxldGUgKyAnJSdcbn1cblxuZnVuY3Rpb24gaGlkZUJhcigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxufVxuXG5mdW5jdGlvbiBmaW5pc2hlc0J1dHRvbnMoKSB7XG4gIHJldHVybiBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSlcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QuYWRkKCdpcy1sb2FkaW5nJykpXG4gIHJldHVybiB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWxvYWRpbmcnKSlcbiAgaGlkZUJhcigpXG4gIHJldHVybiBmYWxzZVxufVxuXG5tb2R1bGUuZXhwb3J0cy5wYWludGluZyA9IGZ1bmN0aW9uIChwYWludGluZywgY2FsbGJhY2spIHtcbiAgdmFyIGNhY2hlZEdlbyA9IGNhY2hlLmZyb20ocGFpbnRpbmcuaWQpXG4gIGlmIChjYWNoZWRHZW8pIHJldHVybiBjYWxsYmFjayhwYWludGluZywgY2FjaGVkR2VvKVxuICBsb2FkZXIubG9hZChwYWludGluZy51cmwsIGZ1bmN0aW9uKGdlbykge1xuICAgIGdlby5tZXJnZVZlcnRpY2VzKClcbiAgICBnZW8uY2VudGVyKClcbiAgICBjYWNoZS51cGRhdGUocGFpbnRpbmcuaWQsIGdlbylcbiAgICBjYWxsYmFjayhwYWludGluZywgZ2VvKVxuICB9LCBvblByb2dyZXNzKVxufVxuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnL2ltZy90ZXh0dXJlcy93b29kLmpwZWcnKVxuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihjb2xvdXIpIHtcbiAgcmV0dXJuIFtcbiAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleHR1cmUsXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSksXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcihjb2xvdXIpLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pXG4gIF1cbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgbWF0ZXJpYWxzID0gcmVxdWlyZSgnLi9tYXRlcmlhbHMnKVxuXG5mdW5jdGlvbiBnZXRNZXNoKHNjZW5lKSB7XG4gIHJldHVybiBzY2VuZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkIGluc3RhbmNlb2YgVEhSRUUuTWVzaFxuICB9KVswXVxufVxuXG5tb2R1bGUuZXhwb3J0cy5zZXRDb2xvdXIgPSBmdW5jdGlvbihzY2VuZSwgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpXG4gIGlmICghbWVzaCkgcmV0dXJuXG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cilcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKVxuICBtZXNoLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KVxufVxuXG5tb2R1bGUuZXhwb3J0cy5uZXcgPSBmdW5jdGlvbihnZW8sIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1hdCA9IG1hdGVyaWFscy5nZXQoY29sb3VyKVxuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpXG4gIHZhciB6bWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KSlcbiAgem1lc2gucm90YXRpb24uZnJvbUFycmF5KHBhaW50aW5nLnJvdGF0aW9uKVxuICB6bWVzaC5zY2FsZS5mcm9tQXJyYXkocGFpbnRpbmcuc2NhbGUpXG4gIHJldHVybiB6bWVzaFxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSlcbiAgc2NlbmUucmVtb3ZlKG1lc2gpXG4gIHVwZGF0ZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFt7XG4gIGlkOiAwLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTEuanMnLFxuICByb3RhdGlvbjogWzAuMSwgLTEuMTUsIDAuMDJdLFxuICBzY2FsZTogWzEsIDEsIDFdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMSxcbiAgdXJsOiAnL29iai9wYWludGluZy0yLmpzJyxcbiAgcm90YXRpb246IFstMS4xNSwgMi42NSwgLTAuMTVdLFxuICBzY2FsZTogWzEuMiwgMS4yLCAxLjJdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZy00LmpzJyxcbiAgcm90YXRpb246IFswLjg1LCAwLjEyLCAxLjQ1XSxcbiAgc2NhbGU6IFsxLjE1LCAxLjE1LCAxLjE1XSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDMsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNS5qcycsXG4gIHJvdGF0aW9uOiBbMC44MiwgMC4xNSwgMS40MV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn1dXG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDYW1lcmEoKSB7XG4gIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIHJhdGlvLCAxLCAyMDAwKVxuICBjYW1lcmEucG9zaXRpb24ueCA9IDBcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAwXG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDBcbiAgcmV0dXJuIGNhbWVyYVxufVxuXG5mdW5jdGlvbiBhZGRMaWdodHMoc2NlbmUpIHtcbiAgdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MTAxMDMwKVxuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKVxuXHRkaXJlY3Rpb25hbExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAxKVxuXHRzY2VuZS5hZGQoYW1iaWVudClcblx0c2NlbmUuYWRkKGRpcmVjdGlvbmFsTGlnaHQpXG59XG5cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIGNhbGxiYWNrKSB7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSlcblx0Y29udHJvbHMuZGFtcGluZyA9IDAuMlxuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaylcbiAgcmV0dXJuIGNvbnRyb2xzXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWV9KVxuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIHJldHVybiByZW5kZXJlclxufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKGNhbWVyYSwgcmVuZGVyZXIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpXG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKVxuICB2YXIgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKClcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuICB2YXIgdXBkYXRlID0gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKVxuICB2YXIgY29udHJvbHMgPSBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpXG5cbiAgYWRkTGlnaHRzKHNjZW5lKVxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudClcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGFuaW1hdGUoc2NlbmUuY29udHJvbHMpXG4gIHNjZW5lLnVwZGF0ZSgpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZShcbiAgICBzY2VuZS5jYW1lcmEsXG4gICAgc2NlbmUucmVuZGVyZXIsXG4gICAgc2NlbmUudXBkYXRlXG4gICkpXG4gIHJldHVybiBzY2VuZVxufVxuXG5mdW5jdGlvbiBhbmltYXRlKGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZShjb250cm9scykpXG4gICAgY29udHJvbHMudXBkYXRlKClcbiAgfVxufVxuIiwidmFyIGNyZWF0ZVNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZScpLmluaXRcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJylcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKVxudmFyIHNpZGViYXIgPSByZXF1aXJlKCcuL3NpZGViYXInKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKClcbiAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpXG4gIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSlcbiAgc2lkZWJhci5pbml0KClcbn0pXG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKVxudmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKVxudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKVxuXG5mdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3BcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICBpZiAoc2Nyb2xsID49IHdpbkhlaWdodCkgZG9GaXgoKVxufVxuXG5mdW5jdGlvbiBkb0ZpeCgpIHtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JylcbiAgYm9keS5jbGFzc0xpc3QuYWRkKCdmaXgtcGFnZScpXG4gIGJvZHkuc2Nyb2xsVG9wIC09IHdpbmRvdy5pbm5lckhlaWdodFxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbClcbn1cblxuZnVuY3Rpb24gY2xpY2tOYXYoZSkge1xuICB2YXIgaHJlZiA9IHRoaXMuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgdmFyIGlzRml4ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaXgtcGFnZScpXG4gIHZhciB0byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaHJlZikub2Zmc2V0VG9wXG4gIHNjcm9sbFRvKHRvLCBmdW5jdGlvbigpIHt9LCA2MDAsICdlYXNlSW5PdXRRdWFkJylcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Njcm9sbCcpKVxuICBlLnByZXZlbnREZWZhdWx0KClcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmF2cyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyLS1sZWZ0IGEnKSlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwpXG4gIG5hdnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2xpY2tOYXYpKVxufVxuIl19
