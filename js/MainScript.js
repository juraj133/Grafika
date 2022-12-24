class World{

    constructor() {
        this.Init();
    }

    Init(){
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
        let floorTexture = new THREE.ImageUtils.loadTexture('texture/floor.jpg');
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

    Update(){
        this.KeyboardHandling();
        this.controls.update();
    }

    KeyboardHandling(){
        const clock = new THREE.Clock();
        const delta = clock.getDelta();
        const moveDistance = 5 * delta;
        const rotateAngle = Math.PI / 2 * delta;

        if ( this.keyboard.pressed("S") ) {
            this.eagle.translateZ(-moveDistance);
            console.log('S');
        }
        if ( this.keyboard.pressed("W") )
            car.translateZ( moveDistance );

        if ( this.keyboard.pressed("E") )
            car.translateX( -moveDistance );

        if ( this.keyboard.pressed("Q") )
            car.translateX(moveDistance);

        const rotation_matrix = new THREE.Matrix4().identity();
        if ( this.keyboard.pressed("A") ){
            car.rotateOnAxis( new THREE.Vector3(0,2,0),rotateAngle);
        }
        if ( this.keyboard.pressed("D") ){
            car.rotateOnAxis( new THREE.Vector3(0,2,0),-rotateAngle);
        }
    }

    LoadModel(path){
        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) =>{
            gltf.scene.traverse(c =>{
                c.castShadow = true;
            });
            this.scene.add(gltf.scene);
            gltf.animations;
            this.eagle = gltf.scene;
        });
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
    _APP = new World();
});