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

function swapHeader() {
  var top = slice(document.querySelector('.underlay .underlay-top').children);
  window.setInterval(function() {
    top.forEach(classList.remove('is-active'));
    top[Math.floor(Math.random()*top.length)].classList.add('is-active');
  }, 800);
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
  swapHeader();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FjaGUuanMiLCJzcmMvanMvY29sb3Vycy5qcyIsInNyYy9qcy9maW5pc2hlcy5qcyIsInNyYy9qcy9saWIvYWN0aXZhdGUuanMiLCJzcmMvanMvbGliL2NsYXNzbGlzdC5qcyIsInNyYy9qcy9saWIvZGVib3VuY2UuanMiLCJzcmMvanMvbGliL2Vhc2luZy5qcyIsInNyYy9qcy9saWIvZXZlbnRsaXN0ZW5lcnMuanMiLCJzcmMvanMvbGliL2xpYmVyYXRlLmpzIiwic3JjL2pzL2xpYi9zY3JvbGx0by5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL21haWwuanMiLCJzcmMvanMvbWF0ZXJpYWxzLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcGFpbnRpbmdzLmpzIiwic3JjL2pzL3ByZXZpZXcuanMiLCJzcmMvanMvc2NlbmUuanMiLCJzcmMvanMvc2NyaXB0LmpzIiwic3JjL2pzL3NpZGViYXIuanMiLCJzcmMvanMvdGVhcnNoZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBzdG9yYWdlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTtcblxubW9kdWxlLmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gc3RvcmFnZVtpZF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGUgPSBmdW5jdGlvbiAoaWQsIGdlbykge1xuICBzdG9yYWdlW2lkXSA9IGdlbztcbn07XG4iLCJ2YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgYWN0aXZhdGUgPSByZXF1aXJlKCcuL2xpYi9hY3RpdmF0ZScpO1xudmFyIG1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpO1xuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChlbGVtZW50KSB7XG4gIHZhciBjb2xvdXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm94LWNvbG91cicpO1xuICB2YXIgY29sb3VyTmFtZSA9IGVsZW1lbnQuZGF0YXNldC5uYW1lO1xuICBjb2xvdXIudGV4dENvbnRlbnQgPSBjb2xvdXJOYW1lO1xufVxuXG52YXIgZ2V0Q29sb3VyID0gbW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAvLyB2YXIgY2xhc3NlcyA9IHNsaWNlKGVsZW1lbnQuY2xhc3NMaXN0KVxuICAvLyByZXR1cm4gJyMnICsgY2xhc3Nlcy5yZWR1Y2UoZnVuY3Rpb24gKGNvbG91ciwgY2xhc3NOYW1lKSB7XG4gIC8vICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdjb2xvdXItLScpICE9PSAtMSlcbiAgLy8gICAgIGNvbG91ciA9IGNsYXNzTmFtZS5zcGxpdCgnY29sb3VyLS0nKVsxXVxuICAvLyAgIHJldHVybiBjb2xvdXJcbiAgLy8gfSwgJycpXG4gIHJldHVybiBlbGVtZW50LmRhdGFzZXQuY29sb3VyO1xufTtcblxuZnVuY3Rpb24gY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSByZXR1cm47XG4gICAgdmFyIGNvbG91ciA9IGdldENvbG91cih0aGlzKTtcbiAgICB2YXIgZ3JhZGllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JhZGllbnQuY29sb3VyLS0nICsgY29sb3VyLnN1YnN0cmluZygxKSk7XG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b25zLS1maW5pc2hlcyAuYnV0dG9uLmlzLWFjdGl2ZScpO1xuICAgIGFjdGl2YXRlKHRoaXMpO1xuICAgIGFjdGl2YXRlKGdyYWRpZW50KTtcbiAgICBzZXRUZXh0Q29udGVudCh0aGlzKTtcbiAgICBpZiAoZmluaXNoKVxuICAgICAgbWVzaC5zZXRDb2xvdXIoc2NlbmUsIGNvbG91ciwgcGFpbnRpbmdzW2ZpbmlzaC5kYXRhc2V0LmlkXSk7XG4gICAgdXBkYXRlKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBjb2xvdXJCdXR0b25zID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWNvbG91cnMgbGknKSk7XG4gIGNvbG91ckJ1dHRvbnMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgY2hhbmdlQ29sb3VyKHNjZW5lLCB1cGRhdGUpKSk7XG4gIGNvbG91ckJ1dHRvbnNbY29sb3VyQnV0dG9ucy5sZW5ndGggLSAxXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSk7XG59O1xuIiwidmFyIGV2ZW50TGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saWIvZXZlbnRsaXN0ZW5lcnMnKTtcbnZhciBzbGljZSA9IHJlcXVpcmUoJy4vbGliL2xpYmVyYXRlJykoW10uc2xpY2UpO1xudmFyIGFjdGl2YXRlID0gcmVxdWlyZSgnLi9saWIvYWN0aXZhdGUnKTtcbnZhciBwYWludGluZ3MgPSByZXF1aXJlKCcuL3BhaW50aW5ncycpO1xudmFyIGxvYWQgPSByZXF1aXJlKCcuL2xvYWQnKTtcbnZhciBjb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJyk7XG52YXIgbWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xudmFyIGxvYWRpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpIHtcbiAgdmFyIGluZm9ybWF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItaW5mb3JtYXRpb24nKTtcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJyk7XG4gIGluZm9ybWF0aW9uLnRleHRDb250ZW50ID0gcGFpbnRpbmcuaW5mb3JtYXRpb247XG4gIGZpbmlzaC50ZXh0Q29udGVudCA9ICdGaW5pc2ggJyArIChwYWludGluZy5pZCArIDEpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIHZhciBwYWludGluZyA9IHBhaW50aW5nc1t0aGlzLmRhdGFzZXQuaWRdO1xuICAgIGlmIChsb2FkaW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkgcmV0dXJuIGZhbHNlO1xuICAgIGxvYWRpbmcgPSBsb2FkLnN0YXJ0KCk7XG4gICAgbWVzaC5yZW1vdmUoc2NlbmUsIHVwZGF0ZSk7XG4gICAgc2V0VGV4dENvbnRlbnQocGFpbnRpbmcpO1xuICAgIGxvYWQucGFpbnRpbmcocGFpbnRpbmcsIGdvdEdlbyhzY2VuZSwgdXBkYXRlKSk7XG4gICAgcmV0dXJuIGFjdGl2YXRlKHRoaXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnb3RHZW8oc2NlbmUsIHVwZGF0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBhaW50aW5nLCBnZW8pIHtcbiAgICB2YXIgYWN0aXZlQ29sb3VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbnMtLWNvbG91cnMgbGkuaXMtYWN0aXZlJyk7XG4gICAgdmFyIGNvbG91ciA9IGNvbG91cnMuZ2V0KGFjdGl2ZUNvbG91cik7XG4gICAgdmFyIHptZXNoID0gbWVzaC5uZXcoZ2VvLCBjb2xvdXIsIHBhaW50aW5nKTtcbiAgICBzY2VuZS5hZGQoem1lc2gpO1xuICAgIGxvYWRpbmcgPSBsb2FkLmVuZCgpO1xuICAgIHVwZGF0ZSgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHVwZGF0ZSkge1xuICB2YXIgZmluaXNoQnV0dG9ucyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b25zLS1maW5pc2hlcyBsaScpKTtcbiAgZmluaXNoQnV0dG9ucy5mb3JFYWNoKGV2ZW50TGlzdGVuZXJzLmFkZCgnY2xpY2snLCBjaGFuZ2VGaW5pc2goc2NlbmUsIHVwZGF0ZSkpKTtcbiAgZmluaXNoQnV0dG9uc1swXS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSk7XG59O1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWJlcmF0ZScpKFtdLnNsaWNlKTtcbnZhciBjbGFzc2xpc3QgPSByZXF1aXJlKCcuL2NsYXNzbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgc2xpY2UoZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtYWN0aXZlJykpO1xuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnRvZ2dsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShuYW1lKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuXHR2YXIgdGltZW91dDtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcztcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0aWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdFx0fTtcblx0XHR2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcblx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cdFx0aWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG4gIHQgLz0gZC8yO1xuICBpZiAodCA8IDEpIHtcbiAgICByZXR1cm4gYy8yKnQqdCArIGI7XG4gIH1cbiAgdC0tO1xuICByZXR1cm4gLWMvMiAqICh0Kih0LTIpIC0gMSkgKyBiO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZWFzZUluQ3ViaWMgPSBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XG4gIHZhciB0YyA9ICh0Lz1kKSp0KnQ7XG4gIHJldHVybiBiK2MqKHRjKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZnVuY3Rpb24odCwgYiwgYywgZCkge1xuICB2YXIgdHMgPSAodC89ZCkqdDtcbiAgdmFyIHRjID0gdHMqdDtcbiAgcmV0dXJuIGIrYyooNip0Yyp0cyArIC0xNSp0cyp0cyArIDEwKnRjKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5hZGQgPSBmdW5jdGlvbiAoZXZlbnQsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChldmVudCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmMpO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24uYmluZC5iaW5kKEZ1bmN0aW9uLmNhbGwpO1xuIiwidmFyIGVhc2luZyA9IHJlcXVpcmUoJy4vZWFzaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odG8sIGNhbGxiYWNrLCBkdXJhdGlvbiwgZWFzaW5nTmFtZSkge1xuICB2YXIgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IGRvY3VtZW50LmJvZHk7XG4gIHZhciBzdGFydCA9IGRvYy5zY3JvbGxUb3A7XG4gIHZhciBjaGFuZ2UgPSB0byAtIHN0YXJ0O1xuICB2YXIgY3VycmVudFRpbWUgPSAwO1xuICB2YXIgaW5jcmVtZW50ID0gMjA7XG5cbiAgdmFyIGFuaW1hdGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50VGltZSArPSBpbmNyZW1lbnQ7XG4gICAgdmFyIHZhbCA9IGVhc2luZ1tlYXNpbmdOYW1lXShjdXJyZW50VGltZSwgc3RhcnQsIGNoYW5nZSwgZHVyYXRpb24pO1xuICAgIGRvYy5zY3JvbGxUb3AgPSB2YWw7XG4gICAgaWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVNjcm9sbCk7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH07XG4gIGFuaW1hdGVTY3JvbGwoKTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgY2xhc3NsaXN0ID0gcmVxdWlyZSgnLi9saWIvY2xhc3NsaXN0Jyk7XG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJyk7XG52YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblxuZnVuY3Rpb24gb25Qcm9ncmVzcyAoeGhyKSB7XG4gIHZhciBwZXJjZW50Q29tcGxldGUgPSB4aHIubG9hZGVkIC8geGhyLnRvdGFsICogMTAwO1xuICB2YXIgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGluZy1wcm9ncmVzcycpO1xuICBwcm9ncmVzc0Jhci5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICBwcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHBlcmNlbnRDb21wbGV0ZSArICclJztcbn1cblxuZnVuY3Rpb24gaGlkZUJhcigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbn1cblxuZnVuY3Rpb24gZmluaXNoZXNCdXR0b25zKCkge1xuICByZXR1cm4gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbnMtLWZpbmlzaGVzIGxpJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBmaW5pc2hlc0J1dHRvbnMoKS5mb3JFYWNoKGNsYXNzbGlzdC5hZGQoJ2lzLWxvYWRpbmcnKSk7XG4gIHJldHVybiB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZW5kID0gZnVuY3Rpb24oKSB7XG4gIGZpbmlzaGVzQnV0dG9ucygpLmZvckVhY2goY2xhc3NsaXN0LnJlbW92ZSgnaXMtbG9hZGluZycpKTtcbiAgaGlkZUJhcigpO1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5wYWludGluZyA9IGZ1bmN0aW9uIChwYWludGluZywgY2FsbGJhY2spIHtcbiAgdmFyIGNhY2hlZEdlbyA9IGNhY2hlLmZyb20ocGFpbnRpbmcuaWQpO1xuICBpZiAoY2FjaGVkR2VvKSByZXR1cm4gY2FsbGJhY2socGFpbnRpbmcsIGNhY2hlZEdlbyk7XG4gIGxvYWRlci5sb2FkKHBhaW50aW5nLnVybCwgZnVuY3Rpb24oZ2VvKSB7XG4gICAgZ2VvLm1lcmdlVmVydGljZXMoKTtcbiAgICBnZW8uY2VudGVyKCk7XG4gICAgY2FjaGUudXBkYXRlKHBhaW50aW5nLmlkLCBnZW8pO1xuICAgIGNhbGxiYWNrKHBhaW50aW5nLCBnZW8pO1xuICB9LCBvblByb2dyZXNzKTtcbn07XG4iLCJ2YXIgdGVhcnNoZWV0ID0gcmVxdWlyZSgnLi90ZWFyc2hlZXQnKTtcblxuZnVuY3Rpb24gbWFpbChlKSB7XG4gIHZhciBocmVmID0gJ21haWx0bzppbmZvQGJyZW5kYW5zbWl0aHN0dWRpby5jb20/c3ViamVjdD1QYWludGluZ0lEJmJvZHk9JztcbiAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib3gtZmluaXNoJykudGV4dENvbnRlbnQ7XG4gIHZhciBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJveC1jb2xvdXInKS50ZXh0Q29udGVudDtcbiAgdmFyIGZ1bGxEZXRhaWxzID0gZW5jb2RlVVJJQ29tcG9uZW50KGZpbmlzaCkgKyAnJTIwJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcbiAgdmFyIGJvZHkgPSBlbmNvZGVVUklDb21wb25lbnQoJ0kgYW0gaW50ZXJlc3RlZCBpbiBhY3F1aXJpbmcgYSBjdXN0b20gNDggeCA0MCBYWFhYWFggcGFpbnRpbmcuIEkgbG9vayBmb3J3YXJkIHRvIGhlYXJpbmcgZnJvbSBQYWludGluZ0lEIGluIHRoZSBuZXh0IDI0IGhvdXJzLiBNeSBmdWxsIGNvbnRhY3QgZGV0YWlscyBhcmUgaW5jbHVkZWQgYmVsb3c6XFxuXFxuUGhvbmU6XFxuRW1haWw6Jyk7XG4gIGJvZHkgPSBib2R5LnNwbGl0KCdYWFhYWFgnKS5qb2luKGZ1bGxEZXRhaWxzKTtcbiAgdGhpcy5ocmVmID0gaHJlZiArIGJvZHk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1haWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1haWwpO1xufTtcbiIsIi8qZ2xvYmFsIFRIUkVFICovXG52YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9pbWcvdGV4dHVyZXMvd29vZC5qcGVnJyk7XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGNvbG91cikge1xuICByZXR1cm4gW1xuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KSxcbiAgICBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcihjb2xvdXIpLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pXG4gIF07XG59O1xuIiwiLypnbG9iYWwgVEhSRUUgKi9cbnZhciBtYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdGVyaWFscycpO1xuXG5mdW5jdGlvbiBnZXRNZXNoKHNjZW5lKSB7XG4gIHJldHVybiBzY2VuZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkIGluc3RhbmNlb2YgVEhSRUUuTWVzaDtcbiAgfSlbMF07XG59XG5cbm1vZHVsZS5leHBvcnRzLnNldENvbG91ciA9IGZ1bmN0aW9uKHNjZW5lLCBjb2xvdXIsIHBhaW50aW5nKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIGlmICghbWVzaCkgcmV0dXJuO1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICBtZXNoLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwobWF0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLm5ldyA9IGZ1bmN0aW9uKGdlbywgY29sb3VyLCBwYWludGluZykge1xuICB2YXIgbWF0ID0gbWF0ZXJpYWxzLmdldChjb2xvdXIpO1xuICBpZiAocGFpbnRpbmcucmV2ZXJzZWRNZXNoKSBtYXQgPSBtYXQucmV2ZXJzZSgpO1xuICB2YXIgem1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW8sIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKG1hdCkpO1xuICB6bWVzaC5yb3RhdGlvbi5mcm9tQXJyYXkocGFpbnRpbmcucm90YXRpb24pO1xuICB6bWVzaC5zY2FsZS5mcm9tQXJyYXkocGFpbnRpbmcuc2NhbGUpO1xuICByZXR1cm4gem1lc2g7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbihzY2VuZSwgdXBkYXRlKSB7XG4gIHZhciBtZXNoID0gZ2V0TWVzaChzY2VuZSk7XG4gIHNjZW5lLnJlbW92ZShtZXNoKTtcbiAgdXBkYXRlKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBbe1xuICBpZDogMCxcbiAgdXJsOiAnL29iai9wYWludGluZy0xLmpzJyxcbiAgcm90YXRpb246IFswLjEsIC0xLjE1LCAwLjAyXSxcbiAgc2NhbGU6IFsxLCAxLCAxXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn0sIHtcbiAgaWQ6IDEsXG4gIHVybDogJy9vYmovcGFpbnRpbmctMi5qcycsXG4gIHJvdGF0aW9uOiBbLTEuMTUsIDIuNjUsIC0wLjE1XSxcbiAgc2NhbGU6IFsxLjIsIDEuMiwgMS4yXSxcbiAgcmV2ZXJzZWRNZXNoOiBmYWxzZSxcbiAgY2FjaGU6IGZhbHNlLFxuICBpbmZvcm1hdGlvbjogJydcbn0sIHtcbiAgaWQ6IDIsXG4gIHVybDogJy9vYmovcGFpbnRpbmctNC5qcycsXG4gIHJvdGF0aW9uOiBbMC44NSwgMC4xMiwgMS40NV0sXG4gIHNjYWxlOiBbMS4xNSwgMS4xNSwgMS4xNV0sXG4gIHJldmVyc2VkTWVzaDogZmFsc2UsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59LCB7XG4gIGlkOiAzLFxuICB1cmw6ICcvb2JqL3BhaW50aW5nLTUuanMnLFxuICByb3RhdGlvbjogWzAuODIsIDAuMTUsIDEuNDFdLFxuICBzY2FsZTogWzEuMywgMS4zLCAxLjNdLFxuICByZXZlcnNlZE1lc2g6IHRydWUsXG4gIGNhY2hlOiBmYWxzZSxcbiAgaW5mb3JtYXRpb246ICcnXG59XTtcbiIsInZhciB0ZWFyc2hlZXQgPSByZXF1aXJlKCcuL3RlYXJzaGVldCcpO1xuXG5mdW5jdGlvbiBzaG93UHJldmlldyhzY2VuZSkge1xuICB2YXIgZ2V0SnBnID0gdGVhcnNoZWV0LmdldEpwZyhzY2VuZS5yZW5kZXJlciwgc2NlbmUuY2FtZXJhLCBzY2VuZS5jb250cm9scyk7XG4gIHZhciBpbnRybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1pbnRybycpO1xuICB2YXIgcGFpbnRpbmcgPSBpbnRyby5jaGlsZHJlblswXTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBqcGcgPSBnZXRKcGcoKTtcbiAgICBjb25zb2xlLmxvZyhqcGcpO1xuICAgIHBhaW50aW5nLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoXCInICsganBnICsgJ1wiKSc7XG4gICAgaW50cm8uY2xhc3NMaXN0LmFkZCgnc2hvdy0tcHJldmlldycpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoaWRlUHJldmlldygpIHtcbiAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93LS1wcmV2aWV3Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzY2VuZSkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2hvdy1wcmV2aWV3JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UHJldmlldyhzY2VuZSkpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVQcmV2aWV3KTtcbn07XG4iLCIvKmdsb2JhbCBUSFJFRSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDYW1lcmEoKSB7XG4gIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCByYXRpbywgMSwgMjAwMCk7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAwO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDQwO1xuICByZXR1cm4gY2FtZXJhO1xufVxuXG5mdW5jdGlvbiBhZGRMaWdodHMoc2NlbmUpIHtcbiAgdmFyIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZlOCk7XG5cdGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDEpO1xuXHRzY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDJDMkMzRCkpO1xuXHRzY2VuZS5hZGQoZGlyZWN0aW9uYWxMaWdodCk7XG59XG5cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIGNhbGxiYWNrKSB7XG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSk7XG5cdGNvbnRyb2xzLmRhbXBpbmcgPSAwLjI7XG4gIGNvbnRyb2xzLm5vS2V5cyA9IHRydWU7XG4gIGNvbnRyb2xzLm5vWm9vbSA9IHRydWU7XG4gIGNvbnRyb2xzLm5vUGFuID0gdHJ1ZTtcbiAgY29udHJvbHMubm9Sb3RhdGVVcCA9IGZhbHNlO1xuICBjb250cm9scy5taW5BemltdXRoQW5nbGUgPSAtTWF0aC5QSS81O1xuXHRjb250cm9scy5tYXhBemltdXRoQW5nbGUgPSBNYXRoLlBJLzEuNTtcbiAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spO1xuICByZXR1cm4gY29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIGFkZERldmljZUNvbnRyb2xzKGNhbWVyYSkge1xuICByZXR1cm4gbmV3IFRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHMoY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICBhbHBoYTogdHJ1ZSxcbiAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWVcbiAgfSk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuXHRyZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZShjYW1lcmEsIHJlbmRlcmVyLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHQgIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdCAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBjYWxsYmFjaygpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2VuZSgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW5kZXInKTtcbiAgdmFyIGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpO1xuICB2YXIgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgdmFyIHVwZGF0ZSA9IHJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XG4gIHZhciBjb250cm9scyA9IHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCA/XG4gICAgICAgIGFkZENvbnRyb2xzKHNjZW5lLCBjYW1lcmEsIHVwZGF0ZSkgOlxuICAgICAgICBhZGREZXZpY2VDb250cm9scyhjYW1lcmEpO1xuXG4gIGFkZExpZ2h0cyhzY2VuZSk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYSxcbiAgICBjb250cm9sczogY29udHJvbHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHNjZW5lOiBzY2VuZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbiAgYW5pbWF0ZShzY2VuZS5jb250cm9scyk7XG4gIHNjZW5lLnVwZGF0ZSgpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dSZXNpemUoXG4gICAgc2NlbmUuY2FtZXJhLFxuICAgIHNjZW5lLnJlbmRlcmVyLFxuICAgIHNjZW5lLnVwZGF0ZVxuICApKTtcbiAgcmV0dXJuIHNjZW5lO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZShjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUoY29udHJvbHMpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgfTtcbn1cbiIsInZhciBjcmVhdGVTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUnKS5pbml0O1xudmFyIGNvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBmaW5pc2hlcyA9IHJlcXVpcmUoJy4vZmluaXNoZXMnKTtcbnZhciBzY3JvbGwgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbnZhciBwcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG52YXIgbWFpbCA9IHJlcXVpcmUoJy4vbWFpbCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDc2Nykge1xuICAgIHZhciBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4gICAgY29sb3Vycy5pbml0KHNjZW5lLnNjZW5lLCBzY2VuZS51cGRhdGUpO1xuICAgIGZpbmlzaGVzLmluaXQoc2NlbmUuc2NlbmUsIHNjZW5lLnVwZGF0ZSk7XG4gICAgcHJldmlldy5pbml0KHNjZW5lKTtcbiAgfVxuICBzY3JvbGwuaW5pdCgpO1xuICBtYWlsLmluaXQoKTtcbn0pO1xuIiwidmFyIHNsaWNlID0gcmVxdWlyZSgnLi9saWIvbGliZXJhdGUnKShbXS5zbGljZSk7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpYi9ldmVudGxpc3RlbmVycycpO1xudmFyIGNsYXNzTGlzdCA9IHJlcXVpcmUoJy4vbGliL2NsYXNzbGlzdCcpO1xudmFyIHNjcm9sbFRvID0gcmVxdWlyZSgnLi9saWIvc2Nyb2xsdG8nKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbGliL2RlYm91bmNlJyk7XG5cbmZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgdmFyIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgaWYgKHNjcm9sbCA+PSB3aW5IZWlnaHQpIGRvRml4KCk7XG59XG5cbmZ1bmN0aW9uIGRvVW5kZXJsYXkoKSB7XG4gIHZhciBib3R0b21TUyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51bmRlcmxheSAuYm90dG9tLS1zcyBsaScpO1xuICB2YXIgYm90dG9tQWJvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLmJvdHRvbS0tYWJvdXQgbGknKTtcbiAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gIHZhciBhYm91dFBvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1hYm91dCcpLm9mZnNldFRvcDtcbiAgaWYgKGFib3V0UG9zICE9PSAwICYmIGFib3V0UG9zIDw9IHNjcm9sbCkge1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9IGVsc2Uge1xuICAgIGJvdHRvbUFib3V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIGJvdHRvbVNTLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN3YXBIZWFkZXIoKSB7XG4gIHZhciB0b3AgPSBzbGljZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudW5kZXJsYXkgLnVuZGVybGF5LXRvcCcpLmNoaWxkcmVuKTtcbiAgd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHRvcC5mb3JFYWNoKGNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpKTtcbiAgICB0b3BbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRvcC5sZW5ndGgpXS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfSwgODAwKTtcbn1cblxuZnVuY3Rpb24gZG9GaXgoKSB7XG4gIHZhciBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICB2YXIgaW50cm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8nKTtcbiAgYm9keS5jbGFzc0xpc3QuYWRkKCdmaXgtcGFnZScpO1xuICBpbnRyby5jbGFzc0xpc3QucmVtb3ZlKCdqcy1ub3Qtc2Nyb2xsZWQnKTtcbiAgYm9keS5zY3JvbGxUb3AgLT0gd2luZG93LmlubmVySGVpZ2h0O1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHNob3dBYm91dCgpO1xuICB9LCA0MDApO1xufVxuXG5mdW5jdGlvbiBzaG93QWJvdXQoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLS1hYm91dCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUtYWJvdXQnKTtcbn1cblxuZnVuY3Rpb24gY2xpY2tOYXYoZSkge1xuICBzaG93QWJvdXQoKTtcbiAgdmFyIGhyZWYgPSB0aGlzLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICB2YXIgaXNGaXhlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpeC1wYWdlJyk7XG4gIHZhciB0byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaHJlZikub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24oKSB7fSwgNjAwLCAnZWFzZUluT3V0UXVhZCcpO1xuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc2Nyb2xsJykpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIHNjcm9sbEludHJvKCkge1xuICB2YXIgdG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFpbnRpbmdzJykub2Zmc2V0VG9wO1xuICBzY3JvbGxUbyh0bywgZnVuY3Rpb24gKCkge30sIDYwMCwgJ2Vhc2VJbk91dFF1YWQnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlU2lkZWJhcihlKSB7XG4gIHRoaXMucGFyZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd0b2dnbGVkJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmF2cyA9IHNsaWNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyLS1sZWZ0IGEnKSk7XG4gIHZhciB0b2dnbGVzID0gc2xpY2UoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS5qcy10by10b2dnbGUnKSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZG9VbmRlcmxheSk7XG4gIGRvVW5kZXJsYXkoKTtcbiAgc3dhcEhlYWRlcigpO1xuICBuYXZzLmZvckVhY2goZXZlbnRMaXN0ZW5lcnMuYWRkKCdjbGljaycsIGNsaWNrTmF2KSk7XG4gIHRvZ2dsZXMuZm9yRWFjaChldmVudExpc3RlbmVycy5hZGQoJ2NsaWNrJywgdG9nZ2xlU2lkZWJhcikpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi0taW50cm8uanMtbm90LXNjcm9sbGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY3JvbGxJbnRybyk7XG59O1xuIiwiZnVuY3Rpb24gc2F2ZVRlYXJTaGVldChyZW5kZXJlciwgY2FtZXJhLCBjb250cm9scykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpwZztcbiAgICB2YXIgcHJldlBvc2l0aW9uID0gW1xuICAgICAgY2FtZXJhLnBvc2l0aW9uLngsXG4gICAgICBjYW1lcmEucG9zaXRpb24ueSxcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi56XG4gICAgXTtcbiAgICBjYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KFswLCAwLCA0MF0pO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIGpwZyA9IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmZyb21BcnJheShwcmV2UG9zaXRpb24pO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIHJldHVybiBqcGc7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldEpwZyA9IHNhdmVUZWFyU2hlZXQ7XG4iXX0=
