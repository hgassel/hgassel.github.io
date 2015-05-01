(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var storage = [false, false, false, false];

module.exports.from = function (id) {
  return storage[id];
};

module.exports.update = function (id, geo) {
  storage[id] = geo;
};

},{}],2:[function(require,module,exports){
var eventListeners = require('./lib/eventlisteners');
var slice = require('./lib/liberate')([].slice);
var activate = require('./lib/activate');
var mesh = require('./mesh');
var paintings = require('./paintings');

function setTextContent(element) {
  var colour = document.querySelector('.box-colour');
  var colourName = element.dataset.name;
  colour.textContent = colourName;
}

var getColour = module.exports.get = function(element) {
  // var classes = slice(element.classList)
  // return '#' + classes.reduce(function (colour, className) {
  //   if (className.indexOf('colour--') !== -1)
  //     colour = className.split('colour--')[1]
  //   return colour
  // }, '')
  return element.dataset.colour;
};

function changeColour(scene, update) {
  return function(e) {
    if (this.classList.contains('is-active')) return;
    var colour = getColour(this);
    var gradient = document.querySelector('.gradient.colour--' + colour.substring(1));
    var finish = document.querySelector('.buttons--finishes .button.is-active');
    activate(this);
    activate(gradient);
    setTextContent(this);
    if (finish)
      mesh.setColour(scene, colour, paintings[finish.dataset.id]);
    update();
  };
}

module.exports.init = function(scene, update) {
  var colourButtons = slice(document.querySelectorAll('.buttons--colours li'));
  colourButtons.forEach(eventListeners.add('click', changeColour(scene, update)));
  colourButtons[colourButtons.length - 1].dispatchEvent(new Event('click'));
};

},{"./lib/activate":4,"./lib/eventlisteners":7,"./lib/liberate":8,"./mesh":13,"./paintings":14}],3:[function(require,module,exports){
var eventListeners = require('./lib/eventlisteners');
var slice = require('./lib/liberate')([].slice);
var activate = require('./lib/activate');
var paintings = require('./paintings');
var load = require('./load');
var colours = require('./colours');
var mesh = require('./mesh');
var loading = false;

function setTextContent(painting) {
  var information = document.querySelector('.sidebar-information');
  var finish = document.querySelector('.box-finish');
  information.textContent = painting.information;
  finish.textContent = 'Finish ' + (painting.id + 1);
}

function changeFinish(scene, update) {
  return function(e) {
    var painting = paintings[this.dataset.id];
    if (loading) return false;
    if (this.classList.contains('is-active')) return false;
    loading = load.start();
    mesh.remove(scene, update);
    setTextContent(painting);
    load.painting(painting, gotGeo(scene, update));
    return activate(this);
  };
}

function gotGeo(scene, update) {
  return function (painting, geo) {
    var activeColour = document.querySelector('.buttons--colours li.is-active');
    var colour = colours.get(activeColour);
    var zmesh = mesh.new(geo, colour, painting);
    scene.add(zmesh);
    loading = load.end();
    update();
  };
}

module.exports.init = function(scene, update) {
  var finishButtons = slice(document.querySelectorAll('.buttons--finishes li'));
  finishButtons.forEach(eventListeners.add('click', changeFinish(scene, update)));
  finishButtons[0].dispatchEvent(new Event('click'));
};

},{"./colours":2,"./lib/activate":4,"./lib/eventlisteners":7,"./lib/liberate":8,"./load":10,"./mesh":13,"./paintings":14}],4:[function(require,module,exports){
var slice = require('./liberate')([].slice);
var classlist = require('./classlist');

module.exports = function(element) {
  slice(element.parentNode.childNodes).forEach(classlist.remove('is-active'));
  element.classList.add('is-active');
};

},{"./classlist":5,"./liberate":8}],5:[function(require,module,exports){
module.exports.add = function (name) {
  return function (element) {
    element.classList.add(name);
  };
};

module.exports.remove = function (name) {
  return function (element) {
    element.classList.remove(name);
  };
};

module.exports.toggle = function (name) {
  return function (element) {
    element.classList.toggle(name);
  };
};

},{}],6:[function(require,module,exports){
module.exports.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b;
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};

module.exports.easeInCubic = function(t, b, c, d) {
  var tc = (t/=d)*t*t;
  return b+c*(tc);
};

module.exports.easeInOutQuint = function(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

},{}],7:[function(require,module,exports){
module.exports.add = function (event, func) {
  return function (element) {
    element.addEventListener(event, func);
  };
};

module.exports.remove = function (event, func) {
  return function (element) {
    element.removeEventListener(event, func);
  };
};

},{}],8:[function(require,module,exports){
module.exports = Function.bind.bind(Function.call);

},{}],9:[function(require,module,exports){
var easing = require('./easing');

module.exports = function(to, callback, duration, easingName) {
  var doc = document.documentElement.scrollTop ? document.documentElement : document.body;
  var start = doc.scrollTop;
  var change = to - start;
  var currentTime = 0;
  var increment = 20;

  var animateScroll = function() {
    currentTime += increment;
    var val = easing[easingName](currentTime, start, change, duration);
    doc.scrollTop = val;
    if (currentTime < duration) return requestAnimationFrame(animateScroll);
    return callback();
  };
  animateScroll();
};

},{"./easing":6}],10:[function(require,module,exports){
/*global THREE */
var slice = require('./lib/liberate')([].slice);
var classlist = require('./lib/classlist');
var cache = require('./cache');
var loader = new THREE.JSONLoader();

function onProgress (xhr) {
  var percentComplete = xhr.loaded / xhr.total * 100;
  var progressBar = document.querySelector('.loading-progress');
  progressBar.parentNode.classList.remove('hidden');
  progressBar.style.width = percentComplete + '%';
}

function hideBar() {
  document.querySelector('.loading').classList.add('hidden');
}

function finishesButtons() {
  return slice(document.querySelectorAll('.buttons--finishes li'));
}

module.exports.start = function() {
  finishesButtons().forEach(classlist.add('is-loading'));
  return true;
};

module.exports.end = function() {
  finishesButtons().forEach(classlist.remove('is-loading'));
  hideBar();
  return false;
};

module.exports.painting = function (painting, callback) {
  var cachedGeo = cache.from(painting.id);
  if (cachedGeo) return callback(painting, cachedGeo);
  loader.load(painting.url, function(geo) {
    geo.mergeVertices();
    geo.center();
    cache.update(painting.id, geo);
    callback(painting, geo);
  }, onProgress);
};

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":8}],11:[function(require,module,exports){
var tearsheet = require('./tearsheet');

function mail(scene) {
  var getImage = tearsheet.getJpg(scene.renderer, scene.camera, scene.controls);
  var href = 'mailto:info@brendansmithstudio.com?subject=PaintingID';
  return function(e) {
    var image = getImage();
    var finish = document.querySelector('.box-finish').textContent;
    var name = document.querySelector('.box-colour').textContent;
    this.href = href + '&body=' +
      encodeURIComponent(finish) + '%20' + encodeURIComponent(name);
  };
}

module.exports.init = function(scene) {
  document.querySelector('.js-mail').addEventListener('click', mail(scene));
};

},{"./tearsheet":19}],12:[function(require,module,exports){
/*global THREE */
var texture = THREE.ImageUtils.loadTexture('/img/textures/wood.jpeg');

module.exports.get = function(colour) {
  return [
    new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    }),
    new THREE.MeshPhongMaterial({
      color: new THREE.Color(colour),
      side: THREE.DoubleSide
    })
  ];
};

},{}],13:[function(require,module,exports){
/*global THREE */
var materials = require('./materials');

function getMesh(scene) {
  return scene.children.filter(function (child) {
    return child instanceof THREE.Mesh;
  })[0];
}

module.exports.setColour = function(scene, colour, painting) {
  var mesh = getMesh(scene);
  if (!mesh) return;
  var mat = materials.get(colour);
  if (painting.reversedMesh) mat = mat.reverse();
  mesh.material = new THREE.MeshFaceMaterial(mat);
};

module.exports.new = function(geo, colour, painting) {
  var mat = materials.get(colour);
  if (painting.reversedMesh) mat = mat.reverse();
  var zmesh = new THREE.Mesh(geo, new THREE.MeshFaceMaterial(mat));
  zmesh.rotation.fromArray(painting.rotation);
  zmesh.scale.fromArray(painting.scale);
  return zmesh;
};

module.exports.remove = function(scene, update) {
  var mesh = getMesh(scene);
  scene.remove(mesh);
  update();
};

},{"./materials":12}],14:[function(require,module,exports){
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
}];

},{}],15:[function(require,module,exports){
var tearsheet = require('./tearsheet');

function showPreview(scene) {
  var getJpg = tearsheet.getJpg(scene.renderer, scene.camera, scene.controls);
  var intro = document.querySelector('.section--intro');
  var painting = intro.children[0];
  return function() {
    var jpg = getJpg();
    painting.style.backgroundImage = 'url("' + jpg + '")';
    intro.classList.add('show--preview');
  };
}

function hidePreview() {
  this.classList.remove('show--preview');
}

module.exports.init = function(scene) {
  document.querySelector('.js-show-preview').addEventListener('click', showPreview(scene));
  document.querySelector('.section--intro').addEventListener('click', hidePreview);
};

},{"./tearsheet":19}],16:[function(require,module,exports){
/*global THREE */

function createCamera() {
  var ratio = window.innerWidth / window.innerHeight;
  var camera = new THREE.PerspectiveCamera(60, ratio, 1, 2000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 40;
  return camera;
}

function addLights(scene) {
  var directionalLight = new THREE.DirectionalLight(0xffffe8);
	directionalLight.position.set(0, 1, 1);
	scene.add(new THREE.AmbientLight(0x2C2C3D));
	scene.add(directionalLight);
}

function addControls(scene, camera, callback) {
  var controls = new THREE.OrbitControls(camera);
	controls.damping = 0.2;
  controls.noKeys = true;
  controls.noZoom = true;
  controls.noPan = true;
  controls.noRotateUp = false;
  controls.minAzimuthAngle = -Math.PI/5;
	controls.maxAzimuthAngle = Math.PI/1.5;
  controls.addEventListener('change', callback);
  return controls;
}

function addDeviceControls(camera) {
  return new THREE.DeviceOrientationControls(camera);
}

function createRenderer() {
  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true
  });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}

function render(scene, camera, renderer) {
  return function() {
	  renderer.render(scene, camera);
  };
}

function onWindowResize(camera, renderer, callback) {
  return function() {
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize(window.innerWidth, window.innerHeight);
    callback();
  };
}

function createScene() {
  var container = document.querySelector('.render');
  var camera = createCamera();
  var renderer = createRenderer();
  var scene = new THREE.Scene();
  var update = render(scene, camera, renderer);
  var controls = window.innerWidth > 1024 ?
        addControls(scene, camera, update) :
        addDeviceControls(camera);

  addLights(scene);
  container.appendChild(renderer.domElement);
  return {
    camera: camera,
    controls: controls,
    renderer: renderer,
    update: update,
    scene: scene
  };
}

module.exports.init = function init() {
  var scene = createScene();
  animate(scene.controls);
  scene.update();
  window.addEventListener('resize', onWindowResize(
    scene.camera,
    scene.renderer,
    scene.update
  ));
  return scene;
};

function animate(controls) {
  return function() {
    requestAnimationFrame(animate(controls));
    controls.update();
  };
}

},{}],17:[function(require,module,exports){
var createScene = require('./scene').init;
var colours = require('./colours');
var finishes = require('./finishes');
var scroll = require('./sidebar');
var preview = require('./preview');
var mail = require('./mail');

document.addEventListener('DOMContentLoaded', function() {
  var scene = createScene();
  colours.init(scene.scene, scene.update);
  finishes.init(scene.scene, scene.update);
  scroll.init();
  preview.init(scene);
  mail.init(scene);
});

},{"./colours":2,"./finishes":3,"./mail":11,"./preview":15,"./scene":16,"./sidebar":18}],18:[function(require,module,exports){
var slice = require('./lib/liberate')([].slice);
var eventListeners = require('./lib/eventlisteners');
var scrollTo = require('./lib/scrollto');

function onScroll() {
  var scroll = document.querySelector('body').scrollTop;
  var winHeight = window.innerHeight;
  if (scroll >= winHeight) doFix();
}

function doFix() {
  var body = document.querySelector('body');
  var intro = document.querySelector('.section--intro');
  body.classList.add('fix-page');
  intro.classList.remove('js-not-scrolled');
  body.scrollTop -= window.innerHeight;
  document.removeEventListener('scroll', onScroll);
}

function clickNav(e) {
  var href = this.getAttribute('href');
  var isFixed = document.querySelector('body').classList.contains('fix-page');
  var to = document.querySelector(href).offsetTop;
  scrollTo(to, function() {}, 600, 'easeInOutQuad');
  document.dispatchEvent(new Event('scroll'));
  e.preventDefault();
}

function scrollIntro() {
  var to = document.querySelector('#paintings').offsetTop;
  scrollTo(to, function () {}, 600, 'easeInOutQuad');
}

function toggleSidebar(e) {
  this.parentElement.classList.toggle('toggled');
  e.preventDefault();
}

module.exports.init = function() {
  var navs = slice(document.querySelectorAll('.sidebar--left a'));
  var toggles = slice(document.querySelectorAll('a.js-to-toggle'));
  document.addEventListener('scroll', onScroll);
  navs.forEach(eventListeners.add('click', clickNav));
  toggles.forEach(eventListeners.add('click', toggleSidebar));
  document.querySelector('.section--intro.js-not-scrolled').addEventListener('click', scrollIntro);
};

},{"./lib/eventlisteners":7,"./lib/liberate":8,"./lib/scrollto":9}],19:[function(require,module,exports){
function saveTearSheet(renderer, camera, controls) {
  return function() {
    var jpg;
    var prevPosition = [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ];
    camera.position.fromArray([0, 0, 40]);
    controls.update();
    jpg = renderer.domElement.toDataURL();
    camera.position.fromArray(prevPosition);
    controls.update();
    return jpg;
  };
}

module.exports.getJpg = saveTearSheet;

},{}]},{},[17])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZWFzaW5nLmpzIiwic3JjL2pzL2xpYi9ldmVudGxpc3RlbmVycy5qcyIsInNyYy9qcy9saWIvbGliZXJhdGUuanMiLCJzcmMvanMvbGliL3Njcm9sbHRvLmpzIiwic3JjL2pzL2xvYWQuanMiLCJzcmMvanMvbWFpbC5qcyIsInNyYy9qcy9tYXRlcmlhbHMuanMiLCJzcmMvanMvbWVzaC5qcyIsInNyYy9qcy9wYWludGluZ3MuanMiLCJzcmMvanMvcHJldmlldy5qcyIsInNyYy9qcy9zY2VuZS5qcyIsInNyYy9qcy9zY3JpcHQuanMiLCJzcmMvanMvc2lkZWJhci5qcyIsInNyYy9qcy90ZWFyc2hlZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN0b3JhZ2UgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuXG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBzdG9yYWdlW2lkXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgZ2VvKSB7XG4gIHN0b3JhZ2VbaWRdID0gZ2VvO1xufTtcbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJyk7XG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGVsZW1lbnQpIHtcbiAgdmFyIGNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJyk7XG4gIHZhciBjb2xvdXJOYW1lID0gZWxlbWVudC5kYXRhc2V0Lm5hbWU7XG4gIGNvbG91ci50ZXh0Q29udGVudCA9IGNvbG91ck5hbWU7XG59XG5cbnZhciBnZXRDb2xvdXIgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIC8vIHZhciBjbGFzc2VzID0gc2xpY2UoZWxlbWVudC5jbGFzc0xpc3QpXG4gIC8vIHJldHVybiAnIycgKyBjbGFzc2VzLnJlZHVjZShmdW5jdGlvbiAoY29sb3VyLCBjbGFzc05hbWUpIHtcbiAgLy8gICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2NvbG91ci0tJykgIT09IC0xKVxuICAvLyAgICAgY29sb3VyID0gY2xhc3NOYW1lLnNwbGl0KCdjb2xvdXItLScpWzFdXG4gIC8vICAgcmV0dXJuIGNvbG91clxuICAvLyB9LCAnJylcbiAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldC5jb2xvdXI7XG59O1xuXG5mdW5jdGlvbiBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybjtcbiAgICB2YXIgY29sb3VyID0gZ2V0Q29sb3VyKHRoaXMpO1xuICAgIHZhciBncmFkaWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmFkaWVudC5jb2xvdXItLScgKyBjb2xvdXIuc3Vic3RyaW5nKDEpKTtcbiAgICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWZpbmlzaGVzIC5idXR0b24uaXMtYWN0aXZlJyk7XG4gICAgYWN0aXZhdGUodGhpcyk7XG4gICAgYWN0aXZhdGUoZ3JhZGllbnQpO1xuICAgIHNldFRleHRDb250ZW50KHRoaXMpO1xuICAgIGlmIChmaW5pc2gpXG4gICAgICBtZXNoLnNldENvbG91cihzY2VuZSwgY29sb3VyLCBwYWludGluZ3NbZmluaXNoLmRhdGFzZXQuaWRdKTtcbiAgICB1cGRhdGUoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGNvbG91ckJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tY29sb3VycyBsaScpKTtcbiAgY29sb3VyQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkpKTtcbiAgY29sb3VyQnV0dG9uc1tjb2xvdXJCdXR0b25zLmxlbmd0aCAtIDFdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG52YXIgbG9hZCA9IHJlcXVpcmUoJy4vbG9hZCcpO1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG52YXIgbG9hZGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChwYWludGluZykge1xuICB2YXIgaW5mb3JtYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1pbmZvcm1hdGlvbicpO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKTtcbiAgaW5mb3JtYXRpb24udGV4dENvbnRlbnQgPSBwYWludGluZy5pbmZvcm1hdGlvbjtcbiAgZmluaXNoLnRleHRDb250ZW50ID0gJ0ZpbmlzaCAnICsgKHBhaW50aW5nLmlkICsgMSk7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHBhaW50aW5nID0gcGFpbnRpbmdzW3RoaXMuZGF0YXNldC5pZF07XG4gICAgaWYgKGxvYWRpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gZmFsc2U7XG4gICAgbG9hZGluZyA9IGxvYWQuc3RhcnQoKTtcbiAgICBtZXNoLnJlbW92ZShzY2VuZSwgdXBkYXRlKTtcbiAgICBzZXRUZXh0Q29udGVudChwYWludGluZyk7XG4gICAgbG9hZC5wYWludGluZyhwYWludGluZywgZ290R2VvKHNjZW5lLCB1cGRhdGUpKTtcbiAgICByZXR1cm4gYWN0aXZhdGUodGhpcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGFpbnRpbmcsIGdlbykge1xuICAgIHZhciBhY3RpdmVDb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tY29sb3VycyBsaS5pcy1hY3RpdmUnKTtcbiAgICB2YXIgY29sb3VyID0gY29sb3Vycy5nZXQoYWN0aXZlQ29sb3VyKTtcbiAgICB2YXIgem1lc2ggPSBtZXNoLm5ldyhnZW8sIGNvbG91ciwgcGFpbnRpbmcpO1xuICAgIHNjZW5lLmFkZCh6bWVzaCk7XG4gICAgbG9hZGluZyA9IGxvYWQuZW5kKCk7XG4gICAgdXBkYXRlKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBmaW5pc2hCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpO1xuICBmaW5pc2hCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSkpO1xuICBmaW5pc2hCdXR0b25zWzBdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vY2xhc3NsaXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICBzbGljZShlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcykuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSk7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICB0IC89IGQvMjtcbiAgaWYgKHQgPCAxKSB7XG4gICAgcmV0dXJuIGMvMip0KnQgKyBiO1xuICB9XG4gIHQtLTtcbiAgcmV0dXJuIC1jLzIgKiAodCoodC0yKSAtIDEpICsgYjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbkN1YmljID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdGMgPSAodC89ZCkqdCp0O1xuICByZXR1cm4gYitjKih0Yyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRzID0gKHQvPWQpKnQ7XG4gIHZhciB0YyA9IHRzKnQ7XG4gIHJldHVybiBiK2MqKDYqdGMqdHMgKyAtMTUqdHMqdHMgKyAxMCp0Yyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLmJpbmQuYmluZChGdW5jdGlvbi5jYWxsKTtcbiIsInZhciBlYXNpbmcgPSByZXF1aXJlKCcuL2Vhc2luZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRvLCBjYWxsYmFjaywgZHVyYXRpb24sIGVhc2luZ05hbWUpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5O1xuICB2YXIgc3RhcnQgPSBkb2Muc2Nyb2xsVG9wO1xuICB2YXIgY2hhbmdlID0gdG8gLSBzdGFydDtcbiAgdmFyIGN1cnJlbnRUaW1lID0gMDtcbiAgdmFyIGluY3JlbWVudCA9IDIwO1xuXG4gIHZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudFRpbWUgKz0gaW5jcmVtZW50O1xuICAgIHZhciB2YWwgPSBlYXNpbmdbZWFzaW5nTmFtZV0oY3VycmVudFRpbWUsIHN0YXJ0LCBjaGFuZ2UsIGR1cmF0aW9uKTtcbiAgICBkb2Muc2Nyb2xsVG9wID0gdmFsO1xuICAgIGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTY3JvbGwpO1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9O1xuICBhbmltYXRlU2Nyb2xsKCk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpO1xudmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cbmZ1bmN0aW9uIG9uUHJvZ3Jlc3MgKHhocikge1xuICB2YXIgcGVyY2VudENvbXBsZXRlID0geGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMDtcbiAgdmFyIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmctcHJvZ3Jlc3MnKTtcbiAgcHJvZ3Jlc3NCYXIucGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50Q29tcGxldGUgKyAnJSc7XG59XG5cbmZ1bmN0aW9uIGhpZGVCYXIoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaGVzQnV0dG9ucygpIHtcbiAgcmV0dXJuIHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QuYWRkKCdpcy1sb2FkaW5nJykpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWxvYWRpbmcnKSk7XG4gIGhpZGVCYXIoKTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMucGFpbnRpbmcgPSBmdW5jdGlvbiAocGFpbnRpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBjYWNoZWRHZW8gPSBjYWNoZS5mcm9tKHBhaW50aW5nLmlkKTtcbiAgaWYgKGNhY2hlZEdlbykgcmV0dXJuIGNhbGxiYWNrKHBhaW50aW5nLCBjYWNoZWRHZW8pO1xuICBsb2FkZXIubG9hZChwYWludGluZy51cmwsIGZ1bmN0aW9uKGdlbykge1xuICAgIGdlby5tZXJnZVZlcnRpY2VzKCk7XG4gICAgZ2VvLmNlbnRlcigpO1xuICAgIGNhY2hlLnVwZGF0ZShwYWludGluZy5pZCwgZ2VvKTtcbiAgICBjYWxsYmFjayhwYWludGluZywgZ2VvKTtcbiAgfSwgb25Qcm9ncmVzcyk7XG59O1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG5cbmZ1bmN0aW9uIG1haWwoc2NlbmUpIHtcbiAgdmFyIGdldEltYWdlID0gdGVhcnNoZWV0LmdldEpwZyhzY2VuZS5yZW5kZXJlciwgc2NlbmUuY2FtZXJhLCBzY2VuZS5jb250cm9scyk7XG4gIHZhciBocmVmID0gJ21haWx0bzppbmZvQGJyZW5kYW5zbWl0aHN0dWRpby5jb20/c3ViamVjdD1QYWludGluZ0lEJztcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgaW1hZ2UgPSBnZXRJbWFnZSgpO1xuICAgIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpLnRleHRDb250ZW50O1xuICAgIHZhciBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKS50ZXh0Q29udGVudDtcbiAgICB0aGlzLmhyZWYgPSBocmVmICsgJyZib2R5PScgK1xuICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KGZpbmlzaCkgKyAnJTIwJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1tYWlsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBtYWlsKHNjZW5lKSk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnL2ltZy90ZXh0dXJlcy93b29kLmpwZWcnKTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIHJldHVybiBbXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pLFxuICAgIG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKGNvbG91ciksXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSlcbiAgXTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIG1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0ZXJpYWxzJyk7XG5cbmZ1bmN0aW9uIGdldE1lc2goc2NlbmUpIHtcbiAgcmV0dXJuIHNjZW5lLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQgaW5zdGFuY2VvZiBUSFJFRS5NZXNoO1xuICB9KVswXTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Q29sb3VyID0gZnVuY3Rpb24oc2NlbmUsIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgaWYgKCFtZXNoKSByZXR1cm47XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIG1lc2gubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMubmV3ID0gZnVuY3Rpb24oZ2VvLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIHZhciB6bWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KSk7XG4gIHptZXNoLnJvdGF0aW9uLmZyb21BcnJheShwYWludGluZy5yb3RhdGlvbik7XG4gIHptZXNoLnNjYWxlLmZyb21BcnJheShwYWludGluZy5zY2FsZSk7XG4gIHJldHVybiB6bWVzaDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgc2NlbmUucmVtb3ZlKG1lc2gpO1xuICB1cGRhdGUoKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFt7XG4gIGlkOiAwLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTEuanMnLFxuICByb3RhdGlvbjogWzAuMSwgLTEuMTUsIDAuMDJdLFxuICBzY2FsZTogWzEsIDEsIDFdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMSxcbiAgdXJsOiAnL29iai9wYWludGluZy0yLmpzJyxcbiAgcm90YXRpb246IFstMS4xNSwgMi42NSwgLTAuMTVdLFxuICBzY2FsZTogWzEuMiwgMS4yLCAxLjJdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnQXZhaWxhYmxlIHNpemVzOiA0OCDDlyA0MCDDlyA0IGluLiBvciA3MiDDlyA2MCDDlyA0IGluLiB3aXRoIG9uZSBvZiBmb3VyIGZpbmlzaGVzLiBGaW5pc2ggYXZhaWxhYmxlIGluIG9uZSBvZiB0d28gZ3JleXMuJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZy00LmpzJyxcbiAgcm90YXRpb246IFswLjg1LCAwLjEyLCAxLjQ1XSxcbiAgc2NhbGU6IFsxLjE1LCAxLjE1LCAxLjE1XSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDMsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNS5qcycsXG4gIHJvdGF0aW9uOiBbMC44MiwgMC4xNSwgMS40MV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn1dO1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG5cbmZ1bmN0aW9uIHNob3dQcmV2aWV3KHNjZW5lKSB7XG4gIHZhciBnZXRKcGcgPSB0ZWFyc2hlZXQuZ2V0SnBnKHNjZW5lLnJlbmRlcmVyLCBzY2VuZS5jYW1lcmEsIHNjZW5lLmNvbnRyb2xzKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIHZhciBwYWludGluZyA9IGludHJvLmNoaWxkcmVuWzBdO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpwZyA9IGdldEpwZygpO1xuICAgIHBhaW50aW5nLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoXCInICsganBnICsgJ1wiKSc7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnc2hvdy0tcHJldmlldycpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoaWRlUHJldmlldygpIHtcbiAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93LS1wcmV2aWV3Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2hvdy1wcmV2aWV3JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UHJldmlldyhzY2VuZSkpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVQcmV2aWV3KTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDYW1lcmEoKSB7XG4gIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCByYXRpbywgMSwgMjAwMCk7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDQwO1xuICByZXR1cm4gY2FtZXJhO1xufVxuXG5mdW5jdGlvbiBhZGRMaWdodHMoc2NlbmUpIHtcbiAgdmFyIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZlOCk7XG5cdGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDEpO1xuXHRzY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDJDMkMzRCkpO1xuXHRzY2VuZS5hZGQoZGlyZWN0aW9uYWxMaWdodCk7XG59XG5cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIGNhbGxiYWNrKSB7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSk7XG5cdGNvbnRyb2xzLmRhbXBpbmcgPSAwLjI7XG4gIGNvbnRyb2xzLm5vS2V5cyA9IHRydWU7XG4gIGNvbnRyb2xzLm5vWm9vbSA9IHRydWU7XG4gIGNvbnRyb2xzLm5vUGFuID0gdHJ1ZTtcbiAgY29udHJvbHMubm9Sb3RhdGVVcCA9IGZhbHNlO1xuICBjb250cm9scy5taW5BemltdXRoQW5nbGUgPSAtTWF0aC5QSS81O1xuXHRjb250cm9scy5tYXhBemltdXRoQW5nbGUgPSBNYXRoLlBJLzEuNTtcbiAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spO1xuICByZXR1cm4gY29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSkge1xuICByZXR1cm4gbmV3IFRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHMoY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICBhbHBoYTogdHJ1ZSxcbiAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWVcbiAgfSk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZShjYW1lcmEsIHJlbmRlcmVyLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHQgIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBjYWxsYmFjaygpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKTtcbiAgdmFyIGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpO1xuICB2YXIgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgdmFyIHVwZGF0ZSA9IHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XG4gIHZhciBjb250cm9scyA9IHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCA/XG4gICAgICAgIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIHVwZGF0ZSkgOlxuICAgICAgICBhZGREZXZpY2VDb250cm9scyhjYW1lcmEpO1xuXG4gIGFkZExpZ2h0cyhzY2VuZSk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbiAgYW5pbWF0ZShzY2VuZS5jb250cm9scyk7XG4gIHNjZW5lLnVwZGF0ZSgpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKTtcbiAgcmV0dXJuIHNjZW5lO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgfTtcbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0O1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKTtcbnZhciBzY3JvbGwgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbnZhciBwcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG52YXIgbWFpbCA9IHJlcXVpcmUoJy4vbWFpbCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gIGNvbG91cnMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKTtcbiAgZmluaXNoZXMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKTtcbiAgc2Nyb2xsLmluaXQoKTtcbiAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgbWFpbC5pbml0KHNjZW5lKTtcbn0pO1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKTtcblxuZnVuY3Rpb24gb25TY3JvbGwoKSB7XG4gIHZhciBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuICB2YXIgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBpZiAoc2Nyb2xsID49IHdpbkhlaWdodCkgZG9GaXgoKTtcbn1cblxuZnVuY3Rpb24gZG9GaXgoKSB7XG4gIHZhciBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICB2YXIgaW50cm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKTtcbiAgYm9keS5jbGFzc0xpc3QuYWRkKCdmaXgtcGFnZScpO1xuICBpbnRyby5jbGFzc0xpc3QucmVtb3ZlKCdqcy1ub3Qtc2Nyb2xsZWQnKTtcbiAgYm9keS5zY3JvbGxUb3AgLT0gd2luZG93LmlubmVySGVpZ2h0O1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCk7XG59XG5cbmZ1bmN0aW9uIGNsaWNrTmF2KGUpIHtcbiAgdmFyIGhyZWYgPSB0aGlzLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICB2YXIgaXNGaXhlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpeC1wYWdlJyk7XG4gIHZhciB0byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaHJlZikub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24oKSB7fSwgNjAwLCAnZWFzZUluT3V0UXVhZCcpO1xuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc2Nyb2xsJykpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIHNjcm9sbEludHJvKCkge1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFpbnRpbmdzJykub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24gKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lkZWJhcihlKSB7XG4gIHRoaXMucGFyZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd0b2dnbGVkJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmF2cyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyLS1sZWZ0IGEnKSk7XG4gIHZhciB0b2dnbGVzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS5qcy10by10b2dnbGUnKSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgbmF2cy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjbGlja05hdikpO1xuICB0b2dnbGVzLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIHRvZ2dsZVNpZGViYXIpKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvLmpzLW5vdC1zY3JvbGxlZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2Nyb2xsSW50cm8pO1xufTtcbiIsImZ1bmN0aW9uIHNhdmVUZWFyU2hlZXQocmVuZGVyZXIsIGNhbWVyYSwgY29udHJvbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBqcGc7XG4gICAgdmFyIHByZXZQb3NpdGlvbiA9IFtcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi54LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnksXG4gICAgICBjYW1lcmEucG9zaXRpb24uelxuICAgIF07XG4gICAgY2FtZXJhLnBvc2l0aW9uLmZyb21BcnJheShbMCwgMCwgNDBdKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgICBqcGcgPSByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkocHJldlBvc2l0aW9uKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgICByZXR1cm4ganBnO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRKcGcgPSBzYXZlVGVhclNoZWV0O1xuIl19
