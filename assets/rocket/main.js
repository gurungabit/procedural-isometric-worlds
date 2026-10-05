import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createKit,createRocket,palette} from './rocket.js';
import {createLaunchComplex} from './world.js';

const $=s=>document.querySelector(s), stage=$('#stage');
await document.fonts.ready;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
const scene=new THREE.Scene(),dayColor=new THREE.Color(palette.ground),nightColor=new THREE.Color('#172a32');
scene.background=dayColor.clone();scene.fog=new THREE.Fog(dayColor,65,140);
const hemi=new THREE.HemisphereLight('#fffcf1','#758c76',2.3);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2d7',3.4);sun.position.set(-12,22,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:16,bottom:-13,near:1,far:65});sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun);
const fill=new THREE.DirectionalLight('#c4deef',1.3);fill.position.set(10,7,-9);scene.add(fill);
const kit=createKit(),rocket=createRocket({kit}),world=createLaunchComplex(kit);scene.add(world.group,rocket.group);rocket.group.position.y=.91;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:palette.ground,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.56;ground.receiveShadow=true;scene.add(ground);
const engineLight=new THREE.PointLight('#ff893d',0,15,2);rocket.group.add(engineLight);engineLight.position.y=-.5;
const apronLights=[];for(const x of [-5.9,5.9])for(const z of [-4.4,4.4]){const l=new THREE.PointLight('#ffd591',0,5,2);l.position.set(x,2.4,z);scene.add(l);apronLights.push(l);}
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,300);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minZoom=.65;controls.maxZoom=2.3;controls.minPolarAngle=.45;controls.maxPolarAngle=1.48;
let followY=0;
function resetCamera(){followY=rocket.group.position.y-.91;const targetY=4+Math.max(0,followY-2);camera.position.set(19,15+targetY-4,23);controls.target.set(0,targetY,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();followY=Math.max(0,followY-2);}
resetCamera();
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h;const s=Math.max(17.8,17.5/a);camera.left=-s*a/2;camera.right=s*a/2;camera.top=s/2;camera.bottom=-s/2;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(resize);observer.observe(stage);resize();

// Camera-facing procedural plasma with a soft radial edge and a narrow luminous core.
const flameUniforms={time:{value:0},power:{value:0}};
const flameMat=new THREE.ShaderMaterial({uniforms:flameUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
fragmentShader:`varying vec2 vUv;uniform float time;uniform float power;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){float y=vUv.y;float n=noise(vec2(vUv.x*9.,y*20.+time*17.));float bend=sin(y*21.-time*19.)*.025*(1.-y);float width=.09+.32*pow(y,.65);float r=abs(vUv.x-.5+bend)/width;float outer=exp(-r*r*2.4);float core=exp(-r*r*13.);float tail=smoothstep(0.,.18,y);float bands=.97+.03*sin(y*30.-time*17.);vec3 c=mix(vec3(1.,.23,.025),vec3(1.,.63,.13),y);c=mix(c,vec3(.24,.48,1.),smoothstep(.72,1.,y));c=mix(c,vec3(2.3,1.65,.8),core*.82);float alpha=outer*tail*(.83+n*.14)*power*bands;gl_FragColor=vec4(c,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
const flameGeo=new THREE.PlaneGeometry(.82,4.2);flameGeo.translate(0,-2.1,0);
const flames=[],flameQuaternion=new THREE.Quaternion();
for(const e of rocket.engines){const f=new THREE.Group();e.add(f);f.add(new THREE.Mesh(flameGeo,flameMat));f.visible=false;flames.push(f);}

// Fixed particle pool. Per-instance alpha lets vapor dissolve without allocating meshes each frame.
const smokeGeometry=new THREE.PlaneGeometry(2,2),count=180;
const alphas=new Float32Array(count);smokeGeometry.setAttribute('aOpacity',new THREE.InstancedBufferAttribute(alphas,1));
const smokeCanvas=document.createElement('canvas');smokeCanvas.width=128;smokeCanvas.height=128;const smokeContext=smokeCanvas.getContext('2d');
for(const [x,y,r] of [[64,64,49],[45,48,32],[83,45,31],[40,77,30],[81,79,32]]){const gradient=smokeContext.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,'rgba(255,255,255,.6)');gradient.addColorStop(.42,'rgba(255,255,255,.35)');gradient.addColorStop(1,'rgba(255,255,255,0)');smokeContext.fillStyle=gradient;smokeContext.fillRect(0,0,128,128);}
const smokeTexture=new THREE.CanvasTexture(smokeCanvas);
const smokeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{color:{value:new THREE.Color('#d3d8cb')},map:{value:smokeTexture}},
vertexShader:`attribute float aOpacity;varying float vOpacity;varying vec2 vUv;void main(){vUv=uv;vOpacity=aOpacity;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float size=length(instanceMatrix[0].xyz);center.xy+=position.xy*size;gl_Position=projectionMatrix*center;}`,
fragmentShader:`uniform vec3 color;uniform sampler2D map;varying float vOpacity;varying vec2 vUv;void main(){float density=texture2D(map,vUv).a;float light=.84+.16*vUv.y;gl_FragColor=vec4(color*light,density*vOpacity);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
const smoke=new THREE.InstancedMesh(smokeGeometry,smokeMat,count);smoke.frustumCulled=false;smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(smoke);
const particles=Array.from({length:count},()=>({age:99,life:1,pos:new THREE.Vector3(),vel:new THREE.Vector3(),size:1,steam:false}));let particleIndex=0,seed=42;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function emit(steam=false){const p=particles[particleIndex++%count];p.age=0;p.life=steam?2.7:3.8+random()*1.4;p.steam=steam;p.size=steam?.22:.34+random()*.28;const angle=random()*Math.PI*2;
if(steam){p.pos.set(-.85,5.5,0);p.vel.set(-.3-random()*.35,.25+random()*.4,.15);}
else if(rocket.group.position.y<4){p.pos.set(Math.cos(angle)*.35,1.1,Math.sin(angle)*.35);p.vel.set(Math.cos(angle)*(1.1+random()*.65),.12+random()*.3,Math.sin(angle)*(1.1+random()*.65));}
else {p.pos.set(rocket.group.position.x,rocket.group.position.y-2,rocket.group.position.z);p.vel.set((random()-.5)*.45,-1.6-random()*1.2,(random()-.5)*.45);p.size=.23+random()*.28;p.life=2;}}
const dummy=new THREE.Object3D();function updateParticles(dt){for(let i=0;i<count;i++){const p=particles[i];p.age+=dt;if(p.age>=p.life){dummy.scale.setScalar(0);alphas[i]=0;}else{const u=p.age/p.life;p.pos.addScaledVector(p.vel,dt);p.vel.y+=dt*(p.steam?.06:.13);dummy.position.copy(p.pos);dummy.rotation.set(i*.7,p.age*.12,i*.5);dummy.scale.setScalar(p.size*(.35+u*2.3));alphas[i]=(p.steam?.30:.58)*Math.sin(Math.PI*u)*Math.min(1,p.age*5);}dummy.updateMatrix();smoke.setMatrixAt(i,dummy.matrix);}smoke.instanceMatrix.needsUpdate=true;smokeGeometry.attributes.aOpacity.needsUpdate=true;}
updateParticles(0);
const starsGeo=new THREE.BufferGeometry(),starPositions=[];for(let i=0;i<220;i++)starPositions.push((random()-.5)*120,12+random()*100,-25-random()*70);starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const starsMat=new THREE.PointsMaterial({color:'#dde4d6',size:.11,transparent:true,opacity:.7});const stars=new THREE.Points(starsGeo,starsMat);stars.visible=false;scene.add(stars);

const state={phase:'ready',time:-5,elapsed:0,paused:matchMedia('(prefers-reduced-motion: reduce)').matches,speed:1,night:false,sound:false,thrust:0};
let last=performance.now(),steamBudget=0,smokeBudget=0,lastStep=-1,lastCountdown=-1,uiBudget=0;
const listeners=[];function on(el,event,fn){el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));}
const clamp=THREE.MathUtils.clamp,smooth=(a,b,x)=>{const u=clamp((x-a)/(b-a),0,1);return u*u*(3-2*u);};
function syncPause(){const b=$('#pause');b.setAttribute('aria-pressed',String(state.paused));b.setAttribute('aria-label',state.paused?'Resume animation':'Pause animation');b.querySelector('span').textContent=state.paused?'Resume':'Pause';b.querySelector('use').setAttribute('href',state.paused?'#i-play':'#i-pause');updateAudio();}
function setLight(night){state.night=night;document.body.classList.toggle('night',night);scene.background.copy(night?nightColor:dayColor);scene.fog.color.copy(scene.background);ground.material.color.set(night?'#21383c':palette.ground);hemi.intensity=night?.7:2.3;sun.intensity=night?.65:3.4;sun.color.set(night?'#a7c7e9':'#fff2d7');fill.intensity=night?1:1.3;stars.visible=night;world.lampMat.emissiveIntensity=night?3:.3;apronLights.forEach(l=>l.intensity=night?4:0);smokeMat.uniforms.color.value.set(night?'#8fa0a4':'#d3d8cb');for(const b of document.querySelectorAll('[data-light]'))b.setAttribute('aria-pressed',String((b.dataset.light==='night')===night));}
for(const b of document.querySelectorAll('[data-light]'))on(b,'click',()=>setLight(b.dataset.light==='night'));
for(const b of document.querySelectorAll('[data-speed]'))on(b,'click',()=>{state.speed=Number(b.dataset.speed);for(const btn of document.querySelectorAll('[data-speed]'))btn.setAttribute('aria-pressed',String(btn===b));});
on($('#pause'),'click',()=>{state.paused=!state.paused;syncPause();});on($('#reset-camera'),'click',resetCamera);
let audio=null;
syncPause();
async function ensureAudio(){if(!audio){const ctx=new AudioContext();const gain=ctx.createGain();gain.gain.value=0;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;const noise=ctx.createBufferSource();const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;noise.buffer=buffer;noise.loop=true;noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();audio={ctx,gain,filter,noise};}await audio.ctx.resume();updateAudio();}
function updateAudio(){if(audio){audio.gain.gain.setTargetAtTime(state.sound&&!state.paused?state.thrust*.26:0,audio.ctx.currentTime,.15);audio.filter.frequency.setTargetAtTime(140+state.thrust*420,audio.ctx.currentTime,.1);}}
function beep(){if(!state.sound||!audio)return;const osc=audio.ctx.createOscillator(),gain=audio.ctx.createGain();osc.frequency.value=state.time>=0?960:660;gain.gain.setValueAtTime(.04,audio.ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.ctx.currentTime+.18);osc.connect(gain);gain.connect(audio.ctx.destination);osc.start();osc.stop(audio.ctx.currentTime+.2);}
on($('#sound'),'click',async()=>{try{state.sound=!state.sound;if(state.sound)await ensureAudio();updateAudio();$('#sound').setAttribute('aria-pressed',String(state.sound));$('#sound').setAttribute('aria-label',state.sound?'Mute launch sound':'Enable launch sound');}catch(e){state.sound=false;$('#launch-note').textContent='Sound is unavailable in this browser.';}});
function resetMission(){state.phase='ready';state.time=-5;state.thrust=0;lastStep=-1;lastCountdown=-1;rocket.group.position.set(0,.91,0);rocket.group.rotation.set(0,0,0);world.arms.forEach(a=>a.rotation.y=0);flames.forEach(f=>f.visible=false);engineLight.intensity=0;particles.forEach(p=>p.age=99);updateParticles(0);$('#countdown').hidden=true;$('#flight-message').hidden=true;$('#reset-mission').hidden=true;$('#launch').disabled=false;$('#launch span').textContent='Initiate launch';$('#launch-note').textContent='You’re the flight director. Make it fly.';$('#header-status').textContent='Systems ready';$('#scene-label').textContent='PAD A · STANDING BY';resetCamera();updateUI();updateAudio();}
function launch(){if(state.phase==='complete')resetMission();if(state.phase!=='ready')return;state.phase='launch';state.paused=false;syncPause();$('#launch').disabled=true;$('#launch span').textContent='Launch in progress';$('#reset-mission').hidden=false;$('#countdown').hidden=false;$('#header-status').textContent='Launch sequence active';$('#launch-note').textContent='Countdown started. Aster is ready to fly.';if(state.sound)ensureAudio();if(innerWidth<=800)document.querySelector('.viewer').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
on($('#launch'),'click',launch);on($('#reset-mission'),'click',resetMission);
on(window,'keydown',e=>{if(e.code==='Space'&&(e.target===document.body||e.target===renderer.domElement)){e.preventDefault();state.paused=!state.paused;syncPause();}});
function updateUI(){const t=state.time;const flight=Math.max(0,t);const step=state.phase==='ready'?0:t<-2?1:t<0?2:t<5?3:4;for(const li of document.querySelectorAll('[data-step]')){const s=Number(li.dataset.step);li.classList.toggle('current',s===step);li.classList.toggle('done',s<step||state.phase==='complete');}
if(step!==lastStep&&state.phase!=='ready'){const notes=['','Service arms retracting. Launch corridor clear.','Engine ignition. Thrust building.','Liftoff! Aster is on its way.','Tower cleared. The sky is yours.'];$('#launch-note').textContent=notes[step];$('#scene-label').textContent=step<3?'PAD A · LAUNCH SEQUENCE':step===3?'ASCENT · LIFTOFF':'ASCENT · TOWER CLEARED';lastStep=step;}
const secs=Math.floor(Math.abs(t));$('#mission-time').textContent=`T ${t<0?'−':'+'} ${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;$('#altitude').textContent=(flight*flight*.006).toFixed(2);$('#velocity').textContent=String(Math.round(flight*12));$('#thrust').textContent=String(Math.round(state.thrust*100));
if(state.phase==='launch'){const n=t<0?Math.ceil(-t):0;$('#countdown').hidden=t>2;$('#count-number').textContent=n>0?n:'LIFT OFF';$('#count-number').style.fontSize=n>0?'':'clamp(24px,3vw,40px)';$('#count-caption').textContent=t<0?'ALL SYSTEMS GO':'GO, ASTER. GO.';if(n!==lastCountdown){beep();lastCountdown=n;}}
}
function animate(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;const simDt=state.paused||document.hidden?0:dt*state.speed;
if(simDt){state.elapsed+=simDt;if(state.phase==='launch')state.time=Math.min(22,state.time+simDt);const t=state.time,flight=Math.max(0,t);state.thrust=state.phase==='ready'?0:smooth(-2.4,.6,t);world.arms.forEach((a,i)=>a.rotation.y=-smooth(-4.8+i*.2,-2.3+i*.2,t)*1.65);
if(state.phase!=='ready'){const y=.12*flight*flight;rocket.group.position.y=.91+y;rocket.group.position.x=smooth(6,22,t)*1.1;rocket.group.rotation.z=-smooth(7,22,t)*.085;const shake=t>-2.2&&t<2?Math.sin(state.elapsed*70)*.014*state.thrust:0;rocket.group.position.z=shake;const targetFollow=Math.max(0,y-2);const change=targetFollow-followY;camera.position.y+=change;controls.target.y+=change;followY=targetFollow;}
flameUniforms.time.value=state.elapsed;flameUniforms.power.value=state.thrust;flames.forEach((f,i)=>{f.visible=state.thrust>.01;f.parent.getWorldQuaternion(flameQuaternion);f.quaternion.copy(flameQuaternion.invert().multiply(camera.quaternion));f.scale.set(.8+Math.sin(state.elapsed*33+i)*.08,(.4+state.thrust*.8)*(1+Math.sin(state.elapsed*41+i)*.08),.8);});engineLight.intensity=state.thrust*(state.night?35:14);
world.beaconMat.emissiveIntensity=.6+Math.pow(Math.max(0,Math.sin(state.elapsed*3)),8)*2.5;world.dish.rotation.y=Math.sin(state.elapsed*.16)*.15;
steamBudget+=simDt*(state.phase==='ready'?7:t<0?4:0);while(steamBudget>1){emit(true);steamBudget--;}
smokeBudget+=simDt*state.thrust*(flight<4?36:20);while(smokeBudget>1){emit(false);smokeBudget--;}
updateParticles(simDt);uiBudget+=simDt;if(uiBudget>.07){updateUI();updateAudio();uiBudget=0;}
if(state.time>=22&&state.phase==='launch'){state.phase='complete';$('#countdown').hidden=true;$('#flight-message').hidden=false;$('#launch').disabled=false;$('#launch span').textContent='Launch again';$('#header-status').textContent='Mission accomplished';$('#launch-note').textContent='A beautiful liftoff. Ready for another?';state.thrust=.9;updateUI();updateAudio();}}
controls.update();renderer.render(scene,camera);}
renderer.setAnimationLoop(animate);updateUI();$('#loading').hidden=true;
window.rocketPreview={rocket,world,renderer,scene,camera,controls,state,launch,resetMission,setLight};
function dispose(){renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();listeners.forEach(remove=>remove());rocket.dispose();world.dispose();kit.dispose();ground.geometry.dispose();ground.material.dispose();flameMat.dispose();flameGeo.dispose();smokeTexture.dispose();smokeGeometry.dispose();smokeMat.dispose();smoke.dispose();starsGeo.dispose();starsMat.dispose();renderer.dispose();renderer.domElement.remove();if(audio){audio.noise.stop();audio.ctx.close();}delete window.rocketPreview;}
on(window,'pagehide',event=>{if(!event.persisted)dispose();});
