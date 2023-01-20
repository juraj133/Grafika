import * as CANNON from "cannon-es";
class MainWorld{

    constructor() {
        this.Init();
    }

    SetBirdBasicState(object){
        this.birdAxis = {
            x: object.rotation.x,
            y: object.rotation.y,
            z: object.rotation.z
        }

    }

    GetBird(){
        return this.Bird;
    }

    SetBird(object){
        this.Bird = object;
    }

    GetMuseum(){
        return this.museum;
    }

    SetMuseum(obj){
        this.museum = obj;
    }

    Init(){
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.Type = THREE.VSM;
        //this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920/1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0,2,-5);




        this.scene = new THREE.Scene();

        this.keyboard = new THREEx.KeyboardState();

        this.AddObjects();
        this.AddLights();

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0,-9.81,0)
        })
        this.timeStep = 1/60;

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        this.RAF();
    }
    AddObjects(){

        //SPHERE
        let geometrySphere = new THREE.SphereGeometry(100, 100, 100);
        let sphereTexture = new THREE.ImageUtils.loadTexture('texture/sky.jpg');
        let materialSphere = new THREE.MeshBasicMaterial({map: sphereTexture, transparent: true, side: THREE.DoubleSide});
        let sphere = new THREE.Mesh(geometrySphere, materialSphere);
        sphere.position.set(0, 0, 0);
        sphere.castShadow = true;
        this.scene.add(sphere);

        //FLOOR
        let floorTexture = new THREE.ImageUtils.loadTexture('texture/carbon.png');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10, 10);
        let geometryPlane = new THREE.PlaneGeometry(100, 100, 4, 4);
        let materialPlane = new THREE.MeshStandardMaterial({
            map: floorTexture,
            side: THREE.DoubleSide,
            roughness: 0.12,
            metalness: 0.65
        });
        let floor = new THREE.Mesh(geometryPlane, materialPlane);
        floor.position.set(0, -0.5, 0);
        floor.rotation.x = Math.PI / 2;
        floor.receiveShadow = true;
        //this.scene.add(floor);

        //GLTF
        this.LoadMuseum('gltf/final5.gltf');

        this.LoadBird('gltf/eagle_animated.gltf');


    }

    LoadBird(path){
        let counter = 0;
        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) =>{
            gltf.scene.traverse(c =>{
                c.castShadow = true;
                c.receiveShadow = true;
                counter += 1;
            });
            console.log("Bird poly: " + counter);

            this.SetBird(gltf.scene);

            const box = new THREE.BoxHelper( this.GetBird(), 0xffff00 );
            this.GetBird().add(box);
            this.GetBird().position.set(0,5,0);
            this.GetBird().scale.set(2,2,2);
            this.scene.add(this.GetBird());
            this.sideAngle = 0;
            this.GetBird().add(this.camera);
            this.mixer = new THREE.AnimationMixer(this.GetBird());
            const clips = gltf.animations;
            const clip = THREE.AnimationClip.findByName(clips, 'BirdFly');
            const action = this.mixer.clipAction(clip);
            action.play();

            // const axesHelper = new THREE.AxesHelper( 5 );
            // this.GetBird().add(axesHelper);

            this.SetBirdBasicState(this.GetBird());
        });
    }

    LoadMuseum(path){
        let counter;
        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) => {
            gltf.scene.traverse(c => {
                c.receiveShadow = true;
                c.castShadow = true;
                counter += 1;
            });
            console.log("Museum poly: " + counter);
            this.SetMuseum(gltf.scene);
            this.GetMuseum().scale.set(2,2,2);
            this.GetMuseum().position.set(2,0,32);
            this.scene.add(this.GetMuseum());

            const mShape = this.GetMuseum().shape();
            this.museumBody = new CANNON.Body({
                shape: mShape,
                mass: 10,
                // type: CANNON.Body.STATIC
            })
            this.world.addBody(this.museumBody)
        });


    }

    AddLights(){

        //MIDDLE LIGHT
        const pointLight = new THREE.PointLight( 0xFFFFFF, 2, 100 );
        pointLight.position.set( 0, 18, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);

        let lightHelper = new THREE.PointLightHelper(pointLight, 1);
        this.scene.add(lightHelper);

        //STATUES LIGHTS
        const pointLight2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2.position.set( 0, 12, 20);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);

        let lightHelper2 = new THREE.PointLightHelper(pointLight2, 1);
        this.scene.add(lightHelper2);

        const pointLight2_1 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2_1.position.set( 28, 12, 20);
        pointLight2_1.castShadow = true;
        this.scene.add(pointLight2_1);

        let pointLightHelper2_1 = new THREE.PointLightHelper(pointLight2_1, 1);
        this.scene.add(pointLightHelper2_1);

        const pointLight2_2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2_2.position.set( -28, 12, 20);
        pointLight2_2.castShadow = true;
        this.scene.add(pointLight2_2);

        let pointLightHelper2_2 = new THREE.PointLightHelper(pointLight2_2, 1);
        this.scene.add(pointLightHelper2_2);

        //PAINTS LIGHTS
        const pointLight3 = new THREE.PointLight( 0xFFFFFF, 2, 100 );
        pointLight3.position.set( 0, 12, -20);
        pointLight3.castShadow = true;
        this.scene.add(pointLight3);

        let lightHelper3 = new THREE.PointLightHelper(pointLight3, 1);
        this.scene.add(lightHelper3);

        const pointLight3_1 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight3_1.position.set( 28, 12, -20);
        pointLight3_1.castShadow = true;
        this.scene.add(pointLight3_1);

        let pointLightHelper3_1 = new THREE.PointLightHelper(pointLight3_1, 1);
        this.scene.add(pointLightHelper3_1);

        const pointLight3_2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight3_2.position.set( -28, 12, -20);
        pointLight3_2.castShadow = true;
        this.scene.add(pointLight3_2);

        let pointLightHelper3_2 = new THREE.PointLightHelper(pointLight3_2, 1);
        this.scene.add(pointLightHelper3_2);


        let ambientLight = new THREE.AmbientLight(0x454545);
        this.scene.add(ambientLight);

    }

    OnWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth / window.innerHeight);
    }

    RAF(){
        requestAnimationFrame(()=> {
            this.world.step(this.timeStep)

            this.GetMuseum().position.copy(this.museumBody.position)
            this.GetMuseum().quaternion.copy(this.museumBody.quaternion)

            this.renderer.render(this.scene, this.camera);
            this.RAF();
        });
        this.Update();
    }

    Update(){
        //const timeElapsedS = timeElapsed * 0.001;
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
        this.KeyboardHandling(delta);
        this.controls.update();

    }

    KeyboardHandling(delta){
        //const delta = this.clock.getDelta();
        const moveDistance = 5 * delta;
        const rotateAngle = Math.PI / 2 * delta;
        // if ( this.keyboard.pressed("S") ) {
        //     this.getBird().translateZ(-moveDistance);
        // }
        if ( this.keyboard.pressed("W") ) {
            this.GetBird().translateZ(moveDistance);
            if(this.sideAngle > 0){
                this.GetBird().translateX(this.sideAngle/2000);
            }
            if(this.sideAngle < 0){
                this.GetBird().translateX(this.sideAngle/2000);
            }
        }
        // if ( this.keyboard.pressed("D") ) {
        //     if(this.GetBird().rotation.z <= Math.PI / 3){ // PRI OTOCENI SA NEOTOCI SSO
        //         //console.log(Math.abs(this.getBird().rotation.z - this.birdAxis.z));
        //         this.GetBird().rotateZ(rotateAngle);
        //         //this.getBird().rotateOnAxis(new THREE.Vector3(0, 0, 2), rotateAngle);
        //         this.sideAngle -=1;
        //         console.log('Side angle is ' + this.sideAngle);
        //
        //     }
        //    // this.getBird().position.x -= moveDistance/8;
        //
        // }
        // if ( this.keyboard.pressed("A") ) {
        //     if(this.GetBird().rotation.z >= -(Math.PI / 3)){ // PRI OTOCENI SA NEOTOCI SSO
        //         console.log('Side angle is ' + this.sideAngle);
        //         this.GetBird().rotateZ(-rotateAngle);
        //         this.sideAngle +=1;
        //         //this.getBird().rotateOnAxis(new THREE.Vector3(0, 0, 2), -rotateAngle);
        //     }
        //     //this.getBird().translateX(moveDistance);
        // }
        if(this.keyboard.pressed("space")){
            console.log(this.GetBird().x);
            if(this.GetBird().rotation._x >= -0.25) {
                this.GetBird().rotateOnAxis(new THREE.Vector3(2, 0, 0), -rotateAngle);
            }
        }
        if(this.keyboard.pressed("shift"))
            if(this.GetBird().rotation._x <= 0.25) {
                this.GetBird().rotateOnAxis(new THREE.Vector3(2, 0, 0), rotateAngle);
            }
        //const rotation_matrix = new THREE.Matrix4().identity();
        if ( this.keyboard.pressed("A") ){
             this.GetBird().rotateOnAxis( new THREE.Vector3(0,2,0),rotateAngle/4);
        }
        if ( this.keyboard.pressed("D") ){
             this.GetBird().rotateOnAxis( new THREE.Vector3(0,2,0),-rotateAngle/4);
        }

    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new MainWorld();
});