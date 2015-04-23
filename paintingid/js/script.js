!function e(n,t,i){function r(s,a){if(!t[s]){if(!n[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(o)return o(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var l=t[s]={exports:{}};n[s][0].call(l.exports,function(e){var t=n[s][1][e];return r(t?t:e)},l,l.exports,e,n,t,i)}return t[s].exports}for(var o="function"==typeof require&&require,s=0;s<i.length;s++)r(i[s]);return r}({1:[function(e,n,t){var i=[!1,!1,!1,!1];n.exports.from=function(e){return i[e]},n.exports.update=function(e,n){i[e]=n}},{}],2:[function(e,n,t){function i(e){var n=document.querySelector(".box-colour"),t=e.dataset.name;n.textContent=t}function r(e,n){return function(t){if(!this.classList.contains("is-active")){var r=l(this),o=document.querySelector(".gradient.colour--"+r.substring(1)),s=document.querySelector(".buttons--finishes .button.is-active");a(this),a(o),i(this),s&&c.setColour(e,r,u[s.dataset.id]),n()}}}var o=e("./lib/eventlisteners"),s=e("./lib/liberate")([].slice),a=e("./lib/activate"),c=e("./mesh"),u=e("./paintings"),l=n.exports.get=function(e){var n=s(e.classList);return"#"+n.reduce(function(e,n){return-1!==n.indexOf("colour--")&&(e=n.split("colour--")[1]),e},"")};n.exports.init=function(e,n){var t=s(document.querySelectorAll(".buttons--colours li"));t.forEach(o.add("click",r(e,n))),t[t.length-1].dispatchEvent(new Event("click"))}},{"./lib/activate":4,"./lib/eventlisteners":6,"./lib/liberate":7,"./mesh":10,"./paintings":11}],3:[function(e,n,t){function i(e){var n=document.querySelector(".sidebar-information"),t=document.querySelector(".box-finish");n.textContent=e.information,t.textContent="Finish "+(e.id+1)}function r(e,n){return function(t){var r=u[this.dataset.id];return v?!1:this.classList.contains("is-active")?!1:(v=l.start(),f.remove(e,n),i(r),l.painting(r,o(e,n)),c(this))}}function o(e,n){return function(t,i){var r=document.querySelector(".buttons--colours li.is-active"),o=d.get(r),s=f["new"](i,o,t);e.add(s),v=l.end(),n()}}var s=e("./lib/eventlisteners"),a=e("./lib/liberate")([].slice),c=e("./lib/activate"),u=e("./paintings"),l=e("./load"),d=e("./colours"),f=e("./mesh"),v=!1;n.exports.init=function(e,n){var t=a(document.querySelectorAll(".buttons--finishes li"));t.forEach(s.add("click",r(e,n))),t[0].dispatchEvent(new Event("click"))}},{"./colours":2,"./lib/activate":4,"./lib/eventlisteners":6,"./lib/liberate":7,"./load":8,"./mesh":10,"./paintings":11}],4:[function(e,n,t){var i=e("./liberate")([].slice),r=e("./classlist");n.exports=function(e){i(e.parentNode.childNodes).forEach(r.remove("is-active")),e.classList.add("is-active")}},{"./classlist":5,"./liberate":7}],5:[function(e,n,t){n.exports.add=function(e){return function(n){n.classList.add(e)}},n.exports.remove=function(e){return function(n){n.classList.remove(e)}},n.exports.toggle=function(e){return function(n){n.classList.toggle(e)}}},{}],6:[function(e,n,t){n.exports.add=function(e,n){return function(t){t.addEventListener(e,n)}},n.exports.remove=function(e,n){return function(t){t.removeEventListener(e,n)}}},{}],7:[function(e,n,t){n.exports=Function.bind.bind(Function.call)},{}],8:[function(e,n,t){function i(e){var n=e.loaded/e.total*100,t=document.querySelector(".loading-progress");t.parentNode.classList.remove("hidden"),t.style.width=n+"%"}function r(){document.querySelector(".loading").classList.add("hidden")}function o(){return s(document.querySelectorAll(".buttons--finishes li"))}var s=e("./lib/liberate")([].slice),a=e("./lib/classlist"),c=e("./cache"),u=new THREE.JSONLoader;n.exports.start=function(){return o().forEach(a.add("is-loading")),!0},n.exports.end=function(){return o().forEach(a.remove("is-loading")),r(),!1},n.exports.painting=function(e,n){var t=c.from(e.id);return t?n(e,t):void u.load(e.url,function(t){t.mergeVertices(),t.center(),c.update(e.id,t),n(e,t)},i)}},{"./cache":1,"./lib/classlist":5,"./lib/liberate":7}],9:[function(e,n,t){var i=THREE.ImageUtils.loadTexture("/img/textures/wood.jpeg");n.exports.get=function(e){return[new THREE.MeshLambertMaterial({map:i,side:THREE.DoubleSide}),new THREE.MeshLambertMaterial({color:new THREE.Color(e),side:THREE.DoubleSide})]}},{}],10:[function(e,n,t){function i(e){return e.children.filter(function(e){return e instanceof THREE.Mesh})[0]}var r=e("./materials");n.exports.setColour=function(e,n,t){var o=i(e);if(o){var s=r.get(n);t.reversedMesh&&(s=s.reverse()),o.material=new THREE.MeshFaceMaterial(s)}},n.exports["new"]=function(e,n,t){var i=r.get(n);t.reversedMesh&&(i=i.reverse());var o=new THREE.Mesh(e,new THREE.MeshFaceMaterial(i));return o.rotation.fromArray(t.rotation),o.scale.fromArray(t.scale),o},n.exports.remove=function(e,n){var t=i(e);e.remove(t),n()}},{"./materials":9}],11:[function(e,n,t){n.exports=[{id:0,url:"/obj/painting-1.js",rotation:[.1,-1.15,.02],scale:[1,1,1],reversedMesh:!1,cache:!1,information:"Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys."},{id:1,url:"/obj/painting-2.js",rotation:[-1.15,2.65,-.15],scale:[1.2,1.2,1.2],reversedMesh:!1,cache:!1,information:"Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys."},{id:2,url:"/obj/painting-4.js",rotation:[.85,.12,1.45],scale:[1.15,1.15,1.15],reversedMesh:!1,cache:!1,information:"Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys."},{id:3,url:"/obj/painting-5.js",rotation:[.82,.15,1.41],scale:[1.3,1.3,1.3],reversedMesh:!0,cache:!1,information:"Available sizes: 48 × 40 × 4 in. or 72 × 60 × 4 in. with one of four finishes. Finish available in one of two greys."}]},{}],12:[function(e,n,t){function i(){var e=window.innerWidth/window.innerHeight,n=new THREE.PerspectiveCamera(60,e,1,2e3);return n.position.x=0,n.position.y=0,n.position.z=40,n}function r(e){var n=new THREE.AmbientLight(1052720),t=new THREE.DirectionalLight(16777215);t.position.set(0,1,1),e.add(n),e.add(t)}function o(e,n,t){var i=new THREE.OrbitControls(n);return i.damping=.2,i.addEventListener("change",t),i}function s(){var e=new THREE.WebGLRenderer({alpha:!0});return e.setPixelRatio(window.devicePixelRatio),e.setSize(window.innerWidth,window.innerHeight),e}function a(e,n,t){return function(){t.render(e,n)}}function c(e,n,t){return function(){e.aspect=window.innerWidth/window.innerHeight,e.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight),t()}}function u(){var e=document.querySelector(".render"),n=i(),t=s(),c=new THREE.Scene,u=a(c,n,t),l=o(c,n,u);return r(c),e.appendChild(t.domElement),{camera:n,controls:l,renderer:t,update:u,scene:c}}function l(e){return function(){requestAnimationFrame(l(e)),e.update()}}n.exports.init=function(){var e=u();return l(e.controls),e.update(),window.addEventListener("resize",c(e.camera,e.renderer,e.update)),e}},{}],13:[function(e,n,t){var i=e("./scene").init,r=e("./colours"),o=e("./finishes");document.addEventListener("DOMContentLoaded",function(){var e=i();r.init(e.scene,e.update),o.init(e.scene,e.update)})},{"./colours":2,"./finishes":3,"./scene":12}]},{},[13]); {
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

document.addEventListener('DOMContentLoaded', function() {
  var scene = createScene()
  colours.init(scene.scene, scene.update)
  finishes.init(scene.scene, scene.update)
})

},{"./colours":2,"./finishes":3,"./scene":12}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3NjZW5lLmpzIiwic3JjL2pzL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBzdG9yYWdlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXVxuXG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBzdG9yYWdlW2lkXVxufVxuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGUgPSBmdW5jdGlvbiAoaWQsIGdlbykge1xuICBzdG9yYWdlW2lkXSA9IGdlb1xufVxuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKVxudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJylcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJylcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpXG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGVsZW1lbnQpIHtcbiAgdmFyIGNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJylcbiAgdmFyIGNvbG91ck5hbWUgPSBlbGVtZW50LmRhdGFzZXQubmFtZVxuICBjb2xvdXIudGV4dENvbnRlbnQgPSBjb2xvdXJOYW1lXG59XG5cbnZhciBnZXRDb2xvdXIgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBjbGFzc2VzID0gc2xpY2UoZWxlbWVudC5jbGFzc0xpc3QpXG4gIHJldHVybiAnIycgKyBjbGFzc2VzLnJlZHVjZShmdW5jdGlvbiAoY29sb3VyLCBjbGFzc05hbWUpIHtcbiAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2NvbG91ci0tJykgIT09IC0xKVxuICAgICAgY29sb3VyID0gY2xhc3NOYW1lLnNwbGl0KCdjb2xvdXItLScpWzFdXG4gICAgcmV0dXJuIGNvbG91clxuICB9LCAnJylcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm5cbiAgICB2YXIgY29sb3VyID0gZ2V0Q29sb3VyKHRoaXMpXG4gICAgdmFyIGdyYWRpZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyYWRpZW50LmNvbG91ci0tJyArIGNvbG91ci5zdWJzdHJpbmcoMSkpXG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1maW5pc2hlcyAuYnV0dG9uLmlzLWFjdGl2ZScpXG4gICAgYWN0aXZhdGUodGhpcylcbiAgICBhY3RpdmF0ZShncmFkaWVudClcbiAgICBzZXRUZXh0Q29udGVudCh0aGlzKVxuICAgIGlmIChmaW5pc2gpXG4gICAgICBtZXNoLnNldENvbG91cihzY2VuZSwgY29sb3VyLCBwYWludGluZ3NbZmluaXNoLmRhdGFzZXQuaWRdKVxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGNvbG91ckJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tY29sb3VycyBsaScpKVxuICBjb2xvdXJCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSkpXG4gIGNvbG91ckJ1dHRvbnNbY29sb3VyQnV0dG9ucy5sZW5ndGggLSAxXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSlcbn1cbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJylcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpXG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKVxudmFyIGxvYWQgPSByZXF1aXJlKCcuL2xvYWQnKVxudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKVxudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKVxudmFyIGxvYWRpbmcgPSBmYWxzZVxuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChwYWludGluZykge1xuICB2YXIgaW5mb3JtYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1pbmZvcm1hdGlvbicpXG4gIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpXG4gIGluZm9ybWF0aW9uLnRleHRDb250ZW50ID0gcGFpbnRpbmcuaW5mb3JtYXRpb25cbiAgZmluaXNoLnRleHRDb250ZW50ID0gJ0ZpbmlzaCAnICsgKHBhaW50aW5nLmlkICsgMSlcbn1cblxuZnVuY3Rpb24gY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcGFpbnRpbmcgPSBwYWludGluZ3NbdGhpcy5kYXRhc2V0LmlkXVxuICAgIGlmIChsb2FkaW5nKSByZXR1cm4gZmFsc2VcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gZmFsc2VcbiAgICBsb2FkaW5nID0gbG9hZC5zdGFydCgpXG4gICAgbWVzaC5yZW1vdmUoc2NlbmUsIHVwZGF0ZSlcbiAgICBzZXRUZXh0Q29udGVudChwYWludGluZylcbiAgICBsb2FkLnBhaW50aW5nKHBhaW50aW5nLCBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkpXG4gICAgcmV0dXJuIGFjdGl2YXRlKHRoaXMpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ290R2VvKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYWludGluZywgZ2VvKSB7XG4gICAgdmFyIGFjdGl2ZUNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1jb2xvdXJzIGxpLmlzLWFjdGl2ZScpXG4gICAgdmFyIGNvbG91ciA9IGNvbG91cnMuZ2V0KGFjdGl2ZUNvbG91cilcbiAgICB2YXIgem1lc2ggPSBtZXNoLm5ldyhnZW8sIGNvbG91ciwgcGFpbnRpbmcpXG4gICAgc2NlbmUuYWRkKHptZXNoKVxuICAgIGxvYWRpbmcgPSBsb2FkLmVuZCgpXG4gICAgdXBkYXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgZmluaXNoQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKVxuICBmaW5pc2hCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSkpXG4gIGZpbmlzaEJ1dHRvbnNbMF0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpXG59XG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYmVyYXRlJykoW10uc2xpY2UpXG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9jbGFzc2xpc3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgc2xpY2UoZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpXG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcbn1cbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnRvZ2dsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24uYmluZC5iaW5kKEZ1bmN0aW9uLmNhbGwpXG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSlcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKVxudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpXG52YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKVxuXG5mdW5jdGlvbiBvblByb2dyZXNzICh4aHIpIHtcbiAgdmFyIHBlcmNlbnRDb21wbGV0ZSA9IHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDBcbiAgdmFyIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmctcHJvZ3Jlc3MnKVxuICBwcm9ncmVzc0Jhci5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXG4gIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyY2VudENvbXBsZXRlICsgJyUnXG59XG5cbmZ1bmN0aW9uIGhpZGVCYXIoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbn1cblxuZnVuY3Rpb24gZmluaXNoZXNCdXR0b25zKCkge1xuICByZXR1cm4gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpXG59XG5cbm1vZHVsZS5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LmFkZCgnaXMtbG9hZGluZycpKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cy5lbmQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJykpXG4gIGhpZGVCYXIoKVxuICByZXR1cm4gZmFsc2Vcbn1cblxubW9kdWxlLmV4cG9ydHMucGFpbnRpbmcgPSBmdW5jdGlvbiAocGFpbnRpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBjYWNoZWRHZW8gPSBjYWNoZS5mcm9tKHBhaW50aW5nLmlkKVxuICBpZiAoY2FjaGVkR2VvKSByZXR1cm4gY2FsbGJhY2socGFpbnRpbmcsIGNhY2hlZEdlbylcbiAgbG9hZGVyLmxvYWQocGFpbnRpbmcudXJsLCBmdW5jdGlvbihnZW8pIHtcbiAgICBnZW8ubWVyZ2VWZXJ0aWNlcygpXG4gICAgZ2VvLmNlbnRlcigpXG4gICAgY2FjaGUudXBkYXRlKHBhaW50aW5nLmlkLCBnZW8pXG4gICAgY2FsbGJhY2socGFpbnRpbmcsIGdlbylcbiAgfSwgb25Qcm9ncmVzcylcbn1cbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9pbWcvdGV4dHVyZXMvd29vZC5qcGVnJylcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIHJldHVybiBbXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pLFxuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoY29sb3VyKSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KVxuICBdXG59XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIG1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0ZXJpYWxzJylcblxuZnVuY3Rpb24gZ2V0TWVzaChzY2VuZSkge1xuICByZXR1cm4gc2NlbmUuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZCBpbnN0YW5jZW9mIFRIUkVFLk1lc2hcbiAgfSlbMF1cbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Q29sb3VyID0gZnVuY3Rpb24oc2NlbmUsIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKVxuICBpZiAoIW1lc2gpIHJldHVyblxuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpXG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKClcbiAgbWVzaC5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdClcbn1cblxubW9kdWxlLmV4cG9ydHMubmV3ID0gZnVuY3Rpb24oZ2VvLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cilcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKVxuICB2YXIgem1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW8sIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCkpXG4gIHptZXNoLnJvdGF0aW9uLmZyb21BcnJheShwYWludGluZy5yb3RhdGlvbilcbiAgem1lc2guc2NhbGUuZnJvbUFycmF5KHBhaW50aW5nLnNjYWxlKVxuICByZXR1cm4gem1lc2hcbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpXG4gIHNjZW5lLnJlbW92ZShtZXNoKVxuICB1cGRhdGUoKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBbe1xuICBpZDogMCxcbiAgdXJsOiAnL29iai9wYWludGluZy0xLmpzJyxcbiAgcm90YXRpb246IFswLjEsIC0xLjE1LCAwLjAyXSxcbiAgc2NhbGU6IFsxLCAxLCAxXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDEsXG4gIHVybDogJy9vYmovcGFpbnRpbmctMi5qcycsXG4gIHJvdGF0aW9uOiBbLTEuMTUsIDIuNjUsIC0wLjE1XSxcbiAgc2NhbGU6IFsxLjIsIDEuMiwgMS4yXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDIsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4xNSwgMS4xNSwgMS4xNV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTUuanMnLFxuICByb3RhdGlvbjogWzAuODIsIDAuMTUsIDEuNDFdLFxuICBzY2FsZTogWzEuMywgMS4zLCAxLjNdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59XVxuIiwiLypnbG9iYWwgVEhSRUUgKi9cblxuZnVuY3Rpb24gY3JlYXRlQ2FtZXJhKCkge1xuICB2YXIgcmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCByYXRpbywgMSwgMjAwMClcbiAgY2FtZXJhLnBvc2l0aW9uLnggPSAwXG4gIGNhbWVyYS5wb3NpdGlvbi55ID0gMFxuICBjYW1lcmEucG9zaXRpb24ueiA9IDQwXG4gIHJldHVybiBjYW1lcmFcbn1cblxuZnVuY3Rpb24gYWRkTGlnaHRzKHNjZW5lKSB7XG4gIHZhciBhbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDEwMTAzMClcbiAgdmFyIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZilcblx0ZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoMCwgMSwgMSlcblx0c2NlbmUuYWRkKGFtYmllbnQpXG5cdHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KVxufVxuXG5mdW5jdGlvbiBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCBjYWxsYmFjaykge1xuICB2YXIgY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyhjYW1lcmEpXG5cdGNvbnRyb2xzLmRhbXBpbmcgPSAwLjJcbiAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spXG4gIHJldHVybiBjb250cm9sc1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZW5kZXJlcigpIHtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FscGhhOiB0cnVlfSlcblx0cmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbylcblx0cmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuICByZXR1cm4gcmVuZGVyZXJcbn1cblxuZnVuY3Rpb24gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSlcbiAgfVxufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZShjYW1lcmEsIHJlbmRlcmVyLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG5cdCAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKVxuXHQgIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcbiAgICBjYWxsYmFjaygpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU2NlbmUoKSB7XG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuZGVyJylcbiAgdmFyIGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpXG4gIHZhciByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKClcbiAgdmFyIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcbiAgdmFyIHVwZGF0ZSA9IHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcilcbiAgdmFyIGNvbnRyb2xzID0gYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgdXBkYXRlKVxuXG4gIGFkZExpZ2h0cyhzY2VuZSlcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpXG4gIHJldHVybiB7XG4gICAgY2FtZXJhOiBjYW1lcmEsXG4gICAgY29udHJvbHM6IGNvbnRyb2xzLFxuICAgIHJlbmRlcmVyOiByZW5kZXJlcixcbiAgICB1cGRhdGU6IHVwZGF0ZSxcbiAgICBzY2VuZTogc2NlbmVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKVxuICBhbmltYXRlKHNjZW5lLmNvbnRyb2xzKVxuICBzY2VuZS51cGRhdGUoKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKVxuICByZXR1cm4gc2NlbmVcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKVxuICAgIGNvbnRyb2xzLnVwZGF0ZSgpXG4gIH1cbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0XG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpXG52YXIgZmluaXNoZXMgPSByZXF1aXJlKCcuL2ZpbmlzaGVzJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpXG4gIGNvbG91cnMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKVxuICBmaW5pc2hlcy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpXG59KVxuIl19
