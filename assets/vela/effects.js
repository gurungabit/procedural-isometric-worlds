import * as THREE from 'three';

/** Pooled puffs drawn as one InstancedMesh. Particles live in world space, so smoke stays where it was emitted.
 * emit() reuses the oldest slot when the pool is full; update(dt) ages, moves, grows, and recolors every live puff.
 */
export function createParticles({count=600,glow=false,detail=1,smooth=false}={}) {
  const geometry=glow?new THREE.TetrahedronGeometry(1):new THREE.IcosahedronGeometry(1,detail);
  const material=glow
    ?new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})
    :new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:!smooth});
  const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.frustumCulled=false;mesh.name=glow?'Sparks':'Smoke';
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.setColorAt(0,new THREE.Color());mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const items=Array.from({length:count},()=>({alive:false,p:new THREE.Vector3(),v:new THREE.Vector3(),q:new THREE.Quaternion(),spin:new THREE.Vector3(),age:0,life:1,size:1,grow:1,drag:0,rise:0,c0:new THREE.Color(),c1:new THREE.Color()}));
  const dummy=new THREE.Matrix4(),scale=new THREE.Vector3(),color=new THREE.Color(),spinQ=new THREE.Quaternion(),euler=new THREE.Euler();
  // Live puffs are packed into the first instances each frame, so the draw only covers what is visible.
  mesh.count=0;let cursor=0,live=0;
  function emit({position,velocity,size=1,life=2,grow=1,drag=1,rise=0,color='#ffffff',fade}){
    const it=items[cursor];cursor=(cursor+1)%count;
    it.alive=true;it.p.copy(position);it.v.copy(velocity);it.age=0;it.life=life;it.size=size;it.grow=grow;it.drag=drag;it.rise=rise;
    it.c0.set(color);it.c1.set(fade??color);it.q.setFromEuler(euler.set(Math.random()*6,Math.random()*6,0));it.spin.set(Math.random()-.5,Math.random()-.5,Math.random()-.5);
  }
  function update(dt){
    live=0;
    for(const it of items){
      if(!it.alive)continue;
      it.age+=dt;if(it.age>=it.life){it.alive=false;continue;}
      const k=it.age/it.life;
      it.v.multiplyScalar(Math.exp(-it.drag*dt));it.v.y+=it.rise*dt;it.p.addScaledVector(it.v,dt);
      it.q.multiply(spinQ.setFromEuler(euler.set(it.spin.x*dt,it.spin.y*dt,it.spin.z*dt)));
      const s=it.size*(1+it.grow*(1-Math.pow(1-k,2.2)))*Math.min(1,it.age*7)*(k>.62?Math.max(0,1-(k-.62)/.38):1);
      mesh.setMatrixAt(live,dummy.compose(it.p,it.q,scale.setScalar(s)));mesh.setColorAt(live,color.copy(it.c0).lerp(it.c1,Math.pow(k,.55)));live++;
    }
    mesh.count=live;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
  }
  function clear(){for(const it of items)it.alive=false;mesh.count=live=0;}
  function dispose(){geometry.dispose();material.dispose();mesh.dispose();}
  return {mesh,emit,update,clear,dispose,get live(){return live;}};
}

/** Soft camera-facing smoke: one instanced quad per puff, with per-instance opacity, spin, and texture variant.
 * Same emit() contract as createParticles; size is the puff radius in world units.
 */
export function createSmoke({count=900}={}) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
  // Four billow variants in a 2×2 atlas, each built from overlapping radial blobs.
  let seed=11;const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  for(let cell=0;cell<4;cell++){
    const ox=(cell%2)*128,oy=Math.floor(cell/2)*128;
    for(let i=0;i<7;i++){
      const a=rand()*Math.PI*2,d=i?14+rand()*20:0,x=ox+64+Math.cos(a)*d,y=oy+64+Math.sin(a)*d,r=i?24+rand()*16:44;
      const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.5,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
    }
  }
  const texture=new THREE.CanvasTexture(canvas);
  const geometry=new THREE.PlaneGeometry(2,2),params=new Float32Array(count*3);
  const paramAttr=new THREE.InstancedBufferAttribute(params,3);paramAttr.setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('aParams',paramAttr);
  const material=new THREE.ShaderMaterial({
    uniforms:{map:{value:texture}},transparent:true,depthWrite:false,
    vertexShader:`attribute vec3 aParams;varying vec2 vUv;varying vec2 vCorner;varying float vAlpha;varying vec3 vColor;
void main(){
  vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float size=length(instanceMatrix[0].xyz);
  float s=sin(aParams.y),c=cos(aParams.y);vec2 corner=vec2(c*position.x-s*position.y,s*position.x+c*position.y);
  center.xy+=corner*size;gl_Position=projectionMatrix*center;
  float cell=aParams.z;vUv=(uv+vec2(mod(cell,2.),floor(cell/2.)))*.5;vCorner=position.xy;vAlpha=aParams.x;
  vColor=vec3(1.);
#ifdef USE_INSTANCING_COLOR
  vColor=instanceColor;
#endif
}`,
    fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying vec2 vCorner;varying float vAlpha;varying vec3 vColor;
void main(){
  float a=texture2D(map,vUv).a*vAlpha;if(a<.003)discard;
  // Light from above: the upper side of each billow is brighter, the underside picks up shadow.
  float shade=mix(.8,1.07,smoothstep(-1.,1.,vCorner.y+.25));
  gl_FragColor=vec4(vColor*shade,a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`});
  const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.frustumCulled=false;mesh.name='Smoke';mesh.renderOrder=1;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.setColorAt(0,new THREE.Color());mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);mesh.count=0;
  const items=Array.from({length:count},()=>({alive:false,p:new THREE.Vector3(),v:new THREE.Vector3(),age:0,life:1,size:1,grow:1,drag:0,rise:0,spin:0,angle:0,cell:0,opacity:.7,c0:new THREE.Color(),c1:new THREE.Color()}));
  const matrix=new THREE.Matrix4(),identity=new THREE.Quaternion(),scale=new THREE.Vector3(),color=new THREE.Color();
  let cursor=0,live=0;
  function emit({position,velocity,size=1,life=2,grow=1,drag=1,rise=0,color:c0='#ffffff',fade,opacity=.72}){
    const it=items[cursor];cursor=(cursor+1)%count;
    Object.assign(it,{alive:true,age:0,life,size,grow,drag,rise,opacity,spin:(Math.random()-.5)*.6,angle:Math.random()*6.28,cell:Math.floor(Math.random()*4)});
    it.p.copy(position);it.v.copy(velocity);it.c0.set(c0);it.c1.set(fade??c0);
  }
  function update(dt){
    live=0;
    for(const it of items){
      if(!it.alive)continue;
      it.age+=dt;if(it.age>=it.life){it.alive=false;continue;}
      const k=it.age/it.life;
      it.v.multiplyScalar(Math.exp(-it.drag*dt));it.v.y+=it.rise*dt;it.p.addScaledVector(it.v,dt);it.angle+=it.spin*dt;
      const s=it.size*1.7*(1+it.grow*(1-Math.pow(1-k,2)));
      mesh.setMatrixAt(live,matrix.compose(it.p,identity,scale.setScalar(s)));mesh.setColorAt(live,color.copy(it.c0).lerp(it.c1,Math.pow(k,.6)));
      params[live*3]=it.opacity*Math.min(1,it.age*5)*(1-smoothstep(.35,1,k));params[live*3+1]=it.angle;params[live*3+2]=it.cell;live++;
    }
    mesh.count=live;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;paramAttr.needsUpdate=true;
  }
  const smoothstep=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  function clear(){for(const it of items)it.alive=false;mesh.count=live=0;}
  function dispose(){geometry.dispose();material.dispose();texture.dispose();mesh.dispose();}
  return {mesh,emit,update,clear,dispose,get live(){return live;}};
}

/** Screen-space sky drawn first: a day gradient that darkens to space, with the Earth's limb rising into view. */
export function createSky() {
  const material=new THREE.ShaderMaterial({
    uniforms:{uTop:{value:new THREE.Color()},uBottom:{value:new THREE.Color()},uSpace:{value:0},uAspect:{value:1},uLimb:{value:-.4},uTime:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.9999,1.);}',
    fragmentShader:`uniform vec3 uTop,uBottom;uniform float uSpace,uAspect,uLimb,uTime;varying vec2 vUv;
void main(){vec3 col=mix(uBottom,uTop,smoothstep(0.,1.,vUv.y));
vec2 p=vec2((vUv.x-.5)*uAspect,vUv.y);float R=3.2;float d=length(p-vec2(0.,uLimb-R))-R;
float bands=sin(p.x*9.+uTime*.05)*sin(p.x*23.-p.y*41.+1.7)*.5+.5;
vec3 earth=mix(vec3(.13,.36,.62),vec3(.05,.17,.36),smoothstep(0.,-.35,d));
earth=mix(earth,vec3(.86,.92,.97),smoothstep(.62,.95,bands)*.55*smoothstep(-.4,-.02,d));
col+=vec3(.3,.58,1.)*exp(-max(d,0.)*24.)*uSpace*.85;
col=mix(col,earth,smoothstep(.003,-.003,d)*uSpace);
gl_FragColor=vec4(col,1.);
#include <colorspace_fragment>
}`,depthTest:false,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);mesh.frustumCulled=false;mesh.renderOrder=-100;mesh.name='Sky';
  const day=[new THREE.Color('#a8d2ea'),new THREE.Color('#eef4ee')],dusk=[new THREE.Color('#1d3f7a'),new THREE.Color('#6f9ccc')],space=[new THREE.Color('#03050d'),new THREE.Color('#0b1a3c')];
  const step=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  /** Returns the 0..1 "space" amount so callers can fade stars and plume spread consistently. */
  function setAltitude(y,aspect,time=0){
    const k1=step(120,900,y),k2=step(700,2200,y),u=material.uniforms;
    u.uTop.value.copy(day[0]).lerp(dusk[0],k1).lerp(space[0],k2);u.uBottom.value.copy(day[1]).lerp(dusk[1],k1).lerp(space[1],k2);
    u.uSpace.value=step(900,2600,y);u.uLimb.value=-.45+.68*step(1100,4200,y);u.uAspect.value=aspect;u.uTime.value=time;
    return u.uSpace.value;
  }
  function dispose(){mesh.geometry.dispose();material.dispose();}
  return {mesh,setAltitude,dispose};
}

/** Two layers of camera-attached points, so stars stay put while the follow camera climbs. */
export function createStars(camera,{count=900}={}) {
  const group=new THREE.Group();group.name='Stars';camera.add(group);const owned=[];
  for(const [n,size,seed] of [[count,1.4,7],[Math.round(count/6),2.6,13]]){
    let s=seed>>>0;const rand=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
    const positions=new Float32Array(n*3);for(let i=0;i<n;i++)positions.set([(rand()*2-1)*70,(rand()*2-1)*42,-120],i*3);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const material=new THREE.PointsMaterial({color:'#e9f1ff',size,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false});
    const points=new THREE.Points(geometry,material);points.frustumCulled=false;group.add(points);owned.push(geometry,material);
  }
  function setOpacity(k){group.visible=k>.002;for(const [i,p] of group.children.entries())p.material.opacity=k*(i?1:.8);}
  function dispose(){camera.remove(group);for(const r of owned)r.dispose();}
  return {group,setOpacity,dispose};
}

/** Flat-shaded cumulus puffs scattered along the ascent corridor; one draw call. */
export function createClouds({seed=42}={}) {
  let s=seed>>>0;const rand=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
  const puffs=[];
  for(let c=0;c<18;c++){
    const cx=-24+rand()*58,cy=55+rand()*230,cz=-14+rand()*20,n=5+Math.floor(rand()*4),w=2.2+rand()*2.6;
    for(let i=0;i<n;i++){const t=i/(n-1)-.5;puffs.push({x:cx+t*w*2.4+rand()*.6,y:cy+(1-Math.abs(t)*1.6)*w*.35,z:cz+(rand()-.5)*w,r:w*(.55+rand()*.35)*(1-Math.abs(t)*.6)});}
  }
  const geometry=new THREE.IcosahedronGeometry(1,1),material=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:true,emissive:'#dfe9f3',emissiveIntensity:.25});
  const mesh=new THREE.InstancedMesh(geometry,material,puffs.length);mesh.name='Clouds';
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  puffs.forEach((p,i)=>mesh.setMatrixAt(i,m.compose(new THREE.Vector3(p.x,p.y,p.z),q.setFromEuler(e.set(0,i*1.3,0)),new THREE.Vector3(p.r,p.r*.72,p.r))));
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
  function dispose(){geometry.dispose();material.dispose();mesh.dispose();}
  return {mesh,dispose};
}
