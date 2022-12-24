// import {BirdController} from "./BirdMovement";


class ThirdPersonCamera{
    constructor(params) {
        this.params = params;
        this.camera = params.camera;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    CalculateOffset(){
        const idealOffset = new THREE.Vector3(-15,20,-30);
        idealOffset.applyQuaternion(this.params.target.rotation);
        idealOffset.add(this.params.target.position);
        return idealOffset;
    }
    CalculateLookAt(){
        const idealLookAt = new THREE.Vector3(0,10,50);
        idealLookAt.applyQuaternion(this.params.target.rotation);
        idealLookAt.add(this.params.target.position);
        return idealLookAt;
    }
    Update(timeElapsed){
        const idealOffset = this.CalculateOffset();
        const idealLookAt = this.CalculateLookAt();

        this.currentPosition.copy(idealOffset);
        this.currentLookAt.copy(idealLookAt);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}

class MainWorld{

    constructor() {
        this.Init();
    }




    getBird(){
        return this.Bird;
    }
    getBirdName(){
        return this.Name;
    }
    SetBird(object){
        this.Bird = object;
    }

    Init(){
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.Type = THREE.PCFSoftShadowMap;
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

        // this.tps = new ThirdPersonCamera({
        //     camera: this.camera,
        // })

        this.scene = new THREE.Scene();

        this.keyboard = new THREEx.KeyboardState();

        this.AddObjects();
        this.AddLights();

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
        let plane = new THREE.Mesh(geometryPlane, materialPlane);
        plane.position.set(0, -0.5, 0);
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        //GLTF
        this.LoadModel('glb/eagle.gltf');

        // this.FBXloader();
    }

    LoadModel(path){
        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) =>{
            gltf.scene.traverse(c =>{
                c.castShadow = true;
            });
            this.scene.add(gltf.scene);
             this.SetBird(gltf.scene);
             this.sideAngle = 0;
             //console.log(this.getBird().toString())
             this.getBird().add(this.camera);
        });
    }

    AddLights(){
        let directionalLight = new THREE.DirectionalLight(0xFFFFFFFF);
        directionalLight.position.set(100,100,100);
        directionalLight.target.position.set(0,0,0);
        directionalLight.castShadow = false;
        this.scene.add(directionalLight);

        let lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xFFFFFF);
        this.scene.add(lightHelper);

        let ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

    }

    OnWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth / window.innerHeight);
    }

    RAF(){
        requestAnimationFrame(()=> {
            this.renderer.render(this.scene, this.camera);
            this.RAF();
        });
        this.Update();
    }

    Update(timeElapsed){
        const timeElapsedS = timeElapsed * 0.001;
        this.KeyboardHandling();
        this.controls.update();

        //this.tps.Update(timeElapsedS);
    }

    KeyboardHandling(){
        const delta = this.clock.getDelta();
        const moveDistance = 5 * delta;
        const rotateAngle = Math.PI / 2 * delta;
        if ( this.keyboard.pressed("S") ) {
            this.getBird().translateZ(-moveDistance);
        }
        if ( this.keyboard.pressed("W") ) {
            this.getBird().translateZ(moveDistance);
            if(this.sideAngle > 0){
                this.getBird().position.x -= this.sideAngle/3000;
            }
            if(this.sideAngle < 0){
                this.getBird().position.x -= this.sideAngle/3000;
            }
        }
        if ( this.keyboard.pressed("D") ) {
            if(this.getBird().rotation._z <= 0.85){
                this.getBird().rotateOnAxis(new THREE.Vector3(0, 0, 2), rotateAngle);
                this.sideAngle +=1;
            }
           // this.getBird().position.x -= moveDistance/8;

        }
        if ( this.keyboard.pressed("A") ) {
            if(this.getBird().rotation._z >= -0.85){
                this.sideAngle -=1;
                this.getBird().rotateOnAxis(new THREE.Vector3(0, 0, 2), -rotateAngle);
            }
            //this.getBird().translateX(moveDistance);
        }
        if(this.keyboard.pressed("space")){
            console.log(this.getBird().rotation._x);
            if(this.getBird().rotation._x >= -0.55) {
                this.getBird().rotateOnAxis(new THREE.Vector3(2, 0, 0), -rotateAngle);
            }
        }
        if(this.keyboard.pressed("shift"))
            if(this.getBird().rotation._x <= 0.55) {
                this.getBird().rotateOnAxis(new THREE.Vector3(2, 0, 0), rotateAngle);
            }
        //const rotation_matrix = new THREE.Matrix4().identity();
        if ( this.keyboard.pressed("Q") ){
            this.getBird().rotateOnWorldAxis( new THREE.Vector3(0,2,0),rotateAngle/4);
        }
        if ( this.keyboard.pressed("E") ){
            this.getBird().rotateOnWorldAxis( new THREE.Vector3(0,2,0),-rotateAngle/4);
        }

    }

    // FBXloader(){
    //     const loader = new THREE.FBXLoader();
    //     //loader.setPath('./glb/dove-bird-rigged/source/Dove/');
    //     loader.load('./glb/dove-bird-rigged/source/Dove/Dove.FBX', (fbx)=>{
    //         fbx.scale.setScalar(0.1);
    //         fbx.traverse(c =>{
    //             c.castShadow = true;
    //         })
    //         this.scene.add(fbx);
    //     })
    // }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new MainWorld();
});