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
var classList = require('./lib/classlist');
var mesh = require('./mesh');
var paintings = require('./paintings');

function setTextContent(element) {
  var colour = document.querySelector('.box-colour');
  var colourName = element.dataset.name;
  colour.textContent = colourName.toUpperCase();
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

function swapHeader() {
  var top = slice(document.querySelector('.underlay .underlay-top').children);
  var index = top.reduce(function (i, li, j) {
    if (li.classList.contains('is-active')) return j;
    return i;
  }, -1) + 1;
  if (index > top.length - 1) index = 0;
  top.forEach(classList.remove('is-active'));
  top[index].classList.add('is-active');
}

function changeColour(scene, update) {
  return function(e) {
    if (this.classList.contains('is-active')) return;
    var colour = getColour(this);
    var gradient = document.querySelector('.gradient.colour--' + colour.substring(1));
    var finish = document.querySelector('.buttons--finishes .button.is-active');
    activate(this);
    activate(gradient);
    swapHeader();
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

},{"./lib/activate":4,"./lib/classlist":5,"./lib/eventlisteners":8,"./lib/liberate":9,"./mesh":14,"./paintings":15}],3:[function(require,module,exports){
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

},{"./colours":2,"./lib/activate":4,"./lib/eventlisteners":8,"./lib/liberate":9,"./load":11,"./mesh":14,"./paintings":15}],4:[function(require,module,exports){
var slice = require('./liberate')([].slice);
var classlist = require('./classlist');

module.exports = function(element) {
  slice(element.parentNode.childNodes).forEach(classlist.remove('is-active'));
  element.classList.add('is-active');
};

},{"./classlist":5,"./liberate":9}],5:[function(require,module,exports){
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
module.exports = function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this;
    var args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		window.clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = Function.bind.bind(Function.call);

},{}],10:[function(require,module,exports){
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

},{"./easing":7}],11:[function(require,module,exports){
/*global THREE */
var slice = require('./lib/liberate')([].slice);
var classlist = require('./lib/classlist');
var cache = require('./cache');
//var loader = new THREE.JSONLoader()
var binLoader = new THREE.BinaryLoader();

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
  binLoader.load(painting.url, function(geo) {
    geo.mergeVertices();
    geo.center();
    cache.update(painting.id, geo);
    callback(painting, geo);
  }, '', '/obj/', onProgress);
};

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":9}],12:[function(require,module,exports){
var tearsheet = require('./tearsheet');

function mail(e) {
  var href = 'mailto:info@brendansmithstudio.com?subject=PaintingID&body=';
  var finish = document.querySelector('.box-finish').textContent;
  var name = document.querySelector('.box-colour').textContent.toUpperCase();
  var fullDetails = encodeURIComponent(finish) + '%20' + encodeURIComponent(name);
  var body = encodeURIComponent('I am interested in acquiring a custom 48 x 40 XXXXXX painting. I look forward to hearing from PaintingID in the next 24 hours. My full contact details are included below:\n\nPhone:\nEmail:');
  body = body.split('XXXXXX').join(fullDetails);
  this.href = href + body;
}

module.exports.init = function() {
  document.querySelector('.js-mail').addEventListener('click', mail);
};

},{"./tearsheet":20}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
  window.zmesh = zmesh;
  zmesh.rotation.fromArray(painting.rotation);
  zmesh.scale.fromArray(painting.scale);
  return zmesh;
};

module.exports.remove = function(scene, update) {
  var mesh = getMesh(scene);
  scene.remove(mesh);
  update();
};

},{"./materials":13}],15:[function(require,module,exports){
module.exports = [{
  id: 0,
  url: '/obj/painting1.js',
  rotation: [0.1, -0.9, 0.0],
  scale: [1, 1, 1],
  reversedMesh: true,
  cache: false,
  information: ''
}, {
  id: 1,
  url: '/obj/painting_circles.js',
  rotation: [-0.8, -0.12, -1.69],
  scale: [1.1, 1.1, 1.1],
  reversedMesh: false,
  cache: false,
  information: ''
}, {
  id: 2,
  url: '/obj/painting_freeform.js',
  rotation: [-0.18, 0.8, -3.14],
  scale: [1.2, 1.2, 1.2],
  reversedMesh: true,
  cache: false,
  information: ''
}, {
  id: 3,
  url: '/obj/painting4.js',
  rotation: [0.85, 0.12, 1.45],
  scale: [1.3, 1.3, 1.3],
  reversedMesh: true,
  cache: false,
  information: ''
}];

},{}],16:[function(require,module,exports){
var tearsheet = require('./tearsheet');
var doFix = require('./sidebar').doFix;

function showPreview(scene) {
  var getJpg = tearsheet.getJpg(scene.renderer, scene.camera, scene.controls);
  var intro = document.querySelector('.section--intro');
  var painting = intro.children[0];
  return function() {
    doFix();
    document.querySelector('.sidebar--right').classList.remove('is-active');
    document.querySelector('a.mobile-sidebar-trigger').textContent = "<";
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

},{"./sidebar":19,"./tearsheet":20}],17:[function(require,module,exports){
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

function addControls(scene, camera, update) {
  var canvas = document.querySelector('.render');
  var controls = new THREE.OrbitControls(camera, canvas);
	controls.damping = 0.2;
  controls.noKeys = true;
  controls.noZoom = true;
  controls.noPan = true;
  controls.noRotateUp = false;
  controls.minPolarAngle = Math.PI/3;
	controls.maxPolarAngle = Math.PI/1.5;
  controls.minAzimuthAngle = -Math.PI/5;
	controls.maxAzimuthAngle = Math.PI/5;
  controls.addEventListener('change', update);
  return controls;
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
  var controls = addControls(scene, camera, update);
  window.update = update;

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

},{}],18:[function(require,module,exports){
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
  preview.init(scene);
  scroll.init();
  mail.init();
});

},{"./colours":2,"./finishes":3,"./mail":12,"./preview":16,"./scene":17,"./sidebar":19}],19:[function(require,module,exports){
var slice = require('./lib/liberate')([].slice);
var eventListeners = require('./lib/eventlisteners');
var classList = require('./lib/classlist');
var scrollTo = require('./lib/scrollto');
var debounce = require('./lib/debounce');

function onScroll() {
  var scroll = document.querySelector('body').scrollTop;
  var winHeight = window.innerHeight;
  if (scroll >= winHeight) doFix();
}

function doUnderlay() {
  var bottomSS = document.querySelector('.underlay .bottom--ss li');
  var bottomAbout = document.querySelector('.underlay .bottom--about li');
  var scroll = document.querySelector('body').scrollTop;
  var aboutPos = document.querySelector('.section--about').offsetTop;
  if (aboutPos !== 0 && aboutPos <= scroll) {
    bottomSS.classList.remove('is-active');
    bottomAbout.classList.add('is-active');
  } else {
    bottomAbout.classList.remove('is-active');
    bottomSS.classList.add('is-active');
  }
}

function doFix() {
  var body = document.querySelector('body');
  var intro = document.querySelector('.section--intro');
  body.classList.add('fix-page');
  intro.classList.remove('js-not-scrolled');
  body.scrollTop -= window.innerHeight;
  document.removeEventListener('scroll', onScroll);
  window.setTimeout(function() {
    showAbout();
    intro.classList.add('animate--top');
  }, 400);
}

function showAbout() {
  document.querySelector('.section--about').classList.remove('hide-about');
}

function clickNav(e) {
  showAbout();
  var href = this.getAttribute('href');
  var isFixed = document.querySelector('body').classList.contains('fix-page');
  if (!isFixed) doFix();
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

function loadIntro() {
  var intro = document.querySelector('.section--intro');
  var img = new window.Image();
  img.src = intro.dataset.bg;
  img.onload = function() {
    intro.classList.add('show--intro');
  };
}

function setUpMobile() {
  var body = document.querySelector('body');
  var toggles = slice(document.querySelectorAll('.toggle-me'));
  var sidebar = document.querySelector('.sidebar--right');
  if (window.innerWidth < 768) {
    body.appendChild(sidebar);
    toggles.forEach(classList.add('toggled'));
  } else {
    document.querySelector('#painting').appendChild(sidebar);
  }
}

function showHideSidebar(e) {
  var text = this.textContent;
  this.textContent = text === '<' ? '>' : '<';
  document.querySelector('.sidebar--right').classList.toggle('is-active');
  e.preventDefault();
}

module.exports.doFix = doFix;

module.exports.init = function() {
  var navs = slice(document.querySelectorAll('.sidebar--left a'));
  var toggles = slice(document.querySelectorAll('a.js-to-toggle'));
  document.addEventListener('scroll', onScroll);
  document.addEventListener('scroll', doUnderlay);
  doUnderlay();
  loadIntro();
  window.addEventListener('resize', setUpMobile);
  setUpMobile();
  document.querySelector('a.mobile-sidebar-trigger').addEventListener('click', showHideSidebar);
  navs.forEach(eventListeners.add('click', clickNav));
  toggles.forEach(eventListeners.add('click', toggleSidebar));
  document.querySelector('.section--intro.js-not-scrolled').addEventListener('click', scrollIntro);
};

},{"./lib/classlist":5,"./lib/debounce":6,"./lib/eventlisteners":8,"./lib/liberate":9,"./lib/scrollto":10}],20:[function(require,module,exports){
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

},{}]},{},[18])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBzdG9yYWdlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTtcblxubW9kdWxlLmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gc3RvcmFnZVtpZF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGUgPSBmdW5jdGlvbiAoaWQsIGdlbykge1xuICBzdG9yYWdlW2lkXSA9IGdlbztcbn07XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpO1xudmFyIGNsYXNzTGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpO1xuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChlbGVtZW50KSB7XG4gIHZhciBjb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpO1xuICB2YXIgY29sb3VyTmFtZSA9IGVsZW1lbnQuZGF0YXNldC5uYW1lO1xuICBjb2xvdXIudGV4dENvbnRlbnQgPSBjb2xvdXJOYW1lLnRvVXBwZXJDYXNlKCk7XG59XG5cbnZhciBnZXRDb2xvdXIgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIC8vIHZhciBjbGFzc2VzID0gc2xpY2UoZWxlbWVudC5jbGFzc0xpc3QpXG4gIC8vIHJldHVybiAnIycgKyBjbGFzc2VzLnJlZHVjZShmdW5jdGlvbiAoY29sb3VyLCBjbGFzc05hbWUpIHtcbiAgLy8gICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2NvbG91ci0tJykgIT09IC0xKVxuICAvLyAgICAgY29sb3VyID0gY2xhc3NOYW1lLnNwbGl0KCdjb2xvdXItLScpWzFdXG4gIC8vICAgcmV0dXJuIGNvbG91clxuICAvLyB9LCAnJylcbiAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldC5jb2xvdXI7XG59O1xuXG5mdW5jdGlvbiBzd2FwSGVhZGVyKCkge1xuICB2YXIgdG9wID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVuZGVybGF5IC51bmRlcmxheS10b3AnKS5jaGlsZHJlbik7XG4gIHZhciBpbmRleCA9IHRvcC5yZWR1Y2UoZnVuY3Rpb24gKGksIGxpLCBqKSB7XG4gICAgaWYgKGxpLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybiBqO1xuICAgIHJldHVybiBpO1xuICB9LCAtMSkgKyAxO1xuICBpZiAoaW5kZXggPiB0b3AubGVuZ3RoIC0gMSkgaW5kZXggPSAwO1xuICB0b3AuZm9yRWFjaChjbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSk7XG4gIHRvcFtpbmRleF0uY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuO1xuICAgIHZhciBjb2xvdXIgPSBnZXRDb2xvdXIodGhpcyk7XG4gICAgdmFyIGdyYWRpZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyYWRpZW50LmNvbG91ci0tJyArIGNvbG91ci5zdWJzdHJpbmcoMSkpO1xuICAgIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tZmluaXNoZXMgLmJ1dHRvbi5pcy1hY3RpdmUnKTtcbiAgICBhY3RpdmF0ZSh0aGlzKTtcbiAgICBhY3RpdmF0ZShncmFkaWVudCk7XG4gICAgc3dhcEhlYWRlcigpO1xuICAgIHNldFRleHRDb250ZW50KHRoaXMpO1xuICAgIGlmIChmaW5pc2gpXG4gICAgICBtZXNoLnNldENvbG91cihzY2VuZSwgY29sb3VyLCBwYWludGluZ3NbZmluaXNoLmRhdGFzZXQuaWRdKTtcbiAgICB1cGRhdGUoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGNvbG91ckJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tY29sb3VycyBsaScpKTtcbiAgY29sb3VyQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkpKTtcbiAgY29sb3VyQnV0dG9uc1tjb2xvdXJCdXR0b25zLmxlbmd0aCAtIDFdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG52YXIgbG9hZCA9IHJlcXVpcmUoJy4vbG9hZCcpO1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG52YXIgbG9hZGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChwYWludGluZykge1xuICB2YXIgaW5mb3JtYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1pbmZvcm1hdGlvbicpO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKTtcbiAgaW5mb3JtYXRpb24udGV4dENvbnRlbnQgPSBwYWludGluZy5pbmZvcm1hdGlvbjtcbiAgZmluaXNoLnRleHRDb250ZW50ID0gJ0ZpbmlzaCAnICsgKHBhaW50aW5nLmlkICsgMSk7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHBhaW50aW5nID0gcGFpbnRpbmdzW3RoaXMuZGF0YXNldC5pZF07XG4gICAgaWYgKGxvYWRpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gZmFsc2U7XG4gICAgbG9hZGluZyA9IGxvYWQuc3RhcnQoKTtcbiAgICBtZXNoLnJlbW92ZShzY2VuZSwgdXBkYXRlKTtcbiAgICBzZXRUZXh0Q29udGVudChwYWludGluZyk7XG4gICAgbG9hZC5wYWludGluZyhwYWludGluZywgZ290R2VvKHNjZW5lLCB1cGRhdGUpKTtcbiAgICByZXR1cm4gYWN0aXZhdGUodGhpcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGFpbnRpbmcsIGdlbykge1xuICAgIHZhciBhY3RpdmVDb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tY29sb3VycyBsaS5pcy1hY3RpdmUnKTtcbiAgICB2YXIgY29sb3VyID0gY29sb3Vycy5nZXQoYWN0aXZlQ29sb3VyKTtcbiAgICB2YXIgem1lc2ggPSBtZXNoLm5ldyhnZW8sIGNvbG91ciwgcGFpbnRpbmcpO1xuICAgIHNjZW5lLmFkZCh6bWVzaCk7XG4gICAgbG9hZGluZyA9IGxvYWQuZW5kKCk7XG4gICAgdXBkYXRlKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBmaW5pc2hCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpO1xuICBmaW5pc2hCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSkpO1xuICBmaW5pc2hCdXR0b25zWzBdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vY2xhc3NsaXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICBzbGljZShlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcykuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSk7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG5cdHZhciB0aW1lb3V0O1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHRcdHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0XHR9O1xuXHRcdHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0dGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0fTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcbiAgdCAvPSBkLzI7XG4gIGlmICh0IDwgMSkge1xuICAgIHJldHVybiBjLzIqdCp0ICsgYjtcbiAgfVxuICB0LS07XG4gIHJldHVybiAtYy8yICogKHQqKHQtMikgLSAxKSArIGI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRjID0gKHQvPWQpKnQqdDtcbiAgcmV0dXJuIGIrYyoodGMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0cyA9ICh0Lz1kKSp0O1xuICB2YXIgdGMgPSB0cyp0O1xuICByZXR1cm4gYitjKig2KnRjKnRzICsgLTE1KnRzKnRzICsgMTAqdGMpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYyk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5iaW5kLmJpbmQoRnVuY3Rpb24uY2FsbCk7XG4iLCJ2YXIgZWFzaW5nID0gcmVxdWlyZSgnLi9lYXNpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0bywgY2FsbGJhY2ssIGR1cmF0aW9uLCBlYXNpbmdOYW1lKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogZG9jdW1lbnQuYm9keTtcbiAgdmFyIHN0YXJ0ID0gZG9jLnNjcm9sbFRvcDtcbiAgdmFyIGNoYW5nZSA9IHRvIC0gc3RhcnQ7XG4gIHZhciBjdXJyZW50VGltZSA9IDA7XG4gIHZhciBpbmNyZW1lbnQgPSAyMDtcblxuICB2YXIgYW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRUaW1lICs9IGluY3JlbWVudDtcbiAgICB2YXIgdmFsID0gZWFzaW5nW2Vhc2luZ05hbWVdKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbik7XG4gICAgZG9jLnNjcm9sbFRvcCA9IHZhbDtcbiAgICBpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKTtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfTtcbiAgYW5pbWF0ZVNjcm9sbCgpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBjYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKTtcbi8vdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKClcbnZhciBiaW5Mb2FkZXIgPSBuZXcgVEhSRUUuQmluYXJ5TG9hZGVyKCk7XG5cbmZ1bmN0aW9uIG9uUHJvZ3Jlc3MgKHhocikge1xuICB2YXIgcGVyY2VudENvbXBsZXRlID0geGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMDtcbiAgdmFyIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmctcHJvZ3Jlc3MnKTtcbiAgcHJvZ3Jlc3NCYXIucGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50Q29tcGxldGUgKyAnJSc7XG59XG5cbmZ1bmN0aW9uIGhpZGVCYXIoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaGVzQnV0dG9ucygpIHtcbiAgcmV0dXJuIHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QuYWRkKCdpcy1sb2FkaW5nJykpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWxvYWRpbmcnKSk7XG4gIGhpZGVCYXIoKTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMucGFpbnRpbmcgPSBmdW5jdGlvbiAocGFpbnRpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBjYWNoZWRHZW8gPSBjYWNoZS5mcm9tKHBhaW50aW5nLmlkKTtcbiAgaWYgKGNhY2hlZEdlbykgcmV0dXJuIGNhbGxiYWNrKHBhaW50aW5nLCBjYWNoZWRHZW8pO1xuICBiaW5Mb2FkZXIubG9hZChwYWludGluZy51cmwsIGZ1bmN0aW9uKGdlbykge1xuICAgIGdlby5tZXJnZVZlcnRpY2VzKCk7XG4gICAgZ2VvLmNlbnRlcigpO1xuICAgIGNhY2hlLnVwZGF0ZShwYWludGluZy5pZCwgZ2VvKTtcbiAgICBjYWxsYmFjayhwYWludGluZywgZ2VvKTtcbiAgfSwgJycsICcvb2JqLycsIG9uUHJvZ3Jlc3MpO1xufTtcbiIsInZhciB0ZWFyc2hlZXQgPSByZXF1aXJlKCcuL3RlYXJzaGVldCcpO1xuXG5mdW5jdGlvbiBtYWlsKGUpIHtcbiAgdmFyIGhyZWYgPSAnbWFpbHRvOmluZm9AYnJlbmRhbnNtaXRoc3R1ZGlvLmNvbT9zdWJqZWN0PVBhaW50aW5nSUQmYm9keT0nO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKS50ZXh0Q29udGVudDtcbiAgdmFyIG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpLnRleHRDb250ZW50LnRvVXBwZXJDYXNlKCk7XG4gIHZhciBmdWxsRGV0YWlscyA9IGVuY29kZVVSSUNvbXBvbmVudChmaW5pc2gpICsgJyUyMCcgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSk7XG4gIHZhciBib2R5ID0gZW5jb2RlVVJJQ29tcG9uZW50KCdJIGFtIGludGVyZXN0ZWQgaW4gYWNxdWlyaW5nIGEgY3VzdG9tIDQ4IHggNDAgWFhYWFhYIHBhaW50aW5nLiBJIGxvb2sgZm9yd2FyZCB0byBoZWFyaW5nIGZyb20gUGFpbnRpbmdJRCBpbiB0aGUgbmV4dCAyNCBob3Vycy4gTXkgZnVsbCBjb250YWN0IGRldGFpbHMgYXJlIGluY2x1ZGVkIGJlbG93OlxcblxcblBob25lOlxcbkVtYWlsOicpO1xuICBib2R5ID0gYm9keS5zcGxpdCgnWFhYWFhYJykuam9pbihmdWxsRGV0YWlscyk7XG4gIHRoaXMuaHJlZiA9IGhyZWYgKyBib2R5O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1tYWlsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBtYWlsKTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcvaW1nL3RleHR1cmVzL3dvb2QuanBlZycpO1xuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihjb2xvdXIpIHtcbiAgcmV0dXJuIFtcbiAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleHR1cmUsXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSksXG4gICAgbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoY29sb3VyKSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KVxuICBdO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgbWF0ZXJpYWxzID0gcmVxdWlyZSgnLi9tYXRlcmlhbHMnKTtcblxuZnVuY3Rpb24gZ2V0TWVzaChzY2VuZSkge1xuICByZXR1cm4gc2NlbmUuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZCBpbnN0YW5jZW9mIFRIUkVFLk1lc2g7XG4gIH0pWzBdO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zZXRDb2xvdXIgPSBmdW5jdGlvbihzY2VuZSwgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpO1xuICBpZiAoIW1lc2gpIHJldHVybjtcbiAgdmFyIG1hdCA9IG1hdGVyaWFscy5nZXQoY29sb3VyKTtcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKTtcbiAgbWVzaC5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5uZXcgPSBmdW5jdGlvbihnZW8sIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1hdCA9IG1hdGVyaWFscy5nZXQoY29sb3VyKTtcbiAgaWYgKHBhaW50aW5nLnJldmVyc2VkTWVzaCkgbWF0ID0gbWF0LnJldmVyc2UoKTtcbiAgdmFyIHptZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvLCBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpKTtcbiAgd2luZG93LnptZXNoID0gem1lc2g7XG4gIHptZXNoLnJvdGF0aW9uLmZyb21BcnJheShwYWludGluZy5yb3RhdGlvbik7XG4gIHptZXNoLnNjYWxlLmZyb21BcnJheShwYWludGluZy5zY2FsZSk7XG4gIHJldHVybiB6bWVzaDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgc2NlbmUucmVtb3ZlKG1lc2gpO1xuICB1cGRhdGUoKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFt7XG4gIGlkOiAwLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nMS5qcycsXG4gIHJvdGF0aW9uOiBbMC4xLCAtMC45LCAwLjBdLFxuICBzY2FsZTogWzEsIDEsIDFdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59LCB7XG4gIGlkOiAxLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nX2NpcmNsZXMuanMnLFxuICByb3RhdGlvbjogWy0wLjgsIC0wLjEyLCAtMS42OV0sXG4gIHNjYWxlOiBbMS4xLCAxLjEsIDEuMV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59LCB7XG4gIGlkOiAyLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nX2ZyZWVmb3JtLmpzJyxcbiAgcm90YXRpb246IFstMC4xOCwgMC44LCAtMy4xNF0sXG4gIHNjYWxlOiBbMS4yLCAxLjIsIDEuMl0sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn0sIHtcbiAgaWQ6IDMsXG4gIHVybDogJy9vYmovcGFpbnRpbmc0LmpzJyxcbiAgcm90YXRpb246IFswLjg1LCAwLjEyLCAxLjQ1XSxcbiAgc2NhbGU6IFsxLjMsIDEuMywgMS4zXSxcbiAgcmV2ZXJzZWRNZXNoOiB0cnVlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufV07XG4iLCJ2YXIgdGVhcnNoZWV0ID0gcmVxdWlyZSgnLi90ZWFyc2hlZXQnKTtcbnZhciBkb0ZpeCA9IHJlcXVpcmUoJy4vc2lkZWJhcicpLmRvRml4O1xuXG5mdW5jdGlvbiBzaG93UHJldmlldyhzY2VuZSkge1xuICB2YXIgZ2V0SnBnID0gdGVhcnNoZWV0LmdldEpwZyhzY2VuZS5yZW5kZXJlciwgc2NlbmUuY2FtZXJhLCBzY2VuZS5jb250cm9scyk7XG4gIHZhciBpbnRybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpO1xuICB2YXIgcGFpbnRpbmcgPSBpbnRyby5jaGlsZHJlblswXTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRvRml4KCk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItLXJpZ2h0JykuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYS5tb2JpbGUtc2lkZWJhci10cmlnZ2VyJykudGV4dENvbnRlbnQgPSBcIjxcIjtcbiAgICB2YXIganBnID0gZ2V0SnBnKCk7XG4gICAgcGFpbnRpbmcuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybChcIicgKyBqcGcgKyAnXCIpJztcbiAgICBpbnRyby5jbGFzc0xpc3QuYWRkKCdzaG93LS1wcmV2aWV3Jyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhpZGVQcmV2aWV3KCkge1xuICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctLXByZXZpZXcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaG93LXByZXZpZXcnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dQcmV2aWV3KHNjZW5lKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVByZXZpZXcpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpIHtcbiAgdmFyIHJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIHJhdGlvLCAxLCAyMDAwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueSA9IDA7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDA7XG4gIHJldHVybiBjYW1lcmE7XG59XG5cbmZ1bmN0aW9uIGFkZExpZ2h0cyhzY2VuZSkge1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmU4KTtcblx0ZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoMCwgMSwgMSk7XG5cdHNjZW5lLmFkZChuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MkMyQzNEKSk7XG5cdHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgdXBkYXRlKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuZGVyJyk7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSwgY2FudmFzKTtcblx0Y29udHJvbHMuZGFtcGluZyA9IDAuMjtcbiAgY29udHJvbHMubm9LZXlzID0gdHJ1ZTtcbiAgY29udHJvbHMubm9ab29tID0gdHJ1ZTtcbiAgY29udHJvbHMubm9QYW4gPSB0cnVlO1xuICBjb250cm9scy5ub1JvdGF0ZVVwID0gZmFsc2U7XG4gIGNvbnRyb2xzLm1pblBvbGFyQW5nbGUgPSBNYXRoLlBJLzM7XG5cdGNvbnRyb2xzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJLzEuNTtcbiAgY29udHJvbHMubWluQXppbXV0aEFuZ2xlID0gLU1hdGguUEkvNTtcblx0Y29udHJvbHMubWF4QXppbXV0aEFuZ2xlID0gTWF0aC5QSS81O1xuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB1cGRhdGUpO1xuICByZXR1cm4gY29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgYWxwaGE6IHRydWUsXG4gICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlXG4gIH0pO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcblx0cmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgcmV0dXJuIHJlbmRlcmVyO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25XaW5kb3dSZXNpemUoY2FtZXJhLCByZW5kZXJlciwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIGNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHQgIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgY2FsbGJhY2soKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2NlbmUoKSB7XG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuZGVyJyk7XG4gIHZhciBjYW1lcmEgPSBjcmVhdGVDYW1lcmEoKTtcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKTtcbiAgdmFyIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIHZhciB1cGRhdGUgPSByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpO1xuICB2YXIgY29udHJvbHMgPSBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpO1xuICB3aW5kb3cudXBkYXRlID0gdXBkYXRlO1xuXG4gIGFkZExpZ2h0cyhzY2VuZSk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbiAgYW5pbWF0ZShzY2VuZS5jb250cm9scyk7XG4gIHNjZW5lLnVwZGF0ZSgpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKTtcbiAgcmV0dXJuIHNjZW5lO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgfTtcbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0O1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKTtcbnZhciBzY3JvbGwgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbnZhciBwcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG52YXIgbWFpbCA9IHJlcXVpcmUoJy4vbWFpbCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gIGNvbG91cnMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKTtcbiAgZmluaXNoZXMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKTtcbiAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgc2Nyb2xsLmluaXQoKTtcbiAgbWFpbC5pbml0KCk7XG59KTtcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBjbGFzc0xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBzY3JvbGxUbyA9IHJlcXVpcmUoJy4vbGliL3Njcm9sbHRvJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2xpYi9kZWJvdW5jZScpO1xuXG5mdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciB3aW5IZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGlmIChzY3JvbGwgPj0gd2luSGVpZ2h0KSBkb0ZpeCgpO1xufVxuXG5mdW5jdGlvbiBkb1VuZGVybGF5KCkge1xuICB2YXIgYm90dG9tU1MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tc3MgbGknKTtcbiAgdmFyIGJvdHRvbUFib3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVuZGVybGF5IC5ib3R0b20tLWFib3V0IGxpJyk7XG4gIHZhciBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuICB2YXIgYWJvdXRQb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0tYWJvdXQnKS5vZmZzZXRUb3A7XG4gIGlmIChhYm91dFBvcyAhPT0gMCAmJiBhYm91dFBvcyA8PSBzY3JvbGwpIHtcbiAgICBib3R0b21TUy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICBib3R0b21BYm91dC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfSBlbHNlIHtcbiAgICBib3R0b21BYm91dC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICBib3R0b21TUy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkb0ZpeCgpIHtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gIHZhciBpbnRybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpO1xuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2ZpeC1wYWdlJyk7XG4gIGludHJvLmNsYXNzTGlzdC5yZW1vdmUoJ2pzLW5vdC1zY3JvbGxlZCcpO1xuICBib2R5LnNjcm9sbFRvcCAtPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc2hvd0Fib3V0KCk7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZS0tdG9wJyk7XG4gIH0sIDQwMCk7XG59XG5cbmZ1bmN0aW9uIHNob3dBYm91dCgpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWFib3V0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS1hYm91dCcpO1xufVxuXG5mdW5jdGlvbiBjbGlja05hdihlKSB7XG4gIHNob3dBYm91dCgpO1xuICB2YXIgaHJlZiA9IHRoaXMuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gIHZhciBpc0ZpeGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmNsYXNzTGlzdC5jb250YWlucygnZml4LXBhZ2UnKTtcbiAgaWYgKCFpc0ZpeGVkKSBkb0ZpeCgpO1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGhyZWYpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Njcm9sbCcpKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBzY3JvbGxJbnRybygpIHtcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhaW50aW5ncycpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uICgpIHt9LCA2MDAsICdlYXNlSW5PdXRRdWFkJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNpZGViYXIoZSkge1xuICB0aGlzLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlZCcpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRJbnRybygpIHtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIHZhciBpbWcgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gIGltZy5zcmMgPSBpbnRyby5kYXRhc2V0LmJnO1xuICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnc2hvdy0taW50cm8nKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2V0VXBNb2JpbGUoKSB7XG4gIHZhciBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICB2YXIgdG9nZ2xlcyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUtbWUnKSk7XG4gIHZhciBzaWRlYmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItLXJpZ2h0Jyk7XG4gIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCkge1xuICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2lkZWJhcik7XG4gICAgdG9nZ2xlcy5mb3JFYWNoKGNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWQnKSk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhaW50aW5nJykuYXBwZW5kQ2hpbGQoc2lkZWJhcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0hpZGVTaWRlYmFyKGUpIHtcbiAgdmFyIHRleHQgPSB0aGlzLnRleHRDb250ZW50O1xuICB0aGlzLnRleHRDb250ZW50ID0gdGV4dCA9PT0gJzwnID8gJz4nIDogJzwnO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci0tcmlnaHQnKS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5kb0ZpeCA9IGRvRml4O1xuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuYXZzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXItLWxlZnQgYScpKTtcbiAgdmFyIHRvZ2dsZXMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhLmpzLXRvLXRvZ2dsZScpKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBkb1VuZGVybGF5KTtcbiAgZG9VbmRlcmxheSgpO1xuICBsb2FkSW50cm8oKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNldFVwTW9iaWxlKTtcbiAgc2V0VXBNb2JpbGUoKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYS5tb2JpbGUtc2lkZWJhci10cmlnZ2VyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93SGlkZVNpZGViYXIpO1xuICBuYXZzLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNsaWNrTmF2KSk7XG4gIHRvZ2dsZXMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgdG9nZ2xlU2lkZWJhcikpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8uanMtbm90LXNjcm9sbGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY3JvbGxJbnRybyk7XG59O1xuIiwiZnVuY3Rpb24gc2F2ZVRlYXJTaGVldChyZW5kZXJlciwgY2FtZXJhLCBjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpwZztcbiAgICB2YXIgcHJldlBvc2l0aW9uID0gW1xuICAgICAgY2FtZXJhLnBvc2l0aW9uLngsXG4gICAgICBjYW1lcmEucG9zaXRpb24ueSxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi56XG4gICAgXTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KFswLCAwLCA0MF0pO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIGpwZyA9IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmZyb21BcnJheShwcmV2UG9zaXRpb24pO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIHJldHVybiBqcGc7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldEpwZyA9IHNhdmVUZWFyU2hlZXQ7XG4iXX0=
