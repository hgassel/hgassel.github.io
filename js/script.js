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
  if (window.innerWidth > 1) {
    var scene = createScene();
    colours.init(scene.scene, scene.update);
    finishes.init(scene.scene, scene.update);
    preview.init(scene);
  }
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
  if (window.innerWidth >= 768) return;
  var toggles = slice(document.querySelectorAll('.toggle-me'));
  toggles.forEach(classList.add('toggled'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc3RvcmFnZSA9IFtmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZV07XG5cbm1vZHVsZS5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHN0b3JhZ2VbaWRdO1xufTtcblxubW9kdWxlLmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKGlkLCBnZW8pIHtcbiAgc3RvcmFnZVtpZF0gPSBnZW87XG59O1xuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKTtcbnZhciBjbGFzc0xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKTtcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQoZWxlbWVudCkge1xuICB2YXIgY29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKTtcbiAgdmFyIGNvbG91ck5hbWUgPSBlbGVtZW50LmRhdGFzZXQubmFtZTtcbiAgY29sb3VyLnRleHRDb250ZW50ID0gY29sb3VyTmFtZS50b1VwcGVyQ2FzZSgpO1xufVxuXG52YXIgZ2V0Q29sb3VyID0gbW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAvLyB2YXIgY2xhc3NlcyA9IHNsaWNlKGVsZW1lbnQuY2xhc3NMaXN0KVxuICAvLyByZXR1cm4gJyMnICsgY2xhc3Nlcy5yZWR1Y2UoZnVuY3Rpb24gKGNvbG91ciwgY2xhc3NOYW1lKSB7XG4gIC8vICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdjb2xvdXItLScpICE9PSAtMSlcbiAgLy8gICAgIGNvbG91ciA9IGNsYXNzTmFtZS5zcGxpdCgnY29sb3VyLS0nKVsxXVxuICAvLyAgIHJldHVybiBjb2xvdXJcbiAgLy8gfSwgJycpXG4gIHJldHVybiBlbGVtZW50LmRhdGFzZXQuY29sb3VyO1xufTtcblxuZnVuY3Rpb24gc3dhcEhlYWRlcigpIHtcbiAgdmFyIHRvcCA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51bmRlcmxheSAudW5kZXJsYXktdG9wJykuY2hpbGRyZW4pO1xuICB2YXIgaW5kZXggPSB0b3AucmVkdWNlKGZ1bmN0aW9uIChpLCBsaSwgaikge1xuICAgIGlmIChsaS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gajtcbiAgICByZXR1cm4gaTtcbiAgfSwgLTEpICsgMTtcbiAgaWYgKGluZGV4ID4gdG9wLmxlbmd0aCAtIDEpIGluZGV4ID0gMDtcbiAgdG9wLmZvckVhY2goY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpO1xuICB0b3BbaW5kZXhdLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybjtcbiAgICB2YXIgY29sb3VyID0gZ2V0Q29sb3VyKHRoaXMpO1xuICAgIHZhciBncmFkaWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmFkaWVudC5jb2xvdXItLScgKyBjb2xvdXIuc3Vic3RyaW5nKDEpKTtcbiAgICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWZpbmlzaGVzIC5idXR0b24uaXMtYWN0aXZlJyk7XG4gICAgYWN0aXZhdGUodGhpcyk7XG4gICAgYWN0aXZhdGUoZ3JhZGllbnQpO1xuICAgIHN3YXBIZWFkZXIoKTtcbiAgICBzZXRUZXh0Q29udGVudCh0aGlzKTtcbiAgICBpZiAoZmluaXNoKVxuICAgICAgbWVzaC5zZXRDb2xvdXIoc2NlbmUsIGNvbG91ciwgcGFpbnRpbmdzW2ZpbmlzaC5kYXRhc2V0LmlkXSk7XG4gICAgdXBkYXRlKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBjb2xvdXJCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWNvbG91cnMgbGknKSk7XG4gIGNvbG91ckJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpKSk7XG4gIGNvbG91ckJ1dHRvbnNbY29sb3VyQnV0dG9ucy5sZW5ndGggLSAxXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSk7XG59O1xuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKTtcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpO1xudmFyIGxvYWQgPSByZXF1aXJlKCcuL2xvYWQnKTtcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJyk7XG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xudmFyIGxvYWRpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpIHtcbiAgdmFyIGluZm9ybWF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItaW5mb3JtYXRpb24nKTtcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJyk7XG4gIGluZm9ybWF0aW9uLnRleHRDb250ZW50ID0gcGFpbnRpbmcuaW5mb3JtYXRpb247XG4gIGZpbmlzaC50ZXh0Q29udGVudCA9ICdGaW5pc2ggJyArIChwYWludGluZy5pZCArIDEpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIHZhciBwYWludGluZyA9IHBhaW50aW5nc1t0aGlzLmRhdGFzZXQuaWRdO1xuICAgIGlmIChsb2FkaW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuIGZhbHNlO1xuICAgIGxvYWRpbmcgPSBsb2FkLnN0YXJ0KCk7XG4gICAgbWVzaC5yZW1vdmUoc2NlbmUsIHVwZGF0ZSk7XG4gICAgc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpO1xuICAgIGxvYWQucGFpbnRpbmcocGFpbnRpbmcsIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSk7XG4gICAgcmV0dXJuIGFjdGl2YXRlKHRoaXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBhaW50aW5nLCBnZW8pIHtcbiAgICB2YXIgYWN0aXZlQ29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWNvbG91cnMgbGkuaXMtYWN0aXZlJyk7XG4gICAgdmFyIGNvbG91ciA9IGNvbG91cnMuZ2V0KGFjdGl2ZUNvbG91cik7XG4gICAgdmFyIHptZXNoID0gbWVzaC5uZXcoZ2VvLCBjb2xvdXIsIHBhaW50aW5nKTtcbiAgICBzY2VuZS5hZGQoem1lc2gpO1xuICAgIGxvYWRpbmcgPSBsb2FkLmVuZCgpO1xuICAgIHVwZGF0ZSgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgZmluaXNoQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKTtcbiAgZmluaXNoQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkpKTtcbiAgZmluaXNoQnV0dG9uc1swXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSk7XG59O1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2NsYXNzbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgc2xpY2UoZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpO1xuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnRvZ2dsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShuYW1lKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuXHR2YXIgdGltZW91dDtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcztcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0aWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdFx0fTtcblx0XHR2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcblx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cdFx0aWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG4gIHQgLz0gZC8yO1xuICBpZiAodCA8IDEpIHtcbiAgICByZXR1cm4gYy8yKnQqdCArIGI7XG4gIH1cbiAgdC0tO1xuICByZXR1cm4gLWMvMiAqICh0Kih0LTIpIC0gMSkgKyBiO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZWFzZUluQ3ViaWMgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0YyA9ICh0Lz1kKSp0KnQ7XG4gIHJldHVybiBiK2MqKHRjKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdHMgPSAodC89ZCkqdDtcbiAgdmFyIHRjID0gdHMqdDtcbiAgcmV0dXJuIGIrYyooNip0Yyp0cyArIC0xNSp0cyp0cyArIDEwKnRjKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24uYmluZC5iaW5kKEZ1bmN0aW9uLmNhbGwpO1xuIiwidmFyIGVhc2luZyA9IHJlcXVpcmUoJy4vZWFzaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odG8sIGNhbGxiYWNrLCBkdXJhdGlvbiwgZWFzaW5nTmFtZSkge1xuICB2YXIgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IGRvY3VtZW50LmJvZHk7XG4gIHZhciBzdGFydCA9IGRvYy5zY3JvbGxUb3A7XG4gIHZhciBjaGFuZ2UgPSB0byAtIHN0YXJ0O1xuICB2YXIgY3VycmVudFRpbWUgPSAwO1xuICB2YXIgaW5jcmVtZW50ID0gMjA7XG5cbiAgdmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50VGltZSArPSBpbmNyZW1lbnQ7XG4gICAgdmFyIHZhbCA9IGVhc2luZ1tlYXNpbmdOYW1lXShjdXJyZW50VGltZSwgc3RhcnQsIGNoYW5nZSwgZHVyYXRpb24pO1xuICAgIGRvYy5zY3JvbGxUb3AgPSB2YWw7XG4gICAgaWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVNjcm9sbCk7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH07XG4gIGFuaW1hdGVTY3JvbGwoKTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9saWIvY2xhc3NsaXN0Jyk7XG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJyk7XG4vL3ZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpXG52YXIgYmluTG9hZGVyID0gbmV3IFRIUkVFLkJpbmFyeUxvYWRlcigpO1xuXG5mdW5jdGlvbiBvblByb2dyZXNzICh4aHIpIHtcbiAgdmFyIHBlcmNlbnRDb21wbGV0ZSA9IHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDA7XG4gIHZhciBwcm9ncmVzc0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLXByb2dyZXNzJyk7XG4gIHByb2dyZXNzQmFyLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyY2VudENvbXBsZXRlICsgJyUnO1xufVxuXG5mdW5jdGlvbiBoaWRlQmFyKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xufVxuXG5mdW5jdGlvbiBmaW5pc2hlc0J1dHRvbnMoKSB7XG4gIHJldHVybiBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LmFkZCgnaXMtbG9hZGluZycpKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lbmQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJykpO1xuICBoaWRlQmFyKCk7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnBhaW50aW5nID0gZnVuY3Rpb24gKHBhaW50aW5nLCBjYWxsYmFjaykge1xuICB2YXIgY2FjaGVkR2VvID0gY2FjaGUuZnJvbShwYWludGluZy5pZCk7XG4gIGlmIChjYWNoZWRHZW8pIHJldHVybiBjYWxsYmFjayhwYWludGluZywgY2FjaGVkR2VvKTtcbiAgYmluTG9hZGVyLmxvYWQocGFpbnRpbmcudXJsLCBmdW5jdGlvbihnZW8pIHtcbiAgICBnZW8ubWVyZ2VWZXJ0aWNlcygpO1xuICAgIGdlby5jZW50ZXIoKTtcbiAgICBjYWNoZS51cGRhdGUocGFpbnRpbmcuaWQsIGdlbyk7XG4gICAgY2FsbGJhY2socGFpbnRpbmcsIGdlbyk7XG4gIH0sICcnLCAnL29iai8nLCBvblByb2dyZXNzKTtcbn07XG4iLCJ2YXIgdGVhcnNoZWV0ID0gcmVxdWlyZSgnLi90ZWFyc2hlZXQnKTtcblxuZnVuY3Rpb24gbWFpbChlKSB7XG4gIHZhciBocmVmID0gJ21haWx0bzppbmZvQGJyZW5kYW5zbWl0aHN0dWRpby5jb20/c3ViamVjdD1QYWludGluZ0lEJmJvZHk9JztcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJykudGV4dENvbnRlbnQ7XG4gIHZhciBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKS50ZXh0Q29udGVudC50b1VwcGVyQ2FzZSgpO1xuICB2YXIgZnVsbERldGFpbHMgPSBlbmNvZGVVUklDb21wb25lbnQoZmluaXNoKSArICclMjAnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpO1xuICB2YXIgYm9keSA9IGVuY29kZVVSSUNvbXBvbmVudCgnSSBhbSBpbnRlcmVzdGVkIGluIGFjcXVpcmluZyBhIGN1c3RvbSA0OCB4IDQwIFhYWFhYWCBwYWludGluZy4gSSBsb29rIGZvcndhcmQgdG8gaGVhcmluZyBmcm9tIFBhaW50aW5nSUQgaW4gdGhlIG5leHQgMjQgaG91cnMuIE15IGZ1bGwgY29udGFjdCBkZXRhaWxzIGFyZSBpbmNsdWRlZCBiZWxvdzpcXG5cXG5QaG9uZTpcXG5FbWFpbDonKTtcbiAgYm9keSA9IGJvZHkuc3BsaXQoJ1hYWFhYWCcpLmpvaW4oZnVsbERldGFpbHMpO1xuICB0aGlzLmhyZWYgPSBocmVmICsgYm9keTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWFpbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbWFpbCk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnL2ltZy90ZXh0dXJlcy93b29kLmpwZWcnKTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIHJldHVybiBbXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pLFxuICAgIG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKGNvbG91ciksXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSlcbiAgXTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIG1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0ZXJpYWxzJyk7XG5cbmZ1bmN0aW9uIGdldE1lc2goc2NlbmUpIHtcbiAgcmV0dXJuIHNjZW5lLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQgaW5zdGFuY2VvZiBUSFJFRS5NZXNoO1xuICB9KVswXTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Q29sb3VyID0gZnVuY3Rpb24oc2NlbmUsIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgaWYgKCFtZXNoKSByZXR1cm47XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIG1lc2gubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMubmV3ID0gZnVuY3Rpb24oZ2VvLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIHZhciB6bWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KSk7XG4gIHdpbmRvdy56bWVzaCA9IHptZXNoO1xuICB6bWVzaC5yb3RhdGlvbi5mcm9tQXJyYXkocGFpbnRpbmcucm90YXRpb24pO1xuICB6bWVzaC5zY2FsZS5mcm9tQXJyYXkocGFpbnRpbmcuc2NhbGUpO1xuICByZXR1cm4gem1lc2g7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIHNjZW5lLnJlbW92ZShtZXNoKTtcbiAgdXBkYXRlKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBbe1xuICBpZDogMCxcbiAgdXJsOiAnL29iai9wYWludGluZzEuanMnLFxuICByb3RhdGlvbjogWzAuMSwgLTAuOSwgMC4wXSxcbiAgc2NhbGU6IFsxLCAxLCAxXSxcbiAgcmV2ZXJzZWRNZXNoOiB0cnVlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufSwge1xuICBpZDogMSxcbiAgdXJsOiAnL29iai9wYWludGluZ19jaXJjbGVzLmpzJyxcbiAgcm90YXRpb246IFstMC44LCAtMC4xMiwgLTEuNjldLFxuICBzY2FsZTogWzEuMSwgMS4xLCAxLjFdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZ19mcmVlZm9ybS5qcycsXG4gIHJvdGF0aW9uOiBbLTAuMTgsIDAuOCwgLTMuMTRdLFxuICBzY2FsZTogWzEuMiwgMS4yLCAxLjJdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn1dO1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG52YXIgZG9GaXggPSByZXF1aXJlKCcuL3NpZGViYXInKS5kb0ZpeDtcblxuZnVuY3Rpb24gc2hvd1ByZXZpZXcoc2NlbmUpIHtcbiAgdmFyIGdldEpwZyA9IHRlYXJzaGVldC5nZXRKcGcoc2NlbmUucmVuZGVyZXIsIHNjZW5lLmNhbWVyYSwgc2NlbmUuY29udHJvbHMpO1xuICB2YXIgaW50cm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKTtcbiAgdmFyIHBhaW50aW5nID0gaW50cm8uY2hpbGRyZW5bMF07XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBkb0ZpeCgpO1xuICAgIHZhciBqcGcgPSBnZXRKcGcoKTtcbiAgICBwYWludGluZy5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKFwiJyArIGpwZyArICdcIiknO1xuICAgIGludHJvLmNsYXNzTGlzdC5hZGQoJ3Nob3ctLXByZXZpZXcnKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGlkZVByZXZpZXcoKSB7XG4gIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdy0tcHJldmlldycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNob3ctcHJldmlldycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1ByZXZpZXcoc2NlbmUpKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlUHJldmlldyk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cblxuZnVuY3Rpb24gY3JlYXRlQ2FtZXJhKCkge1xuICB2YXIgcmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgdmFyIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgcmF0aW8sIDEsIDIwMDApO1xuICBjYW1lcmEucG9zaXRpb24ueCA9IDA7XG4gIGNhbWVyYS5wb3NpdGlvbi55ID0gMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSA0MDtcbiAgcmV0dXJuIGNhbWVyYTtcbn1cblxuZnVuY3Rpb24gYWRkTGlnaHRzKHNjZW5lKSB7XG4gIHZhciBkaXJlY3Rpb25hbExpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZTgpO1xuXHRkaXJlY3Rpb25hbExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAxKTtcblx0c2NlbmUuYWRkKG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHgyQzJDM0QpKTtcblx0c2NlbmUuYWRkKGRpcmVjdGlvbmFsTGlnaHQpO1xufVxuXG5mdW5jdGlvbiBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKTtcbiAgdmFyIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhLCBjYW52YXMpO1xuXHRjb250cm9scy5kYW1waW5nID0gMC4yO1xuICBjb250cm9scy5ub0tleXMgPSB0cnVlO1xuICBjb250cm9scy5ub1pvb20gPSB0cnVlO1xuICBjb250cm9scy5ub1BhbiA9IHRydWU7XG4gIGNvbnRyb2xzLm5vUm90YXRlVXAgPSBmYWxzZTtcbiAgY29udHJvbHMubWluUG9sYXJBbmdsZSA9IE1hdGguUEkvMztcblx0Y29udHJvbHMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEkvMS41O1xuICBjb250cm9scy5taW5BemltdXRoQW5nbGUgPSAtTWF0aC5QSS81O1xuXHRjb250cm9scy5tYXhBemltdXRoQW5nbGUgPSBNYXRoLlBJLzU7XG4gIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHVwZGF0ZSk7XG4gIHJldHVybiBjb250cm9scztcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICBhbHBoYTogdHJ1ZSxcbiAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWVcbiAgfSk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZShjYW1lcmEsIHJlbmRlcmVyLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHQgIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBjYWxsYmFjaygpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKTtcbiAgdmFyIGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpO1xuICB2YXIgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgdmFyIHVwZGF0ZSA9IHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XG4gIHZhciBjb250cm9scyA9IGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIHVwZGF0ZSk7XG4gIHdpbmRvdy51cGRhdGUgPSB1cGRhdGU7XG5cbiAgYWRkTGlnaHRzKHNjZW5lKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICByZXR1cm4ge1xuICAgIGNhbWVyYTogY2FtZXJhLFxuICAgIGNvbnRyb2xzOiBjb250cm9scyxcbiAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgc2NlbmU6IHNjZW5lXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpO1xuICBhbmltYXRlKHNjZW5lLmNvbnRyb2xzKTtcbiAgc2NlbmUudXBkYXRlKCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZShcbiAgICBzY2VuZS5jYW1lcmEsXG4gICAgc2NlbmUucmVuZGVyZXIsXG4gICAgc2NlbmUudXBkYXRlXG4gICkpO1xuICByZXR1cm4gc2NlbmU7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlKGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZShjb250cm9scykpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9O1xufVxuIiwidmFyIGNyZWF0ZVNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZScpLmluaXQ7XG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGZpbmlzaGVzID0gcmVxdWlyZSgnLi9maW5pc2hlcycpO1xudmFyIHNjcm9sbCA9IHJlcXVpcmUoJy4vc2lkZWJhcicpO1xudmFyIHByZXZpZXcgPSByZXF1aXJlKCcuL3ByZXZpZXcnKTtcbnZhciBtYWlsID0gcmVxdWlyZSgnLi9tYWlsJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMSkge1xuICAgIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gICAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpO1xuICAgIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSk7XG4gICAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgfVxuICBzY3JvbGwuaW5pdCgpO1xuICBtYWlsLmluaXQoKTtcbn0pO1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIGNsYXNzTGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbGliL2RlYm91bmNlJyk7XG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgaWYgKHNjcm9sbCA+PSB3aW5IZWlnaHQpIGRvRml4KCk7XG59XG5cbmZ1bmN0aW9uIGRvVW5kZXJsYXkoKSB7XG4gIHZhciBib3R0b21TUyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51bmRlcmxheSAuYm90dG9tLS1zcyBsaScpO1xuICB2YXIgYm90dG9tQWJvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tYWJvdXQgbGknKTtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciBhYm91dFBvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1hYm91dCcpLm9mZnNldFRvcDtcbiAgaWYgKGFib3V0UG9zICE9PSAwICYmIGFib3V0UG9zIDw9IHNjcm9sbCkge1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9IGVsc2Uge1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIGJvZHkuY2xhc3NMaXN0LmFkZCgnZml4LXBhZ2UnKTtcbiAgaW50cm8uY2xhc3NMaXN0LnJlbW92ZSgnanMtbm90LXNjcm9sbGVkJyk7XG4gIGJvZHkuc2Nyb2xsVG9wIC09IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwpO1xuICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBzaG93QWJvdXQoKTtcbiAgICBpbnRyby5jbGFzc0xpc3QuYWRkKCdhbmltYXRlLS10b3AnKTtcbiAgfSwgNDAwKTtcbn1cblxuZnVuY3Rpb24gc2hvd0Fib3V0KCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0tYWJvdXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLWFib3V0Jyk7XG59XG5cbmZ1bmN0aW9uIGNsaWNrTmF2KGUpIHtcbiAgc2hvd0Fib3V0KCk7XG4gIHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgdmFyIGlzRml4ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaXgtcGFnZScpO1xuICBpZiAoIWlzRml4ZWQpIGRvRml4KCk7XG4gIHZhciB0byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaHJlZikub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24oKSB7fSwgNjAwLCAnZWFzZUluT3V0UXVhZCcpO1xuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc2Nyb2xsJykpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIHNjcm9sbEludHJvKCkge1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFpbnRpbmdzJykub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24gKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lkZWJhcihlKSB7XG4gIHRoaXMucGFyZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd0b2dnbGVkJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuZnVuY3Rpb24gbG9hZEludHJvKCkge1xuICB2YXIgaW50cm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKTtcbiAgdmFyIGltZyA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgaW1nLnNyYyA9IGludHJvLmRhdGFzZXQuYmc7XG4gIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpbnRyby5jbGFzc0xpc3QuYWRkKCdzaG93LS1pbnRybycpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzZXRVcE1vYmlsZSgpIHtcbiAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDc2OCkgcmV0dXJuO1xuICB2YXIgdG9nZ2xlcyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUtbWUnKSk7XG4gIHRvZ2dsZXMuZm9yRWFjaChjbGFzc0xpc3QuYWRkKCd0b2dnbGVkJykpO1xufVxuXG5mdW5jdGlvbiBzaG93SGlkZVNpZGViYXIoZSkge1xuICB2YXIgdGV4dCA9IHRoaXMudGV4dENvbnRlbnQ7XG4gIHRoaXMudGV4dENvbnRlbnQgPSB0ZXh0ID09PSAnPCcgPyAnPicgOiAnPCc7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLS1yaWdodCcpLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmRvRml4ID0gZG9GaXg7XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5hdnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2lkZWJhci0tbGVmdCBhJykpO1xuICB2YXIgdG9nZ2xlcyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EuanMtdG8tdG9nZ2xlJykpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRvVW5kZXJsYXkpO1xuICBkb1VuZGVybGF5KCk7XG4gIGxvYWRJbnRybygpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2V0VXBNb2JpbGUpO1xuICBzZXRVcE1vYmlsZSgpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhLm1vYmlsZS1zaWRlYmFyLXRyaWdnZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dIaWRlU2lkZWJhcik7XG4gIG5hdnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2xpY2tOYXYpKTtcbiAgdG9nZ2xlcy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCB0b2dnbGVTaWRlYmFyKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRyby5qcy1ub3Qtc2Nyb2xsZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjcm9sbEludHJvKTtcbn07XG4iLCJmdW5jdGlvbiBzYXZlVGVhclNoZWV0KHJlbmRlcmVyLCBjYW1lcmEsIGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIganBnO1xuICAgIHZhciBwcmV2UG9zaXRpb24gPSBbXG4gICAgICBjYW1lcmEucG9zaXRpb24ueCxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi55LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnpcbiAgICBdO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkoWzAsIDAsIDQwXSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAganBnID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHByZXZQb3NpdGlvbik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIGpwZztcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SnBnID0gc2F2ZVRlYXJTaGVldDtcbiJdfQ==
