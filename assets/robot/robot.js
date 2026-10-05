import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** A grounded, Y-up robot facing +Z. All geometry and artwork are procedural.
 * Usage: const robot=createRobot({accent:'#388f89'}); scene.add(robot.group);
 * Call robot.update(seconds, deltaSeconds, 'idle'|'wave'|'walk'|'dance').
 * The caller owns the scene; robot.dispose() releases this factory's resources.
 */
export function createRobot({accent='#388f89',scale=1}={}) {
  const group=new THREE.Group();group.name='Roo';group.scale.setScalar(scale);
  const geometries=new Map(),resources=new Set();
  const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.52,metalness:.1,...extra});resources.add(m);return m;};
  const paint=material(accent),shell=material('#f3eddc'),dark=material('#253b3e'),metal=material('#71848a',{metalness:.6,roughness:.35}),orange=material('#e8a552'),eye=material('#83eee0',{emissive:'#83eee0',emissiveIntensity:.5});
  function geo(key,make){if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);}
  function mesh(parent,geometry,mat,x=0,y=0,z=0,name=''){
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m;
  }
  function box(parent,w,h,d,mat,x,y,z,r=.08,name=''){
    return mesh(parent,geo(`b:${w}:${h}:${d}:${r}`,()=>new RoundedBoxGeometry(w,h,d,3,r)),mat,x,y,z,name);
  }
  function cyl(parent,r,h,mat,x,y,z){return mesh(parent,geo(`c:${r}:${h}`,()=>new THREE.CylinderGeometry(r,r,h,20)),mat,x,y,z);}
  function sphere(parent,r,mat,x,y,z){return mesh(parent,geo(`s:${r}`,()=>new THREE.SphereGeometry(r,20,12)),mat,x,y,z);}
  function pivot(parent,name,x,y,z){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  const torso=pivot(group,'Torso',0,2.77,0);
  box(torso,1.8,1.56,1.18,shell,0,0,0,.16,'Body shell');
  box(torso,1.86,.22,1.22,paint,0,.57,0,.06);
  box(torso,1.18,.68,.1,dark,0,.08,.622,.09,'Chest panel');
  box(torso,.15,.33,.035,paint,-.36,.08,.682,.025);
  for(let i=0;i<3;i++)box(torso,.15,.08,.035,i===2?orange:eye,.05+i*.24,.12,.682,.018);
  for(let i=0;i<3;i++)box(torso,.09,.12,.035,metal,-.17+i*.17,-.33,.608,.018);
  box(torso,1.08,1.06,.34,paint,0,.08,-.71,.12,'Battery pack');
  for(const x of [-.54,.54])cyl(torso,.07,.33,metal,x,-.74,.42);
  cyl(group,.44,.28,dark,0,1.91,0);cyl(group,.25,.36,metal,0,3.72,0);

  const head=pivot(group,'Head',0,4.6,0);
  box(head,2.22,1.5,1.45,shell,0,0,0,.2,'Head shell');
  box(head,1.99,1.03,.12,dark,0,-.02,.735,.16,'Visor');
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;resources.add(texture);
  const screenMat=new THREE.MeshBasicMaterial({map:texture});resources.add(screenMat);
  const screen=mesh(head,geo('face',()=>new THREE.PlaneGeometry(1.72,.84)),screenMat,0,-.02,.8,'Screen face');screen.castShadow=false;
  let faceState='';
  function drawFace(blink,mode){
    const state=`${blink}:${mode}`;if(state===faceState)return;faceState=state;
    ctx.fillStyle='#253b3e';ctx.fillRect(0,0,512,256);ctx.fillStyle='#a8fff0';
    for(const x of [150,362]){ctx.beginPath();ctx.roundRect(x-31,blink?115:64,62,blink?8:88,blink?4:25);ctx.fill();}
    ctx.strokeStyle='#a8fff0';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();
    if(mode==='dance'){ctx.arc(256,184,20,0,Math.PI*2);}else{ctx.arc(256,155,39,.18*Math.PI,.82*Math.PI);}ctx.stroke();texture.needsUpdate=true;
  }
  drawFace(false,'idle');
  for(const side of [-1,1]){
    const ear=cyl(head,.28,.22,paint,side*1.17,.05,0);ear.rotation.z=Math.PI/2;
    const cap=cyl(head,.14,.24,metal,side*1.19,.05,0);cap.rotation.z=Math.PI/2;
  }
  cyl(head,.055,.45,metal,.64,.95,-.12);sphere(head,.15,orange,.64,1.21,-.12);
  box(head,.47,.08,.04,paint,-.38,.55,.726,.025);

  const arms=[],legs=[];
  for(const side of [-1,1]){
    const label=side<0?'Left':'Right';
    const shoulder=pivot(group,`${label} shoulder`,side*1.08,3.3,0);
    sphere(shoulder,.27,paint,0,0,0);
    box(shoulder,.43,.6,.48,shell,side*.05,-.36,0,.1);
    const elbow=pivot(shoulder,`${label} elbow`,side*.05,-.77,0);
    sphere(elbow,.2,metal,0,0,0);box(elbow,.42,.57,.44,paint,0,-.35,0,.08);
    const hand=pivot(elbow,`${label} gripper`,0,-.76,0);
    box(hand,.48,.24,.44,dark,0,0,0,.06);
    for(const x of [-.18,.18]){
      box(hand,.12,.28,.34,shell,x,-.22,.03,.035);
      box(hand,.16,.1,.34,shell,x-Math.sign(x)*.045,-.38,.03,.025);
    }
    arms.push({shoulder,elbow,hand,side});
    const hip=pivot(group,`${label} hip`,side*.48,1.75,0);
    sphere(hip,.22,dark,0,0,0);cyl(hip,.18,.55,metal,0,-.34,0);
    box(hip,.4,.46,.46,shell,0,-.32,0,.07);
    const knee=pivot(hip,`${label} knee`,0,-.68,0);sphere(knee,.21,paint,0,0,0);
    box(knee,.44,.64,.46,shell,0,-.38,0,.09);
    box(knee,.18,.24,.035,paint,0,-.35,.245,.028);
    box(knee,.7,.34,1.02,paint,0,-.9,.19,.09,'Foot');
    box(knee,.72,.1,1.04,dark,0,-1.035,.19,.03);
    legs.push({hip,knee,side});
  }
  let mode='idle';
  function update(time,dt,nextMode='idle'){
    mode=nextMode;const lerp=1-Math.exp(-12*dt),beat=time*6;
    const blend=(object,key,target)=>{object.rotation[key]=THREE.MathUtils.lerp(object.rotation[key],target,lerp);};
    group.position.y=mode==='walk'?Math.abs(Math.sin(beat))*.07:mode==='dance'?.045+.045*Math.sin(beat):0;
    torso.position.y=2.77+Math.sin(time*2)*.012;
    blend(torso,'z',mode==='dance'?Math.sin(beat)*.09:0);
    blend(head,'y',mode==='idle'?Math.sin(time*.7)*.13:mode==='dance'?Math.sin(beat*.5)*.2:0);
    blend(head,'z',mode==='wave'?-.1:mode==='dance'?Math.sin(beat)*.1:0);
    for(const arm of arms){
      blend(arm.shoulder,'x',mode==='walk'?Math.sin(beat)*.43*arm.side:mode==='dance'?Math.sin(beat+arm.side)*.65:0);
      blend(arm.shoulder,'z',mode==='wave'&&arm.side===1?1.9+.08*Math.sin(time*5):mode==='dance'?arm.side*(.95+.2*Math.sin(beat)):arm.side*.08);
      blend(arm.elbow,'z',mode==='wave'&&arm.side===1?.8+.2*Math.sin(time*7):mode==='dance'?arm.side*.6:0);
      blend(arm.elbow,'x',mode==='walk'?-.15:0);
      blend(arm.hand,'z',mode==='wave'&&arm.side===1?Math.sin(time*7)*.18:0);
    }
    for(const leg of legs){blend(leg.hip,'x',mode==='walk'?Math.sin(beat)*.4*leg.side:0);blend(leg.hip,'z',mode==='dance'?Math.sin(beat)*.08:0);blend(leg.knee,'x',mode==='walk'?Math.max(0,-Math.sin(beat)*leg.side)*.3:0);}
    drawFace(time%4.4>4.24,mode);
  }
  function setAccent(color){paint.color.set(color);}
  // Bake procedural joint motion into portable clips for GLB/AnimationMixer.
  // Canvas eye blinking stays in the live preview; these clips animate transforms.
  function createAnimationClips({fps=30}={}){
    if(!Number.isFinite(fps)||fps<1||fps>120)throw new RangeError('fps must be between 1 and 120');
    const nodes=[group,torso,head,...arms.flatMap(a=>[a.shoulder,a.elbow,a.hand]),...legs.flatMap(l=>[l.hip,l.knee])];
    const saved=nodes.map(node=>({node,position:node.position.clone(),quaternion:node.quaternion.clone()})),savedMode=mode;
    const clips=[];
    try{
      for(const [clipMode,duration] of [['idle',4.4],['wave',Math.PI*2],['walk',Math.PI/3],['dance',Math.PI*2/3]]){
        const frames=Math.ceil(duration*fps),times=[],positions=nodes.map(()=>[]),quaternions=nodes.map(()=>[]);
        for(const node of nodes)node.rotation.set(0,0,0);
        for(let frame=0;frame<=frames;frame++){
          const t=duration*frame/frames;times.push(t);update(t,1,clipMode);
          nodes.forEach((node,i)=>{positions[i].push(...node.position.toArray());quaternions[i].push(...node.quaternion.toArray());});
        }
        const tracks=[];
        nodes.forEach((node,i)=>{
          // Matching endpoints keep repeat playback continuous.
          positions[i].splice(frames*3,3,...positions[i].slice(0,3));quaternions[i].splice(frames*4,4,...quaternions[i].slice(0,4));
          if(node===group||node===torso)tracks.push(new THREE.VectorKeyframeTrack(`${node.uuid}.position`,times,positions[i]));
          tracks.push(new THREE.QuaternionKeyframeTrack(`${node.uuid}.quaternion`,times,quaternions[i]));
        });
        clips.push(new THREE.AnimationClip(clipMode[0].toUpperCase()+clipMode.slice(1),duration,tracks));
      }
    }finally{
      for(const {node,position,quaternion} of saved){node.position.copy(position);node.quaternion.copy(quaternion);}
      mode=savedMode;drawFace(false,mode);group.updateMatrixWorld(true);
    }
    return clips;
  }
  function dispose(){for(const r of [...geometries.values(),...resources])r.dispose();geometries.clear();resources.clear();}
  return {group,joints:{head,torso,arms,legs},update,setAccent,createAnimationClips,dispose,get mode(){return mode;}};
}
