/*
Team: This Variable is yet to be Declared
Members: Daniel Johnston, Benedikt Reynolds, Rebecca Panitch,
		Marcus Lee, Zepeng Hu
PA02: Work with your team to modify the game0 demo from class and
		make the following changes:
				- Add key controls "Q" and "E" to rotate the node camera view to the
					left and right, respectively
				-	Replace the box node with a Monkey node
				- Create a NonPlayableCharacter which moves toward the node if
					the node gets too close
				- When the NPC hits the node, the node should lose a point of health
					and the NPC should be teleported to a random positiion on the board
				- When the node reaches zero health, the game should go to a "you lose"
					scene, which the player can restart with the "R" key
				- Add a start screen, where the user can initatie play by hitting the "P"
					key
				- Each member of the team should also add at least one additional feature
					to the game
BUGS:
*/

	var scene, renderer;  // all threejs programs need these
	var camera, nodeCam, edgeCam, upperCam;  // we have two cameras in the main scene
	var node;
	var index = [];
	var nodes = [];
	var head;
	var balls = [];

	// here are some mesh objects ...
	//var cone;
	//var torus;
	//var npc;
	//var goldenSnitch; //actually hot pink

	var endScene, endCamera, endText;
	var loseScene, startScene, midScene;

	var controls =
	     {fwd:true, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, rleft:false,
				rright:false, start:false, hit:false, npc:false, goldenSnitch:false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, lives:3, scene:'start', camera:'none' }

	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!

	function createStartScene() {
		startScene = initScene();
		endText = createSkyBox('wood.jpg',10);

		//endText.rotateX(Math.PI);
		startScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		startScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}
	function createMidScene(){
		midScene = initScene();
		var geometry = new THREE.PlaneGeometry( 1600, 925, 128 );
		var texture = new THREE.TextureLoader().load( '../images/hearts.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		mesh.position.z-=000;
		mesh.position.y-=400;
		mesh.rotateX(-Math.PI/2);
		endText = mesh;
		//endText.rotateX(Math.PI);
		midScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		midScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	function createLoseScene() {
		loseScene = initScene();
		var geometry = new THREE.PlaneGeometry( 1600, 925, 128 );
		var texture = new THREE.TextureLoader().load( '../images/loser.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		mesh.position.z-=000;
		mesh.position.y-=400;
		mesh.rotateX(-Math.PI/2);
		endText = mesh;
		loseScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		loseScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	function createEndScene() {
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);

		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	//To initialize the scene, we initialize each of its component
	function init() {
      initPhysijs();
			scene = initScene();
			createEndScene();
			createLoseScene();
			createMidScene();
			createStartScene();
			initRenderer();
			createMainScene();
	}

	function createMainScene() {
      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,75,0);
			camera.lookAt(0,0,0);

			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the node
			nodeCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			upperCam = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			createS();
			gameState.camera = camera;

      		edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
      		edgeCam.position.set(20,20,10);

			//addBalls();
			//addHealthBalls();
			//addDeathBalls();



			torus = createTorus();
			torus.position.set(0,0,0);
			torus.rotation.set(135,0,0);
			scene.add(torus);

			torus = createTorus();
			torus.position.set(0,0,0);
			torus.rotation.set(0,45,0);
			scene.add(torus);

			addBalls();

			//npc = createBoxMesh2(0x0000ff,1,2,4);
			//npc.position.set(30,5,-30);
			//scene.add(npc);
			//console.dir(npc);
			//playGameMusic();

			//goldenSnitch = createSphereMesh();
			//goldenSnitch.position.set(16, 5, -30);
			//scene.add(goldenSnitch);
	}

	function randN(n) {
		return Math.random()*n;
	}

	function addBalls() {
		var numBalls = 5;

		for(i=0;i<numBalls;i++) {
			var ball = createBall();
			ball.position.set(randN(100)-50,15,randN(100)-50);
			scene.add(ball);
			balls.push(ball);
		}
	}

	function playGameMusic() {
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file) {
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene() {
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs() {
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer() {
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	function createPointLight() {
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}

	function createBoxMesh(color) {
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createBoxMesh2(color,w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createGround(image) {
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}

	function createSkyBox(image,k) {
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;

		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}

	function createnode(i) {
		var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var geometry = new THREE.SphereGeometry(1,10,10);
		let tmp = new Physijs.SphereMesh( geometry, pmaterial );
		tmp.setDamping(0.1,0.1);
		tmp.castShadow = true;
		tmp.addEventListener( 'collision',
			function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				if(other_object==node){
					console.log("checkmate");
					console.log("hit the tail!");
						node.__dirtyPosition = true;
						gameState.scene = 'lifelost'
						gameState.lives -=1;
						if (gameState.lives==0){
							gameState.scene = 'youlose';
						}
					}

				for(var i = 0; i<balls.length; i++){
					if (other_object==balls[i]){
						console.log("hit a ball!");
						scene.remove(balls[i]);
						node.__dirtyPosition = true;
						gameState.score ++;
						if (gameState.score==7){
							gameState.scene = 'youwon';
						}
					}
				}
			}
		);
		if (i == 0) {
			node = tmp;
			nodeCam.position.set(0,4,5);
			nodeCam.lookAt(0,4,10);
			upperCam.position.set(0,6,-6);
			upperCam.lookAt(0,4,16);
			node.add(nodeCam);
			node.add(upperCam);

			//node.translateY(10);

			nodeCam.translateY(-4);
			nodeCam.translateZ(3);
			head = new Physijs.SphereMesh( geometry, pmaterial );
			head.position.set(0,0,3);
			node.add(head);
		}


		return tmp;
	}

	function createS() {
		for (i = 0; i < 15; i++) {
			let tmp = createnode(i);
			tmp.position.set(0,1,-2.25*i);
			scene.add(tmp);
			index.push({x: tmp.position.x,
			y:tmp.position.y,
			z:tmp.position.z});
			nodes.push(tmp);
		}
	}
	function updateS() {
		let change = false;
		for (i = nodes.length - 1; i > 0; i--) {
			if (Math.sqrt(Math.pow((nodes[i].position.x - index[i - 1].x),2) +
				Math.pow((nodes[i].position.y - index[i - 1].y),2) +
				+ Math.pow((nodes[i].position.z - index[i - 1].z),2)) < 1.3 || change) {
					change = true;
				if (i != 1) {
					index[i] = {
						x: nodes[i].position.x,
						y: nodes[i].position.y,
						z: nodes[i].position.z,
					};
			  } else {
					index[1] = {
						x: nodes[1].position.x,
						y: nodes[1].position.y,
						z: nodes[1].position.z,
					};
					index[0] = {
						x: node.position.x,
						y: node.position.y,
						z: node.position.z,
					}
				}
			}
			if (Math.sqrt(Math.pow((nodes[i].position.x - nodes[i - 1].position.x),2) +
				Math.pow((nodes[i].position.y - nodes[i - 1].position.y),2) +
				+ Math.pow((nodes[i].position.z - nodes[i - 1].position.z),2)) < 2.2) {
					var velocity = nodes[i].getLinearVelocity();
					nodes[i].setLinearVelocity(
						new THREE.Vector3(index[i - 1].x - nodes[i].position.x,
															0,
															index[i - 1].z - nodes[i].position.z).normalize().multiplyScalar(velocity.length() * 0.88));

			} else {
				nodes[i].setLinearVelocity(
					new THREE.Vector3(index[i - 1].x - nodes[i].position.x,
														0,
														index[i - 1].z - nodes[i].position.z).normalize().multiplyScalar(controls.speed * 1.1));

			}

		}
	}

	function createSphereMesh() {
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xFF69B4} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
			var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createTorus(){
		var geometry = new THREE.TorusGeometry( 75, 3, 16, 100 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.Mesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createBall() {
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    	var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createHealthBall() {
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0x00FF00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    	var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createDeathBall(){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xff0000} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    	var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	var clock;
	function initControls() {
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event) {
		console.log("Keydown: '"+event.key+"'");
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.lives = 3;
			gameState.health = 10;
			//addBalls();
			//addHealthBalls();
			//addDeathBalls();
			return;
		}
		if (gameState.scene == 'youlose' && event.key=='r') {
			gameState.scene = 'main';
			scene = initScene();
			index = [];
			nodes = [];
			createMainScene();
			gameState.health = 10;
			gameState.lives = 3;
			gameState.score = 0;
			return;
		}
		if (gameState.scene =='lifelost' && event.key =='c'){
			gameState.scene = 'main';
			scene = initScene();
			index =[];
			nodes =[];
			createMainScene();
			return;

		}

		// this is the regular scene
		switch (event.key) {
			// change the way the node is moving
			//case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": node.rotation.set(0,0,0); node.__dirtyRotation=true;
				console.dir(node.rotation); break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
      case " ": controls.fly = true; break;
      case "h": controls.reset = true; break;

			case "q": controls.rleft = true; break;
			case "e": controls.rright = true; break;

			case "p": controls.start = true; break;


			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = nodeCam; break;
      case "3": gameState.camera = edgeCam; break;
			case "4": gameState.camera = upperCam; break;

			// move the camera around, relative to the node
			case "ArrowLeft": nodeCam.translateY(1);break;
			case "ArrowRight": nodeCam.translateY(-1);break;
			case "ArrowUp": nodeCam.translateZ(-1);break;
			case "ArrowDown": nodeCam.translateZ(1);break;
		}
	}

	function keyup(event) {
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key) {
			//case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
      		case " ": controls.fly = false; break;
      		case "h": controls.reset = false; break;
			case "q": controls.rleft = false; break;
			case "e": controls.rright = false; break;
		}
	}


  function updatenode() {
		"change the node's linear or angular velocity based on controls state (set by WSAD key presses)"
		var forward = node.getWorldDirection();

		if (controls.fwd){
			node.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			node.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = node.getLinearVelocity();
			velocity.x=velocity.z=0;
			node.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      node.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			node.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.2,0));
		} else if (controls.right){
			node.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.2,0));
		}

		if (controls.rleft) {
			nodeCam.rotateY(0.01);
		}
		if (controls.rright) {
			nodeCam.rotateY(-0.01);
		}
		node.position.y = 1;

		/*if (controls.hit) {
			gameState.health--;
			controls.hit = false;
		}

    if (controls.reset){
      node.__dirtyPosition = true;
      node.position.set(40,10,40);
    }*/
	}

	function animate() {
		requestAnimationFrame( animate );

		switch(gameState.scene) {
			case "start":
				renderer.render(startScene, endCamera);
				if (controls.start) gameState.scene = 'main';
				break;

			case "youwon":
				//endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;

			case "youlose":
				renderer.render( loseScene, endCamera );
				break;

			case "lifelost":
				renderer.render(midScene, endCamera);
				break;

			case "main":

				updatenode();
				updateS();
        		edgeCam.lookAt(node.position);
	    		scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);
		}

		//draw heads up display ..
	if(gameState.scene=="start"){
		  var info = document.getElementById("info");
			info.innerHTML='<div style="font-size:24pt">Score: '
	    + gameState.score
	    + " Lives="+gameState.lives
			+ '     Press p to play'
	    + '</div>';
	}
	else if(gameState.scene=='youlose' || gameState.scene=='youwon'){
		var info = document.getElementById("info");
			info.innerHTML='<div style="font-size:24pt">Score: '
	    + gameState.score
	    + " Lives="+gameState.lives
			+ '     Press r to restart'
	    + '</div>';
	}
	else if(gameState.scene =='lifelost'){
		var info = document.getElementById("info");
			info.innerHTML='<div style="font-size:24pt">Score: '
	    + gameState.score
	    + " Lives="+gameState.lives
			+ '     Lost a life. Press c to continue'
	    + '</div>';
	}
	else{
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
		+ gameState.score
		+ " Lives="+gameState.lives
		+ '</div>';
	}
}
