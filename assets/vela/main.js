import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createRocket} from './rocket.js';
import {createLaunchPad} from './pad.js';
import {createParticles,createSmoke,createSky,createStars,createClouds} from './effects.js';

const $=selector=>document.querySelector(selector);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=$('#stage'),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const sky=createSky();scene.add(sky.mesh);
const hemi=new THREE.HemisphereLight('#ffffff','#c3cdbf',2.3);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2d9',3.4);sun.position.set(-12,24,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-13,right:13,top:16,bottom:-13,near:1,far:80});sun.shadow.normalBias=.03;scene.add(sun);
const fill=new THREE.DirectionalLight('#dcebff',1.1);fill.position.set(12,8,-10);scene.add(fill);
const engineLight=new THREE.PointLight('#ff9a4a',0,36,1.4);scene.add(engineLight);

const pad=createLaunchPad();scene.add(pad.group);
const rocket=createRocket();scene.add(rocket.group);
const smoke=createSmoke({count:1100});scene.add(smoke.mesh);
const sparks=createParticles({count:260,glow:true});scene.add(sparks.mesh);
const clouds=createClouds();scene.add(clouds.mesh);
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,400);scene.add(camera);
const stars=createStars(camera);

// ---- Camera ----------------------------------------------------------------------------------
const controls=new OrbitControls(camera,renderer.domElement);
Object.assign(controls,{enableDamping:true,enablePan:false,minZoom:.45,maxZoom:3.4,minPolarAngle:.3,maxPolarAngle:Math.PI/2-.03});
const HOME={target:new THREE.Vector3(0,6.1,0),azimuth:.7,elevation:.37,distance:70,zoom:1};
let zoomGoal=null,shake=new THREE.Vector3();
function resetCamera(){
  const {target,azimuth:a,elevation:e,distance:r}=HOME;controls.target.copy(target);
  camera.position.set(target.x+Math.sin(a)*Math.cos(e)*r,target.y+Math.sin(e)*r,target.z+Math.cos(a)*Math.cos(e)*r);
  camera.zoom=HOME.zoom;zoomGoal=null;camera.updateProjectionMatrix();controls.update();
}
controls.addEventListener('start',()=>{zoomGoal=null;});
let aspect=1;
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);aspect=w/h;
  const s=Math.max(22,16.5/aspect);Object.assign(camera,{left:-s*aspect/2,right:s*aspect/2,top:s/2,bottom:-s/2});camera.updateProjectionMatrix();
}
const observer=new ResizeObserver(resize);observer.observe(stage);resize();resetCamera();

// ---- Mission profile -------------------------------------------------------------------------
// Mission time m is seconds relative to liftoff; null means the vehicle is resting on the pad.
const EVENTS=[
  {t:-10,label:'Terminal count'},{t:-9,label:'Crew arm retract'},{t:-3,label:'Engine ignition'},{t:0,label:'Liftoff'},
  {t:2.4,label:'Legs stowed'},{t:11,label:'Max-Q'},{t:30,label:'Main engine cutoff'},{t:31,label:'Stage separation'},
  {t:32.5,label:'Second-stage ignition'},{t:37,label:'Fairing separation'},{t:46,label:'Second-stage cutoff'},{t:47.5,label:'Payload deploy'},{t:49,label:'Solar arrays'},
];
const PHASES=[[-10,'Terminal count'],[-9,'Crew arm retracting'],[-6,'Propellant topping'],[-3,'Ignition sequence'],[0,'Liftoff'],[2.4,'Stowing landing legs'],
  [5,'Pitch program'],[10,'Throttle down · Max-Q'],[15,'Throttle up'],[30,'Main engine cutoff'],[31,'Stage separation'],[32.5,'Second-stage burn'],
  [37,'Fairing separation'],[46,'Orbit insertion'],[47.5,'Payload separation'],[49,'Deploying solar arrays'],[53,'Nominal orbit']];
const ramp=(x,a,b)=>THREE.MathUtils.clamp((x-a)/(b-a),0,1),smooth=k=>k*k*(3-2*k),rand=(a,b)=>a+Math.random()*(b-a);
const mission={m:null,pos:new THREE.Vector3(),speed:0,pitch:0,boosterThrottle:0,upperThrottle:0,
  booster:{x:0,y:0,vy:0,spin:0},payload:{y:0,spin:0},stageDrift:{y:0,spin:0},orbitSpeed:0,earthPhase:0};
let clock=0;const accumulators={};
function every(key,rate,dt,emit){accumulators[key]=(accumulators[key]||0)+rate*dt;while(accumulators[key]>=1){accumulators[key]-=1;emit();}}
const tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),heading=new THREE.Vector3(),ventDir=new THREE.Vector3(Math.sin(1.4),0,Math.cos(1.4));

function applyPose(){
  const m=mission.m??-Infinity,b=mission.booster;
  pad.setArms({service:1-ramp(m,-9,-6.4),umbilical:1-ramp(m,-.5,.5)});pad.setClamps(1-ramp(m,0,.3));
  rocket.group.position.copy(mission.pos);rocket.group.rotation.set(0,0,-mission.pitch);
  rocket.setLegs(1-ramp(m,2.4,4.6));rocket.setFairing(ramp(m,37,37.8),Math.max(0,m-37.8));rocket.setArrays(ramp(m,49,52.5));
  // The booster spins about its own middle (local y≈4) once it is free.
  rocket.booster.position.set(b.x+4*Math.sin(b.spin),b.y+4-4*Math.cos(b.spin),0);rocket.booster.rotation.z=b.spin;rocket.booster.visible=b.y>-260;
  rocket.upper.position.set(0,8+mission.stageDrift.y,0);rocket.upper.rotation.z=mission.stageDrift.spin;
  rocket.payload.position.set(0,1.25+mission.payload.y,0);rocket.payload.rotation.y=mission.payload.spin;
}

function step(dt){
  clock+=dt;
  const m=mission.m;
  if(m===null){
    // Cold oxygen vapor sinks and spreads from the vents while the vehicle waits on the pad.
    every('vent',16,dt,()=>ventPuff(1));
  }else{
    const prev=m,now=mission.m=m+dt;
    mission.boosterThrottle=now<-3||now>=30?0:(smooth(ramp(now,-3,-2.2))*.6+smooth(ramp(now,-1.2,0))*.4)*(1-.24*smooth(ramp(now,10,11))*(1-smooth(ramp(now,14.5,16))));
    mission.upperThrottle=now>=32.5&&now<46?smooth(ramp(now,32.5,33.3)):0;
    rocket.setThrust('booster',mission.boosterThrottle);rocket.setThrust('upper',mission.upperThrottle);
    mission.pitch=1.2*smooth(ramp(now,5,46));
    if(now>0&&now<48){
      const accel=now<30?mission.boosterThrottle*(2.3+.1*now):mission.upperThrottle*21;
      mission.speed+=accel*dt;heading.set(Math.sin(mission.pitch),Math.cos(mission.pitch),0);mission.pos.addScaledVector(heading,mission.speed*dt);
    }
    if(now>=46)mission.orbitSpeed=mission.speed;
    if(now>=31){
      const b=mission.booster;if(prev<31){b.vy=-2.4;separationBurst();}
      b.vy-=(mission.upperThrottle*21+1.5)*dt;b.y+=b.vy*dt;b.x-=.5*dt;b.spin+=.22*dt*Math.min(1,now-31);
    }
    if(now>=47.5){const p=mission.payload;if(prev<47.5)rcsPuffs();p.y+=.32*dt*Math.min(1,(now-47.5)*.8);p.spin+=.05*dt;mission.stageDrift.y-=.12*dt;mission.stageDrift.spin+=.025*dt;}
    if(prev<37.8&&now>=37.8)fairingPuffs();
    if(now<-1)every('vent',now<-6?22:10,dt,()=>ventPuff(now<-6?1.25:.7));
    emitExhaust(dt,now);
    mission.earthPhase+=dt*(now>=46?2.4:.6);
  }
  applyPose();
  const t=clock;
  rocket.setGimbal(Math.sin(t*1.3)*.035*(mission.boosterThrottle>0?1:.15),Math.cos(t*1.7)*.03*(mission.boosterThrottle>0?1:.15));
  rocket.setFins(mission.m!==null&&mission.m>0&&mission.m<30?Math.sin(t*1.1)*.09:0);
  const alt=mission.pos.y;rocket.setPlumeSpread(1+1.6*THREE.MathUtils.smoothstep(alt,80,1300));
  rocket.update(t,dt);pad.update(t);smoke.update(dt);sparks.update(dt);
  const bp=rocket.thrust.booster;
  rocket.parts.boosterExit.getWorldPosition(engineLight.position);engineLight.position.y-=.9;
  engineLight.intensity=bp*(150+40*Math.sin(t*41)*Math.sin(t*23));
}

function ventPuff(strength){
  for(const vent of rocket.parts.vents){
    vent.getWorldPosition(tmp);tmp2.copy(ventDir).multiplyScalar(rand(1.1,2)*strength).add({x:rand(-.3,.3),y:rand(-.2,.2),z:rand(-.3,.3)});
    smoke.emit({position:tmp,velocity:tmp2,size:rand(.08,.13),life:rand(1.6,2.4),grow:rand(2.5,4),drag:1.4,rise:-.7,color:'#ffffff',fade:'#eef2f3',opacity:.55});
  }
}
function emitExhaust(dt,m){
  const power=rocket.thrust.booster,alt=mission.pos.y;if(power<.02)return;
  rocket.parts.boosterExit.getWorldPosition(tmp);
  const nearPad=1-THREE.MathUtils.smoothstep(alt,4,26);
  if(nearPad>0){
    // Exhaust hits the deflector and leaves both ends of the trench as two billowing banks.
    for(const exit of pad.trenchExits){
      const dir=Math.sign(exit.x);
      every(`trench${dir}`,58*power*nearPad,dt,()=>smoke.emit({position:tmp2.copy(exit).add({x:rand(-.4,.4),y:rand(-.2,.4),z:rand(-.6,.6)}),
        velocity:{x:dir*rand(4,8),y:rand(.4,2),z:rand(-2.2,2.2)},size:rand(.45,.75),life:rand(3.6,6),grow:rand(2.2,3.2),drag:.7,rise:rand(.35,.8),color:'#ffe9cf',fade:'#d3d7d1',opacity:rand(.62,.82)}));
      every(`spark${dir}`,40*power*nearPad,dt,()=>sparks.emit({position:tmp2.copy(exit).add({x:0,y:rand(0,.4),z:rand(-.5,.5)}),
        velocity:{x:dir*rand(7,15),y:rand(2,7),z:rand(-3,3)},size:rand(.04,.08),life:rand(.4,.9),grow:-.6,drag:.4,rise:-9,color:'#ffd27a',fade:'#ff5a1a'}));
    }
    every('deck',22*power*nearPad*(alt<2.5?1:.4),dt,()=>{const a=rand(0,Math.PI*2);smoke.emit({position:tmp2.set(Math.cos(a)*1.2,.2,Math.sin(a)*1.2),
      velocity:{x:Math.cos(a)*rand(3,5.5),y:rand(.2,1.2),z:Math.sin(a)*rand(3,5.5)},size:rand(.35,.6),life:rand(2.5,4.2),grow:rand(2,3),drag:.9,rise:.5,color:'#fff1de',fade:'#d9dcd6',opacity:rand(.5,.7)});});
  }
  if(m>0&&alt>3&&alt<1150){
    // Trail density follows distance travelled, thinning as the air does.
    const thin=1-THREE.MathUtils.smoothstep(alt,500,1150),size=.55+Math.min(1,alt/500);
    every('trail',mission.speed*3*thin,dt,()=>smoke.emit({position:tmp2.copy(tmp).addScaledVector(heading,-rand(3.6,5.2)*(1+alt/900)).add({x:rand(-.25,.25),y:0,z:rand(-.25,.25)}),
      velocity:{x:rand(-1,1),y:-mission.speed*.04,z:rand(-1,1)},size,life:rand(2.4,3.6)*(.5+thin*.5),grow:rand(2.4,3.6),drag:.8,rise:.2,color:'#fff1df',fade:'#cdd1d4',opacity:.6*thin+.15}));
  }
}
function separationBurst(){
  rocket.upper.getWorldPosition(tmp);
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2;smoke.emit({position:tmp,velocity:{x:Math.cos(a)*rand(2,4),y:rand(-1,1),z:Math.sin(a)*rand(2,4)},size:rand(.2,.32),life:rand(.9,1.5),grow:3,drag:1.6,color:'#ffffff',fade:'#dfe6ea',opacity:.7});}
  for(let i=0;i<30;i++)sparks.emit({position:tmp,velocity:{x:rand(-5,5),y:rand(-4,3),z:rand(-5,5)},size:rand(.03,.06),life:rand(.3,.7),grow:-.5,drag:1,color:'#fff0b0',fade:'#ff7a2e'});
}
function fairingPuffs(){
  rocket.upper.localToWorld(tmp.set(0,2.6,0));
  for(let i=0;i<18;i++)smoke.emit({position:tmp2.copy(tmp).add({x:0,y:rand(-1.2,1.2),z:rand(-.7,.7)}),velocity:{x:rand(-3,3),y:rand(-.5,.5),z:rand(-3,3)},size:rand(.14,.22),life:rand(.8,1.3),grow:2.5,drag:1.8,color:'#ffffff',fade:'#e3e8ec',opacity:.7});
}
function rcsPuffs(){
  rocket.upper.localToWorld(tmp.set(0,1.3,0));
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;smoke.emit({position:tmp,velocity:{x:Math.cos(a)*1.6,y:rand(-.3,.3),z:Math.sin(a)*1.6},size:.12,life:1,grow:2.5,drag:1.6,color:'#ffffff',fade:'#e3e8ec',opacity:.7});}
}

// ---- Camera follow, sky, UI ------------------------------------------------------------------
let follow=true,paused=reduceMotion,warp=1,last=performance.now(),kick=0;
const focus=new THREE.Vector3(),lastFocus=new THREE.Vector3(),carry=new THREE.Vector3();let tracking=false;
function focusHeight(){
  const m=mission.m??-Infinity;
  if(m<31)return 6.2;
  if(m<47.5)return THREE.MathUtils.lerp(6.2,10.4+mission.stageDrift.y,smooth(ramp(m,31,34)));
  return THREE.MathUtils.lerp(10.4,9.8+mission.payload.y,smooth(ramp(m,47.5,50)));
}
function updateCamera(dt){
  const m=mission.m;
  if(follow&&m!==null&&m>-3){
    // Carry the camera by exactly the vehicle's motion this frame, then ease out any remaining framing offset,
    // so the rocket stays in frame at any speed or time warp.
    rocket.group.localToWorld(focus.set(0,focusHeight(),0));if(!tracking){lastFocus.copy(focus);tracking=true;}
    carry.subVectors(focus,lastFocus);lastFocus.copy(focus);
    carry.add(tmp.subVectors(focus,controls.target).sub(carry).multiplyScalar(1-Math.exp(-3*dt)));
    controls.target.add(carry);camera.position.add(carry);
  }else tracking=false;
  if(zoomGoal!==null){camera.zoom=THREE.MathUtils.lerp(camera.zoom,zoomGoal,1-Math.exp(-1.6*dt));camera.updateProjectionMatrix();if(Math.abs(camera.zoom-zoomGoal)<.004)zoomGoal=null;}
  const alt=mission.pos.y,space=sky.setAltitude(alt,aspect,mission.earthPhase);
  stars.setOpacity(THREE.MathUtils.smoothstep(alt,450,1500));hemi.intensity=1.9-.9*space;
  kick=Math.max(0,kick-dt*2.5);
  const amp=reduceMotion?0:.11*rocket.thrust.booster*(1-THREE.MathUtils.smoothstep(alt,0,50))+.06*kick;
  shake.set(rand(-1,1),rand(-1,1),rand(-1,1)).multiplyScalar(amp);
}
const zoomCues=[[-3,.92],[8,1],[31,1.6],[47.5,2.05]];
function cueZoom(prev,now){if(!follow)return;for(const [t,z] of zoomCues)if(prev<t&&now>=t)zoomGoal=z;if(prev<31&&now>=31)kick=1;}

const eventList=$('#events'),eventItems=EVENTS.map(({t,label})=>{
  const li=document.createElement('li');li.innerHTML=`<span class="event-time">${formatClock(t)}</span><span>${label}</span>`;eventList.appendChild(li);return li;
});
function formatClock(m){const s=m<0?Math.ceil(-m):Math.floor(m);return `T${m<0?'−':'+'}${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function phaseName(m){if(m===null)return 'Go for launch';let name=PHASES[0][1];for(const [t,label] of PHASES)if(m>=t)name=label;return name;}
const ui={clock:$('#clock'),phase:$('#phase'),altitude:$('#altitude'),speed:$('#speed'),throttle:$('#throttle'),status:$('#status-text'),viewer:$('.viewer'),launch:$('#launch'),countdown:$('#countdown')},shown={};
function show(key,value){if(shown[key]!==value){shown[key]=value;ui[key].textContent=value;}}
function updateUI(){
  const m=mission.m,phase=m===null?'pad':m<0?'count':m<46?'flight':'orbit';
  if(ui.viewer.dataset.phase!==phase){ui.viewer.dataset.phase=phase;ui.launch.disabled=m!==null;ui.launch.querySelector('span').textContent=m===null?'Launch':phase==='orbit'?'Payload in orbit':'Launch in progress';}
  show('clock',m===null?'T−00:10':formatClock(m));show('countdown',m!==null&&m>=-5&&m<1.2?(m<0?String(Math.ceil(-m)):'Liftoff'):'');show('phase',phaseName(m));
  show('status',m===null?'Go for launch':phase==='orbit'?'In orbit':phase==='count'?'Counting down':'In flight');
  show('altitude',`${(mission.pos.y*.045).toFixed(1)} km`);
  show('speed',`${Math.round((mission.orbitSpeed||mission.speed)*72).toLocaleString('en-US')} km/h`);
  const throttle=m!==null&&m>=31?mission.upperThrottle:mission.boosterThrottle;show('throttle',`${Math.round(throttle*100)}%`);
  let current=-1;EVENTS.forEach(({t},i)=>{const done=m!==null&&m>=t;eventItems[i].classList.toggle('done',done);if(done)current=i;});
  eventItems.forEach((li,i)=>{if(i===current)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
}

function launch(){if(mission.m!==null)return;mission.m=-10;paused=false;syncPause();}
function resetMission(){
  Object.assign(mission,{m:null,speed:0,pitch:0,boosterThrottle:0,upperThrottle:0,orbitSpeed:0,earthPhase:0,booster:{x:0,y:0,vy:0,spin:0},payload:{y:0,spin:0},stageDrift:{y:0,spin:0}});
  mission.pos.set(0,0,0);for(const k in accumulators)delete accumulators[k];
  rocket.setThrust('booster',0,true);rocket.setThrust('upper',0,true);rocket.cool();smoke.clear();sparks.clear();kick=0;
  applyPose();rocket.update(clock,0);resetCamera();updateUI();
}
const listeners=[];function on(el,event,fn){el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));}
on(ui.launch,'click',launch);on($('#reset-mission'),'click',resetMission);on($('#reset'),'click',resetCamera);
function syncPause(){const b=$('#pause');b.textContent=paused?'Resume':'Pause';b.setAttribute('aria-pressed',String(paused));}
syncPause();on($('#pause'),'click',()=>{paused=!paused;syncPause();});
for(const button of document.querySelectorAll('[data-warp]'))on(button,'click',()=>{warp=Number(button.dataset.warp);for(const b of document.querySelectorAll('[data-warp]'))b.setAttribute('aria-pressed',String(b===button));});
on($('#follow'),'change',event=>{follow=event.target.checked;if(!follow)zoomGoal=null;});
for(const button of document.querySelectorAll('[data-color]'))on(button,'click',()=>{rocket.setAccent(button.dataset.color);pad.setAccent(button.dataset.color);for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b===button));});
on(window,'keydown',event=>{if(event.target.closest('input,button,select,textarea'))return;if(event.code==='Space'){event.preventDefault();mission.m===null?launch():(paused=!paused,syncPause());}});

async function exportModel(){
  // Export the rest pose with the articulated clips; shader plumes are runtime-only and stay out of the file.
  const plumes=rocket.parts.plumes.map(p=>p.visible);
  rocket.group.position.set(0,0,0);rocket.group.rotation.set(0,0,0);rocket.booster.position.set(0,0,0);rocket.booster.rotation.set(0,0,0);rocket.booster.visible=true;
  rocket.upper.position.set(0,8,0);rocket.upper.rotation.set(0,0,0);rocket.payload.position.set(0,1.25,0);rocket.payload.rotation.set(0,0,0);
  rocket.setLegs(1);rocket.setFairing(0);rocket.setArrays(0);rocket.setGimbal(0,0);rocket.setFins(0);for(const p of rocket.parts.plumes)p.visible=false;
  try{const animations=rocket.createAnimationClips();rocket.group.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(rocket.group,{binary:true,onlyVisible:true,animations});}
  finally{rocket.parts.plumes.forEach((p,i)=>{p.visible=plumes[i];});applyPose();}
}
on($('#export'),'click',async()=>{
  const button=$('#export'),note=$('#export-note');button.disabled=true;note.textContent='Preparing your model…';
  try{const buffer=await exportModel();const url=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));const link=document.createElement('a');link.href=url;link.download='vela-rocket.glb';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);note.textContent='Downloaded · includes four articulated animations';}
  catch(error){note.textContent='Export failed. Try again or download the asset source.';console.error(error);}finally{button.disabled=false;}
});

function advance(dt){
  // Sub-step time warp so emitters and separation physics stay smooth.
  const steps=Math.max(1,Math.ceil(dt/.02)),h=dt/steps;
  for(let i=0;i<steps;i++){const prev=mission.m;step(h);if(prev!==null)cueZoom(prev,mission.m);}
}
renderer.setAnimationLoop(now=>{
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(!paused&&!document.hidden)advance(dt*warp);
  updateCamera(dt);controls.update();camera.position.add(shake);renderer.render(scene,camera);camera.position.sub(shake);updateUI();
});
applyPose();rocket.update(0,1);updateUI();$('#loading').hidden=true;
window.rocketPreview={rocket,pad,mission,renderer,scene,camera,controls,smoke,exportModel,launch,resetMission,
  /** Advance the mission deterministically, e.g. simulate(40) to inspect fairing separation. */
  simulate(seconds,h=1/60){for(let t=0;t<seconds;t+=h){advance(h);updateCamera(h);}controls.update();},
  get paused(){return paused;},set paused(v){paused=v;syncPause();}};
function dispose(){
  renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();for(const remove of listeners)remove();
  for(const r of [rocket,pad,smoke,sparks,clouds,sky,stars])r.dispose();renderer.dispose();renderer.domElement.remove();delete window.rocketPreview;
}
on(window,'pagehide',event=>{if(!event.persisted)dispose();});
