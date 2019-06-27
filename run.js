(function mainFunction(select){

    
    let renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.setPixelRatio( window.devicePixelRation);
    renderer.setClearColor(0x888888, 1.0);

//button Inits
    var initButton = document.getElementById(select.initButtonId);
    var selectionSortButton = document.getElementById(select.selectionSortButtonId);

    
	document.body.appendChild(renderer.domElement);
//Scene
	let scene = new THREE.Scene();
	let aspect = window.innerWidth/window.innerHeight;
//Camera
	let camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
	scene.add(camera);
	
//Plane
	let planeGeometry = new THREE.PlaneGeometry(700, 200, 1, 1);
	let planeTexture = new THREE.TextureLoader().load("./textures/grass2.jpg")
	let planeMaterial = new THREE.MeshLambertMaterial({color: 0xFFBF80, side: THREE.DoubleSide, map: planeTexture});
	
	let plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.rotation.x = -0.5* Math.PI;
	plane.position.x =0;
	plane.position.y =0;
	plane.position.z =0;
	scene.add(plane);
//CAMERA	
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 250;
	camera.lookAt(scene.position);
	let cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    
	var spriteMap = new THREE.TextureLoader().load("./textures/ghosts.png");
    var spriteMaterial = new THREE.SpriteMaterial({map:spriteMap, color:0xFFFFFF});

//loaders
	function loadModel(objectInfo){
        //console.log(objectInfo);
		let mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath(objectInfo.mtlPathName);
		
		let objLoader = new THREE.OBJLoader();
		objLoader.setPath(objectInfo.objPathName);
		mtlLoader.load(objectInfo.mtlFile, onMtlLoad, showLoadPorgress, onError);
		function onMtlLoad(mtl){
			mtl.preload();
			objLoader.setMaterials(mtl);
			objLoader.load(objectInfo.objFile, onObjLoad, showLoadPorgress, onError);
		}
		function onObjLoad(object){

			let bBox = new THREE.Box3().setFromObject(object);
			let size = new THREE.Vector3();
			bBox.getSize(size);
			let maxBaseSize = Math.max(size.x, size.z);
			object.scale.multiplyScalar(objectInfo.scale/maxBaseSize);
			object.position.copy(objectInfo.translateVector);
			object.rotation.x = objectInfo.xrotate;
			object.rotation.y = objectInfo.yrotate;
			object.rotation.z = objectInfo.zrotate;
			
			objectInfo.obj = object;
			scene.add(object);
		}
		function showLoadPorgress(xhr){
			//console.log((xhr.loaded/xhr.total*100)+ '% loaded');
		}
		function onError(){
            console.log('An error happened');
		}
	}

    
//ARRAYS
    var unsorted = new Array(8);
    var treeArray = new Array(unsorted.length);    
    var lightArray = new Array(unsorted.length);
    var sortControlIndex = 0;
    var spriteArray = new Array(unsorted.length);


//ADD TREES
    function addTrees(array){
        var counti = 1;
        for (var i = 0; i<array.length; i++)
        {
            var divi = -700/2;  // = -150
            var subdiv = 700/(2*array.length); // = 50

                	//OBJECTS	
	        let TreeInfo = {
		    mtlPathName: "./",
		    objPathName: "./",
		    mtlFile: "DeadTree.mtl",
		    objFile: "DeadTree.obj",
		    scale: 35,
		    xrotate :0,
		    yrotate :0 + i*10 + Math.floor(Math.random() * i *5),
		    zrotate :0,
            translateVector: new THREE.Vector3(  (divi+((i+counti)*subdiv))  ,0,0),
            object: undefined,
            value: array[i]
	        };
            treeArray[i] = TreeInfo;
            loadModel(treeArray[i]); 
            counti++;
        }
        counti =1;
        return;
    }

//ADD WHISPS
    var colorArray  = [0xFFA500,0xFF00A5,0xA5FF00,0xA500FF,0x00FFA5,0x00A5FF,0xff4040,0xbcb1f9]
    function addWhisps(array)
    {

        for (let i = 0; i<lightArray.length; i++)
        {   
            lightArray[i] = new Array(array[i]);
            spriteArray[i] = new Array(array[i]);
            for(let j = 0; j<array[i]; j++)
            {
                lightArray[i][j] = new THREE.PointLight(colorArray[i], 1.0, 75, 1);
                spriteArray[i][j] = new THREE.Sprite(spriteMaterial);
                spriteArray[i][j].scale.set(10,10,1);
                lightArray[i][j].add(spriteArray[i][j]);            
                lightArray[i][j].position.x = j+ (i+0)*(j+0);
                lightArray[i][j].position.y = 250 + (j*5);
                lightArray[i][j].position.z = j+ (i+0)*(j+0);
                scene.add(lightArray[i][j]);
            }        
        }
        
    }

    //Auxs
    function reset(array){
        if(!array)
        {
            var array = []
        }
        for(var i = lightArray.length-1; i>=0 ; i--)
        {
            for(var j = lightArray[i].length-1; j>=0; j--)
            {   
                scene.remove(lightArray[i][j]);
                lightArray[i][j] = undefined;
            }
            lightArray[i] = undefined;
        }
        
        for(var i = treeArray.length-1; i>=0; i--)
        {
            scene.remove(treeArray[i].obj)
            scene.remove(treeArray[i]);
        }
        treeArray = new Array(array.length);
        
        return;
    }

    //ANIMATE AND RENDER
	function animate() {
				requestAnimationFrame( animate );
				render();
			}
    let render = function ()
    {
        
		var time = Date.now() * 0.0005;
       

        if(lightArray[0]!=undefined){

            for (var i = 0; i<lightArray.length; i++)
            {   
                for(var j = 0; j<lightArray[i].length; j++)
                {    
		            lightArray[i][j].position.x = treeArray[i].translateVector.x - Math.sin(time * (j+5)/3) * 30;
                    lightArray[i][j].position.z = Math.cos(time*(j+5)/3)*30;   
                }
            }   
        }
        renderer.render( scene, camera );
    };


//WHISP ANIMATE
    function whispAnimate(tree, oldLight, i, j){
        var newLight = oldLight;
        oldLight.remove();
        newLight.remove();
        newLight.position.x = oldLight.position.x;
        newLight.position.y = oldLight.position.y;

        scene.add(newLight);
        var newX, newY, newZ;

        function lerp(a, b, t) 
        {
            return a + (b - a) * t
        }

        var t = 0, dt = 0.02,                   
        end = {x: tree.translateVector.x + 35, y: tree.translateVector.y +15 + (i+j*5), z: 0};      
    
        function loop() {
            newX = lerp(newLight.position.x, end.x, smooth(t));  
            newY = lerp(newLight.position.y, end.y, smooth(t));   
            newZ = lerp(newLight.position.z, end.z, smooth(t));  
            newLight.position.set(newX, newY, newZ);  
            t += dt;
            if (t <= 0 || t >=1) dt = -dt;        
            requestAnimationFrame(loop)
        }
        
        
        function smooth(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t}
        loop();
    }
    //SET TO GREEN LIGHTS
    function greenLights(lightArray){
        for(var i=0; i<lightArray.length;i++){
            for(var j=0; j<lightArray[i].length;j++){
                lightArray[i][j].color.setHex(0x00FF00);
            }
        }
    }

    cameraControls.addEventListener("change", render, false);

//BUTTONS    
    //Init Button
    initButton.addEventListener("click",function(){
        if(unsorted[0]!= undefined){
            reset(unsorted);    
        }
        for(var i = 0; i<unsorted.length; i++)
        {
            unsorted[i] = Math.floor(Math.random() * 8)+1 ;
        }
        addTrees(unsorted);
        addWhisps(unsorted);
        
        for(var i = 0; i<lightArray.length;i++)
        {
            console.log("Light array initialialize:", lightArray[i].length);
        }
        
        for (let i = 0; i < treeArray.length; i++)
        {
            
            for(var j = 0; j < lightArray[i].length; j++)
            {
                
                whispAnimate(treeArray[i], lightArray[i][j], i , j);
            }
        }
    })

    var innerIndex = 0;
    //SelectionSort Button
    selectionSortButton.addEventListener("click", function(){
        var len = treeArray.length;
        if (sortControlIndex >= len){
            sortControlIndex =0;
            greenLights(lightArray);
            return;
        } 
         min = sortControlIndex;
            
        for(var j=sortControlIndex+1; j<len; j++){
            if(lightArray[j].length<lightArray[min].length)
            {
                min = j;
            }
        }
    
        swapLight(sortControlIndex, min);
        sortControlIndex++;
        function swapLight(oldIndex, newIndex){
            var temp = lightArray[oldIndex];
                lightArray[oldIndex] = lightArray[newIndex];
                lightArray[newIndex] = temp;
            }
    });

    animate();

    let resize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        render();
        };

    window.addEventListener("resize",resize, false)
})

({
    initButtonId: "init-button",
    selectionSortButtonId: "selection_sort-button",
});
	