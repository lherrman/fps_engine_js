

class weapon_generic{
    constructor(){
        this.pos = new THREE.Vector3();
        this.dir = new THREE.Vector3();

        let projectile_size = 10    

        var center_vec3 = new THREE.Vector3();
        var shoot_force_vec3 = new THREE.Vector3();

        var shooting_head_offset = new THREE.Vector3(0,0,10);

        var times_fired = 0;
        var max_projectiles_in_air = 100;

        this.shoot = function(){
            times_fired += 1;

            let pysics_options = {
                type: 'sphere',
                size: [projectile_size, projectile_size, projectile_size],
                pos: [this.pos.x, this.pos.y - 30, this.pos.z],
                density: 10,
                move: true
                }  
            var projectile = new THREE.Mesh(new THREE.SphereBufferGeometry(projectile_size), new THREE.MeshNormalMaterial());
            
            projectile.userData.physics_object = world.add(pysics_options);
            
            if (times_fired < max_projectiles_in_air){
                projectiles.push(projectile)
            }
            else{
                projectiles[0].userData.physics_object.remove();
                scene.remove(projectiles[0]);
                projectiles.shift();
                projectiles.push(projectile);
            }
            
            
            scene.add(projectile)
            shoot_force_vec3.copy(this.dir);
            shoot_force_vec3.multiplyScalar(8000);
            projectile.userData.physics_object.applyImpulse(center_vec3, shoot_force_vec3);
            
        }

        this.set_pos_dir = function(pos, dir){
            this.pos = pos;
            this.dir = dir;
        }
    }

}

