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

},{"./lib/activate":4,"./lib/eventlisteners":8,"./lib/liberate":9,"./mesh":14,"./paintings":15}],3:[function(require,module,exports){
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

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":9}],12:[function(require,module,exports){
var tearsheet = require('./tearsheet');

function mail(e) {
  var href = 'mailto:info@brendansmithstudio.com?subject=PaintingID';
  var finish = document.querySelector('.box-finish').textContent;
  var name = document.querySelector('.box-colour').textContent;
  this.href = href + '&body=' +
    encodeURIComponent(finish) + '%20' + encodeURIComponent(name);
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

},{}],18:[function(require,module,exports){
var createScene = require('./scene').init;
var colours = require('./colours');
var finishes = require('./finishes');
var scroll = require('./sidebar');
var preview = require('./preview');
var mail = require('./mail');

document.addEventListener('DOMContentLoaded', function() {
  if (window.innerWidth > 767) {
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

var doUnderlay = debounce(function() {
  var top = slice(document.querySelector('.underlay .underlay-top').children);
  var bottomSS = slice(document.querySelector('.underlay .bottom--ss').children);
  var bottomAbout = document.querySelector('.underlay .bottom--about li');
  var scroll = document.querySelector('body').scrollTop;
  var aboutPos = document.querySelector('.section--about').offsetTop;
  top.forEach(classList.remove('is-active'));
  bottomSS.forEach(classList.remove('is-active'));
  bottomAbout.classList.remove('is-active');
  top[Math.floor(Math.random()*top.length)].classList.add('is-active');
  if (aboutPos !== 0 && aboutPos <= scroll) {
    bottomAbout.classList.add('is-active');
  } else {
    bottomSS[Math.floor(Math.random()*bottomSS.length)].classList.add('is-active');
  }
}, 15);

function doFix() {
  var body = document.querySelector('body');
  var intro = document.querySelector('.section--intro');
  body.classList.add('fix-page');
  intro.classList.remove('js-not-scrolled');
  body.scrollTop -= window.innerHeight;
  document.removeEventListener('scroll', onScroll);
  window.setTimeout(function() {
    showAbout();
  }, 400);
}

function showAbout() {
  document.querySelector('.section--about').classList.remove('hide-about');
}

function clickNav(e) {
  showAbout();
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
  document.addEventListener('scroll', doUnderlay);
  doUnderlay();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN0b3JhZ2UgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuXG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBzdG9yYWdlW2lkXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgZ2VvKSB7XG4gIHN0b3JhZ2VbaWRdID0gZ2VvO1xufTtcbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJyk7XG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGVsZW1lbnQpIHtcbiAgdmFyIGNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtY29sb3VyJyk7XG4gIHZhciBjb2xvdXJOYW1lID0gZWxlbWVudC5kYXRhc2V0Lm5hbWU7XG4gIGNvbG91ci50ZXh0Q29udGVudCA9IGNvbG91ck5hbWU7XG59XG5cbnZhciBnZXRDb2xvdXIgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIC8vIHZhciBjbGFzc2VzID0gc2xpY2UoZWxlbWVudC5jbGFzc0xpc3QpXG4gIC8vIHJldHVybiAnIycgKyBjbGFzc2VzLnJlZHVjZShmdW5jdGlvbiAoY29sb3VyLCBjbGFzc05hbWUpIHtcbiAgLy8gICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2NvbG91ci0tJykgIT09IC0xKVxuICAvLyAgICAgY29sb3VyID0gY2xhc3NOYW1lLnNwbGl0KCdjb2xvdXItLScpWzFdXG4gIC8vICAgcmV0dXJuIGNvbG91clxuICAvLyB9LCAnJylcbiAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldC5jb2xvdXI7XG59O1xuXG5mdW5jdGlvbiBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybjtcbiAgICB2YXIgY29sb3VyID0gZ2V0Q29sb3VyKHRoaXMpO1xuICAgIHZhciBncmFkaWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmFkaWVudC5jb2xvdXItLScgKyBjb2xvdXIuc3Vic3RyaW5nKDEpKTtcbiAgICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWZpbmlzaGVzIC5idXR0b24uaXMtYWN0aXZlJyk7XG4gICAgYWN0aXZhdGUodGhpcyk7XG4gICAgYWN0aXZhdGUoZ3JhZGllbnQpO1xuICAgIHNldFRleHRDb250ZW50KHRoaXMpO1xuICAgIGlmIChmaW5pc2gpXG4gICAgICBtZXNoLnNldENvbG91cihzY2VuZSwgY29sb3VyLCBwYWludGluZ3NbZmluaXNoLmRhdGFzZXQuaWRdKTtcbiAgICB1cGRhdGUoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGNvbG91ckJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tY29sb3VycyBsaScpKTtcbiAgY29sb3VyQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VDb2xvdXIoc2NlbmUsIHVwZGF0ZSkpKTtcbiAgY29sb3VyQnV0dG9uc1tjb2xvdXJCdXR0b25zLmxlbmd0aCAtIDFdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpO1xudmFyIHBhaW50aW5ncyA9IHJlcXVpcmUoJy4vcGFpbnRpbmdzJyk7XG52YXIgbG9hZCA9IHJlcXVpcmUoJy4vbG9hZCcpO1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG52YXIgbG9hZGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChwYWludGluZykge1xuICB2YXIgaW5mb3JtYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1pbmZvcm1hdGlvbicpO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKTtcbiAgaW5mb3JtYXRpb24udGV4dENvbnRlbnQgPSBwYWludGluZy5pbmZvcm1hdGlvbjtcbiAgZmluaXNoLnRleHRDb250ZW50ID0gJ0ZpbmlzaCAnICsgKHBhaW50aW5nLmlkICsgMSk7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHBhaW50aW5nID0gcGFpbnRpbmdzW3RoaXMuZGF0YXNldC5pZF07XG4gICAgaWYgKGxvYWRpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm4gZmFsc2U7XG4gICAgbG9hZGluZyA9IGxvYWQuc3RhcnQoKTtcbiAgICBtZXNoLnJlbW92ZShzY2VuZSwgdXBkYXRlKTtcbiAgICBzZXRUZXh0Q29udGVudChwYWludGluZyk7XG4gICAgbG9hZC5wYWludGluZyhwYWludGluZywgZ290R2VvKHNjZW5lLCB1cGRhdGUpKTtcbiAgICByZXR1cm4gYWN0aXZhdGUodGhpcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGFpbnRpbmcsIGdlbykge1xuICAgIHZhciBhY3RpdmVDb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9ucy0tY29sb3VycyBsaS5pcy1hY3RpdmUnKTtcbiAgICB2YXIgY29sb3VyID0gY29sb3Vycy5nZXQoYWN0aXZlQ29sb3VyKTtcbiAgICB2YXIgem1lc2ggPSBtZXNoLm5ldyhnZW8sIGNvbG91ciwgcGFpbnRpbmcpO1xuICAgIHNjZW5lLmFkZCh6bWVzaCk7XG4gICAgbG9hZGluZyA9IGxvYWQuZW5kKCk7XG4gICAgdXBkYXRlKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBmaW5pc2hCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpO1xuICBmaW5pc2hCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUZpbmlzaChzY2VuZSwgdXBkYXRlKSkpO1xuICBmaW5pc2hCdXR0b25zWzBdLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycpKTtcbn07XG4iLCJ2YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vY2xhc3NsaXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICBzbGljZShlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcykuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSk7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG5cdHZhciB0aW1lb3V0O1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHRcdHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0XHR9O1xuXHRcdHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0dGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0fTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcbiAgdCAvPSBkLzI7XG4gIGlmICh0IDwgMSkge1xuICAgIHJldHVybiBjLzIqdCp0ICsgYjtcbiAgfVxuICB0LS07XG4gIHJldHVybiAtYy8yICogKHQqKHQtMikgLSAxKSArIGI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRjID0gKHQvPWQpKnQqdDtcbiAgcmV0dXJuIGIrYyoodGMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0cyA9ICh0Lz1kKSp0O1xuICB2YXIgdGMgPSB0cyp0O1xuICByZXR1cm4gYitjKig2KnRjKnRzICsgLTE1KnRzKnRzICsgMTAqdGMpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYyk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5iaW5kLmJpbmQoRnVuY3Rpb24uY2FsbCk7XG4iLCJ2YXIgZWFzaW5nID0gcmVxdWlyZSgnLi9lYXNpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0bywgY2FsbGJhY2ssIGR1cmF0aW9uLCBlYXNpbmdOYW1lKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogZG9jdW1lbnQuYm9keTtcbiAgdmFyIHN0YXJ0ID0gZG9jLnNjcm9sbFRvcDtcbiAgdmFyIGNoYW5nZSA9IHRvIC0gc3RhcnQ7XG4gIHZhciBjdXJyZW50VGltZSA9IDA7XG4gIHZhciBpbmNyZW1lbnQgPSAyMDtcblxuICB2YXIgYW5pbWF0ZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRUaW1lICs9IGluY3JlbWVudDtcbiAgICB2YXIgdmFsID0gZWFzaW5nW2Vhc2luZ05hbWVdKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbik7XG4gICAgZG9jLnNjcm9sbFRvcCA9IHZhbDtcbiAgICBpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKTtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfTtcbiAgYW5pbWF0ZVNjcm9sbCgpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBjYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKTtcbnZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXG5mdW5jdGlvbiBvblByb2dyZXNzICh4aHIpIHtcbiAgdmFyIHBlcmNlbnRDb21wbGV0ZSA9IHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDA7XG4gIHZhciBwcm9ncmVzc0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLXByb2dyZXNzJyk7XG4gIHByb2dyZXNzQmFyLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyY2VudENvbXBsZXRlICsgJyUnO1xufVxuXG5mdW5jdGlvbiBoaWRlQmFyKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xufVxuXG5mdW5jdGlvbiBmaW5pc2hlc0J1dHRvbnMoKSB7XG4gIHJldHVybiBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LmFkZCgnaXMtbG9hZGluZycpKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lbmQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJykpO1xuICBoaWRlQmFyKCk7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnBhaW50aW5nID0gZnVuY3Rpb24gKHBhaW50aW5nLCBjYWxsYmFjaykge1xuICB2YXIgY2FjaGVkR2VvID0gY2FjaGUuZnJvbShwYWludGluZy5pZCk7XG4gIGlmIChjYWNoZWRHZW8pIHJldHVybiBjYWxsYmFjayhwYWludGluZywgY2FjaGVkR2VvKTtcbiAgbG9hZGVyLmxvYWQocGFpbnRpbmcudXJsLCBmdW5jdGlvbihnZW8pIHtcbiAgICBnZW8ubWVyZ2VWZXJ0aWNlcygpO1xuICAgIGdlby5jZW50ZXIoKTtcbiAgICBjYWNoZS51cGRhdGUocGFpbnRpbmcuaWQsIGdlbyk7XG4gICAgY2FsbGJhY2socGFpbnRpbmcsIGdlbyk7XG4gIH0sIG9uUHJvZ3Jlc3MpO1xufTtcbiIsInZhciB0ZWFyc2hlZXQgPSByZXF1aXJlKCcuL3RlYXJzaGVldCcpO1xuXG5mdW5jdGlvbiBtYWlsKGUpIHtcbiAgdmFyIGhyZWYgPSAnbWFpbHRvOmluZm9AYnJlbmRhbnNtaXRoc3R1ZGlvLmNvbT9zdWJqZWN0PVBhaW50aW5nSUQnO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKS50ZXh0Q29udGVudDtcbiAgdmFyIG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpLnRleHRDb250ZW50O1xuICB0aGlzLmhyZWYgPSBocmVmICsgJyZib2R5PScgK1xuICAgIGVuY29kZVVSSUNvbXBvbmVudChmaW5pc2gpICsgJyUyMCcgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1haWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1haWwpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9pbWcvdGV4dHVyZXMvd29vZC5qcGVnJyk7XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGNvbG91cikge1xuICByZXR1cm4gW1xuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KSxcbiAgICBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcihjb2xvdXIpLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pXG4gIF07XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBtYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdGVyaWFscycpO1xuXG5mdW5jdGlvbiBnZXRNZXNoKHNjZW5lKSB7XG4gIHJldHVybiBzY2VuZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkIGluc3RhbmNlb2YgVEhSRUUuTWVzaDtcbiAgfSlbMF07XG59XG5cbm1vZHVsZS5leHBvcnRzLnNldENvbG91ciA9IGZ1bmN0aW9uKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIGlmICghbWVzaCkgcmV0dXJuO1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICBtZXNoLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLm5ldyA9IGZ1bmN0aW9uKGdlbywgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICB2YXIgem1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW8sIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCkpO1xuICB6bWVzaC5yb3RhdGlvbi5mcm9tQXJyYXkocGFpbnRpbmcucm90YXRpb24pO1xuICB6bWVzaC5zY2FsZS5mcm9tQXJyYXkocGFpbnRpbmcuc2NhbGUpO1xuICByZXR1cm4gem1lc2g7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIHNjZW5lLnJlbW92ZShtZXNoKTtcbiAgdXBkYXRlKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBbe1xuICBpZDogMCxcbiAgdXJsOiAnL29iai9wYWludGluZy0xLmpzJyxcbiAgcm90YXRpb246IFswLjEsIC0xLjE1LCAwLjAyXSxcbiAgc2NhbGU6IFsxLCAxLCAxXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDEsXG4gIHVybDogJy9vYmovcGFpbnRpbmctMi5qcycsXG4gIHJvdGF0aW9uOiBbLTEuMTUsIDIuNjUsIC0wLjE1XSxcbiAgc2NhbGU6IFsxLjIsIDEuMiwgMS4yXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJ0F2YWlsYWJsZSBzaXplczogNDggw5cgNDAgw5cgNCBpbi4gb3IgNzIgw5cgNjAgw5cgNCBpbi4gd2l0aCBvbmUgb2YgZm91ciBmaW5pc2hlcy4gRmluaXNoIGF2YWlsYWJsZSBpbiBvbmUgb2YgdHdvIGdyZXlzLidcbn0sIHtcbiAgaWQ6IDIsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4xNSwgMS4xNSwgMS4xNV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTUuanMnLFxuICByb3RhdGlvbjogWzAuODIsIDAuMTUsIDEuNDFdLFxuICBzY2FsZTogWzEuMywgMS4zLCAxLjNdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICdBdmFpbGFibGUgc2l6ZXM6IDQ4IMOXIDQwIMOXIDQgaW4uIG9yIDcyIMOXIDYwIMOXIDQgaW4uIHdpdGggb25lIG9mIGZvdXIgZmluaXNoZXMuIEZpbmlzaCBhdmFpbGFibGUgaW4gb25lIG9mIHR3byBncmV5cy4nXG59XTtcbiIsInZhciB0ZWFyc2hlZXQgPSByZXF1aXJlKCcuL3RlYXJzaGVldCcpO1xuXG5mdW5jdGlvbiBzaG93UHJldmlldyhzY2VuZSkge1xuICB2YXIgZ2V0SnBnID0gdGVhcnNoZWV0LmdldEpwZyhzY2VuZS5yZW5kZXJlciwgc2NlbmUuY2FtZXJhLCBzY2VuZS5jb250cm9scyk7XG4gIHZhciBpbnRybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpO1xuICB2YXIgcGFpbnRpbmcgPSBpbnRyby5jaGlsZHJlblswXTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBqcGcgPSBnZXRKcGcoKTtcbiAgICBjb25zb2xlLmxvZyhqcGcpO1xuICAgIHBhaW50aW5nLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoXCInICsganBnICsgJ1wiKSc7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnc2hvdy0tcHJldmlldycpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoaWRlUHJldmlldygpIHtcbiAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93LS1wcmV2aWV3Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2hvdy1wcmV2aWV3JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UHJldmlldyhzY2VuZSkpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVQcmV2aWV3KTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDYW1lcmEoKSB7XG4gIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCByYXRpbywgMSwgMjAwMCk7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDQwO1xuICByZXR1cm4gY2FtZXJhO1xufVxuXG5mdW5jdGlvbiBhZGRMaWdodHMoc2NlbmUpIHtcbiAgdmFyIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZlOCk7XG5cdGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDEpO1xuXHRzY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDJDMkMzRCkpO1xuXHRzY2VuZS5hZGQoZGlyZWN0aW9uYWxMaWdodCk7XG59XG5cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIGNhbGxiYWNrKSB7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSk7XG5cdGNvbnRyb2xzLmRhbXBpbmcgPSAwLjI7XG4gIGNvbnRyb2xzLm5vS2V5cyA9IHRydWU7XG4gIGNvbnRyb2xzLm5vWm9vbSA9IHRydWU7XG4gIGNvbnRyb2xzLm5vUGFuID0gdHJ1ZTtcbiAgY29udHJvbHMubm9Sb3RhdGVVcCA9IGZhbHNlO1xuICBjb250cm9scy5taW5BemltdXRoQW5nbGUgPSAtTWF0aC5QSS81O1xuXHRjb250cm9scy5tYXhBemltdXRoQW5nbGUgPSBNYXRoLlBJLzEuNTtcbiAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spO1xuICByZXR1cm4gY29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSkge1xuICByZXR1cm4gbmV3IFRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHMoY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICBhbHBoYTogdHJ1ZSxcbiAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWVcbiAgfSk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZShjYW1lcmEsIHJlbmRlcmVyLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHQgIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBjYWxsYmFjaygpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKTtcbiAgdmFyIGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpO1xuICB2YXIgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgdmFyIHVwZGF0ZSA9IHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XG4gIHZhciBjb250cm9scyA9IHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCA/XG4gICAgICAgIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIHVwZGF0ZSkgOlxuICAgICAgICBhZGREZXZpY2VDb250cm9scyhjYW1lcmEpO1xuXG4gIGFkZExpZ2h0cyhzY2VuZSk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbiAgYW5pbWF0ZShzY2VuZS5jb250cm9scyk7XG4gIHNjZW5lLnVwZGF0ZSgpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKTtcbiAgcmV0dXJuIHNjZW5lO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgfTtcbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0O1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKTtcbnZhciBzY3JvbGwgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbnZhciBwcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG52YXIgbWFpbCA9IHJlcXVpcmUoJy4vbWFpbCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDc2Nykge1xuICAgIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gICAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpO1xuICAgIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSk7XG4gICAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgfVxuICBzY3JvbGwuaW5pdCgpO1xuICBtYWlsLmluaXQoKTtcbn0pO1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIGNsYXNzTGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbGliL2RlYm91bmNlJyk7XG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgaWYgKHNjcm9sbCA+PSB3aW5IZWlnaHQpIGRvRml4KCk7XG59XG5cbnZhciBkb1VuZGVybGF5ID0gZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gIHZhciB0b3AgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLnVuZGVybGF5LXRvcCcpLmNoaWxkcmVuKTtcbiAgdmFyIGJvdHRvbVNTID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVuZGVybGF5IC5ib3R0b20tLXNzJykuY2hpbGRyZW4pO1xuICB2YXIgYm90dG9tQWJvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tYWJvdXQgbGknKTtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciBhYm91dFBvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1hYm91dCcpLm9mZnNldFRvcDtcbiAgdG9wLmZvckVhY2goY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpO1xuICBib3R0b21TUy5mb3JFYWNoKGNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgYm90dG9tQWJvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gIHRvcFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqdG9wLmxlbmd0aCldLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICBpZiAoYWJvdXRQb3MgIT09IDAgJiYgYWJvdXRQb3MgPD0gc2Nyb2xsKSB7XG4gICAgYm90dG9tQWJvdXQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gIH0gZWxzZSB7XG4gICAgYm90dG9tU1NbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmJvdHRvbVNTLmxlbmd0aCldLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9XG59LCAxNSk7XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIGJvZHkuY2xhc3NMaXN0LmFkZCgnZml4LXBhZ2UnKTtcbiAgaW50cm8uY2xhc3NMaXN0LnJlbW92ZSgnanMtbm90LXNjcm9sbGVkJyk7XG4gIGJvZHkuc2Nyb2xsVG9wIC09IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwpO1xuICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBzaG93QWJvdXQoKTtcbiAgfSwgNDAwKTtcbn1cblxuZnVuY3Rpb24gc2hvd0Fib3V0KCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0tYWJvdXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLWFib3V0Jyk7XG59XG5cbmZ1bmN0aW9uIGNsaWNrTmF2KGUpIHtcbiAgc2hvd0Fib3V0KCk7XG4gIHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgdmFyIGlzRml4ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaXgtcGFnZScpO1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGhyZWYpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Njcm9sbCcpKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBzY3JvbGxJbnRybygpIHtcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhaW50aW5ncycpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uICgpIHt9LCA2MDAsICdlYXNlSW5PdXRRdWFkJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNpZGViYXIoZSkge1xuICB0aGlzLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlZCcpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5hdnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2lkZWJhci0tbGVmdCBhJykpO1xuICB2YXIgdG9nZ2xlcyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EuanMtdG8tdG9nZ2xlJykpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRvVW5kZXJsYXkpO1xuICBkb1VuZGVybGF5KCk7XG4gIG5hdnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2xpY2tOYXYpKTtcbiAgdG9nZ2xlcy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCB0b2dnbGVTaWRlYmFyKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRyby5qcy1ub3Qtc2Nyb2xsZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjcm9sbEludHJvKTtcbn07XG4iLCJmdW5jdGlvbiBzYXZlVGVhclNoZWV0KHJlbmRlcmVyLCBjYW1lcmEsIGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIganBnO1xuICAgIHZhciBwcmV2UG9zaXRpb24gPSBbXG4gICAgICBjYW1lcmEucG9zaXRpb24ueCxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi55LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnpcbiAgICBdO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkoWzAsIDAsIDQwXSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAganBnID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHByZXZQb3NpdGlvbik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIGpwZztcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SnBnID0gc2F2ZVRlYXJTaGVldDtcbiJdfQ==
