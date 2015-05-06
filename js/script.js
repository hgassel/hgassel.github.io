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
  url: '/obj/painting2.js',
  rotation: [-0.65, -0.16, -1.72],
  scale: [1.2, 1.2, 1.2],
  reversedMesh: true,
  cache: false,
  information: ''
}, {
  id: 2,
  url: '/obj/painting4.js',
  rotation: [0.85, 0.12, 1.45],
  scale: [1.15, 1.15, 1.15],
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

function showPreview(scene) {
  var getJpg = tearsheet.getJpg(scene.renderer, scene.camera, scene.controls);
  var intro = document.querySelector('.section--intro');
  var painting = intro.children[0];
  return function() {
    var jpg = getJpg();
    console.log(jpg);
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

},{"./tearsheet":20}],17:[function(require,module,exports){
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

module.exports.init = function() {
  var navs = slice(document.querySelectorAll('.sidebar--left a'));
  var toggles = slice(document.querySelectorAll('a.js-to-toggle'));
  document.addEventListener('scroll', onScroll);
  document.addEventListener('scroll', doUnderlay);
  doUnderlay();
  loadIntro();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN0b3JhZ2UgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuXG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBzdG9yYWdlW2lkXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgZ2VvKSB7XG4gIHN0b3JhZ2VbaWRdID0gZ2VvO1xufTtcbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJyk7XG52YXIgY2xhc3NMaXN0ID0gcmVxdWlyZSgnLi9saWIvY2xhc3NsaXN0Jyk7XG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGVsZW1lbnQpIHtcbiAgdmFyIGNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJyk7XG4gIHZhciBjb2xvdXJOYW1lID0gZWxlbWVudC5kYXRhc2V0Lm5hbWU7XG4gIGNvbG91ci50ZXh0Q29udGVudCA9IGNvbG91ck5hbWUudG9VcHBlckNhc2UoKTtcbn1cblxudmFyIGdldENvbG91ciA9IG1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgLy8gdmFyIGNsYXNzZXMgPSBzbGljZShlbGVtZW50LmNsYXNzTGlzdClcbiAgLy8gcmV0dXJuICcjJyArIGNsYXNzZXMucmVkdWNlKGZ1bmN0aW9uIChjb2xvdXIsIGNsYXNzTmFtZSkge1xuICAvLyAgIGlmIChjbGFzc05hbWUuaW5kZXhPZignY29sb3VyLS0nKSAhPT0gLTEpXG4gIC8vICAgICBjb2xvdXIgPSBjbGFzc05hbWUuc3BsaXQoJ2NvbG91ci0tJylbMV1cbiAgLy8gICByZXR1cm4gY29sb3VyXG4gIC8vIH0sICcnKVxuICByZXR1cm4gZWxlbWVudC5kYXRhc2V0LmNvbG91cjtcbn07XG5cbmZ1bmN0aW9uIHN3YXBIZWFkZXIoKSB7XG4gIHZhciB0b3AgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLnVuZGVybGF5LXRvcCcpLmNoaWxkcmVuKTtcbiAgdmFyIGluZGV4ID0gdG9wLnJlZHVjZShmdW5jdGlvbiAoaSwgbGksIGopIHtcbiAgICBpZiAobGkuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuIGo7XG4gICAgcmV0dXJuIGk7XG4gIH0sIC0xKSArIDE7XG4gIGlmIChpbmRleCA+IHRvcC5sZW5ndGggLSAxKSBpbmRleCA9IDA7XG4gIHRvcC5mb3JFYWNoKGNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgdG9wW2luZGV4XS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm47XG4gICAgdmFyIGNvbG91ciA9IGdldENvbG91cih0aGlzKTtcbiAgICB2YXIgZ3JhZGllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JhZGllbnQuY29sb3VyLS0nICsgY29sb3VyLnN1YnN0cmluZygxKSk7XG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1maW5pc2hlcyAuYnV0dG9uLmlzLWFjdGl2ZScpO1xuICAgIGFjdGl2YXRlKHRoaXMpO1xuICAgIGFjdGl2YXRlKGdyYWRpZW50KTtcbiAgICBzd2FwSGVhZGVyKCk7XG4gICAgc2V0VGV4dENvbnRlbnQodGhpcyk7XG4gICAgaWYgKGZpbmlzaClcbiAgICAgIG1lc2guc2V0Q29sb3VyKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nc1tmaW5pc2guZGF0YXNldC5pZF0pO1xuICAgIHVwZGF0ZSgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgY29sb3VyQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1jb2xvdXJzIGxpJykpO1xuICBjb2xvdXJCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSkpO1xuICBjb2xvdXJCdXR0b25zW2NvbG91ckJ1dHRvbnMubGVuZ3RoIC0gMV0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpO1xufTtcbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJyk7XG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKTtcbnZhciBsb2FkID0gcmVxdWlyZSgnLi9sb2FkJyk7XG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcbnZhciBsb2FkaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KHBhaW50aW5nKSB7XG4gIHZhciBpbmZvcm1hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLWluZm9ybWF0aW9uJyk7XG4gIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpO1xuICBpbmZvcm1hdGlvbi50ZXh0Q29udGVudCA9IHBhaW50aW5nLmluZm9ybWF0aW9uO1xuICBmaW5pc2gudGV4dENvbnRlbnQgPSAnRmluaXNoICcgKyAocGFpbnRpbmcuaWQgKyAxKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcGFpbnRpbmcgPSBwYWludGluZ3NbdGhpcy5kYXRhc2V0LmlkXTtcbiAgICBpZiAobG9hZGluZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybiBmYWxzZTtcbiAgICBsb2FkaW5nID0gbG9hZC5zdGFydCgpO1xuICAgIG1lc2gucmVtb3ZlKHNjZW5lLCB1cGRhdGUpO1xuICAgIHNldFRleHRDb250ZW50KHBhaW50aW5nKTtcbiAgICBsb2FkLnBhaW50aW5nKHBhaW50aW5nLCBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkpO1xuICAgIHJldHVybiBhY3RpdmF0ZSh0aGlzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ290R2VvKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYWludGluZywgZ2VvKSB7XG4gICAgdmFyIGFjdGl2ZUNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1jb2xvdXJzIGxpLmlzLWFjdGl2ZScpO1xuICAgIHZhciBjb2xvdXIgPSBjb2xvdXJzLmdldChhY3RpdmVDb2xvdXIpO1xuICAgIHZhciB6bWVzaCA9IG1lc2gubmV3KGdlbywgY29sb3VyLCBwYWludGluZyk7XG4gICAgc2NlbmUuYWRkKHptZXNoKTtcbiAgICBsb2FkaW5nID0gbG9hZC5lbmQoKTtcbiAgICB1cGRhdGUoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGZpbmlzaEJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSk7XG4gIGZpbmlzaEJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpKSk7XG4gIGZpbmlzaEJ1dHRvbnNbMF0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpO1xufTtcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9jbGFzc2xpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHNsaWNlKGVsZW1lbnQucGFyZW50Tm9kZS5jaGlsZE5vZGVzKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy50b2dnbGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUobmFtZSk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcblx0dmFyIHRpbWVvdXQ7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0dmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHRcdH07XG5cdFx0dmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG5cdFx0d2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuXHRcdGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHR9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICB0IC89IGQvMjtcbiAgaWYgKHQgPCAxKSB7XG4gICAgcmV0dXJuIGMvMip0KnQgKyBiO1xuICB9XG4gIHQtLTtcbiAgcmV0dXJuIC1jLzIgKiAodCoodC0yKSAtIDEpICsgYjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbkN1YmljID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdGMgPSAodC89ZCkqdCp0O1xuICByZXR1cm4gYitjKih0Yyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRzID0gKHQvPWQpKnQ7XG4gIHZhciB0YyA9IHRzKnQ7XG4gIHJldHVybiBiK2MqKDYqdGMqdHMgKyAtMTUqdHMqdHMgKyAxMCp0Yyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLmJpbmQuYmluZChGdW5jdGlvbi5jYWxsKTtcbiIsInZhciBlYXNpbmcgPSByZXF1aXJlKCcuL2Vhc2luZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRvLCBjYWxsYmFjaywgZHVyYXRpb24sIGVhc2luZ05hbWUpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5O1xuICB2YXIgc3RhcnQgPSBkb2Muc2Nyb2xsVG9wO1xuICB2YXIgY2hhbmdlID0gdG8gLSBzdGFydDtcbiAgdmFyIGN1cnJlbnRUaW1lID0gMDtcbiAgdmFyIGluY3JlbWVudCA9IDIwO1xuXG4gIHZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudFRpbWUgKz0gaW5jcmVtZW50O1xuICAgIHZhciB2YWwgPSBlYXNpbmdbZWFzaW5nTmFtZV0oY3VycmVudFRpbWUsIHN0YXJ0LCBjaGFuZ2UsIGR1cmF0aW9uKTtcbiAgICBkb2Muc2Nyb2xsVG9wID0gdmFsO1xuICAgIGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTY3JvbGwpO1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9O1xuICBhbmltYXRlU2Nyb2xsKCk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpO1xuLy92YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKVxudmFyIGJpbkxvYWRlciA9IG5ldyBUSFJFRS5CaW5hcnlMb2FkZXIoKTtcblxuZnVuY3Rpb24gb25Qcm9ncmVzcyAoeGhyKSB7XG4gIHZhciBwZXJjZW50Q29tcGxldGUgPSB4aHIubG9hZGVkIC8geGhyLnRvdGFsICogMTAwO1xuICB2YXIgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZy1wcm9ncmVzcycpO1xuICBwcm9ncmVzc0Jhci5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICBwcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHBlcmNlbnRDb21wbGV0ZSArICclJztcbn1cblxuZnVuY3Rpb24gaGlkZUJhcigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbn1cblxuZnVuY3Rpb24gZmluaXNoZXNCdXR0b25zKCkge1xuICByZXR1cm4gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5hZGQoJ2lzLWxvYWRpbmcnKSk7XG4gIHJldHVybiB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZW5kID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtbG9hZGluZycpKTtcbiAgaGlkZUJhcigpO1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5wYWludGluZyA9IGZ1bmN0aW9uIChwYWludGluZywgY2FsbGJhY2spIHtcbiAgdmFyIGNhY2hlZEdlbyA9IGNhY2hlLmZyb20ocGFpbnRpbmcuaWQpO1xuICBpZiAoY2FjaGVkR2VvKSByZXR1cm4gY2FsbGJhY2socGFpbnRpbmcsIGNhY2hlZEdlbyk7XG4gIGJpbkxvYWRlci5sb2FkKHBhaW50aW5nLnVybCwgZnVuY3Rpb24oZ2VvKSB7XG4gICAgZ2VvLm1lcmdlVmVydGljZXMoKTtcbiAgICBnZW8uY2VudGVyKCk7XG4gICAgY2FjaGUudXBkYXRlKHBhaW50aW5nLmlkLCBnZW8pO1xuICAgIGNhbGxiYWNrKHBhaW50aW5nLCBnZW8pO1xuICB9LCAnJywgJy9vYmovJywgb25Qcm9ncmVzcyk7XG59O1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG5cbmZ1bmN0aW9uIG1haWwoZSkge1xuICB2YXIgaHJlZiA9ICdtYWlsdG86aW5mb0BicmVuZGFuc21pdGhzdHVkaW8uY29tP3N1YmplY3Q9UGFpbnRpbmdJRCZib2R5PSc7XG4gIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpLnRleHRDb250ZW50O1xuICB2YXIgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJykudGV4dENvbnRlbnQudG9VcHBlckNhc2UoKTtcbiAgdmFyIGZ1bGxEZXRhaWxzID0gZW5jb2RlVVJJQ29tcG9uZW50KGZpbmlzaCkgKyAnJTIwJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcbiAgdmFyIGJvZHkgPSBlbmNvZGVVUklDb21wb25lbnQoJ0kgYW0gaW50ZXJlc3RlZCBpbiBhY3F1aXJpbmcgYSBjdXN0b20gNDggeCA0MCBYWFhYWFggcGFpbnRpbmcuIEkgbG9vayBmb3J3YXJkIHRvIGhlYXJpbmcgZnJvbSBQYWludGluZ0lEIGluIHRoZSBuZXh0IDI0IGhvdXJzLiBNeSBmdWxsIGNvbnRhY3QgZGV0YWlscyBhcmUgaW5jbHVkZWQgYmVsb3c6XFxuXFxuUGhvbmU6XFxuRW1haWw6Jyk7XG4gIGJvZHkgPSBib2R5LnNwbGl0KCdYWFhYWFgnKS5qb2luKGZ1bGxEZXRhaWxzKTtcbiAgdGhpcy5ocmVmID0gaHJlZiArIGJvZHk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1haWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1haWwpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9pbWcvdGV4dHVyZXMvd29vZC5qcGVnJyk7XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGNvbG91cikge1xuICByZXR1cm4gW1xuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KSxcbiAgICBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcihjb2xvdXIpLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pXG4gIF07XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBtYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdGVyaWFscycpO1xuXG5mdW5jdGlvbiBnZXRNZXNoKHNjZW5lKSB7XG4gIHJldHVybiBzY2VuZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkIGluc3RhbmNlb2YgVEhSRUUuTWVzaDtcbiAgfSlbMF07XG59XG5cbm1vZHVsZS5leHBvcnRzLnNldENvbG91ciA9IGZ1bmN0aW9uKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIGlmICghbWVzaCkgcmV0dXJuO1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICBtZXNoLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLm5ldyA9IGZ1bmN0aW9uKGdlbywgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICB2YXIgem1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW8sIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCkpO1xuICB3aW5kb3cuem1lc2ggPSB6bWVzaDtcbiAgem1lc2gucm90YXRpb24uZnJvbUFycmF5KHBhaW50aW5nLnJvdGF0aW9uKTtcbiAgem1lc2guc2NhbGUuZnJvbUFycmF5KHBhaW50aW5nLnNjYWxlKTtcbiAgcmV0dXJuIHptZXNoO1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgbWVzaCA9IGdldE1lc2goc2NlbmUpO1xuICBzY2VuZS5yZW1vdmUobWVzaCk7XG4gIHVwZGF0ZSgpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gW3tcbiAgaWQ6IDAsXG4gIHVybDogJy9vYmovcGFpbnRpbmcxLmpzJyxcbiAgcm90YXRpb246IFswLjEsIC0wLjksIDAuMF0sXG4gIHNjYWxlOiBbMSwgMSwgMV0sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn0sIHtcbiAgaWQ6IDEsXG4gIHVybDogJy9vYmovcGFpbnRpbmcyLmpzJyxcbiAgcm90YXRpb246IFstMC42NSwgLTAuMTYsIC0xLjcyXSxcbiAgc2NhbGU6IFsxLjIsIDEuMiwgMS4yXSxcbiAgcmV2ZXJzZWRNZXNoOiB0cnVlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZzQuanMnLFxuICByb3RhdGlvbjogWzAuODUsIDAuMTIsIDEuNDVdLFxuICBzY2FsZTogWzEuMTUsIDEuMTUsIDEuMTVdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn1dO1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG5cbmZ1bmN0aW9uIHNob3dQcmV2aWV3KHNjZW5lKSB7XG4gIHZhciBnZXRKcGcgPSB0ZWFyc2hlZXQuZ2V0SnBnKHNjZW5lLnJlbmRlcmVyLCBzY2VuZS5jYW1lcmEsIHNjZW5lLmNvbnRyb2xzKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIHZhciBwYWludGluZyA9IGludHJvLmNoaWxkcmVuWzBdO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpwZyA9IGdldEpwZygpO1xuICAgIGNvbnNvbGUubG9nKGpwZyk7XG4gICAgcGFpbnRpbmcuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybChcIicgKyBqcGcgKyAnXCIpJztcbiAgICBpbnRyby5jbGFzc0xpc3QuYWRkKCdzaG93LS1wcmV2aWV3Jyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhpZGVQcmV2aWV3KCkge1xuICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctLXByZXZpZXcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaG93LXByZXZpZXcnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dQcmV2aWV3KHNjZW5lKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVByZXZpZXcpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpIHtcbiAgdmFyIHJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIHJhdGlvLCAxLCAyMDAwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueSA9IDA7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDA7XG4gIHJldHVybiBjYW1lcmE7XG59XG5cbmZ1bmN0aW9uIGFkZExpZ2h0cyhzY2VuZSkge1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmU4KTtcblx0ZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoMCwgMSwgMSk7XG5cdHNjZW5lLmFkZChuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MkMyQzNEKSk7XG5cdHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgdXBkYXRlKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuZGVyJyk7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSwgY2FudmFzKTtcblx0Y29udHJvbHMuZGFtcGluZyA9IDAuMjtcbiAgY29udHJvbHMubm9LZXlzID0gdHJ1ZTtcbiAgY29udHJvbHMubm9ab29tID0gdHJ1ZTtcbiAgY29udHJvbHMubm9QYW4gPSB0cnVlO1xuICBjb250cm9scy5ub1JvdGF0ZVVwID0gZmFsc2U7XG4gIGNvbnRyb2xzLm1pblBvbGFyQW5nbGUgPSBNYXRoLlBJLzM7XG5cdGNvbnRyb2xzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJLzEuNTtcbiAgY29udHJvbHMubWluQXppbXV0aEFuZ2xlID0gLU1hdGguUEkvNTtcblx0Y29udHJvbHMubWF4QXppbXV0aEFuZ2xlID0gTWF0aC5QSS81O1xuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB1cGRhdGUpO1xuICByZXR1cm4gY29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgYWxwaGE6IHRydWUsXG4gICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlXG4gIH0pO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcblx0cmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgcmV0dXJuIHJlbmRlcmVyO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25XaW5kb3dSZXNpemUoY2FtZXJhLCByZW5kZXJlciwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgIGNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0ICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHQgIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgY2FsbGJhY2soKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2NlbmUoKSB7XG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuZGVyJyk7XG4gIHZhciBjYW1lcmEgPSBjcmVhdGVDYW1lcmEoKTtcbiAgdmFyIHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKTtcbiAgdmFyIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIHZhciB1cGRhdGUgPSByZW5kZXIoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpO1xuICB2YXIgY29udHJvbHMgPSBhZGRDb250cm9scyhzY2VuZSwgY2FtZXJhLCB1cGRhdGUpO1xuICB3aW5kb3cudXBkYXRlID0gdXBkYXRlO1xuXG4gIGFkZExpZ2h0cyhzY2VuZSk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbiAgYW5pbWF0ZShzY2VuZS5jb250cm9scyk7XG4gIHNjZW5lLnVwZGF0ZSgpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKTtcbiAgcmV0dXJuIHNjZW5lO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgfTtcbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0O1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKTtcbnZhciBzY3JvbGwgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbnZhciBwcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG52YXIgbWFpbCA9IHJlcXVpcmUoJy4vbWFpbCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDEpIHtcbiAgICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpO1xuICAgIGNvbG91cnMuaW5pdChzY2VuZS5zY2VuZSwgc2NlbmUudXBkYXRlKTtcbiAgICBmaW5pc2hlcy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpO1xuICAgIHByZXZpZXcuaW5pdChzY2VuZSk7XG4gIH1cbiAgc2Nyb2xsLmluaXQoKTtcbiAgbWFpbC5pbml0KCk7XG59KTtcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBjbGFzc0xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBzY3JvbGxUbyA9IHJlcXVpcmUoJy4vbGliL3Njcm9sbHRvJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2xpYi9kZWJvdW5jZScpO1xuXG5mdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciB3aW5IZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGlmIChzY3JvbGwgPj0gd2luSGVpZ2h0KSBkb0ZpeCgpO1xufVxuXG5mdW5jdGlvbiBkb1VuZGVybGF5KCkge1xuICB2YXIgYm90dG9tU1MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tc3MgbGknKTtcbiAgdmFyIGJvdHRvbUFib3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVuZGVybGF5IC5ib3R0b20tLWFib3V0IGxpJyk7XG4gIHZhciBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuICB2YXIgYWJvdXRQb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0tYWJvdXQnKS5vZmZzZXRUb3A7XG4gIGlmIChhYm91dFBvcyAhPT0gMCAmJiBhYm91dFBvcyA8PSBzY3JvbGwpIHtcbiAgICBib3R0b21TUy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICBib3R0b21BYm91dC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfSBlbHNlIHtcbiAgICBib3R0b21BYm91dC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICBib3R0b21TUy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkb0ZpeCgpIHtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gIHZhciBpbnRybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpO1xuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2ZpeC1wYWdlJyk7XG4gIGludHJvLmNsYXNzTGlzdC5yZW1vdmUoJ2pzLW5vdC1zY3JvbGxlZCcpO1xuICBib2R5LnNjcm9sbFRvcCAtPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc2hvd0Fib3V0KCk7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZS0tdG9wJyk7XG4gIH0sIDQwMCk7XG59XG5cbmZ1bmN0aW9uIHNob3dBYm91dCgpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWFib3V0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS1hYm91dCcpO1xufVxuXG5mdW5jdGlvbiBjbGlja05hdihlKSB7XG4gIHNob3dBYm91dCgpO1xuICB2YXIgaHJlZiA9IHRoaXMuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gIHZhciBpc0ZpeGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmNsYXNzTGlzdC5jb250YWlucygnZml4LXBhZ2UnKTtcbiAgaWYgKCFpc0ZpeGVkKSBkb0ZpeCgpO1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGhyZWYpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Njcm9sbCcpKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBzY3JvbGxJbnRybygpIHtcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhaW50aW5ncycpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uICgpIHt9LCA2MDAsICdlYXNlSW5PdXRRdWFkJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNpZGViYXIoZSkge1xuICB0aGlzLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlZCcpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRJbnRybygpIHtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIHZhciBpbWcgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gIGltZy5zcmMgPSBpbnRyby5kYXRhc2V0LmJnO1xuICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnc2hvdy0taW50cm8nKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmF2cyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyLS1sZWZ0IGEnKSk7XG4gIHZhciB0b2dnbGVzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS5qcy10by10b2dnbGUnKSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZG9VbmRlcmxheSk7XG4gIGRvVW5kZXJsYXkoKTtcbiAgbG9hZEludHJvKCk7XG4gIG5hdnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2xpY2tOYXYpKTtcbiAgdG9nZ2xlcy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCB0b2dnbGVTaWRlYmFyKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRyby5qcy1ub3Qtc2Nyb2xsZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjcm9sbEludHJvKTtcbn07XG4iLCJmdW5jdGlvbiBzYXZlVGVhclNoZWV0KHJlbmRlcmVyLCBjYW1lcmEsIGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIganBnO1xuICAgIHZhciBwcmV2UG9zaXRpb24gPSBbXG4gICAgICBjYW1lcmEucG9zaXRpb24ueCxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi55LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnpcbiAgICBdO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkoWzAsIDAsIDQwXSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAganBnID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHByZXZQb3NpdGlvbik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIGpwZztcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SnBnID0gc2F2ZVRlYXJTaGVldDtcbiJdfQ==
