var camera, scene, renderer, stats, world;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time = Date.now();
var time_old = 0.0;
var dt = 0.0;

setup();

function setup(){

  container =  document.getElementById( 'container' );
  //Setup Physics Engine
  world = new OIMO.World({ 
    timestep: 1/60,
    iterations: 30,
    broadphase: 3,
    worldscale: 10,
    random: true,
    info:false,
    gravity: [0,-40,0]
  });
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  //Creating THREE Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2b2b2b);
  scene.fog = new THREE.Fog(0x2b2b2b, 1, 10000);
  //Initialize Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  //Add Directional Light

  light = new THREE.DirectionalLight( 0xffffff , 1);
  light.position.set( 500, 1000, 100 );
  light.target.position.set( 0, 0, 0 );
  light.castShadow = true;
  var d = 6000;
  light.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  500, 1600 );
  light.shadow.bias = 0.0001;
  light.shadow.mapSize.width = light.shadow.mapSize.height = 1024*3;
  scene.add( light );

  

 //Pointer Lock
  var controlls_active = true;
  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );
  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

  if ( havePointerLock ) {
      var element = document.body;
      var pointerlockchange = function ( event ) {
          if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
              controlls_active.enabled = true;
              blocker.style.display = 'none';
          } else {
              controlls_active.enabled = false;
              blocker.style.display = '-webkit-box';
              blocker.style.display = '-moz-box';
              blocker.style.display = 'box';
              instructions.style.display = '';
          }
      }
      var pointerlockerror = function ( event ) {
          instructions.style.display = '';
      }
      // Hook pointer lock state change events
      document.addEventListener( 'pointerlockchange', pointerlockchange, false );
      document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
      document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
      document.addEventListener( 'pointerlockerror', pointerlockerror, false );
      document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
      document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
      instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ) {
          var fullscreenchange = function ( event ) {
            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                      document.removeEventListener( 'fullscreenchange', fullscreenchange );
                      document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                      element.requestPointerLock();
                  }
              }
              document.addEventListener( 'fullscreenchange', fullscreenchange, false );
              document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
              element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
              element.requestFullscreen();
          } else {
              element.requestPointerLock();
          }
      }, false );
  } else {
      instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }
}