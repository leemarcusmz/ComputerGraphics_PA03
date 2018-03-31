/*
Team: This Variable is yet to be Declared
Members: Daniel Johnston, Benedikt Reynolds, Rebecca Panitch,
		Marcus Lee, Zepeng Hu
PA02: Work with your team to modify the game0 demo from class and
		make the following changes:
				- Add key controls "Q" and "E" to rotate the avatar camera view to the
					left and right, respectively
				-	Replace the box avatar with a Monkey avatar
				- Create a NonPlayableCharacter which moves toward the avatar if
					the avatar gets too close
				- When the NPC hits the Avatar, the avatar should lose a point of health
					and the NPC should be teleported to a random positiion on the board
				- When the Avatar reaches zero health, the game should go to a "you lose"
					scene, which the player can restart with the "R" key
				- Add a start screen, where the user can initatie play by hitting the "P"
					key
				- Each member of the team should also add at least one additional feature
					to the game
BUGS:
*/

	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, edgeCam, upperCam;  // we have two cameras in the main scene
	var avatar;

	// here are some mesh objects ...
	var cone;
	var torus;
	var npc;
	var goldenSnitch; //actually hot pink

	var endScene, endCamera, endText;
	var loseScene, startScene;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, rleft:false,
				rright:false, start:false, hit:false, npc:false, goldenSnitch:false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'start', camera:'none' }

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
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);

			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			upperCam = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			avatar = createAvatar();
			gameState.camera = avatarCam;

      		edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
      		edgeCam.position.set(20,20,10);

			addBalls();
			addHealthBalls();
			addDeathBalls();

			cone = createConeMesh(4,6);
			cone.position.set(10,3,7);
			scene.add(cone);

			torus = createTorus();
			torus.position.set(0,0,0);
			torus.rotation.set(135,0,0);
			scene.add(torus);

			torus = createTorus();
			torus.position.set(0,0,0);
			torus.rotation.set(0,45,0);
			scene.add(torus);

			npc = createBoxMesh2(0x0000ff,1,2,4);
			npc.position.set(30,5,-30);
			scene.add(npc);
			//console.dir(npc);
			//playGameMusic();

			goldenSnitch = createSphereMesh();
			goldenSnitch.position.set(16, 5, -30);
			scene.add(goldenSnitch);
	}

	function randN(n) {
		return Math.random()*n;
	}

	function addBalls() {
		var numBalls = 5;

		for(i=0;i<numBalls;i++) {
			var ball = createBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score == numBalls) {
							gameState.scene='youwon';
						}
            //scene.remove(ball);  // this isn't working ...
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addHealthBalls() {
		//creates spheres that increase health of avatar when they collide with avatar
		var numBalls = 2;

		for(i=0;i<numBalls;i++) {
			var ball = createHealthBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("avatar hit health ball (+1 health!)");
						soundEffect('good.wav');
						gameState.health += 1;  // add one to the score
						//drop below scene
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addDeathBalls() {
		//creates spheres that increase health of avatar when they collide with avatar
		var numBalls = 2;

		for(i=0;i<numBalls;i++) {
			var ball = createDeathBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("avatar hit death ball (you lose!)");
						soundEffect('bad.wav');
						if(gameState.health>5){
							gameState.health -=5;
						}
						else{
							gameState.health =0;
							gameState.scene = 'youlose';
						}
					}
				}
			)
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

	function createAvatar() {
		var loader = new THREE.JSONLoader();
		loader.load("../models/suzanne.json",
					function ( geometry, materials ) {
						console.log("loading suzanne");
						var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
						var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
						avatar = new Physijs.BoxMesh( geometry, pmaterial );
						avatar.setDamping(0.1,0.1);
						avatar.castShadow = true;

						avatarCam.position.set(0,4,0);
						avatarCam.lookAt(0,4,10);
						upperCam.position.set(0,6,-6);
						upperCam.lookAt(0,4,16);
						avatar.add(avatarCam);
						avatar.add(upperCam);

						avatar.translateY(10);

						avatarCam.translateY(-4);
						avatarCam.translateZ(3);
						scene.add(avatar);
						return avatar;
					},
					function(xhr){
						console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
					function(err){console.log("error in loading: "+err);}
				)
	}

	function createConeMesh(r,h) {
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
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
			gameState.health = 10;
			addBalls();
			addHealthBalls();
			addDeathBalls();
			return;
		}
		if (gameState.scene == 'youlose' && event.key=='r') {
			gameState.scene = 'main';
			scene = initScene();
			createMainScene();
			gameState.health = 10;
			gameState.score =0;
			return;
		}

		// this is the regular scene
		switch (event.key) {
			// change the way the avatar is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": avatar.rotation.set(0,0,0); avatar.__dirtyRotation=true;
				console.dir(avatar.rotation); break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
      		case " ": controls.fly = true;
          		console.log("space!!");
          		break;
      		case "h": controls.reset = true; break;

			case "q": controls.rleft = true; break;
			case "e": controls.rright = true; break;

			case "p": controls.start = true; break;


			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
      	case "3": gameState.camera = edgeCam; break;
			case "4": gameState.camera = upperCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;
		}
	}

	function keyup(event) {
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key) {
			case "w": controls.fwd   = false;  break;
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

	function updateNPC() {
		npc.lookAt(avatar.position);
	  //npc.__dirtyPosition = true;

		npc.addEventListener( 'collision',
			function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				if (other_object == avatar){
					controls.hit = true;  // add one to the score
					if (gameState.health == 1) {
						gameState.scene='youlose';
						gameState.health--;
					}
					//scene.remove(ball);  // this isn't working ...
					// make the ball drop below the scene ..
					// threejs doesn't let us remove it from the schene...
					controls.npc = true;
					this.setLinearVelocity(0);
				}
			}
		)

		var dis = Math.sqrt(Math.pow((avatar.position.x - npc.position.x),2) + Math.pow((avatar.position.y - npc.position.y),2) + Math.pow((avatar.position.z - npc.position.z),2));
		if (dis <= 20) {
			npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(5));
		}
		if (controls.npc) {
			controls.npc = false;
			npc.__dirtyPosition = true;
      		npc.position.set(randN(30),5,randN(30));
			npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(0));
		}
	}

	function upadateGoldenSnitch() {
	  goldenSnitch.lookAt(avatar.position);

	  goldenSnitch.addEventListener( 'collision',
	    function( other_object, relative_velocity, relative_rotation, contact_normal ) {
	      if (other_object == avatar){
	        controls.hit = true;
	        gameState.scene = 'youwon';

	        //scene.remove(ball);  // this isn't working ...
	        // make the ball drop below the scene ..
	        // threejs doesn't let us remove it from the schene...
	        controls.goldenSnitch = true;
	        this.setLinearVelocity(0);
	      }
	    }
	  )

	  var dis = Math.sqrt(Math.pow((avatar.position.x - goldenSnitch.position.x),2) + Math.pow((avatar.position.y - goldenSnitch.position.y),2) + Math.pow((avatar.position.z - goldenSnitch.position.z),2));
	  if (dis <= 20) {
			goldenSnitch.setLinearVelocity(goldenSnitch.getWorldDirection().multiplyScalar(-5));
			if(randN(30)<10){
				goldenSnitch.position.z += 10;
				goldenSnitch.__dirtyPosition = true;
			}
			console.log(randN(30));
	  }
	  if (controls.goldenSnitch) {
	    controls.goldenSnitch = false;
	    goldenSnitch.__dirtyPosition = true;
	        goldenSnitch.position.set(randN(30),5,randN(30));
	    goldenSnitch.setLinearVelocity(goldenSnitch.getWorldDirection().multiplyScalar(0));
	  }
	}

  function updateAvatar() {
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.rleft) {
			avatarCam.rotateY(0.01);
		}
		if (controls.rright) {
			avatarCam.rotateY(-0.01);
		}

		if (controls.hit) {
			gameState.health--;
			controls.hit = false;
		}

    if (controls.reset){
      avatar.__dirtyPosition = true;
      avatar.position.set(40,10,40);
    }
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

			case "main":
				updateAvatar();
				upadateGoldenSnitch();
				updateNPC();
        		edgeCam.lookAt(avatar.position);
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
	    + " health="+gameState.health
			+ '     Press p to play'
	    + '</div>';
	}
	else if(gameState.scene=='youlose' || gameState.scene=='youwon'){
		var info = document.getElementById("info");
			info.innerHTML='<div style="font-size:24pt">Score: '
	    + gameState.score
	    + " health="+gameState.health
			+ '     Press r to restart'
	    + '</div>';
	}
	else{
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
		+ gameState.score
		+ " health="+gameState.health
		+ '</div>';
	}
}
