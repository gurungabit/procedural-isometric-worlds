import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createKit,seeded} from './kit.js';

const stage=document.querySelector('#stage'), kit=createKit();
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#edf2ed');
scene.add(new THREE.HemisphereLight('#ffffff','#b1c5b6',2));
const sun=new THREE.DirectionalLight('#fff3de',3);sun.position.set(-15,26,14);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:65});sun.shadow.normalBias=.035;scene.add(sun);
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,180);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
controls.minPolarAngle=controls.maxPolarAngle=Math.PI/2-Math.atan(1/Math.sqrt(2));
controls.minZoom=.55;controls.maxZoom=3;controls.screenSpacePanning=false;
controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_PAN};
function resetView(){controls.target.set(0,0,0);camera.position.set(30,30,30);camera.zoom=1;camera.updateProjectionMatrix();controls.update();}
resetView();
const root=new THREE.Group();scene.add(root);
kit.box(root,29,.25,24,'#d6e3cd',0,-.125,0).castShadow=false;
for(const z of [-9,8])kit.box(root,26,.04,2.2,'#f0e4c7',0,.025,z).castShadow=false;
for(const x of [-11,11])kit.box(root,2.2,.04,19,'#f0e4c7',x,.025,-.5).castShadow=false;
kit.box(root,1.6,.04,15,'#f0e4c7',-1,.025,0).castShadow=false;
for(const z of [-2,4])kit.box(root,17,.04,1.2,'#f0e4c7',2,.025,z).castShadow=false;

const entities=[], beds=[], carts=[];
const selectEl=document.querySelector('#entities');
function addEntity(group,record,x,z){const entity={...record,group};group.position.set(x,0,z);group.userData.entity=entity;root.add(group);entities.push(entity);const option=document.createElement('option');option.value=entity.id;option.textContent=entity.name;selectEl.appendChild(option);return entity;}
addEntity(kit.building({name:'SPROUT YARD'}),{id:'shop',kind:'building',name:'Garden house',description:'The nursery shop: box walls, a gabled extrusion, window slabs, and a canvas sign.'},-6,-5);
addEntity(kit.building({name:'TOOL SHED',color:'#c28b59'}),{id:'shed',kind:'building',name:'Tool shed',description:'A second configuration of the same building factory.'},-6,3);
const variants=[['Herbs','#69a878'],['Flowers','#d595ab'],['Seedlings','#9fbc64'],['Leaf greens','#548d68']];
variants.forEach(([name,color],i)=>{const entity=addEntity(kit.bed({color,seed:41+i}),{id:`bed-${i}`,kind:'bed',name:`${name} bed`,description:'Plant a bed to start a growth cycle. Harvests are counted when it matures.',growth:.25+i*.18,growing:true},3+(i%2)*5.6,-5+Math.floor(i/2)*6.4);beds.push(entity);});
for(let i=0;i<2;i++){const entity=addEntity(kit.cart({color:i?'#78a8ac':'#df985e'}),{id:`cart-${i}`,kind:'cart',name:`Nursery cart ${i+1}`,description:'A box-and-cylinder cart follows four waypoints, with a separate cargo group.',waypoint:i?2:0,distance:0,speed:2.2+i*.3},i?11:-11,i?8:-9);carts.push(entity);}
const random=seeded(840);const treePositions=[];
for(let i=0;i<20;i++)treePositions.push({x:-13+random()*26,z:i%2?10.6:-11,s:.7+random()*.3});
kit.trees(root,treePositions);

const marker=new THREE.BoxHelper(undefined,'#467958');scene.add(marker);marker.visible=false;
let selected=null,paused=false,harvests=0,elapsed=0;
function select(entity){selected=entity;marker.visible=!!entity;selectEl.value=entity?.id||'';document.querySelector('#plant').disabled=entity?.kind!=='bed';updateInspector();}
function updateInspector(){
  document.querySelector('#title').textContent=selected?.name||'Choose an asset';
  document.querySelector('#description').textContent=selected?.description||'Select a bed, cart, or building in the scene or list.';
  document.querySelector('#metric-label').textContent=selected?.kind==='bed'?'Growth':selected?.kind==='cart'?'Distance traveled':'Harvest cycles';
  document.querySelector('#metric').textContent=selected?.kind==='bed'?`${Math.round(selected.growth*100)}%`:selected?.kind==='cart'?`${selected.distance.toFixed(1)} m`:String(harvests);
}
function onSelect(){select(entities.find(e=>e.id===selectEl.value)||null);}
function onPlant(){if(selected?.kind==='bed'){selected.growth=.05;selected.growing=true;updateInspector();}}
function onPause(){paused=!paused;const button=document.querySelector('#pause');button.textContent=paused?'Resume':'Pause';button.setAttribute('aria-pressed',String(paused));}
function onRotate(){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);camera.position.copy(controls.target).add(offset);controls.update();}
selectEl.addEventListener('change',onSelect);document.querySelector('#plant').addEventListener('click',onPlant);
document.querySelector('#pause').addEventListener('click',onPause);document.querySelector('#rotate').addEventListener('click',onRotate);document.querySelector('#reset').addEventListener('click',resetView);

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pointers=new Set();let press=null;
function pointerDown(e){pointers.add(e.pointerId);if(pointers.size===1&&e.button===0)press={id:e.pointerId,x:e.clientX,y:e.clientY};else press=null;}
function pointerUp(e){const start=press;pointers.delete(e.pointerId);press=null;if(!start||start.id!==e.pointerId||Math.hypot(start.x-e.clientX,start.y-e.clientY)>5)return;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(entities.map(e=>e.group),true);let hit=hits[0]?.object;while(hit&&!hit.userData.entity)hit=hit.parent;select(hit?.userData.entity||null);
}
function pointerCancel(e){pointers.delete(e.pointerId);press=null;}
renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerCancel);
function resize(){const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;renderer.setSize(width,height);const aspect=width/height,s=Math.max(25,36/aspect);camera.left=-s*aspect/2;camera.right=s*aspect/2;camera.top=s/2;camera.bottom=-s/2;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(resize);observer.observe(stage);resize();
const route=[[-11,-9],[11,-9],[11,8],[-11,8]];
function stepCart(cart,dt){const [x,z]=route[cart.waypoint],p=cart.group.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<.001){cart.waypoint=(cart.waypoint+1)%route.length;return;}
  const travel=Math.min(d,cart.speed*dt);p.x+=dx/d*travel;p.z+=dz/d*travel;cart.distance+=travel;
  const yaw=Math.atan2(-dz,dx),diff=Math.atan2(Math.sin(yaw-cart.group.rotation.y),Math.cos(yaw-cart.group.rotation.y));cart.group.rotation.y+=diff*Math.min(1,dt*8);
  cart.group.userData.cargo.position.y=.82+Math.sin(elapsed*5)*.025;
}
let last=performance.now(),hudTime=0;
renderer.setAnimationLoop(now=>{
  const dt=paused||document.hidden?0:Math.min(.05,Math.max(0,(now-last)/1000));last=now;elapsed+=dt;
  carts.forEach(cart=>stepCart(cart,dt));beds.forEach(bed=>{if(bed.growing){bed.growth=Math.min(1,bed.growth+dt*.035);if(bed.growth===1){bed.growing=false;harvests++;}}bed.group.userData.crops.scale.set(1,.2+.8*bed.growth,1);});
  controls.update();if(selected)marker.setFromObject(selected.group);renderer.render(scene,camera);
  hudTime+=dt;if(hudTime>.2){hudTime=0;updateInspector();document.querySelector('#stats').textContent=`${renderer.info.render.calls} draw calls · ${renderer.info.memory.geometries} geometries`;}
});
document.querySelector('#loading').hidden=true;

// Read-only diagnostics for preview verification; not required by the UI.
window.worldDemo={renderer,scene,camera,controls,entities,get selected(){return selected;},get paused(){return paused;},get harvests(){return harvests;},get elapsed(){return elapsed;}};
function dispose(){renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();marker.geometry.dispose();marker.material.dispose();kit.dispose();renderer.dispose();renderer.domElement.remove();
  selectEl.removeEventListener('change',onSelect);document.querySelector('#plant').removeEventListener('click',onPlant);document.querySelector('#pause').removeEventListener('click',onPause);document.querySelector('#rotate').removeEventListener('click',onRotate);document.querySelector('#reset').removeEventListener('click',resetView);
  renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerCancel);window.removeEventListener('pagehide',onPageHide);delete window.worldDemo;
}
function onPageHide(event){if(!event.persisted)dispose();}
window.addEventListener('pagehide',onPageHide);
