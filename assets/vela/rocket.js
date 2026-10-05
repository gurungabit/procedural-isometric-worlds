import * as THREE from 'three';

/** Vela V-1, a two-stage launch vehicle built from primitives, lathes, and canvas decals.
 * Y-up, origin at ground center beneath the deployed legs. Fins point along ±X/±Z; legs sit between them.
 * Usage: const rocket=createRocket({accent:'#388f89'}); scene.add(rocket.group);
 * Pose with setLegs/setFairing/setArrays/setGimbal/setFins/setThrust, then call rocket.update(seconds,dt) each frame.
 * The caller owns placement and mission timing; rocket.dispose() releases this factory's resources.
 */
const R=.62,LEG=1.47,LEG_OUT=2.55;
const ease=k=>{k=THREE.MathUtils.clamp(k,0,1);return k*k*(3-2*k);};

const plumeVertex=`varying vec2 vUv;varying float vFacing;
void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);
vec3 v=isOrthographic?vec3(0.,0.,1.):normalize(-mv.xyz);vFacing=abs(dot(n,v));gl_Position=projectionMatrix*mv;}`;
const plumeFragment=`uniform float uTime,uPower,uSeed;uniform vec3 uCore,uEdge;varying vec2 vUv;varying float vFacing;
void main(){float along=1.-vUv.y;
float n=sin(uTime*47.+along*19.+uSeed)*sin(uTime*31.-vUv.x*31.4159+uSeed*2.);
float body=pow(vFacing,1.35),fade=smoothstep(1.,.12,along+.1*n*along)*smoothstep(0.,.03,along);
vec3 col=mix(uEdge,uCore,clamp(body*(1.25-along),0.,1.));
gl_FragColor=vec4(col,body*fade*(.84+.16*n)*uPower);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

export function createRocket({accent='#388f89',scale=1}={}) {
  const group=new THREE.Group();group.name='Vela';group.scale.setScalar(scale);
  const geometries=new Map(),resources=new Set();
  const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.1,...extra});resources.add(m);return m;};
  const paint=material(accent),shell=material('#f3eddc'),dark=material('#253b3e'),metal=material('#71848a',{metalness:.6,roughness:.35});
  const paintInside=material(accent,{side:THREE.DoubleSide}),shellInside=material('#f3eddc',{side:THREE.DoubleSide}),darkInside=material('#253b3e',{side:THREE.DoubleSide});
  const carbon=material('#30393b',{roughness:.62}),foil=material('#d9a441',{metalness:.75,roughness:.28}),panelEdge=material('#c9cfc9',{metalness:.4});
  const nozzle=material('#3c4547',{metalness:.7,roughness:.38,emissive:'#ff5a1a',emissiveIntensity:0,side:THREE.DoubleSide});
  const vacNozzle=material('#5a5148',{metalness:.75,roughness:.32,emissive:'#ff7a2e',emissiveIntensity:0,side:THREE.DoubleSide});
  function geo(key,make){if(!geometries.has(key)){const g=make();g.normalizeNormals();geometries.set(key,g);}return geometries.get(key);}
  function mesh(parent,geometry,mat,x=0,y=0,z=0,name=''){
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m;
  }
  function cyl(parent,rt,rb,h,mat,x,y,z,seg=48,open=false){return mesh(parent,geo(`c:${rt}:${rb}:${h}:${seg}:${open}`,()=>new THREE.CylinderGeometry(rt,rb,h,seg,1,open)),mat,x,y,z);}
  function box(parent,w,h,d,mat,x,y,z,name=''){return mesh(parent,geo(`b:${w}:${h}:${d}`,()=>new THREE.BoxGeometry(w,h,d)),mat,x,y,z,name);}
  function lathe(parent,key,points,mat,phiStart=0,phiLength=Math.PI*2,seg=48){
    return mesh(parent,geo(`l:${key}:${phiStart}`,()=>new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),seg,phiStart,phiLength)),mat);
  }
  function pivot(parent,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  function canvasTexture(w,h){
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;resources.add(texture);
    return {ctx:canvas.getContext('2d'),texture};
  }
  // A decal is a thin cylindrical shell slightly proud of the hull so it wraps the curvature without z-fighting.
  function decal(parent,radius,height,center,width,texture,y){
    const m=new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:.5,polygonOffset:true,polygonOffsetFactor:-2});resources.add(m);
    const g=new THREE.CylinderGeometry(radius,radius,height,24,1,true,center-width/2,width);geometries.set(`decal:${geometries.size}`,g);
    const d=mesh(parent,g,m,0,y,0,'Decal');d.castShadow=false;return d;
  }

  // ---- Booster ----------------------------------------------------------------------------------
  const booster=pivot(group,'Booster');
  cyl(booster,R,R,6.3,shell,0,4.25,0).name='Booster tank';
  cyl(booster,R+.006,R+.006,.62,dark,0,1.41,0,48,true).name='Thrust section';
  cyl(booster,R+.006,R+.006,.2,paint,0,6.96,0,48,true);cyl(booster,R+.006,R+.006,.05,paint,0,6.71,0,48,true);
  cyl(booster,R,R,.6,darkInside,0,7.7,0,48,true).name='Interstage';
  cyl(booster,R-.02,R-.02,.04,metal,0,7.42,0);
  cyl(booster,R,.68,.25,dark,0,.975,0).name='Engine skirt';cyl(booster,.66,.66,.05,metal,0,.86,0).name='Heat shield';
  box(booster,.07,5.2,.06,shell,-(R+.03),4.3,0,'Raceway');
  const logo=canvasTexture(256,1024);
  function drawLogo(color){
    const c=logo.ctx;c.clearRect(0,0,256,1024);c.save();c.translate(128,430);c.rotate(Math.PI/2);c.fillStyle='#253b3e';
    c.font='800 156px system-ui,-apple-system,sans-serif';c.textAlign='center';c.textBaseline='middle';c.letterSpacing='10px';c.fillText('VELA',0,8);c.restore();
    c.fillStyle=color;for(let i=0;i<3;i++){c.beginPath();c.moveTo(78,826+i*46);c.lineTo(128,796+i*46);c.lineTo(178,826+i*46);c.lineTo(178,846+i*46);c.lineTo(128,816+i*46);c.lineTo(78,846+i*46);c.fill();}
    logo.texture.needsUpdate=true;
  }
  decal(booster,R+.004,2.6,.72,2.6*256/1024/R,logo.texture,4.6);
  const vents=[];
  for(const [parent,y] of [[booster,7.12]]){box(parent,.14,.08,.05,dark,Math.sin(1.4)*(R+.01),y,Math.cos(1.4)*(R+.01));const v=pivot(parent,'Vent',Math.sin(1.4)*(R+.06),y,Math.cos(1.4)*(R+.06));vents.push(v);}

  const engines=[];
  for(let i=0;i<5;i++){
    const a=Math.PI/4+i*Math.PI/2,r=i===4?0:.4;
    const engine=pivot(booster,`Engine ${i+1}`,Math.cos(a)*r,.86,Math.sin(a)*r);
    cyl(engine,.075,.075,.14,metal,0,.02,0,16);
    lathe(engine,'bell',[[.06,0],[.075,-.05],[.105,-.15],[.135,-.3],[.155,-.45],[.165,-.52]],nozzle,0,Math.PI*2,28);
    engines.push(engine);
  }
  const fins=[];
  const finShape=new THREE.Shape();finShape.moveTo(0,0);finShape.lineTo(.5,-.08);finShape.lineTo(.5,.4);finShape.lineTo(0,1.25);finShape.closePath();
  const finGeo=geo('fin',()=>{const g=new THREE.ExtrudeGeometry(finShape,{depth:.05,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2});g.translate(0,0,-.025);return g;});
  for(let i=0;i<4;i++){
    const mount=pivot(booster,`Fin mount ${i+1}`,0,1.2,0);mount.rotation.y=-i*Math.PI/2;
    const hinge=pivot(mount,`Fin ${i+1}`,R-.03,0,0);mesh(hinge,finGeo,paint);fins.push(hinge);
  }
  const legs=[];
  for(let i=0;i<4;i++){
    const mount=pivot(booster,`Leg mount ${i+1}`,0,1.3,0);mount.rotation.y=-(Math.PI/4+i*Math.PI/2);
    box(mount,.06,.22,.2,metal,R+.03,0,0);
    const hinge=pivot(mount,`Leg ${i+1}`,R+.09,0,0);
    box(hinge,.13,LEG,.15,carbon,0,LEG/2,0);box(hinge,.04,LEG*.72,.07,metal,-.07,LEG*.5,0);box(hinge,.135,.18,.155,paint,0,LEG-.2,0);
    const foot=pivot(hinge,`Foot ${i+1}`,0,LEG,0);box(foot,.32,.07,.3,metal,.08,-.035,0);
    legs.push({hinge,foot});
  }

  // ---- Upper stage, payload, fairing --------------------------------------------------------------
  const upper=pivot(group,'Upper stage',0,8,0);
  cyl(upper,R,R,1.15,shell,0,.575,0).name='Upper tank';cyl(upper,R+.006,R+.006,.1,dark,0,.05,0,48,true);cyl(upper,R-.01,R-.01,.03,dark,0,-.006,0);
  lathe(upper,'mvac',[[.09,0],[.12,-.08],[.2,-.2],[.3,-.36],[.37,-.48],[.4,-.55]],vacNozzle,0,Math.PI*2,32).name='Vacuum nozzle';
  cyl(upper,.1,.1,.14,metal,0,-.02,0,16);
  cyl(upper,.7,R,.1,dark,0,1.2,0).name='Payload adapter ring';
  box(upper,.14,.08,.05,dark,Math.sin(1.4)*(R+.01),.9,Math.cos(1.4)*(R+.01));
  {const v=pivot(upper,'Vent',Math.sin(1.4)*(R+.06),.9,Math.cos(1.4)*(R+.06));vents.push(v);}

  const payload=pivot(upper,'Payload',0,1.25,0);
  cyl(payload,.22,.3,.18,metal,0,.09,0,24);box(payload,.62,.72,.62,foil,0,.54,0,'Satellite bus');
  box(payload,.64,.04,.64,panelEdge,0,.9,0);cyl(payload,.04,.04,.24,metal,0,1.02,0,8);
  lathe(payload,'dish',[[0,0],[.12,.02],[.22,.07],[.26,.11]],panelEdge,0,Math.PI*2,24).position.y=1.12;
  const cells=canvasTexture(128,256);
  {const c=cells.ctx;c.fillStyle='#d6dde0';c.fillRect(0,0,128,256);for(let y=0;y<8;y++)for(let x=0;x<4;x++){c.fillStyle=(x+y)%2?'#1f3f73':'#24498a';c.fillRect(5+x*30.5,5+y*31,28,28);}cells.texture.needsUpdate=true;}
  const cellMat=new THREE.MeshStandardMaterial({map:cells.texture,metalness:.35,roughness:.35});resources.add(cellMat);
  const arrays=[];
  for(const side of [-1,1]){
    const mount=pivot(payload,side<0?'Left array':'Right array',0,.54,side*.33);mount.rotation.y=side>0?0:Math.PI;
    box(mount,.05,.05,.12,metal,0,0,.06);
    const chain=[];let parent=pivot(mount,'Yoke',0,0,.12);
    for(let i=0;i<3;i++){
      const hinge=pivot(parent,`Panel ${i+1}`,[-.12,-.036,.036][i],0,i===0?0:.5);
      box(hinge,.03,.66,.48,cellMat,0,0,.25);chain.push(hinge);parent=hinge;
    }
    arrays.push(chain);
  }

  const fairing=[];
  const nose=[[.38,2.5],[.25,2.66],[.12,2.78],[0,2.83]],body=[[.7,.12],[.7,1.55],[.685,1.8],[.63,2.05],[.53,2.3],[.38,2.5]];
  for(const side of [-1,1]){
    const hinge=pivot(upper,side<0?'Left fairing':'Right fairing',side*.7,1.25,0),phi=side>0?0:Math.PI;
    for(const [key,points,mat] of [['fband',[[.7,0],[.7,.12]],paintInside],['fbody',body,shellInside],['fnose',nose,paintInside]]){
      const m=lathe(hinge,key,points,mat,phi,Math.PI,32);m.position.x=-side*.7;
    }
    fairing.push({hinge,side});
  }
  const patch=canvasTexture(256,256);
  function drawPatch(color){
    const c=patch.ctx;c.clearRect(0,0,256,256);c.fillStyle='#253b3e';c.beginPath();c.arc(128,128,118,0,Math.PI*2);c.fill();
    c.fillStyle=color;c.beginPath();c.arc(128,128,100,0,Math.PI*2);c.fill();c.fillStyle='#f3eddc';c.beginPath();
    for(let i=0;i<10;i++){const r=i%2?22:54,a=-Math.PI/2+i*Math.PI/5;c.lineTo(128+Math.cos(a)*r,112+Math.sin(a)*r);}c.fill();
    c.font='800 34px system-ui,-apple-system,sans-serif';c.textAlign='center';c.fillText('V-1',128,200);patch.texture.needsUpdate=true;
  }
  {const d=decal(fairing[1].hinge,.705,.62,.82,.62/.705,patch.texture,.85);d.position.x=-.7;}
  drawLogo(accent);drawPatch(accent);

  // ---- Exhaust plumes ---------------------------------------------------------------------------
  const plumes=[];
  function plume(parent,name,y,{radius,length,core,edge,rim,diamonds}){
    const holder=pivot(parent,name,0,y,0),layers=[];
    // The outer sheath is alpha-blended so its color survives a bright daytime sky; the core adds light on top.
    for(const [rt,rb,len,c,e,seed,blending] of [[radius,radius*1.75,1,edge,rim,0,THREE.NormalBlending],[radius*.72,radius*.32,.58,core,edge,3.1,THREE.AdditiveBlending]]){
      const g=geo(`plume:${rt}:${rb}`,()=>{const c=new THREE.CylinderGeometry(rt,rb,1,40,10,true);c.translate(0,-.5,0);return c;});
      const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPower:{value:0},uSeed:{value:seed},uCore:{value:new THREE.Color(c)},uEdge:{value:new THREE.Color(e)}},
        vertexShader:plumeVertex,fragmentShader:plumeFragment,transparent:true,depthWrite:false,blending,side:THREE.DoubleSide});
      resources.add(m);const l=new THREE.Mesh(g,m);l.name=`${name} layer`;l.renderOrder=2;l.userData.length=len;holder.add(l);layers.push(l);
    }
    const knotMat=new THREE.MeshBasicMaterial({color:core,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});resources.add(knotMat);
    const knots=[];for(let i=0;i<diamonds;i++){const k=new THREE.Mesh(geo('knot',()=>new THREE.SphereGeometry(1,16,10)),knotMat);k.renderOrder=3;holder.add(k);knots.push(k);}
    holder.visible=false;const p={holder,layers,knots,knotMat,length,radius,power:0,target:0,spread:1};plumes.push(p);return p;
  }
  const boosterPlume=plume(booster,'Booster plume',.34,{radius:.6,length:7.4,core:'#fff4cf',edge:'#ff9a3d',rim:'#d4461a',diamonds:4});
  const upperPlume=plume(upper,'Upper plume',-.55,{radius:.38,length:3.4,core:'#f2f8ff',edge:'#6fa8ff',rim:'#3346c9',diamonds:0});
  let boosterHeat=0,upperHeat=0;
  function cool(){boosterHeat=upperHeat=0;}

  // ---- Poses ------------------------------------------------------------------------------------
  // Feet stay level while deployed and fold flat against the strut when stowed.
  function setLegs(k){const e=ease(k),phi=.03+(LEG_OUT-.03)*e;for(const leg of legs){leg.hinge.rotation.z=-phi;leg.foot.rotation.z=THREE.MathUtils.lerp(Math.PI/2,phi,ease(k*2-1));}}
  function setGimbal(x,z){engines.forEach((e,i)=>{e.rotation.x=x+Math.sin(i*1.7)*x*.15;e.rotation.z=z+Math.cos(i*2.3)*z*.15;});}
  function setFins(angle){fins.forEach((f,i)=>{f.rotation.x=angle*(i%2?-1:1);});}
  /** open: 0 closed → 1 hinged open. away: seconds since the halves were released. */
  function setFairing(open,away=0){
    for(const {hinge,side} of fairing){
      hinge.rotation.z=-side*(1.05*ease(open)+.42*away);hinge.position.set(side*(.7+away*2.2+away*away*.5),1.25-away*away*1.1,0);hinge.visible=away<6;
    }
  }
  function setArrays(k){
    for(const chain of arrays)chain.forEach((hinge,i)=>{const e=ease(k*1.6-i*.3);hinge.rotation.y=i===0?Math.PI/2*(1-e):(i===1?-1:1)*Math.PI*(1-e);});
  }
  function setThrust(stage,power,immediate=false){const p=stage==='upper'?upperPlume:boosterPlume;p.target=power;if(immediate)p.power=power;}
  function setPlumeSpread(k){for(const p of plumes)p.spread=k;}
  function update(time,dt){
    const lerp=1-Math.exp(-9*dt);
    for(const p of plumes){
      p.power=THREE.MathUtils.lerp(p.power,p.target,lerp);if(p.power<.004&&p.target===0)p.power=0;p.holder.visible=p.power>0;
      if(!p.holder.visible)continue;
      const flutter=1+.05*Math.sin(time*53)+.03*Math.sin(time*97),len=p.length*(.35+.65*p.power)*flutter;
      for(const l of p.layers){l.scale.set(p.spread,len*l.userData.length,p.spread);l.material.uniforms.uTime.value=time;l.material.uniforms.uPower.value=Math.min(1,p.power*1.3);}
      p.knots.forEach((k,i)=>{const s=p.radius*(.5-i*.07)*p.spread;k.position.y=-(.11+i*.12)*len;k.scale.set(s,s*.62,s);});
      p.knotMat.opacity=.42*p.power/Math.max(1,p.spread*.9);
    }
    boosterHeat=THREE.MathUtils.lerp(boosterHeat,boosterPlume.power,1-Math.exp(-(boosterPlume.power>boosterHeat?2.5:.45)*dt));
    upperHeat=THREE.MathUtils.lerp(upperHeat,upperPlume.power,1-Math.exp(-(upperPlume.power>upperHeat?1.6:.3)*dt));
    nozzle.emissiveIntensity=boosterHeat*1.6;vacNozzle.emissiveIntensity=upperHeat*2.2;
  }
  function setAccent(color){paint.color.set(color);paintInside.color.set(color);drawLogo(color);drawPatch(color);}
  setLegs(1);setFairing(0);setArrays(0);

  // Bake the articulated motions into portable clips for GLB/AnimationMixer. Plumes are shader effects and stay runtime-only.
  function createAnimationClips({fps=30}={}){
    if(!Number.isFinite(fps)||fps<1||fps>120)throw new RangeError('fps must be between 1 and 120');
    const nodes=[...legs.flatMap(l=>[l.hinge,l.foot]),...fairing.map(f=>f.hinge),...arrays.flat(),...engines];
    const saved=nodes.map(node=>({node,position:node.position.clone(),quaternion:node.quaternion.clone()}));
    const reset=()=>{setLegs(1);setFairing(0);setArrays(0);setGimbal(0,0);};
    const clips=[];
    try{
      for(const [name,duration,pose] of [
        ['Legs stow',2,t=>setLegs(1-t/2)],
        ['Fairing open',1.5,t=>setFairing(t/1.5)],
        ['Arrays deploy',3,t=>setArrays(t/3)],
        ['Engine gimbal',2,t=>setGimbal(Math.sin(t*Math.PI)*.09,Math.sin(t*Math.PI*2)*.07)],
      ]){
        const frames=Math.ceil(duration*fps),times=[],positions=nodes.map(()=>[]),quaternions=nodes.map(()=>[]);
        for(let frame=0;frame<=frames;frame++){
          const t=duration*frame/frames;times.push(t);reset();pose(t);
          nodes.forEach((node,i)=>{positions[i].push(...node.position.toArray());quaternions[i].push(...node.quaternion.toArray());});
        }
        const tracks=[];
        nodes.forEach((node,i)=>{
          const moves=quaternions[i].some((v,j)=>Math.abs(v-quaternions[i][j%4])>1e-6);if(!moves)return;
          tracks.push(new THREE.QuaternionKeyframeTrack(`${node.uuid}.quaternion`,times,quaternions[i]));
          if(positions[i].some((v,j)=>Math.abs(v-positions[i][j%3])>1e-6))tracks.push(new THREE.VectorKeyframeTrack(`${node.uuid}.position`,times,positions[i]));
        });
        clips.push(new THREE.AnimationClip(name,duration,tracks));
      }
    }finally{
      for(const {node,position,quaternion} of saved){node.position.copy(position);node.quaternion.copy(quaternion);}
      group.updateMatrixWorld(true);
    }
    return clips;
  }
  function dispose(){for(const r of [...geometries.values(),...resources])r.dispose();geometries.clear();resources.clear();}
  return {
    group,booster,upper,payload,
    parts:{engines,fins,legs,fairing,arrays,vents,plumes:[boosterPlume.holder,upperPlume.holder],boosterExit:boosterPlume.holder,upperExit:upperPlume.holder},
    setLegs,setGimbal,setFins,setFairing,setArrays,setThrust,setPlumeSpread,cool,update,setAccent,createAnimationClips,dispose,
    get thrust(){return {booster:boosterPlume.power,upper:upperPlume.power};},
  };
}
