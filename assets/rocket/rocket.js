import * as THREE from 'three';

// Y-up. Rocket origin is the bottom of the engine bells; its labelled face points +Z.
export const palette = { ivory:'#f7f3e8', white:'#e6e7df', dark:'#2a393b', steel:'#718382', orange:'#c95634', copper:'#a85a36', gold:'#ceac71', concrete:'#bfc8b5', sage:'#7f9670', ground:'#f3f0e8' };
export function createKit() {
  const geometries = new Map(), materials = new Map(), textures = new Set();
  const mat = (color, metalness=0, roughness=.65) => {
    const key = `${color}/${metalness}/${roughness}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({color,metalness,roughness}));
    return materials.get(key);
  };
  const geo=(key,fn)=>{if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key);};
  function mesh(parent, geometry, material, x=0,y=0,z=0) {const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const box=(p,w,h,d,c,x=0,y=0,z=0)=>mesh(p,geo(`b/${w}/${h}/${d}`,()=>new THREE.BoxGeometry(w,h,d)),typeof c==='string'?mat(c):c,x,y,z);
  const cyl=(p,rt,rb,h,c,x=0,y=0,z=0,n=48)=>mesh(p,geo(`c/${rt}/${rb}/${h}/${n}`,()=>new THREE.CylinderGeometry(rt,rb,h,n)),typeof c==='string'?mat(c):c,x,y,z);
  const sphere=(p,r,c,x=0,y=0,z=0)=>mesh(p,geo(`s/${r}`,()=>new THREE.SphereGeometry(r,24,16)),typeof c==='string'?mat(c):c,x,y,z);
  function beam(p,a,b,width,c){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=box(p,width,v.length(),width,c,...new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
  function label(text,{color=palette.dark,background=null,width=512,height=128,size=68}={}){const cv=document.createElement('canvas');cv.width=width;cv.height=height;const ctx=cv.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,width,height);}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`700 ${size}px 'DM Sans', sans-serif`;ctx.fillText(text,width/2,height/2);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;textures.add(tx);return tx;}
  function sign(p,text,w,h,x,y,z,opts={}){const tx=label(text,opts);const material=new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false});materials.set(`label/${materials.size}`,material);const plane=mesh(p,geo(`plane/${w}/${h}`,()=>new THREE.PlaneGeometry(w,h)),material,x,y,z);plane.castShadow=false;return plane;}
  return {mat,geo,mesh,box,cyl,sphere,beam,label,sign,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

export function createRocket({kit=createKit(),accent=palette.orange}={}) {
  const {box,cyl,mesh,geo,mat,beam,label}=kit, group=new THREE.Group();group.name='Aster-01';
  const white=mat(palette.ivory,.12,.38),black=mat(palette.dark,.5,.4),silver=mat(palette.steel,.7,.35),orange=mat(accent,.15,.42),gold=mat(palette.gold,.7,.35);
  // Core: tanks, ribbed interstage, upper stage, and an ogive payload fairing.
  cyl(group,.69,.77,1.15,white,0,1.35,0);
  cyl(group,.78,.78,3.5,white,0,3.66,0);
  cyl(group,.785,.785,.33,orange,0,2.13,0);
  cyl(group,.79,.79,.64,black,0,5.65,0);
  for(let i=0;i<32;i++){const a=i*Math.PI/16;box(group,.038,.53,.038,silver,Math.sin(a)*.797,5.65,Math.cos(a)*.797);}
  cyl(group,.78,.78,1.88,white,0,6.92,0);
  cyl(group,.795,.795,.12,orange,0,7.84,0);
  const points=[new THREE.Vector2(0,2.13),new THREE.Vector2(.09,2.04),new THREE.Vector2(.28,1.82),new THREE.Vector2(.5,1.52),new THREE.Vector2(.71,1.14),new THREE.Vector2(.86,.76),new THREE.Vector2(.88,.25),new THREE.Vector2(.8,0)];
  mesh(group,geo('ogive',()=>new THREE.LatheGeometry([...points].reverse(),64)),white,0,7.9,0);
  for(const y of [1,2.31,3.16,4.54,5.3,6.15,7.5])cyl(group,.791,.791,.025,silver,0,y,0);
  // Curved hull decals are flush with the cylinder, so they stay attached from every angle.
  const tx=label('A S T E R',{width:256,height:1024,size:48});
  const cv=tx.image,ctx=cv.getContext('2d');ctx.clearRect(0,0,256,1024);ctx.fillStyle=palette.dark;ctx.font="700 74px 'DM Sans',sans-serif";ctx.textAlign='center';['A','S','T','E','R'].forEach((l,i)=>ctx.fillText(l,128,165+i*165));tx.needsUpdate=true;
  const decalMat=new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false});
  const decalGeo=new THREE.CylinderGeometry(.794,.794,2.5,24,1,true,-.36,.72);const decal=new THREE.Mesh(decalGeo,decalMat);decal.position.y=3.83;group.add(decal);
  kit.sign(group,'01',.4,.23,0,6.84,.787,{size:72});
  kit.sign(group,'A',.32,.32,0,9.05,.865,{color:accent,size:95});
  // Panels, avionics housings, and exposed feed lines.
  for(const side of [-1,1]){
    beam(group,[side*.8,2.28,0],[side*.8,5.23,0],.07,silver);
    box(group,.23,.44,.09,white,side*.41,6.55,.697);
    for(let j=0;j<4;j++)box(group,.15,.035,.022,black,side*.41,6.45+j*.067,.75);
    box(group,.16,.64,.09,orange,side*.38,1.46,.68);
  }
  // Four stabilizer fins, with their origin at the structural root.
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.62,0);shape.lineTo(.54,.37);shape.lineTo(.03,1.28);shape.closePath();
  const finGeo=geo('fin',()=>new THREE.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:1}));
  for(let i=0;i<4;i++){const pivot=new THREE.Group();pivot.rotation.y=i*Math.PI/2+Math.PI/4;pivot.position.set(0,.82,0);group.add(pivot);mesh(pivot,finGeo,orange,.68,0,-.0375);}
  const engines=[];
  function engine(parent,x,z,r=.27){const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);cyl(g,r*.62,r*.7,.21,gold,0,.48,0);cyl(g,r*.7,r,.44,black,0,.2,0);cyl(g,r*1.05,r*1.05,.04,silver,0,0,0);for(let j=0;j<5;j++)cyl(g,r*(.69+j*.073),r*(.69+j*.073),.016,gold,0,.35-j*.07,0);engines.push(g);return g;}
  engine(group,0,0,.26);for(let i=0;i<6;i++){const a=i*Math.PI/3;engine(group,Math.sin(a)*.48,Math.cos(a)*.48,.20);}
  const boosters=[];
  for(const side of [-1,1]){
    const b=new THREE.Group();b.name=side<0?'Port booster':'Starboard booster';b.position.x=side*1.36;group.add(b);boosters.push(b);
    cyl(b,.41,.41,4.42,white,0,2.74,0);cyl(b,.415,.415,.35,orange,0,1.01,0);cyl(b,.42,.42,.3,black,0,4.22,0);
    const pts=[new THREE.Vector2(.41,0),new THREE.Vector2(.41,.24),new THREE.Vector2(.31,.61),new THREE.Vector2(.14,.96),new THREE.Vector2(0,1.15)];mesh(b,geo('booster-nose',()=>new THREE.LatheGeometry(pts,48)),white,0,4.94,0);
    for(let y=1.35;y<4.9;y+=.8)cyl(b,.416,.416,.035,silver,0,y,0);
    cyl(b,.34,.39,.43,black,0,.54,0);engine(b,0,0,.29);
    for(const y of [1.5,4.6])box(group,.63,.15,.23,silver,side*1.02,y,0);
    const stabilizer=mesh(b,finGeo,orange,side>0?.38:-.38,.64,-.04);if(side<0)stabilizer.rotation.y=Math.PI;
    kit.sign(b,side<0?'L':'R',.2,.2,0,3.35,.416,{color:accent,size:80});
  }
  return {group,engines,boosters,kit,dispose(){decalGeo.dispose();decalMat.dispose();}};
}
