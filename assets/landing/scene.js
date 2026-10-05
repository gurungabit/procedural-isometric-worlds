import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// One renderer, with lazy reusable factory previews. The background stays transparent:
// objects and their real shadows belong to the page, rather than a framed screenshot.
export async function createPreview(stage){
  await document.fonts.ready;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#fffaf0','#a0b9a0',2.25));
  const sun=new THREE.DirectionalLight('#fff3dc',3.2);sun.position.set(-16,28,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:80});sun.shadow.normalBias=.04;scene.add(sun);
  const fill=new THREE.DirectionalLight('#d4e7ef',1.1);fill.position.set(14,9,-12);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,220),controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.55;controls.maxPolarAngle=1.45;controls.touches.ONE=THREE.TOUCH.ROTATE;renderer.domElement.style.touchAction='pan-y';
  const cache=new Map();let active=null,current='aster',request=0,time=0,last=performance.now(),paused=matchMedia('(prefers-reduced-motion: reduce)').matches,inView=true,disposed=false;
  function visibleBounds(root){const bounds=new THREE.Box3();root.updateMatrixWorld(true);function visit(node){if(!node.visible)return;if(node.isMesh){node.geometry.computeBoundingBox();const local=node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);bounds.union(local);}if(node.isInstancedMesh){node.computeBoundingBox();bounds.union(node.boundingBox.clone().applyMatrix4(node.matrixWorld));}for(const child of node.children)visit(child);}visit(root);return bounds;}
  let bounds=new THREE.Box3(),center=new THREE.Vector3();
  function fit(width=stage.clientWidth,height=stage.clientHeight){if(!active||!width||!height)return;camera.updateMatrixWorld(true);const vertices=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])vertices.push(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));const projected=new THREE.Box3().setFromPoints(vertices);const aspect=width/height;const vertical=Math.max(projected.max.y-projected.min.y,(projected.max.x-projected.min.x)/aspect)*1.11;camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();}
  function resetCamera(){if(!active)return;bounds=visibleBounds(active.root);center=bounds.getCenter(new THREE.Vector3());camera.position.copy(center).add(new THREE.Vector3(18,14,22));controls.target.copy(center);controls.update();fit();}
  const observer=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(w&&h){renderer.setSize(w,h);fit();}});observer.observe(stage);renderer.setSize(stage.clientWidth,stage.clientHeight);
  const visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{rootMargin:'80px'});visibility.observe(stage);
  async function create(id){
    const root=new THREE.Group();let dispose=()=>{},update=()=>{},floorY=-.55;
    if(id==='aster'){
      const [{createKit,createRocket},{createLaunchComplex}]=await Promise.all([import('../rocket/rocket.js'),import('../rocket/world.js')]);const kit=createKit(),rocket=createRocket({kit}),complex=createLaunchComplex(kit);rocket.group.position.y=.91;root.add(complex.group,rocket.group);update=t=>{complex.beaconMat.emissiveIntensity=.7+Math.pow(Math.max(0,Math.sin(t*2.2)),8);complex.dish.rotation.y=Math.sin(t*.25)*.12;};dispose=()=>{rocket.dispose();complex.dispose();kit.dispose();};
    }else if(id==='roo'){
      const {createRobot}=await import('../robot/robot.js');const robot=createRobot();root.add(robot.group);const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.33,.13,64),new THREE.MeshStandardMaterial({color:'#d7e4cd',roughness:.9}));pedestal.position.y=-.07;pedestal.receiveShadow=true;root.add(pedestal);robot.update(0,1,'wave');update=(t,dt)=>robot.update(t,dt,'wave');floorY=-.15;dispose=()=>{robot.dispose();pedestal.geometry.dispose();pedestal.material.dispose();};
    }else if(id==='vela'){
      const {createRocket}=await import('../vela/rocket.js');const rocket=createRocket();rocket.booster.visible=false;rocket.upper.position.y=3.8;rocket.upper.rotation.z=-.18;rocket.setFairing(1,.6);rocket.setArrays(1);rocket.setThrust('upper',.5,true);rocket.update(0,.1);root.add(rocket.group);floorY=-.2;update=(t,dt)=>{rocket.update(t,dt);rocket.upper.rotation.y=Math.sin(t*.2)*.07;};dispose=()=>rocket.dispose();
    }else{
      const {createKit}=await import('../starter/kit.js');const kit=createKit();kit.box(root,29,.25,24,'#d6e3cd',0,-.125,0).castShadow=false;
      for(const z of [-9,8])kit.box(root,26,.04,2.2,'#f0e4c7',0,.025,z);for(const x of [-11,11])kit.box(root,2.2,.04,19,'#f0e4c7',x,.025,-.5);kit.box(root,1.6,.04,15,'#f0e4c7',-1,.025,0);
      for(const z of [-2,4])kit.box(root,17,.04,1.2,'#f0e4c7',2,.025,z);
      const shop=kit.building({name:'SPROUT YARD'});shop.position.set(-6,0,-5);root.add(shop);const shed=kit.building({name:'TOOL SHED',color:'#c28b59'});shed.position.set(-6,0,3);root.add(shed);
      for(let i=0;i<4;i++){const bed=kit.bed({color:['#69a878','#d595ab','#9fbc64','#548d68'][i],seed:41+i});bed.position.set(3+(i%2)*5.6,0,-5+Math.floor(i/2)*6.4);root.add(bed);}
      const positions=[];for(let i=0;i<11;i++)positions.push({x:-13+i*2.55,z:i%2?10.6:-11,s:.75+(i%3)*.08});kit.trees(root,positions);const carts=[kit.cart(),kit.cart({color:'#78a8ac'})];carts.forEach(c=>root.add(c));
      update=t=>{carts.forEach((cart,i)=>{const p=(t*1.5+i*38)%78;if(p<22){cart.position.set(-11+p,0,-9);cart.rotation.y=0;}else if(p<39){cart.position.set(11,0,-9+p-22);cart.rotation.y=-Math.PI/2;}else if(p<61){cart.position.set(11-(p-39),0,8);cart.rotation.y=Math.PI;}else{cart.position.set(-11,0,8-(p-61));cart.rotation.y=Math.PI/2;}cart.userData.cargo.position.y=.82+Math.sin(t*4)*.022;});};update(0);floorY=-.26;dispose=()=>kit.dispose();
    }
    root.name=id;return {root,dispose,update,floorY};
  }
  async function select(id){const token=++request;if(!cache.has(id))cache.set(id,create(id));const entry=await cache.get(id);if(token!==request||disposed){if(disposed)entry.dispose();return;}if(active)scene.remove(active.root);active=entry;current=id;scene.add(entry.root);floor.position.y=entry.floorY;resetCamera();renderer.render(scene,camera);}
  await select('aster');
  renderer.setAnimationLoop(now=>{const dt=paused||!inView||document.hidden?0:Math.min(.045,(now-last)/1000);last=now;if(!inView||document.hidden)return;if(dt){time+=dt;active?.update(time,dt);}controls.update();renderer.render(scene,camera);});
  // Used only to create faithful transparent showcase assets during development.
  async function capture(id,width=900,height=700){const before=current,wasPaused=paused;paused=true;await select(id);active.update(1.4,1);bounds=visibleBounds(active.root);resetCamera();const pixelRatio=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(width,height,false);fit(width,height);renderer.render(scene,camera);const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png'));renderer.setPixelRatio(pixelRatio);renderer.setSize(stage.clientWidth,stage.clientHeight);await select(before);paused=wasPaused;return blob;}
  function dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);observer.disconnect();visibility.disconnect();controls.dispose();for(const promise of cache.values())promise.then(e=>e.dispose());floor.geometry.dispose();floor.material.dispose();renderer.dispose();renderer.domElement.remove();cache.clear();}
  return {select,resetCamera,capture,dispose,renderer,scene,camera,controls,get current(){return current;},get time(){return time;},get paused(){return paused;},set paused(value){paused=!!value;}};
}
