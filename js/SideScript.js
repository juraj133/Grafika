var camera, scene, renderer, controls, thirdPersonCam;
var geometry, material, cube, cylinder, sphere, spotlight1, spotLightHelper1;

//Doplnenie premennych pre Split kamier CV 11
var view1Elem, view2Elem, cameraHelper, camera2, gui;
var aspect, fov, near,far;
var car;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

// var curve = new THREE.CatmullRomCurve3( [
// 	new THREE.Vector3( -5,1,5 ),
// 	new THREE.Vector3( 5,1,5 ),
// 	new THREE.Vector3( 5,1,-5 ),
// 	new THREE.Vector3( -5,1,-5 ),
// 	], true );
// var points = curve.getPoints( 50 );
// var geometry = new THREE.BufferGeometry().setFromPoints( points );
// var material = new THREE.LineBasicMaterial( { color : 0xff0000 });
// var curveObject = new THREE.Line( geometry, material );
var PosIndex = 0;


init();
render();

// class ThirdPersonCamera{
// 	constructor(params) {
// 		this.params = params;
// 		this.camera = camera;
// 	}
// }

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
	camera.position.set(0, 2, -5);
	//camera.lookAt(0,0,0);

	//thirdPersonCam = new ThirdPersonCamera({camera: camera, });

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();

    addObjects();
    addLights();


	//camera.lookAt(0,0,0)
    //controls = new THREE.OrbitControls( camera, renderer.domElement );

}

function render() {

    requestAnimationFrame( render );
    renderer.render( scene, camera );
	// camera.lookAt(car.position.x, car.position.y, car.position.z);
	// camera.lookAt(car.position);
	update();

    // animovanie krivky
	// scene.add(curveObject);

	// PosIndex++;
	//
	// if (PosIndex > 10000) { PosIndex = 0;}
	// var camPos = curve.getPoint(PosIndex / 1000);
	// var camRot = curve.getTangent(PosIndex / 1000);
	//
	// spotlight1.position.x = camPos.x;
	// spotlight1.position.y = camPos.y;
	// spotlight1.position.z = camPos.z;
	// spotlight1.rotation.x = camRot.x;
	// spotlight1.rotation.y = camRot.y;
	// spotlight1.rotation.z = camRot.z;
	// spotlight1.lookAt(curve.getPoint((PosIndex+1) / 1000));
	// spotLightHelper1.update();
}

function addObjects() {

	var floorTexture = new THREE.ImageUtils.loadTexture('texture/floor.jpg');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(10, 10);
	var geometryPlane = new THREE.PlaneGeometry(100, 100, 4, 4);
	var materialPlane = new THREE.MeshStandardMaterial({
		map: floorTexture,
		side: THREE.DoubleSide,
		roughness: 0.12,
		metalness: 0.65
	});
	plane = new THREE.Mesh(geometryPlane, materialPlane);
	plane.position.set(0, -0.5, 0);
	plane.rotation.x = Math.PI / 2;
	plane.receiveShadow = true;
	scene.add(plane);


	// var geometrySphere = new THREE.SphereGeometry(100, 100, 100);
	// var sphereTexture = new THREE.ImageUtils.loadTexture('texture/sky.jpg');
	// var materialSphere = new THREE.MeshBasicMaterial({map: sphereTexture, transparent: true, side: THREE.DoubleSide});
	// sphere = new THREE.Mesh(geometrySphere, materialSphere);
	// sphere.position.set(0, 0, 0);
	// sphere.castShadow = true
	// scene.add(sphere);

	loadOBJectsPhong( 0, -0.5, 0,
		'models/owl/GreatHornedOwl.obj',
		1, 1, 1,
		'models/owl/GreatHornedOwl_BaseColor.png',
		'white');
}

function addLights(){

    var ambientLight = new THREE.AmbientLight(0xDDDDDD);
    scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xFFFFFF,10, 500, 20)
	pointLight.position.set( 15, 75, 0 );
	pointLight.castShadow = true;
	scene.add(pointLight);

	var lightHelper = new THREE.PointLightHelper(pointLight);
	scene.add(lightHelper);
    // spotlight1 = new THREE.SpotLight('rgb(255,255,255)');
    // spotlight1.angle = Math.PI/3;
    // spotlight1.position.set(0, 3, 8);
	// spotlight1.intensity = 4;
	// spotlight1.castShadow = true;
    // scene.add(spotlight1);
	//
    // spotlight1.penumbra = 1;
    // spotLightHelper1 = new THREE.SpotLightHelper( spotlight1 );
    // scene.add( spotLightHelper1 );
}

function update()
{
	var delta = clock.getDelta();
	var moveDistance = 5 * delta;
	var rotateAngle = Math.PI / 2 * delta;

	if ( keyboard.pressed("S") ){
		car.translateZ( -moveDistance );
		// camera.position.z -=moveDistance;
	}
	if ( keyboard.pressed("W") ){
		car.translateZ( moveDistance );
		// camera.position.z += moveDistance;
		}
	if ( keyboard.pressed("E") ){
		car.translateX( -moveDistance );
		// camera.position.x -= moveDistance;
	}
	if ( keyboard.pressed("Q") ){
		car.translateX(moveDistance);
		//camera.position.x += moveDistance;
	}
	if ( keyboard.pressed("up") )
		car.position.z -= moveDistance;
	if ( keyboard.pressed("down") )
		car.position.z += moveDistance;
	if ( keyboard.pressed("left") )
		car.position.x -= moveDistance;
	if ( keyboard.pressed("right") )
		car.position.x += moveDistance;

	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("A") ){
		car.rotateOnAxis( new THREE.Vector3(0,2,0),rotateAngle);
	}
	if ( keyboard.pressed("D") ){
		car.rotateOnAxis( new THREE.Vector3(0,2,0),-rotateAngle);
	}

	//camera.lookAt(car.position.x, car.position.y, car.position.z);
	//controls.update();
	//thirdPersonCam.Update(time);
}

function loadOBJectsPhong(x,y,z, path, scalex, scaley, scalez,
							texturePath, colorMaterial){
	var loader = new THREE.OBJLoader();
	var textureSurface = new THREE.TextureLoader().load(texturePath);
	var material = new THREE.MeshPhongMaterial({
				color: colorMaterial,
				map: textureSurface
				});
	loader.load( path, function ( object ) {
		object.traverse( function ( node ) {
		object.position.set(x,y,z);
		object.material = material;
		object.scale.set(scalex,scaley,scalez);
		if ( node.isMesh ) node.material = material;});
		//možnosti vrhania tieňov pre potomkov
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = textureSurface;
				child.castShadow = true;
			}
		});
		car = object;
		scene.add( object );
		//car.add(camera)

	});
}


