import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createRobot} from './robot.js';

const stage=document.querySelector('#stage'),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#edf2ed');
scene.add(new THREE.HemisphereLight('#ffffff','#bdcbbf',2));
const sun=new THREE.DirectionalLight('#fff6e5',3.1);sun.position.set(-6,12,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-7,right:7,top:8,bottom:-5,near:1,far:30});sun.shadow.normalBias=.028;scene.add(sun);
const fill=new THREE.DirectionalLight('#e1efff',1);fill.position.set(7,5,-6);scene.add(fill);
const groundGeo=new THREE.PlaneGeometry(200,200),groundMat=new THREE.MeshStandardMaterial({color:'#edf2ed',roughness:1});
const ground=new THREE.Mesh(groundGeo,groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;scene.add(ground);
const pedestalGeo=new THREE.CylinderGeometry(2.35,2.5,.22,80),pedestalMat=new THREE.MeshStandardMaterial({color:'#d8e2d5',roughness:.9});
const pedestal=new THREE.Mesh(pedestalGeo,pedestalMat);pedestal.position.y=-.11;pedestal.receiveShadow=true;pedestal.castShadow=true;scene.add(pedestal);
const robot=createRobot();scene.add(robot.group);
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minZoom=.65;controls.maxZoom=2;controls.minPolarAngle=.65;controls.maxPolarAngle=Math.PI/2-.06;
function resetCamera(){camera.position.set(8,6.1,12);controls.target.set(0,2.9,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();}
resetCamera();
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h,s=Math.max(8.6,5.8/a);camera.left=-s*a/2;camera.right=s*a/2;camera.top=s/2;camera.bottom=-s/2;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(resize);observer.observe(stage);resize();
let mode='idle',time=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now();
const listeners=[];function on(el,event,fn){el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));}
for(const button of document.querySelectorAll('[data-mode]'))on(button,'click',()=>{mode=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b===button));document.querySelector('#current-mode').textContent=mode[0].toUpperCase()+mode.slice(1);});
for(const button of document.querySelectorAll('[data-color]'))on(button,'click',()=>{robot.setAccent(button.dataset.color);for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b===button));});
function syncPause(){const b=document.querySelector('#pause');b.textContent=paused?'Resume animation':'Pause animation';b.setAttribute('aria-pressed',String(paused));}
syncPause();on(document.querySelector('#pause'),'click',()=>{paused=!paused;syncPause();});
on(document.querySelector('#reset'),'click',resetCamera);
on(document.querySelector('#wireframe'),'change',event=>{robot.group.traverse(object=>{if(object.isMesh)object.material.wireframe=event.target.checked;});});
async function exportModel(){const animations=robot.createAnimationClips();robot.group.updateMatrixWorld(true);return new GLTFExporter().parseAsync(robot.group,{binary:true,onlyVisible:true,animations});}
on(document.querySelector('#export'),'click',async()=>{
  const button=document.querySelector('#export'),note=document.querySelector('#export-note');button.disabled=true;note.textContent='Preparing your model…';
  try{const buffer=await exportModel();const url=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));const link=document.createElement('a');link.href=url;link.download='roo-robot.glb';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);note.textContent='Downloaded · includes four joint animations';}
  catch(error){note.textContent='Export failed. Try again or download the asset source.';console.error(error);}finally{button.disabled=false;}
});
renderer.setAnimationLoop(now=>{const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(!paused&&!document.hidden){time+=dt;robot.update(time,dt,mode);}controls.update();renderer.render(scene,camera);});
robot.update(0,1,'idle');document.querySelector('#loading').hidden=true;
window.robotPreview={robot,renderer,scene,camera,controls,exportModel,get time(){return time;},get mode(){return mode;},get paused(){return paused;}};
function dispose(){renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();robot.dispose();groundGeo.dispose();groundMat.dispose();pedestalGeo.dispose();pedestalMat.dispose();renderer.dispose();for(const remove of listeners)remove();renderer.domElement.remove();delete window.robotPreview;}
on(window,'pagehide',event=>{if(!event.persisted)dispose();});
