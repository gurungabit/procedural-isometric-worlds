import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Launch Complex 1: a compact island diorama whose deck top is y=0 and whose rocket axis is the world Y axis.
 * The flame trench runs along X and opens at both island edges; the service tower stands at the back-left.
 * setArms({service,umbilical}) and setClamps(k) take 1 for attached/holding and 0 for retracted.
 */
const ease=k=>{k=THREE.MathUtils.clamp(k,0,1);return k*k*(3-2*k);};
const ISLAND={x:7,z:5.5,trench:.8,deck:.9};

export function createLaunchPad({accent='#388f89'}={}) {
  const group=new THREE.Group();group.name='Launch Complex 1';
  const geometries=new Map(),resources=new Set();
  const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.85,metalness:0,...extra});resources.add(m);return m;};
  const concrete=material('#e2e2d6'),plinth=material('#2b3838',{roughness:.7}),trench=material('#5b6260'),scorch=material('#77695f',{roughness:.65,metalness:.3});
  const steel=material('#8b989b',{metalness:.5,roughness:.45}),dark=material('#253b3e'),cream=material('#f3eddc',{roughness:.55}),red=material('#c4614a',{roughness:.6});
  const paint=material(accent,{roughness:.6}),stripe=material('#e8b84a'),glass=material('#2f4a52',{roughness:.25,metalness:.2});
  const beaconMat=material('#ff4a3a',{emissive:'#ff2d1f',emissiveIntensity:1.5}),lampMat=material('#fff3d6',{emissive:'#ffe2a8',emissiveIntensity:.6});
  function geo(key,make){if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);}
  function mesh(parent,geometry,mat,x=0,y=0,z=0,name=''){
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m;
  }
  function box(parent,w,h,d,mat,x,y,z,name=''){return mesh(parent,geo(`b:${w}:${h}:${d}`,()=>new THREE.BoxGeometry(w,h,d)),mat,x,y,z,name);}
  function rbox(parent,w,h,d,r,mat,x,y,z,name=''){return mesh(parent,geo(`rb:${w}:${h}:${d}:${r}`,()=>new RoundedBoxGeometry(w,h,d,3,r)),mat,x,y,z,name);}
  function cyl(parent,rt,rb,h,mat,x,y,z,seg=24){return mesh(parent,geo(`c:${rt}:${rb}:${h}:${seg}`,()=>new THREE.CylinderGeometry(rt,rb,h,seg)),mat,x,y,z);}
  function sphere(parent,r,mat,x,y,z,seg=24){return mesh(parent,geo(`s:${r}:${seg}`,()=>new THREE.SphereGeometry(r,seg,Math.ceil(seg*.6))),mat,x,y,z);}
  function pivot(parent,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  // Lattice members (tower, railings) share one unit box; each becomes a colored instance stretched between two points.
  const members=[];
  function member(a,b,t,color){members.push({a:new THREE.Vector3(...a),b:new THREE.Vector3(...b),t,color});}

  // ---- Island, deck, trench -------------------------------------------------------------------
  const {x:IX,z:IZ,trench:TW,deck:DH}=ISLAND,slab=IZ-TW;
  for(const side of [-1,1]){
    box(group,IX*2,DH,slab,concrete,0,-DH/2,side*(TW+slab/2),'Deck');
    box(group,IX*2,.012,.09,stripe,0,.006,side*(TW+.06));
  }
  rbox(group,IX*2+.3,.6,IZ*2+.3,.08,plinth,0,-DH-.27,0,'Plinth');
  box(group,IX*2,.06,TW*2,trench,0,-DH+.03,0,'Trench floor');
  const deflector=new THREE.Shape();deflector.moveTo(-2.2,0);deflector.quadraticCurveTo(-.25,0,0,.66);deflector.quadraticCurveTo(.25,0,2.2,0);deflector.closePath();
  mesh(group,geo('deflector',()=>{const g=new THREE.ExtrudeGeometry(deflector,{depth:TW*2-.02,bevelEnabled:false});g.translate(0,0,-(TW-.01));return g;}),scorch,0,-DH+.06,0,'Flame deflector');
  for(const sx of [-1,1])for(const sz of [-1,1])box(group,.5,.012,.5,stripe,sx*1.08,.006,sz*1.08);

  // ---- Hold-down clamps -----------------------------------------------------------------------
  const clamps=[];
  for(const [x,z] of [[-.42,-.98],[.42,-.98],[-.42,.98],[.42,.98]]){
    box(group,.34,.22,.34,steel,x,.11,z);
    const hinge=pivot(group,'Hold-down clamp',x,.22,z);hinge.rotation.y=Math.atan2(z,-x);
    box(hinge,.11,.72,.13,dark,0,.36,0);box(hinge,.4,.1,.13,paint,.15,.72,0);clamps.push(hinge);
  }

  // ---- Service tower: dark steel frame with red bracing ---------------------------------------
  const T={x:-3.2,z:-2.6,w:.7,h:14,step:1.2},frame='#33413f',brace='#c4614a';
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]])member([T.x+cx*T.w,0,T.z+cz*T.w],[T.x+cx*T.w,T.h,T.z+cz*T.w],.15,frame);
  for(let y=T.step;y<=T.h+.01;y+=T.step){
    const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([cx,cz])=>[T.x+cx*T.w,y,T.z+cz*T.w]);
    for(let i=0;i<4;i++){const a=c[i],b=c[(i+1)%4];member(a,b,.08,frame);member([a[0],y-T.step,a[2]],b,.055,brace);member(a,[b[0],y-T.step,b[2]],.055,brace);}
  }
  box(group,.8,T.h,.8,material('#6b7a7b'),T.x,T.h/2,T.z,'Elevator core');
  for(let y=2.4;y<T.h;y+=2.4)box(group,1.6,.06,1.6,steel,T.x,y,T.z);
  box(group,1.7,.12,1.7,dark,T.x,T.h+.06,T.z,'Tower roof');
  cyl(group,.04,.06,2.6,steel,T.x,T.h+1.4,T.z,8);
  const beacons=[sphere(group,.13,beaconMat,T.x,T.h+2.75,T.z,12)];
  // Arms swing about a vertical hinge just off the tower corner nearest the rocket.
  const arms={};
  const hingeX=T.x+T.w+.3,hingeZ=T.z+T.w,toAxis=Math.hypot(hingeX,hingeZ),attached=Math.atan2(hingeZ,-hingeX);
  function arm(name,y,reach,crew){
    const hinge=pivot(group,name,hingeX,y,hingeZ);hinge.rotation.y=attached;
    box(group,.34,.5,.34,dark,hingeX-.12,y+.05,hingeZ);
    const L=toAxis-reach;box(hinge,L,.1,.5,steel,L/2,0,0);
    for(const z of [-.24,.24]){box(hinge,L,.04,.04,red,L/2,.42,z);for(let x=.15;x<L-.1;x+=.42)box(hinge,.04,.42,.04,red,x,.21,z);}
    if(crew){box(hinge,.62,.76,.74,cream,L-.31,.38,0,'White room');box(hinge,.02,.5,.34,dark,L-.62,.33,0);}
    else{box(hinge,.18,.34,.42,dark,L-.09,.1,0,'Umbilical plate');const hose=cyl(hinge,.06,.06,L-.2,dark,(L-.2)/2,-.14,.12,10);hose.rotation.z=Math.PI/2;}
    return {hinge,set:k=>{hinge.rotation.y=attached+(Math.PI/2-attached)*(1-ease(k));}};
  }
  arms.service=arm('Crew access arm',9.98,.75,true);arms.umbilical=arm('Umbilical arm',7.1,.67,false);

  // ---- Propellant spheres, horizontal tank, blockhouse ----------------------------------------
  for(const x of [3.9,5.75]){
    for(const [dx,dz] of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]])cyl(group,.06,.06,1,steel,x+dx,.5,-3.7+dz,8);
    sphere(group,.92,cream,x,1.85,-3.7,28).name='Propellant sphere';cyl(group,.935,.935,.12,paint,x,1.85,-3.7,32);
  }
  {const p=cyl(group,.08,.08,8.2,steel,1.6,.12,-4.95,10);p.rotation.z=Math.PI/2;const q=cyl(group,.08,.08,2.3,steel,-2.5,.12,-3.8,10);q.rotation.x=Math.PI/2;}
  {const t=cyl(group,.6,.6,2.6,cream,-4.7,.82,3.5,24);t.rotation.z=Math.PI/2;t.name='Fuel tank';
    for(const x of [-6,-3.4]){const cap=sphere(group,.6,cream,x,.82,3.5,24);cap.scale.set(.35,1,1);}
    for(const x of [-5.5,-3.9])box(group,.24,.32,1,steel,x,.16,3.5);cyl(group,.61,.61,.1,paint,-4.7,.82,3.5,24).rotation.z=Math.PI/2;}
  rbox(group,3,1.15,2,.08,cream,4.8,.575,3.55,'Blockhouse');
  box(group,2.7,.26,.04,glass,4.8,.78,4.57);box(group,.04,.26,1.6,glass,6.31,.78,3.55);box(group,3.06,.1,2.06,paint,4.8,1.2,3.55);
  {const dish=sphere(group,.34,cream,5.5,1.62,3.2,18);dish.scale.set(1,.35,1);dish.rotation.set(-.5,0,.35);cyl(group,.04,.04,.36,steel,5.5,1.42,3.2,8);}
  {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
    c.fillStyle='#253b3e';c.fillRect(0,0,512,128);c.fillStyle='#f3eddc';c.font='700 60px Manrope,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.letterSpacing='6px';c.fillText('LC-1  VELA',256,68);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;resources.add(texture);
    const m=new THREE.MeshStandardMaterial({map:texture,roughness:.6});resources.add(m);
    const sign=mesh(group,geo('sign',()=>new THREE.PlaneGeometry(1.6,.4)),m,4.8,.36,4.565,'Sign');sign.castShadow=false;
  }

  // ---- Floodlights, railings, shrubs ----------------------------------------------------------
  for(const [x,z] of [[-6.6,-5.1],[6.6,-5.1],[-6.6,5.1],[6.6,5.1]]){
    cyl(group,.045,.07,4.6,dark,x,2.3,z,8);
    const head=pivot(group,'Floodlight',x,4.55,z);
    box(head,.5,.3,.12,dark,0,0,0);const lamp=box(head,.42,.22,.02,lampMat,0,0,.065);lamp.castShadow=false;head.lookAt(0,1.5,0);
  }
  for(let x=1.1;x<=6.9;x+=.58)member([x,0,IZ-.08],[x,.48,IZ-.08],.035,'#33413f');
  member([1.1,.48,IZ-.08],[6.9,.48,IZ-.08],.04,'#33413f');member([1.1,.26,IZ-.08],[6.9,.26,IZ-.08],.03,'#33413f');
  {
    const spots=[[-6.3,1.25,.42],[-5.75,1.5,.3],[-1.6,4.95,.34],[-1.05,5.05,.26],[6.35,1.3,.38],[2.3,-5,.3],[-.2,-5.05,.36]];
    const greens=['#6e9a6a','#86ad74','#5d8a63'];
    const bushes=new THREE.InstancedMesh(geo('bush',()=>new THREE.IcosahedronGeometry(1,1)),material('#ffffff',{roughness:.9,flatShading:true}),spots.length);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),color=new THREE.Color();
    spots.forEach(([x,z,r],i)=>{bushes.setMatrixAt(i,m.compose(new THREE.Vector3(x,r*.8,z),q,new THREE.Vector3(r,r*.85,r)));bushes.setColorAt(i,color.set(greens[i%3]));});
    bushes.castShadow=bushes.receiveShadow=true;bushes.name='Shrubs';group.add(bushes);
  }
  {
    const truss=new THREE.InstancedMesh(geo('unit',()=>new THREE.BoxGeometry(1,1,1)),material('#ffffff',{roughness:.6}),members.length);
    const dummy=new THREE.Object3D(),dir=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
    members.forEach(({a,b,t,color:c},i)=>{dir.subVectors(b,a);const len=dir.length();dummy.position.addVectors(a,b).multiplyScalar(.5);
      dummy.quaternion.setFromUnitVectors(up,dir.normalize());dummy.scale.set(t,len,t);dummy.updateMatrix();truss.setMatrixAt(i,dummy.matrix);truss.setColorAt(i,color.set(c));});
    truss.instanceMatrix.needsUpdate=true;truss.computeBoundingSphere();truss.castShadow=true;truss.receiveShadow=true;truss.name='Tower lattice';group.add(truss);
  }

  // ---- Runtime --------------------------------------------------------------------------------
  function setArms({service,umbilical}={}){if(service!==undefined)arms.service.set(service);if(umbilical!==undefined)arms.umbilical.set(umbilical);}
  function setClamps(k){for(const c of clamps)c.rotation.z=.95*(1-ease(k));}
  function update(time){beaconMat.emissiveIntensity=(time%1.6)<.22?3:.25;}
  function setAccent(color){paint.color.set(color);}
  function dispose(){group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const r of [...geometries.values(),...resources])r.dispose();geometries.clear();resources.clear();}
  setArms({service:1,umbilical:1});setClamps(1);
  return {
    group,setArms,setClamps,setAccent,update,dispose,
    trenchExits:[new THREE.Vector3(IX+.1,-.5,0),new THREE.Vector3(-IX-.1,-.5,0)],
    tower:{x:T.x,z:T.z,height:T.h},
  };
}
