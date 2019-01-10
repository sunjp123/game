import SocketServer from "./public/socket"
import { GAME_MESSAGE } from "../config/constConfig"
let gameData = {}
let scene = null;
let camera = null;
let renderer = null;
let gameStatus = 0; //未开始
let meshs = [];
let stats = null;
/**
 * 发送消息
 * @param {消息key} key 
 * @param {消息内容} value 
 */
const send = (key,value={})=>{
  let message = {name:'wuziqi',number:window.__GAME_NUMBER__,uid:window.__USER_ID__}
  socketServer.client.emit(key,{...message,...value})
}
/**
 * 创建socket 类
 */
const socketServer = new SocketServer({
  events:{
    'connect':()=>{
      console.log('connect')
    },
    [GAME_MESSAGE.REDIS_READY]:(message)=>{
      send(GAME_MESSAGE.GAME_INIT)
    },
    [GAME_MESSAGE.GAME_INIT]:(initData)=>{
      gameData = typeof initData == 'string'?JSON.parse(initData):initData
      gameStatus = gameData.status
      init(checkRole(gameData.roles))
    },
    [GAME_MESSAGE.GAME_SELECT_ROLE]:({status,role,canStart,uid})=>{
      if(status){
        if(role == 'playerA' || role == 'playerB')
        gameStatus = canStart?1:0
        gameData.roles[role] = uid
        if(window.__USER_ID__ == uid){
          start(role)
        }else if(checkRole(gameData.roles)){
          createPlayers(scene)
        }
        
      }
    },
    [GAME_MESSAGE.GAME_PLAY_CHESS]:({x,y,value,activePlayer})=>{
      gameData.activePlayer = activePlayer
      gameData.chessboard[x][y] = value
      let textureBlack = THREE.ImageUtils.loadTexture("/assets/textures/general/black.jpg");
      let textureWhite = THREE.ImageUtils.loadTexture("/assets/textures/general/white.jpg");
      let name = '0,'+x+','+y;
      let mesh = scene.children.find((obj)=>{
         if(obj instanceof THREE.Mesh && obj.name == name){
            return true
         }
         return false
      })
      mesh.material.map = value == 1?textureWhite:textureBlack
    },
    [GAME_MESSAGE.GAME_FINISH]:({msg})=>{
      alert(msg)
      gameStatus = 2;
    }
  }
});
/**
 * 创建角色卡片网格
 * @param {位置} position 
 * @param {角色} role 
 */
function createRoleMesh(geom,role,transparent) {

  var texture = THREE.ImageUtils.loadTexture("/assets/textures/general/" + role + ".jpg");
  var meshMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
  meshMaterial.side = THREE.FrontSide;//THREE.DoubleSide
  meshMaterial.map = texture;
  meshMaterial.ID = role;
  if(transparent&&gameData.roles[role]&&role!='audience'){
    meshMaterial.transparent = true; //是否可以设置透明度
    meshMaterial.opacity = 0.1;      //设置透明度
  }
  //基础材质 多用于线框调试
  // var wireFrameMat = new THREE.MeshBasicMaterial();
  // wireFrameMat.wireframe = true;

  // 融合材质
  // var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
  var mesh = new THREE.Mesh(geom, meshMaterial);
  return mesh;
}
/**
 * 创建角色卡片
 * @param {位置} position 
 * @param {角色} role 
 */
function createRoleCard(position,role){
    // create the ground plane
    var cardGeometry = new THREE.BoxGeometry(4, 4, 4,1, 1,1);
    var card = createRoleMesh(cardGeometry,role,true);
    card.name = role;
    // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    card.receiveShadow = true;
    // rotate and position the plane
    card.rotation.x = 0.5 * Math.PI;
    card.rotation.z = -0.5 * Math.PI;
    card.position.x = position.x;
    card.position.y = position.y;
    card.position.z = position.z;
    return card
}
/**
 * 创建棋盘
 * @param {场景} scene 
 */
function createChessboard(scene){
  var cubes = []
  var cubeGeometry = new THREE.BoxGeometry(6, 6, 6);
  var textureBlack = THREE.ImageUtils.loadTexture("/assets/textures/general/black.jpg");
  var textureWhite = THREE.ImageUtils.loadTexture("/assets/textures/general/white.jpg");
  var textureEmpty = THREE.ImageUtils.loadTexture("/assets/textures/general/empty.jpg");
  gameData.chessboard.forEach((boxs,i)=>{
      boxs.forEach((box,j)=>{
          var cubeMaterial = new THREE.MeshLambertMaterial();
          cubeMaterial.color = new THREE.Color(0, 0, 0);
          if(i==0 || j==0 || i==(gameData.chessboard.length-1) || j==(boxs.length-1)){
            cubeMaterial.map = ''
            cubeMaterial.color = '0x000000'
          }
          else if(box.value == 1){
            cubeMaterial.map = textureWhite
          }else if(box.value == 2){
            cubeMaterial.map = textureBlack
          }else{
            cubeMaterial.map = textureEmpty
          }
          cubeMaterial.side = THREE.FrontSide;//THREE.DoubleSide
          var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

          cube.position.z = -((240) / 2) + (j * 6);
          cube.position.x = -((240) / 2) + (i * 6);
          cube.position.y = 2;
          cube.name = box.value + ',' + i + ',' + j
          cubes.push(cube)
          scene.add(cube);
      })
  })
  return cubes
}
/**
 * 创建角色形象
 * @param {角色位置} position 
 * @param {角色名} rolename 
 */
function createPlayerRole(position,rolename){
    var roleGeometry = new THREE.BoxGeometry(40, 40, 40,1, 1,1);
    var role = createRoleMesh(roleGeometry,rolename);
    // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    role.receiveShadow = true;
    // rotate and position the plane
    role.rotation.x = 0.5 * Math.PI;
    role.rotation.z = -0.5 * Math.PI;
    role.position.x = position.x;
    role.position.y = position.y;
    role.position.z = position.z;
    return role
}
/**
 * 创建玩家
 * @param {*} scene 
 */
function createPlayers(scene){
  if(gameData.roles['playerA']){
    var playerA = createPlayerRole(new THREE.Vector3(-160, 20, 0),'playerA')
    scene.add(playerA);
  }
  if(gameData.roles['playerB']){
    var playerB = createPlayerRole(new THREE.Vector3(160, 20, 0),'playerB')
    scene.add(playerB);
  }
}
/**
 * 检查用户角色
 * @param {*} roles 
 */
function checkRole(roles){
    if(roles.playerA == window.__USER_ID__){
      return 'playerA'
    }
    if(roles.playerB == window.__USER_ID__){
      return 'playerB'
    }
    if(roles.audience.includes(window.__USER_ID__)){
      return 'audience'
    }
    return ''
}
/**
 * 初始化网格
 * @param {*} role 
 * @param {*} scene 
 */
function initMesh(role,scene){
   var meshs = []
   if(!role){
      var playerA = createRoleCard(new THREE.Vector3(0, 0, 5),'playerA')
      var playerB = createRoleCard(new THREE.Vector3(0, 0, 0),'playerB')
      var audience = createRoleCard(new THREE.Vector3(0, 0, -5),'audience')
      scene.add(playerA);
      scene.add(playerB);
      scene.add(audience);
      meshs = [playerA,playerB,audience]
   }else{
    meshs = createChessboard(scene)
    createPlayers(scene)
   }
   return meshs
}
/**
 * 初始化相机
 * @param {*} role 
 * @param {*} scene 
 */
function initCamera(role,scene){
   let camera = ''
   if(!role){
     // create a camera, which defines where we're looking at.
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      // position and point the camera to the center of the scene
      camera.position.x = 0;
      camera.position.y = -20;
      camera.position.z = 0;
      camera.lookAt(scene.position);
   }else if(role == 'playerA'){
      // camera = new THREE.OrthographicCamera(window.innerWidth / -14, window.innerWidth / 14, window.innerHeight / 8, window.innerHeight / -10,-400, 800);
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.x = -240;
      camera.position.y = 200;
      camera.position.z = 0;
      camera.lookAt(new THREE.Vector3(0,0,0));
   }else if(role == 'playerB'){
    // camera = new THREE.OrthographicCamera(window.innerWidth / -14, window.innerWidth / 14, window.innerHeight / 8, window.innerHeight / -10,-400, 800);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 240;
    camera.position.y = 200;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));
   }else if(role == 'audience'){
    camera = new THREE.OrthographicCamera(window.innerWidth / -8, window.innerWidth / 8, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
    camera.position.x = 0;
    camera.position.y = 60;
    camera.position.z = 160;
      camera.lookAt(new THREE.Vector3(0,0,0));
  }
   return camera
}
/**
 * 开始游戏
 * @param {*} role 
 */
function start(role){
  camera = initCamera(role,scene)
  meshs = initMesh(role,scene)
  render()
  bindEvent(role)
  createGUI(role)
}
/**
 * 运行渲染场景和相机
 */
function render() {
  stats.update();
  //按帧刷新
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
/**
 * 初始化stats
 */
function initStats() {

  var stats = new Stats();

  stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.getElementById("Stats-output").appendChild(stats.domElement);

  return stats;
}
/**
 * 绑定点击事件
 * @param {*} role 
 */
function bindEvent(role){
  var projector = new THREE.Projector();
  document.addEventListener('mousedown', onDocumentMouseDown, false);

  function onDocumentMouseDown(event) {

      var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
      vector = vector.unproject(camera);
      var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      var intersects = raycaster.intersectObjects(meshs);
      if (intersects.length > 0) {
          if(!role){
            if(intersects[0].object.material.opacity != 0.1){
              intersects[0].object.material.transparent = true;
              intersects[0].object.material.opacity = 0.1;
              send(GAME_MESSAGE.GAME_SELECT_ROLE,{role:intersects[0].object.name})
            }else{
              alert('角色不可选')
            }
          }else if(role!='audience' && gameStatus == 1){
            let mesh = intersects[0].object
            if(!mesh) return;
            let datas = mesh.name.split(',')
            if(datas[0]!='0') return
            send(GAME_MESSAGE.GAME_PLAY_CHESS,{x:datas[1],y:datas[2],player:role})
          }
      }
  }
}
/**
 * 给观众角色 配置GUI
 * @param {*} role 
 */
function createGUI(role){
    if(role!='audience') return
    var controls = new function () {
    this.perspective = "Perspective";
    this.positionX = 0
    this.positionY = 60
    this.positionZ = 160
    this.changeCameraPosition = function(){
        camera.position.x = controls.positionX;
        camera.position.y = controls.positionY;
        camera.position.z = controls.positionZ;
    }
    this.switchCamera = function () {
            if (camera instanceof THREE.PerspectiveCamera) {
                camera = new THREE.OrthographicCamera(window.innerWidth / -8, window.innerWidth / 8, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
                camera.position.x = controls.positionX;
                camera.position.y = controls.positionY;
                camera.position.z = controls.positionZ;
                camera.lookAt(new THREE.Vector3(0,0,0));
                this.perspective = "Orthographic";
            } else {
                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.x = controls.positionX;
                camera.position.y = controls.positionY;
                camera.position.z = controls.positionZ;
                camera.lookAt(new THREE.Vector3(0,0,0));
                this.perspective = "Perspective";
            }
        };
    };

    var gui = new dat.GUI();
    gui.add(controls, 'switchCamera');
    gui.add(controls, 'positionX',0,1000).onChange(controls.changeCameraPosition);
    gui.add(controls, 'positionY',0,1000).onChange(controls.changeCameraPosition);
    gui.add(controls, 'positionZ',0,1000).onChange(controls.changeCameraPosition);
    gui.add(controls, 'perspective').listen();
}
/**
 * 初始化
 * @param {是否开始游戏} start 
 */
function init(role) {

  stats = initStats();

  // 新建一个场景
  scene = new THREE.Scene();
  
  // 初始化一个相机
  camera = initCamera(role,scene)

  //初始化场景中的网格
  meshs = initMesh(role,scene)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  // add spotlight for the shadows
  var pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(-40, 60, -10);
  pointLight.distance = 1000;
  // pointLight.castShadow = true;
  scene.add(pointLight);

  createGUI(role)
  // add the output of the renderer to the html element
  document.getElementById("WebGL-output").appendChild(renderer.domElement);
  render();

  bindEvent(role)
  
}


