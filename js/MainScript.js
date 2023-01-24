class MainWorld{

    constructor() {
        this.Init();
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

        this.AddRenderer();

        this.scene = new THREE.Scene();
        this.keyboard = new THREEx.KeyboardState();

        this.camera1 = this.AddCamera(60,1920/1080,1.0,1000,{x:0,y:2,z:-5}, false);
        this.camera2 = this.AddCamera(60, 1920/1080, 0.1, 500, {x:0,y:50,z:0}, false);
        this.faceCam = this.AddCamera(60 , 1920/1080, 0.2, 500 , {x:0,y:-0.2,z:1.5}, true);

        this.camera1Active = true;
        this.camera2Active = false;
        this.faceCamActive = false;

        this.AddObjects();
        this.AddLights();
        this.AddCurve();

        this.controls = new THREE.OrbitControls( this.camera1, this.renderer.domElement );

        //GUI
        this.gui = new dat.GUI();
        let cameras = ['TopCamera', 'BehindBirdCamera', 'FaceCamera'];
        let cameraSwitch = {currentCamera: 'BehindBirdCamera'};
        this.cameraSelect = this.gui.add(cameraSwitch, 'currentCamera', cameras).name('Cameras');
        this.cameraSelect.onChange((value)=> this.UpdateCamera(value));

    }

    UpdateCamera(value){
        if(value =='TopCamera'){
            this.camera1Active = false;
            this.camera2Active = true;
            this.faceCamActive = false;
        }
        else if(value =='BehindBirdCamera'){
            this.camera1Active = true;
            this.camera2Active = false;
            this.faceCamActive = false;
        }
        else if(value =='FaceCamera'){
            this.camera1Active = false;
            this.camera2Active = false;
            this.faceCamActive = true;
        }
        else{
            this.camera1Active = true;
            this.camera2Active = false;
            this.faceCamActive = false;
        }
    }

    AddRenderer(){
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.Type = THREE.VSM;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    AddCamera(fov, aspect, near, far, position, rotateY){
        let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        if(rotateY){
            camera.rotateY(Math.PI)
        }
        camera.position.set(position.x, position.y, position.z);
        return camera;
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
        this.LoadMuseum('assets/Museum.gltf');

        this.LoadBird('assets/eagle_animated.gltf');


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

            // const box = new THREE.BoxHelper( this.GetBird(), 0xffff00 );
            // this.GetBird().add(box);
            this.GetBird().position.set(0,10,0);
            this.GetBird().scale.set(2,2,2);
            this.scene.add(this.GetBird());
            this.sideAngle = 0;
            this.GetBird().add(this.camera1);
            this.GetBird().add(this.faceCam);
            this.mixer = new THREE.AnimationMixer(this.GetBird());
            const clips = gltf.animations;
            const clip = THREE.AnimationClip.findByName(clips, 'BirdFly');
            const action = this.mixer.clipAction(clip);
            action.play();

        });
    }

    LoadMuseum(path){
        let counter = 0;
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


        });


    }

    AddLights(){

        //MIDDLE LIGHT
        const pointLight = new THREE.PointLight( 0xFFFFFF, 2, 100 );
        pointLight.position.set( 0, 18, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);

        let lightHelper = new THREE.PointLightHelper(pointLight, 1);
        //this.scene.add(lightHelper);

        //STATUES LIGHTS
        const pointLight2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2.position.set( 0, 12, 20);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);

        let lightHelper2 = new THREE.PointLightHelper(pointLight2, 1);
        //this.scene.add(lightHelper2);

        const pointLight2_1 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2_1.position.set( 28, 12, 20);
        pointLight2_1.castShadow = true;
        this.scene.add(pointLight2_1);

        let pointLightHelper2_1 = new THREE.PointLightHelper(pointLight2_1, 1);
        //this.scene.add(pointLightHelper2_1);

        const pointLight2_2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight2_2.position.set( -28, 12, 20);
        pointLight2_2.castShadow = true;
        this.scene.add(pointLight2_2);

        let pointLightHelper2_2 = new THREE.PointLightHelper(pointLight2_2, 1);
        //this.scene.add(pointLightHelper2_2);

        //PAINTS LIGHTS
        const pointLight3 = new THREE.PointLight( 0xFFFFFF, 2, 100 );
        pointLight3.position.set( 0, 12, -20);
        pointLight3.castShadow = true;
        this.scene.add(pointLight3);

        let lightHelper3 = new THREE.PointLightHelper(pointLight3, 1);
        //this.scene.add(lightHelper3);

        const pointLight3_1 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight3_1.position.set( 28, 12, -20);
        pointLight3_1.castShadow = true;
        this.scene.add(pointLight3_1);

        let pointLightHelper3_1 = new THREE.PointLightHelper(pointLight3_1, 1);
        //this.scene.add(pointLightHelper3_1);

        const pointLight3_2 = new THREE.PointLight( 0xFFFFFF, 1.5, 100 );
        pointLight3_2.position.set( -28, 12, -20);
        pointLight3_2.castShadow = true;
        this.scene.add(pointLight3_2);

        let pointLightHelper3_2 = new THREE.PointLightHelper(pointLight3_2, 1);
        //this.scene.add(pointLightHelper3_2);


        let ambientLight = new THREE.AmbientLight(0x454545);
        this.scene.add(ambientLight);

    }

    RequestAnimationFrame(){
        requestAnimationFrame(()=> this.RequestAnimationFrame());
        // this.renderer.render(this.scene, this.camera);
        this.CameraSwitch();
        this.Update();
    }

    CameraSwitch() {
        if(this.camera1Active){
            this.renderer.render(this.scene, this.camera1);
        }else if (this.camera2Active){
            this.renderer.render(this.scene, this.camera2);
        }else if(this.faceCamActive){
            this.renderer.render(this.scene, this.faceCam);
        }
    }
    Update(){
        const delta = this.clock.getDelta();
        try{
            this.mixer.update(delta);
        }catch (e){
            ;
        }

        this.MoveOnCurve();
        this.KeyboardHandling(delta);

        this.controls.update();
        this.camera2.lookAt(this.GetBird().position);

    }

    AddCurve(){
        this.curve = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( 60,20,15 ),

            new THREE.Vector3( 0,10,17 ),

            //INNER CIRCLE STATUES
            new THREE.Vector3( 5,8,0 ),
            new THREE.Vector3( 20,8,0 ),
            new THREE.Vector3( 28,13,8 ),
            new THREE.Vector3( 25,13,20),


            new THREE.Vector3( -50,20,15 ),
            new THREE.Vector3( -50,20,-15 ),
            new THREE.Vector3( 0,10,-19 ),

            //INNER CIRCLE PAINTS
            new THREE.Vector3( -5,8,-3 ),
            new THREE.Vector3( -25,8, 0 ),
            new THREE.Vector3( -28,13, -8 ),
            new THREE.Vector3( -25,13, -20 ),

            new THREE.Vector3( 60,20,-15 ),
        ], true );
        let points = this.curve.getPoints( 50 );
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        let material = new THREE.LineBasicMaterial( { color : 0xff0000 });
        let curveObject = new THREE.Line( geometry, material );
        //curveObject.visible = false;
        //this.scene.add(curveObject);

        this.up = new THREE.Vector3(0, 1, 0);
        this.targetRotation = new THREE.Quaternion();

        this.PosIndex = 0;
    }

    MoveOnCurve(){
        this.PosIndex += 0.25;
        if (this.PosIndex > 100000) { this.PosIndex = 0;}
        var camPos = this.curve.getPoint(this.PosIndex / 1000);
        var camRot = this.curve.getTangent(this.PosIndex / 1000);
        this.GetBird().position.x = camPos.x;
        this.GetBird().position.y = camPos.y;
        this.GetBird().position.z = camPos.z;
        this.GetBird().rotation.x = camRot.x;
        this.GetBird().rotation.y = camRot.y;
        this.GetBird().rotation.z = camRot.z;
        this.GetBird().lookAt(this.curve.getPoint((this.PosIndex+1) / 1000));
    }

    KeyboardHandling(delta){
        const moveDistance = 5 * delta;
        const rotateAngle = Math.PI / 2 * delta;
        this.speedUp = 1;
        //console.log(delta);

        if (this.keyboard.pressed("1")) {
            this.camera1Active = true;
            this.camera2Active = false;
            this.faceCamActive = false;
        }
        if (this.keyboard.pressed("2")) {
            this.camera1Active = false;
            this.camera2Active = true;
            this.faceCamActive = false;
        }
        if(this.keyboard.pressed("3")){
            this.camera1Active = false;
            this.camera2Active = false;
            this.faceCamActive = true;
        }

        if (this.keyboard.pressed("shift")){
            this.speedUp += 2;
            this.fallSpeed = 0;
        }else{
            if(!this.GetBird().position.y <= 4){
                this.speedUp = 1;
            }else{
                this.speedUp = 0;
            }
        }
        if ( this.keyboard.pressed("W") ) {
            this.GetBird().translateZ(moveDistance * speedUp);
            if(this.sideAngle > 0){
                this.GetBird().translateX(this.sideAngle/2000);
            }
            if(this.sideAngle < 0){
                this.GetBird().translateX(this.sideAngle/2000);
            }
        }
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
    Ammo().then((lib) =>{
        Ammo = lib;
        _APP = new MainWorld();
        _APP.RequestAnimationFrame();
    })

});