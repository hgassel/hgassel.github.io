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
var loader = new THREE.JSONLoader();
var binLoader = new THREE.BinaryLoader();

function onProgress (item, loaded, total) {
  var percentComplete = loaded / total * 100;
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
  binLoader.load('/obj/painting3.js', function(geo) {
    geo.mergeVertices();
    geo.center();
    cache.update(painting.id, geo);
    callback(painting, geo);
  }, '/img/textures/wood.jpeg', '/obj/');
};

},{"./cache":1,"./lib/classlist":5,"./lib/liberate":9}],12:[function(require,module,exports){
var tearsheet = require('./tearsheet');

function mail(e) {
  var href = 'mailto:info@brendansmithstudio.com?subject=PaintingID&body=';
  var finish = document.querySelector('.box-finish').textContent;
  var name = document.querySelector('.box-colour').textContent;
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
  information: ''
}, {
  id: 1,
  url: '/obj/painting-2.js',
  rotation: [-1.15, 2.65, -0.15],
  scale: [1.2, 1.2, 1.2],
  reversedMesh: false,
  cache: false,
  information: ''
}, {
  id: 2,
  url: '/obj/painting-4.js',
  rotation: [0.85, 0.12, 1.45],
  scale: [1.15, 1.15, 1.15],
  reversedMesh: false,
  cache: false,
  information: ''
}, {
  id: 3,
  url: '/obj/painting-5.js',
  rotation: [0.82, 0.15, 1.41],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc3RvcmFnZSA9IFtmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZV07XG5cbm1vZHVsZS5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHN0b3JhZ2VbaWRdO1xufTtcblxubW9kdWxlLmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKGlkLCBnZW8pIHtcbiAgc3RvcmFnZVtpZF0gPSBnZW87XG59O1xuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKTtcbnZhciBjbGFzc0xpc3QgPSByZXF1aXJlKCcuL2xpYi9jbGFzc2xpc3QnKTtcbnZhciBtZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKTtcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQoZWxlbWVudCkge1xuICB2YXIgY29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKTtcbiAgdmFyIGNvbG91ck5hbWUgPSBlbGVtZW50LmRhdGFzZXQubmFtZTtcbiAgY29sb3VyLnRleHRDb250ZW50ID0gY29sb3VyTmFtZTtcbn1cblxudmFyIGdldENvbG91ciA9IG1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgLy8gdmFyIGNsYXNzZXMgPSBzbGljZShlbGVtZW50LmNsYXNzTGlzdClcbiAgLy8gcmV0dXJuICcjJyArIGNsYXNzZXMucmVkdWNlKGZ1bmN0aW9uIChjb2xvdXIsIGNsYXNzTmFtZSkge1xuICAvLyAgIGlmIChjbGFzc05hbWUuaW5kZXhPZignY29sb3VyLS0nKSAhPT0gLTEpXG4gIC8vICAgICBjb2xvdXIgPSBjbGFzc05hbWUuc3BsaXQoJ2NvbG91ci0tJylbMV1cbiAgLy8gICByZXR1cm4gY29sb3VyXG4gIC8vIH0sICcnKVxuICByZXR1cm4gZWxlbWVudC5kYXRhc2V0LmNvbG91cjtcbn07XG5cbmZ1bmN0aW9uIHN3YXBIZWFkZXIoKSB7XG4gIHZhciB0b3AgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLnVuZGVybGF5LXRvcCcpLmNoaWxkcmVuKTtcbiAgdmFyIGluZGV4ID0gdG9wLnJlZHVjZShmdW5jdGlvbiAoaSwgbGksIGopIHtcbiAgICBpZiAobGkuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuIGo7XG4gICAgcmV0dXJuIGk7XG4gIH0sIC0xKSArIDE7XG4gIGlmIChpbmRleCA+IHRvcC5sZW5ndGggLSAxKSBpbmRleCA9IDA7XG4gIHRvcC5mb3JFYWNoKGNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgdG9wW2luZGV4XS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm47XG4gICAgdmFyIGNvbG91ciA9IGdldENvbG91cih0aGlzKTtcbiAgICB2YXIgZ3JhZGllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JhZGllbnQuY29sb3VyLS0nICsgY29sb3VyLnN1YnN0cmluZygxKSk7XG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1maW5pc2hlcyAuYnV0dG9uLmlzLWFjdGl2ZScpO1xuICAgIGFjdGl2YXRlKHRoaXMpO1xuICAgIGFjdGl2YXRlKGdyYWRpZW50KTtcbiAgICBzd2FwSGVhZGVyKCk7XG4gICAgc2V0VGV4dENvbnRlbnQodGhpcyk7XG4gICAgaWYgKGZpbmlzaClcbiAgICAgIG1lc2guc2V0Q29sb3VyKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nc1tmaW5pc2guZGF0YXNldC5pZF0pO1xuICAgIHVwZGF0ZSgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgY29sb3VyQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1jb2xvdXJzIGxpJykpO1xuICBjb2xvdXJCdXR0b25zLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNoYW5nZUNvbG91cihzY2VuZSwgdXBkYXRlKSkpO1xuICBjb2xvdXJCdXR0b25zW2NvbG91ckJ1dHRvbnMubGVuZ3RoIC0gMV0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpO1xufTtcbiIsInZhciBldmVudExpc3RlbmVycyA9IHJlcXVpcmUoJy4vbGliL2V2ZW50bGlzdGVuZXJzJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCcuL2xpYi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBhY3RpdmF0ZSA9IHJlcXVpcmUoJy4vbGliL2FjdGl2YXRlJyk7XG52YXIgcGFpbnRpbmdzID0gcmVxdWlyZSgnLi9wYWludGluZ3MnKTtcbnZhciBsb2FkID0gcmVxdWlyZSgnLi9sb2FkJyk7XG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcbnZhciBsb2FkaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KHBhaW50aW5nKSB7XG4gIHZhciBpbmZvcm1hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLWluZm9ybWF0aW9uJyk7XG4gIHZhciBmaW5pc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWZpbmlzaCcpO1xuICBpbmZvcm1hdGlvbi50ZXh0Q29udGVudCA9IHBhaW50aW5nLmluZm9ybWF0aW9uO1xuICBmaW5pc2gudGV4dENvbnRlbnQgPSAnRmluaXNoICcgKyAocGFpbnRpbmcuaWQgKyAxKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcGFpbnRpbmcgPSBwYWludGluZ3NbdGhpcy5kYXRhc2V0LmlkXTtcbiAgICBpZiAobG9hZGluZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybiBmYWxzZTtcbiAgICBsb2FkaW5nID0gbG9hZC5zdGFydCgpO1xuICAgIG1lc2gucmVtb3ZlKHNjZW5lLCB1cGRhdGUpO1xuICAgIHNldFRleHRDb250ZW50KHBhaW50aW5nKTtcbiAgICBsb2FkLnBhaW50aW5nKHBhaW50aW5nLCBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkpO1xuICAgIHJldHVybiBhY3RpdmF0ZSh0aGlzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ290R2VvKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYWludGluZywgZ2VvKSB7XG4gICAgdmFyIGFjdGl2ZUNvbG91ciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1jb2xvdXJzIGxpLmlzLWFjdGl2ZScpO1xuICAgIHZhciBjb2xvdXIgPSBjb2xvdXJzLmdldChhY3RpdmVDb2xvdXIpO1xuICAgIHZhciB6bWVzaCA9IG1lc2gubmV3KGdlbywgY29sb3VyLCBwYWludGluZyk7XG4gICAgc2NlbmUuYWRkKHptZXNoKTtcbiAgICBsb2FkaW5nID0gbG9hZC5lbmQoKTtcbiAgICB1cGRhdGUoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIGZpbmlzaEJ1dHRvbnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnV0dG9ucy0tZmluaXNoZXMgbGknKSk7XG4gIGZpbmlzaEJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlRmluaXNoKHNjZW5lLCB1cGRhdGUpKSk7XG4gIGZpbmlzaEJ1dHRvbnNbMF0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJykpO1xufTtcbiIsInZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9jbGFzc2xpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHNsaWNlKGVsZW1lbnQucGFyZW50Tm9kZS5jaGlsZE5vZGVzKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy50b2dnbGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUobmFtZSk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcblx0dmFyIHRpbWVvdXQ7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0dmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHRcdH07XG5cdFx0dmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG5cdFx0d2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuXHRcdGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHR9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICB0IC89IGQvMjtcbiAgaWYgKHQgPCAxKSB7XG4gICAgcmV0dXJuIGMvMip0KnQgKyBiO1xuICB9XG4gIHQtLTtcbiAgcmV0dXJuIC1jLzIgKiAodCoodC0yKSAtIDEpICsgYjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbkN1YmljID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdGMgPSAodC89ZCkqdCp0O1xuICByZXR1cm4gYitjKih0Yyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcbiAgdmFyIHRzID0gKHQvPWQpKnQ7XG4gIHZhciB0YyA9IHRzKnQ7XG4gIHJldHVybiBiK2MqKDYqdGMqdHMgKyAtMTUqdHMqdHMgKyAxMCp0Yyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYWRkID0gZnVuY3Rpb24gKGV2ZW50LCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLmJpbmQuYmluZChGdW5jdGlvbi5jYWxsKTtcbiIsInZhciBlYXNpbmcgPSByZXF1aXJlKCcuL2Vhc2luZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRvLCBjYWxsYmFjaywgZHVyYXRpb24sIGVhc2luZ05hbWUpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5O1xuICB2YXIgc3RhcnQgPSBkb2Muc2Nyb2xsVG9wO1xuICB2YXIgY2hhbmdlID0gdG8gLSBzdGFydDtcbiAgdmFyIGN1cnJlbnRUaW1lID0gMDtcbiAgdmFyIGluY3JlbWVudCA9IDIwO1xuXG4gIHZhciBhbmltYXRlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudFRpbWUgKz0gaW5jcmVtZW50O1xuICAgIHZhciB2YWwgPSBlYXNpbmdbZWFzaW5nTmFtZV0oY3VycmVudFRpbWUsIHN0YXJ0LCBjaGFuZ2UsIGR1cmF0aW9uKTtcbiAgICBkb2Muc2Nyb2xsVG9wID0gdmFsO1xuICAgIGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTY3JvbGwpO1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9O1xuICBhbmltYXRlU2Nyb2xsKCk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGNsYXNzbGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpO1xudmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG52YXIgYmluTG9hZGVyID0gbmV3IFRIUkVFLkJpbmFyeUxvYWRlcigpO1xuXG5mdW5jdGlvbiBvblByb2dyZXNzIChpdGVtLCBsb2FkZWQsIHRvdGFsKSB7XG4gIHZhciBwZXJjZW50Q29tcGxldGUgPSBsb2FkZWQgLyB0b3RhbCAqIDEwMDtcbiAgdmFyIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmctcHJvZ3Jlc3MnKTtcbiAgcHJvZ3Jlc3NCYXIucGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjZW50Q29tcGxldGUgKyAnJSc7XG59XG5cbmZ1bmN0aW9uIGhpZGVCYXIoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaGVzQnV0dG9ucygpIHtcbiAgcmV0dXJuIHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgZmluaXNoZXNCdXR0b25zKCkuZm9yRWFjaChjbGFzc2xpc3QuYWRkKCdpcy1sb2FkaW5nJykpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5yZW1vdmUoJ2lzLWxvYWRpbmcnKSk7XG4gIGhpZGVCYXIoKTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMucGFpbnRpbmcgPSBmdW5jdGlvbiAocGFpbnRpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBjYWNoZWRHZW8gPSBjYWNoZS5mcm9tKHBhaW50aW5nLmlkKTtcbiAgaWYgKGNhY2hlZEdlbykgcmV0dXJuIGNhbGxiYWNrKHBhaW50aW5nLCBjYWNoZWRHZW8pO1xuICBiaW5Mb2FkZXIubG9hZCgnL29iai9wYWludGluZzMuanMnLCBmdW5jdGlvbihnZW8pIHtcbiAgICBnZW8ubWVyZ2VWZXJ0aWNlcygpO1xuICAgIGdlby5jZW50ZXIoKTtcbiAgICBjYWNoZS51cGRhdGUocGFpbnRpbmcuaWQsIGdlbyk7XG4gICAgY2FsbGJhY2socGFpbnRpbmcsIGdlbyk7XG4gIH0sICcvaW1nL3RleHR1cmVzL3dvb2QuanBlZycsICcvb2JqLycpO1xufTtcbiIsInZhciB0ZWFyc2hlZXQgPSByZXF1aXJlKCcuL3RlYXJzaGVldCcpO1xuXG5mdW5jdGlvbiBtYWlsKGUpIHtcbiAgdmFyIGhyZWYgPSAnbWFpbHRvOmluZm9AYnJlbmRhbnNtaXRoc3R1ZGlvLmNvbT9zdWJqZWN0PVBhaW50aW5nSUQmYm9keT0nO1xuICB2YXIgZmluaXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1maW5pc2gnKS50ZXh0Q29udGVudDtcbiAgdmFyIG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpLnRleHRDb250ZW50O1xuICB2YXIgZnVsbERldGFpbHMgPSBlbmNvZGVVUklDb21wb25lbnQoZmluaXNoKSArICclMjAnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpO1xuICB2YXIgYm9keSA9IGVuY29kZVVSSUNvbXBvbmVudCgnSSBhbSBpbnRlcmVzdGVkIGluIGFjcXVpcmluZyBhIGN1c3RvbSA0OCB4IDQwIFhYWFhYWCBwYWludGluZy4gSSBsb29rIGZvcndhcmQgdG8gaGVhcmluZyBmcm9tIFBhaW50aW5nSUQgaW4gdGhlIG5leHQgMjQgaG91cnMuIE15IGZ1bGwgY29udGFjdCBkZXRhaWxzIGFyZSBpbmNsdWRlZCBiZWxvdzpcXG5cXG5QaG9uZTpcXG5FbWFpbDonKTtcbiAgYm9keSA9IGJvZHkuc3BsaXQoJ1hYWFhYWCcpLmpvaW4oZnVsbERldGFpbHMpO1xuICB0aGlzLmhyZWYgPSBocmVmICsgYm9keTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWFpbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbWFpbCk7XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnL2ltZy90ZXh0dXJlcy93b29kLmpwZWcnKTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIHJldHVybiBbXG4gICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pLFxuICAgIG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKGNvbG91ciksXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgfSlcbiAgXTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIG1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0ZXJpYWxzJyk7XG5cbmZ1bmN0aW9uIGdldE1lc2goc2NlbmUpIHtcbiAgcmV0dXJuIHNjZW5lLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQgaW5zdGFuY2VvZiBUSFJFRS5NZXNoO1xuICB9KVswXTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Q29sb3VyID0gZnVuY3Rpb24oc2NlbmUsIGNvbG91ciwgcGFpbnRpbmcpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgaWYgKCFtZXNoKSByZXR1cm47XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIG1lc2gubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChtYXQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMubmV3ID0gZnVuY3Rpb24oZ2VvLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtYXQgPSBtYXRlcmlhbHMuZ2V0KGNvbG91cik7XG4gIGlmIChwYWludGluZy5yZXZlcnNlZE1lc2gpIG1hdCA9IG1hdC5yZXZlcnNlKCk7XG4gIHZhciB6bWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KSk7XG4gIHptZXNoLnJvdGF0aW9uLmZyb21BcnJheShwYWludGluZy5yb3RhdGlvbik7XG4gIHptZXNoLnNjYWxlLmZyb21BcnJheShwYWludGluZy5zY2FsZSk7XG4gIHJldHVybiB6bWVzaDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uKHNjZW5lLCB1cGRhdGUpIHtcbiAgdmFyIG1lc2ggPSBnZXRNZXNoKHNjZW5lKTtcbiAgc2NlbmUucmVtb3ZlKG1lc2gpO1xuICB1cGRhdGUoKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFt7XG4gIGlkOiAwLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTEuanMnLFxuICByb3RhdGlvbjogWzAuMSwgLTEuMTUsIDAuMDJdLFxuICBzY2FsZTogWzEsIDEsIDFdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufSwge1xuICBpZDogMSxcbiAgdXJsOiAnL29iai9wYWludGluZy0yLmpzJyxcbiAgcm90YXRpb246IFstMS4xNSwgMi42NSwgLTAuMTVdLFxuICBzY2FsZTogWzEuMiwgMS4yLCAxLjJdLFxuICByZXZlcnNlZE1lc2g6IGZhbHNlLFxuICBjYWNoZTogZmFsc2UsXG4gIGluZm9ybWF0aW9uOiAnJ1xufSwge1xuICBpZDogMixcbiAgdXJsOiAnL29iai9wYWludGluZy00LmpzJyxcbiAgcm90YXRpb246IFswLjg1LCAwLjEyLCAxLjQ1XSxcbiAgc2NhbGU6IFsxLjE1LCAxLjE1LCAxLjE1XSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn0sIHtcbiAgaWQ6IDMsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNS5qcycsXG4gIHJvdGF0aW9uOiBbMC44MiwgMC4xNSwgMS40MV0sXG4gIHNjYWxlOiBbMS4zLCAxLjMsIDEuM10sXG4gIHJldmVyc2VkTWVzaDogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn1dO1xuIiwidmFyIHRlYXJzaGVldCA9IHJlcXVpcmUoJy4vdGVhcnNoZWV0Jyk7XG5cbmZ1bmN0aW9uIHNob3dQcmV2aWV3KHNjZW5lKSB7XG4gIHZhciBnZXRKcGcgPSB0ZWFyc2hlZXQuZ2V0SnBnKHNjZW5lLnJlbmRlcmVyLCBzY2VuZS5jYW1lcmEsIHNjZW5lLmNvbnRyb2xzKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIHZhciBwYWludGluZyA9IGludHJvLmNoaWxkcmVuWzBdO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpwZyA9IGdldEpwZygpO1xuICAgIGNvbnNvbGUubG9nKGpwZyk7XG4gICAgcGFpbnRpbmcuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybChcIicgKyBqcGcgKyAnXCIpJztcbiAgICBpbnRyby5jbGFzc0xpc3QuYWRkKCdzaG93LS1wcmV2aWV3Jyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhpZGVQcmV2aWV3KCkge1xuICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctLXByZXZpZXcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNjZW5lKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaG93LXByZXZpZXcnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dQcmV2aWV3KHNjZW5lKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVByZXZpZXcpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpIHtcbiAgdmFyIHJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIHJhdGlvLCAxLCAyMDAwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueSA9IDA7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDA7XG4gIHJldHVybiBjYW1lcmE7XG59XG5cbmZ1bmN0aW9uIGFkZExpZ2h0cyhzY2VuZSkge1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmU4KTtcblx0ZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoMCwgMSwgMSk7XG5cdHNjZW5lLmFkZChuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MkMyQzNEKSk7XG5cdHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KTtcbn1cblxuZnVuY3Rpb24gYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgY2FsbGJhY2spIHtcbiAgdmFyIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhKTtcblx0Y29udHJvbHMuZGFtcGluZyA9IDAuMjtcbiAgY29udHJvbHMubm9LZXlzID0gdHJ1ZTtcbiAgY29udHJvbHMubm9ab29tID0gdHJ1ZTtcbiAgY29udHJvbHMubm9QYW4gPSB0cnVlO1xuICBjb250cm9scy5ub1JvdGF0ZVVwID0gZmFsc2U7XG4gIGNvbnRyb2xzLm1pbkF6aW11dGhBbmdsZSA9IC1NYXRoLlBJLzU7XG5cdGNvbnRyb2xzLm1heEF6aW11dGhBbmdsZSA9IE1hdGguUEkvMS41O1xuICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gIHJldHVybiBjb250cm9scztcbn1cblxuZnVuY3Rpb24gYWRkRGV2aWNlQ29udHJvbHMoY2FtZXJhKSB7XG4gIHJldHVybiBuZXcgVEhSRUUuRGV2aWNlT3JpZW50YXRpb25Db250cm9scyhjYW1lcmEpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZW5kZXJlcigpIHtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgIGFscGhhOiB0cnVlLFxuICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZVxuICB9KTtcblx0cmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyk7XG5cdHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIHJldHVybiByZW5kZXJlcjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKGNhbWVyYSwgcmVuZGVyZXIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcblx0ICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdCAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0ICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGNhbGxiYWNrKCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNjZW5lKCkge1xuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbmRlcicpO1xuICB2YXIgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKCk7XG4gIHZhciByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKCk7XG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICB2YXIgdXBkYXRlID0gcmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcbiAgdmFyIGNvbnRyb2xzID0gd2luZG93LmlubmVyV2lkdGggPiAxMDI0ID9cbiAgICAgICAgYWRkQ29udHJvbHMoc2NlbmUsIGNhbWVyYSwgdXBkYXRlKSA6XG4gICAgICAgIGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSk7XG5cbiAgYWRkTGlnaHRzKHNjZW5lKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICByZXR1cm4ge1xuICAgIGNhbWVyYTogY2FtZXJhLFxuICAgIGNvbnRyb2xzOiBjb250cm9scyxcbiAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgc2NlbmU6IHNjZW5lXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2NlbmUgPSBjcmVhdGVTY2VuZSgpO1xuICBhbmltYXRlKHNjZW5lLmNvbnRyb2xzKTtcbiAgc2NlbmUudXBkYXRlKCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZShcbiAgICBzY2VuZS5jYW1lcmEsXG4gICAgc2NlbmUucmVuZGVyZXIsXG4gICAgc2NlbmUudXBkYXRlXG4gICkpO1xuICByZXR1cm4gc2NlbmU7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlKGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZShjb250cm9scykpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9O1xufVxuIiwidmFyIGNyZWF0ZVNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZScpLmluaXQ7XG52YXIgY29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGZpbmlzaGVzID0gcmVxdWlyZSgnLi9maW5pc2hlcycpO1xudmFyIHNjcm9sbCA9IHJlcXVpcmUoJy4vc2lkZWJhcicpO1xudmFyIHByZXZpZXcgPSByZXF1aXJlKCcuL3ByZXZpZXcnKTtcbnZhciBtYWlsID0gcmVxdWlyZSgnLi9tYWlsJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMSkge1xuICAgIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gICAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpO1xuICAgIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSk7XG4gICAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgfVxuICBzY3JvbGwuaW5pdCgpO1xuICBtYWlsLmluaXQoKTtcbn0pO1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIGNsYXNzTGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbGliL2RlYm91bmNlJyk7XG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgaWYgKHNjcm9sbCA+PSB3aW5IZWlnaHQpIGRvRml4KCk7XG59XG5cbmZ1bmN0aW9uIGRvVW5kZXJsYXkoKSB7XG4gIHZhciBib3R0b21TUyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51bmRlcmxheSAuYm90dG9tLS1zcyBsaScpO1xuICB2YXIgYm90dG9tQWJvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tYWJvdXQgbGknKTtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciBhYm91dFBvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1hYm91dCcpLm9mZnNldFRvcDtcbiAgaWYgKGFib3V0UG9zICE9PSAwICYmIGFib3V0UG9zIDw9IHNjcm9sbCkge1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9IGVsc2Uge1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRvRml4KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgdmFyIGludHJvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tLWludHJvJyk7XG4gIGJvZHkuY2xhc3NMaXN0LmFkZCgnZml4LXBhZ2UnKTtcbiAgaW50cm8uY2xhc3NMaXN0LnJlbW92ZSgnanMtbm90LXNjcm9sbGVkJyk7XG4gIGJvZHkuc2Nyb2xsVG9wIC09IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwpO1xuICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBzaG93QWJvdXQoKTtcbiAgfSwgNDAwKTtcbn1cblxuZnVuY3Rpb24gc2hvd0Fib3V0KCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0tYWJvdXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLWFib3V0Jyk7XG59XG5cbmZ1bmN0aW9uIGNsaWNrTmF2KGUpIHtcbiAgc2hvd0Fib3V0KCk7XG4gIHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgdmFyIGlzRml4ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaXgtcGFnZScpO1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGhyZWYpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Njcm9sbCcpKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBzY3JvbGxJbnRybygpIHtcbiAgdmFyIHRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhaW50aW5ncycpLm9mZnNldFRvcDtcbiAgc2Nyb2xsVG8odG8sIGZ1bmN0aW9uICgpIHt9LCA2MDAsICdlYXNlSW5PdXRRdWFkJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNpZGViYXIoZSkge1xuICB0aGlzLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlZCcpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5hdnMgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2lkZWJhci0tbGVmdCBhJykpO1xuICB2YXIgdG9nZ2xlcyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EuanMtdG8tdG9nZ2xlJykpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRvVW5kZXJsYXkpO1xuICBkb1VuZGVybGF5KCk7XG4gIG5hdnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2xpY2tOYXYpKTtcbiAgdG9nZ2xlcy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCB0b2dnbGVTaWRlYmFyKSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRyby5qcy1ub3Qtc2Nyb2xsZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjcm9sbEludHJvKTtcbn07XG4iLCJmdW5jdGlvbiBzYXZlVGVhclNoZWV0KHJlbmRlcmVyLCBjYW1lcmEsIGNvbnRyb2xzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIganBnO1xuICAgIHZhciBwcmV2UG9zaXRpb24gPSBbXG4gICAgICBjYW1lcmEucG9zaXRpb24ueCxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi55LFxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnpcbiAgICBdO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkoWzAsIDAsIDQwXSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAganBnID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHByZXZQb3NpdGlvbik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIGpwZztcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SnBnID0gc2F2ZVRlYXJTaGVldDtcbiJdfQ==
