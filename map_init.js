var dynamicObjects = [];
var staticObjects = [];
var projectiles = [];

var loader = new THREE.ObjectLoader();

function load_scene() {

  loader.load(
      // scene file
      "scene.json",

      // full loaded callback
      function (obj) {

        obj.children.forEach(function (item, index) {

          if (item.type == "Mesh") {
            item.scale.multiplyScalar(100, 100, 100);
            item.position.multiplyScalar(100);
            if (item.userData.collider == "box") {
              let pysics_options = {
                type: 'box',
                size: [item.scale.x, item.scale.y, item.scale.z],
                pos: [item.position.x, item.position.y, item.position.z],
                density: item.userData.density,
                move: item.userData.dynamic
              }

              item.userData.physics_object = world.add(pysics_options);
              item.userData.physics_object.setQuaternion(item.quaternion);
                                  
              if (item.userData.dynamic) {
                item.userData.physics_object.isKinematic = false;
                dynamicObjects.push(item);
              } 
              else {
                item.userData.physics_object.updatePosition();
                staticObjects.push(item);
              }
            }
          }
        });

        dynamicObjects.forEach(function (item, index) {
          scene.add(item);
        });

        staticObjects.forEach(function (item, index) {
          scene.add(item);
        });
      },

      // on Progress callback
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },

      // on Error callback
      function (err) {
        console.error('scene loading error');
      }
    );
};

function update_physics_item(obj) {
  obj.position.copy(obj.userData.physics_object.getPosition());
  obj.quaternion.copy(obj.userData.physics_object.getQuaternion());
}