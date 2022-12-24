export class BirdController{
    constructor(params) {
        this.Init(params);
    }
    Init(params){
        this.params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this.input = new BirdControllerInput();
        this.stateMachine = new StateMachine();
        this.LoadModel('glb/eagle.gltf');
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

    Update(timeInSeconds) {
        this.stateMachine.Update(timeInSeconds, this.input);

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        // if (this.input.keys.shift) {
        //     acc.multiplyScalar(2.0);
        // }

        // if (this.stateMachine.currentState.Name == 'dance') {
        //     acc.multiplyScalar(0.0);
        // }

        if (this.input.keys.W) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this.input.keys.S) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this.input.keys.A) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this.input.keys.D) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        oldPosition.copy(controlObject.position);

        // if (this._mixer) {
        //     this._mixer.update(timeInSeconds);
        // }
    }
}

export class BirdControllerInput{
    constructor(){
        this.Init();
    }
    Init(){
        this.keys = {
            W: false,
            A: false,
            S: false,
            D: false,
            Q: false,
            E: false,
            Space: false,
        };
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event){
        switch (event.key) {
            case 'W':
                this.keys.W = true;
                break;
            case 'A':
                this.keys.A = true;
                break;
            case 'S':
                this.keys.S = true;
                break;
            case 'D':
                this.keys.D = true;
                break;
            case 'E':
                this.keys.E = true;
                break;
            case 'Q':
                this.keys.Q = true;
                break;
            case 'SPACE':
                this.keys.Space = true;
                break;
        }
    }
    onKeyUp(event){
        switch (event.key) {
            case 'W':
                this.keys.W = false;
                break;
            case 'A':
                this.keys.A = false;
                break;
            case 'S':
                this.keys.S = false;
                break;
            case 'D':
                this.keys.D = false;
                break;
            case 'E':
                this.keys.E = false;
                break;
            case 'Q':
                this.keys.Q = false;
                break;
            case 'SPACE':
                this.keys.Space = false;
                break;
        }
    }
}

export class StateMachine{
    constructor() {
        this.states = {};
        this.currentState = null;
    }

    AddState(name, type){
        this.states[name] = type;
    }

    SetState(name){
        const prevState = this.currentState;

        if(prevState){
            if(prevState.Name == name)
                return;
            prevState.Exit();
        }

        const state = new this.states[name](this);

        this.currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input){
        if(this.currentState){
            this.currentState.Update(timeElapsed, input);
        }
    }
}

export class BirdSM extends StateMachine{

    constructor(proxy) {
        super();
        this.proxy = proxy;
        this.Init();
    }

    Init(){
        this.AddState('idle', IdleState);
        this.AddState('fly', FlyState);
        //this.AddState('jump', JumpState);
    }
}
export class State {
    constructor(parent) {
        this.parent = parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
}
export class IdleState extends State{
    constructor(parent) {
        super(parent);
    }

    getName(){
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this.parent.proxy.animations['idle'].action;
        if(prevState){
            const prevAction = this.parent.proxy.animations[prevState.Name].action;
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5,true);
            idleAction.play();
        }else{
            idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if(input.keys.W || input.keys.S){
            this.parent.SetState('fly');
        }else if(input.keys.Space){
            this.parent.SetState('jump');
        }
    }
}

export class FlyState extends State{
    constructor(parent) {
        super(parent);
    }

    get Name(){
        return 'fly';
    }

    Enter(prevState){
        const curAction = this.parent.proxy.animations['fly'].action;
        if(prevState){
            const prevAction = this.parent.proxy.animations[prevState.Name].action;
            curAction.reset();
            curAction.setLoop(THREE.LoopPingPong, 1);
            curAction.crossFadeFrom(prevAction, 0.5,true);
            curAction.play();
        }else{
            curAction.play();
        }
    }
    Exit() {
    }

    Update(timeElapsed, input) {
        if(!input.keys.W || !input.keys.S){
            this.parent.SetState('idle');
        }
        return;
    }
}
