
class Player{
  constructor(){
    this.acceleration = new THREE.Vector3()
    this.pos = new THREE.Vector3()
    this.dir = new THREE.Vector3()
    this.heading = new THREE.Vector3()
    this.sideways = new THREE.Vector3()
    this.theta = 0.0 //rotation around axis
    this.phi = 0.0  //jaw
    this.height = 200.0 //player camera height
    this.height_vec3 = new THREE.Vector3(0,this.height,0)
    this.look_at_point_vec3 = new THREE.Vector3()
    this.head_point_vec3 = new THREE.Vector3()

    this.weapon = new weapon_generic()
    
    this.visible = false;

    this.onGround = false;

    this.armlenght = 300;
 
    this.holding_object = null;
  
    //Physics Collider Sphere
    let collider_physics_config = [
      1, // The density of the shape.
      5, // The coefficient of friction of the shape.
      0.1, // The coefficient of restitution of the shape.
      1, // The bits of the collision groups to which the shape belongs.
      0xffffffff // The bits of the collision groups with which the shape collides.
      ];
    
    this.collider = world.add({
      type:'sphere',
      size:[100],
      pos:[500,500,0],
      density:10,
      move:true,
      config:collider_physics_config
    })

    //Player Body Mesh
    if (this.visible){
      this.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(100), new THREE.MeshNormalMaterial());
      scene.add(this.mesh);
    }

    //Vectors for use temporaly for calculations
    var temp_vec3_1 = new THREE.Vector3();
    var temp_vec3_2 = new THREE.Vector3();
    
    //Movement

    //3x3 90deg z rotation matrix
    var Ry90 = new THREE.Matrix3()
    Ry90.set(0,0,1,0,1,0,-1,0,0)


    var center = new THREE.Vector3();

    var maxSpeed = 50;

    this.movement_update = function() {

      //Look at Point Calculation and support vectors for movement
      this.heading.set(Math.cos(this.phi),0,-Math.sin(this.phi));
      this.dir.set(Math.cos(this.phi)*Math.cos(this.theta),Math.sin(this.theta),-Math.sin(this.phi)*Math.cos(this.theta));
      this.head_point_vec3.addVectors(this.pos,this.height_vec3);
      this.look_at_point_vec3.addVectors(this.head_point_vec3,this.dir);
      this.sideways.copy(this.heading).applyMatrix3(Ry90); 

      this.acceleration.set(0,0,0);
      //Movement Input Handling
      var forceMultiplyer = 14000;

      if (inputs_array[inputs_map["up_move"]] == true){
        this.acceleration.add(this.heading);        
      } 
      if (inputs_array[inputs_map["down_move"]] == true){
        temp_vec3_1.copy(this.heading);
        temp_vec3_1.multiplyScalar(-1);
        this.acceleration.add(temp_vec3_1);
      }
      if (inputs_array[inputs_map["left_move"]] == true){
        this.acceleration.add(this.sideways);
      }
      if (inputs_array[inputs_map["right_move"]] == true){
        temp_vec3_1.copy(this.sideways);
        temp_vec3_1.multiplyScalar(-1);
        this.acceleration.add(temp_vec3_1);
      }

      //drag on xz velocity
      var current_velocity_vec3 = this.collider.linearVelocity;
      var current_vertical_velocity_abs = Math.sqrt((current_velocity_vec3.x*current_velocity_vec3.x) + (current_velocity_vec3.z*current_velocity_vec3.z));
      
      this.collider.linearVelocity.x = current_velocity_vec3.x*0.99;
      this.collider.linearVelocity.z = current_velocity_vec3.z*0.99;
      

      if (current_vertical_velocity_abs <= maxSpeed){
        this.acceleration.normalize();
        this.collider.applyImpulse(center, this.acceleration.multiplyScalar(forceMultiplyer));
      }
    }

    //Jumping
    var jumpForce = 200000;
    var y_unit_vec3 = new THREE.Vector3(0,1,0);
    var collides_with_ground = false;
    var vertical_velocity = 0.0;
    var canJump = false;
    var timeJumping = 0;
   
    this.jumping_update =  function() {

      if (inputs_array[inputs_map["jump"]] == true){

        //collides_with_ground = world.getContact(this.collider, ground_collider);
        vertical_velocity = this.collider.linearVelocity.y;
        if ((Math.abs(vertical_velocity) <= 1) && (canJump)){

          this.collider.applyImpulse(center, y_unit_vec3.clone().multiplyScalar(jumpForce));
          canJump = false;
          timeJumping = inputs_time_array[inputs_map["jump"]];
        }
      }
      if(this.collider.linearVelocity.y < -1){
        canJump = true;
      }
    }

    //Object Picking
    var raycaster = new THREE.Raycaster();
    raycaster.near = 10;
    raycaster.far = 800;
    var holding_point_vec3 = new THREE.Vector3();

    var object_force_vec3 = new THREE.Vector3();
    
    var interaction_locked = false;
    var interact_time = time;

    var min_armlength = 200;
    var max_armlegth = 1000;

    var arm_sideways_offset = 0.0;

    var center_vec3 = new THREE.Vector3();
    var throw_force_vec3 = new THREE.Vector3();

    this.pickup_update = function() {
      //reenable interaction after some time to prevent flickring
      if ((interact_time - time) < -200){
        interaction_locked = false;
      }
      
      this.armlenght += mouse_wheel_deltaY * -0.5;
      //bounding
      if (this.armlenght < min_armlength) {
        this.armlenght = min_armlength;
      }
      if (this.armlenght > max_armlegth) {
        this.armlenght = max_armlegth;
      }
      //offset to the side when rmb pressed
      if (mouse_inputs_array[mouse_inputs_map["rmb"]] == true) {
        arm_sideways_offset = 160;
      }
      else {
        arm_sideways_offset = 0
      }

      //Raycasting for picking Objects
      raycaster.set(this.head_point_vec3, this.dir);
      var intersects = raycaster.intersectObjects(scene.children);
      if ((inputs_array[inputs_map["interact_2"]] == true) && !interaction_locked ) {
        if (this.holding_object == null){
          let intersect0 = intersects[0]
          if ((intersect0 != null ) && intersect0.object.userData.dynamic == true){
            interaction_locked = true
            interact_time = time
            this.holding_object = intersect0.object
            this.armlenght = intersect0.distance + 50
          }
        }
        else{
            this.holding_object = null;
            interaction_locked = true;
            interact_time = time;
        }
      }
      if (this.holding_object){
        //pickup point position
        temp_vec3_1.copy(this.dir);
        temp_vec3_1.multiplyScalar(this.armlenght);
        temp_vec3_2.copy(this.head_point_vec3);
        temp_vec3_2.add(temp_vec3_1);
        //Offset to the side
        temp_vec3_1.copy(this.sideways);
        temp_vec3_1.multiplyScalar(-arm_sideways_offset);

        temp_vec3_2.add(temp_vec3_1);
        holding_point_vec3.copy(temp_vec3_2);

        object_force_vec3.copy(this.holding_object.userData.physics_object.getPosition());
        object_force_vec3.sub(holding_point_vec3).multiplyScalar(-1);
        object_force_vec3.multiplyScalar(object_force_vec3.length())
  
        this.holding_object.userData.physics_object.applyImpulse(center_vec3, object_force_vec3);
        //Prevent Collider from Spinning
        this.holding_object.userData.physics_object.angularVelocity.multiplyScalar(0.001);
        this.holding_object.userData.physics_object.linearVelocity.multiplyScalar(0.85);

        
        let pickup_target = 350
        let pickup_speed = 0.02
        let pickup_diff =  Math.abs(pickup_target - this.armlenght) ;
        
        if (this.armlenght < pickup_target - 100) {
          this.armlenght += pickup_speed  * pickup_diff;
        } 
        if (this.armlenght > pickup_target + 100) {
          this.armlenght -= pickup_speed  * pickup_diff;
          
        }
        
        if (mouse_inputs_array[mouse_inputs_map["lmb"]] == true) {
          throw_force_vec3.copy(this.dir);
          throw_force_vec3.multiplyScalar(250000);
          this.holding_object.userData.physics_object.applyImpulse(center_vec3, throw_force_vec3);
          this.holding_object.userData.physics_object.angularVelocity.multiplyScalar(0.005);
            
          //this.holding_object.throw(this.dir,250000);
          this.holding_object = null;
          
        }

      }
      else{ //no object holding
        if (mouse_inputs_array[mouse_inputs_map["lmb"]] == true) {
          this.weapon.shoot()
          
        }

      }

    }

  }

  update(){
    //Copy Position from Physics Model to Object
    let phy_pos = this.collider.getPosition();
    this.pos.set(phy_pos.x, phy_pos.y, phy_pos.z);

    this.phi = mouse_orientation[0];
    this.theta = mouse_orientation[1];

    this.movement_update();
    this.jumping_update();

    this.pickup_update()

    this.weapon.set_pos_dir(this.head_point_vec3, this.dir)


    if (this.visible){
      //Update Mesh Position
      this.mesh.position.copy(this.collider.getPosition());
      this.mesh.quaternion.copy(this.collider.getQuaternion());  
    }

    //Prevent Collider from Spinning
    this.collider.angularVelocity.set(0,0,0);
    
    //Reset Position if falling below trigger
    if (this.pos.y < -1000){
      this.collider.resetPosition(500,500,100);
    }

  }

} 