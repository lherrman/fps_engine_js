
var inputs_array = []
var inputs_time_array = []
var inputs_map = {
  up_move: 87,
  down_move: 83,
  left_move: 65,
  right_move: 68,
  jump: 32, // space
  interact_1: 69, // e
  interact_2: 70 // f
}
var mouseX = 0;
var mouseY = 0

var mouse_inputs_array = [] //1=lmb, 2=rmb, 4=mmb, 8=4.mb, 16=5.mb
var mouse_inputs_map = {
  lmb: 0,
  rmb: 2,
  mmb: 1,
  mb4: 4,
  mb5: 3
}
var mouse_clicked_inputs_array = []
var mouse_wheel_deltaY = 0.0
var mouse_orientation = [0.0, 0.0] //[Phi, Theta]

init_inputs()

function init_inputs () {
  
  // Add Callback Functions
  document.addEventListener('mousemove', onDocumentMouseMove, false)
  window.addEventListener('resize', onWindowResize, false)
  document.addEventListener('wheel', onWheelEvent, false)
  document.addEventListener('mousedown', onMousebuttonDown, false)
  document.addEventListener('mouseup', onMousebuttonUp, false)

  //Initializing Input Arrays
  for (var i = 0; i < 255; i++) {
    inputs_array.push(false)
    inputs_time_array.push(time)
  }
  for (var i = 0; i < 5; i++) {
    mouse_inputs_array.push(false)
  }

  // Reading Inputs With Callback
  document.addEventListener('keydown', function(event) {
    inputs_array[event.keyCode] = true
    inputs_time_array[event.keyCode] = Date.now()
    //console.log(event.keyCode)
  })

  document.addEventListener('keyup', function(event) {
    inputs_array[event.keyCode] = false
  })    
}

function onDocumentMouseMove(event) {
  var sensitivity = 0.001
  mouseX += (event.movementX) * -sensitivity
  mouseY += (event.movementY) * -sensitivity
  mouse_orientation[0] = mouseX
  if (Math.abs(mouseY) <= Math.PI / 2)
    mouse_orientation[1] = mouseY
  }

function onMousebuttonDown(event) {
  mouse_inputs_array[event.button] = true
}

function onMousebuttonUp(event) {
  mouse_inputs_array[event.button] = false
}

function onWheelEvent(event) {
  mouse_wheel_deltaY = event.deltaY
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
