import * as THREE from 'three';

// Original reusable factories. Y-up; local origins at ground center.
export function seeded(seed) {
  let state=seed>>>0;
  return () => {state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
}

export function createKit() {
  const geometry=new Map(), materials=new Map(), owned=new Set();
  function geo(key,create) {if(!geometry.has(key))geometry.set(key,create());return geometry.get(key);}
  function material(color) {if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.85,metalness:0}));return materials.get(color);}
  function mesh(g,color,parent,x,y,z) {
    const m=new THREE.Mesh(g,typeof color==='string'?material(color):color);
    m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function box(parent,w,h,d,color,x=0,y=h/2,z=0) {
    const m=mesh(geo('box',()=>new THREE.BoxGeometry(1,1,1)),color,parent,x,y,z);m.scale.set(w,h,d);return m;
  }
  function cylinder(parent,rt,rb,h,color,x=0,y=h/2,z=0,segments=12) {
    return mesh(geo(`c:${rt}:${rb}:${h}:${segments}`,()=>new THREE.CylinderGeometry(rt,rb,h,segments)),color,parent,x,y,z);
  }
  function sphere(parent,r,color,x,y,z) {
    const m=mesh(geo('sphere',()=>new THREE.SphereGeometry(1,12,8)),color,parent,x,y,z);m.scale.setScalar(r);return m;
  }
  function sign(parent,text,bg,w,h,x,y,z) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);
    let size=58;ctx.font=`700 ${size}px system-ui`;ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';
    while(ctx.measureText(text).width>460&&size>12){size-=2;ctx.font=`700 ${size}px system-ui`;}
    ctx.fillText(text,256,66,460);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;owned.add(texture);
    const g=new THREE.PlaneGeometry(w,h),m=new THREE.MeshStandardMaterial({map:texture,roughness:.85});owned.add(g);owned.add(m);
    const plane=new THREE.Mesh(g,m);plane.position.set(x,y,z);parent.add(plane);return plane;
  }
  function building({name='GARDEN HOUSE',color='#4a9475'}={}) {
    const group=new THREE.Group();box(group,6,3.2,4.8,'#eee8d6');
    box(group,6.2,.2,5,color,0,3.25,0);
    const shape=new THREE.Shape();shape.moveTo(-3.2,0);shape.lineTo(3.2,0);shape.lineTo(0,1.5);shape.closePath();
    const roofGeo=geo('roof:6.4:5:1.5',()=>{const g=new THREE.ExtrudeGeometry(shape,{depth:5,bevelEnabled:false});g.translate(0,0,-2.5);return g;});
    mesh(roofGeo,color,group,0,3.35,0);
    box(group,1.15,2.15,.08,'#485c57',0,1.075,2.445);
    for(const x of [-2,2]){box(group,1.35,1.15,.06,'#bcdacf',x,1.85,2.44);box(group,1.55,.1,.2,'#f9fbec',x,1.23,2.48);}
    box(group,4.8,.12,1.3,'#f1c46e',0,2.55,2.9);
    sign(group,name,color,4.6,1.15,0,3,2.46);
    return group;
  }
  function bed({color='#5fa868',seed=1}={}) {
    const group=new THREE.Group();box(group,4,.28,3,'#716250');
    for(const z of [-1.55,1.55])box(group,4.3,.38,.16,'#c39e77',0,.19,z);
    for(const x of [-2.08,2.08])box(group,.16,.38,3.25,'#c39e77',x,.19,0);
    const crops=new THREE.Group();group.add(crops);const random=seeded(seed);
    for(let x=-1.45;x<=1.45;x+=.72)for(let z=-.95;z<=.95;z+=.62){
      const m=sphere(crops,.27+random()*.07,color,x,.55,z);m.scale.y*=1.35;
    }
    group.userData.crops=crops;return group;
  }
  function cart({color='#df985e'}={}) {
    const group=new THREE.Group(); // faces +X; cargo bobbing is local to the tray.
    box(group,2.6,.3,1.2,color,0,.65,0);box(group,.5,.65,1,'#f5efdc',.85,1,0);
    box(group,.08,.38,.75,'#486460',1.11,1.12,0);
    for(const x of [-.85,.85])for(const z of [-.61,.61]){const wheel=cylinder(group,.28,.28,.16,'#354942',x,.28,z);wheel.rotation.x=Math.PI/2;}
    const cargo=new THREE.Group();cargo.position.set(-.45,.82,0);group.add(cargo);
    box(cargo,1.05,.5,.8,'#bdcc7e');for(const z of [-.2,.2])sphere(cargo,.24,'#579a67',0,.67,z);
    group.userData.cargo=cargo;return group;
  }
  function trees(parent,placements) {
    if(!placements.length)return [];
    const trunk=new THREE.InstancedMesh(geo('tree-trunk',()=>new THREE.CylinderGeometry(.1,.14,1.4,8)),material('#977659'),placements.length);
    const crown=new THREE.InstancedMesh(geo('tree-crown',()=>new THREE.SphereGeometry(1,12,8)),material('#ffffff'),placements.length);
    const scratch=new THREE.Object3D();const colors=['#6bab79','#7fba8b','#579e70'];
    placements.forEach(({x,z,s=1},i)=>{
      scratch.position.set(x,.7*s,z);scratch.scale.setScalar(s);scratch.updateMatrix();trunk.setMatrixAt(i,scratch.matrix);
      scratch.position.set(x,2.1*s,z);scratch.scale.set(.85*s,1.1*s,.85*s);scratch.updateMatrix();crown.setMatrixAt(i,scratch.matrix);crown.setColorAt(i,new THREE.Color(colors[i%colors.length]));
    });
    for(const batch of [trunk,crown]){batch.castShadow=true;batch.receiveShadow=true;batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();parent.add(batch);owned.add(batch);}
    crown.instanceColor.needsUpdate=true;return [trunk,crown];
  }
  function dispose() {for(const resource of new Set([...geometry.values(),...materials.values(),...owned]))resource.dispose();geometry.clear();materials.clear();owned.clear();}
  return {box,cylinder,sphere,sign,building,bed,cart,trees,dispose};
}
