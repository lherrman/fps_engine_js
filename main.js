var avatar

init()
animate()

function init() {
  avatar = new Player()
  load_scene()
  world.play()
}

function animate() {
  time = Date.now()
  dt = time - time_old
  time_old = time
  
  world.step()

  avatar.update()

  // Update Physics Objects
  dynamicObjects.forEach(function (item, index) {
    update_physics_item(item)
  })

  projectiles.forEach(function (item, index) {
    update_physics_item(item)
  })

  reset_inputs()
  requestAnimationFrame(animate)
  render()
}

function render() {
  camera.position.copy(avatar.head_point_vec3)
  camera.lookAt(avatar.look_at_point_vec3)
  renderer.render(scene, camera)
}

function reset_inputs() {
  mouse_wheel_deltaY = 0.0
}
