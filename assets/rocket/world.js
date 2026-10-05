import * as THREE from 'three';
import {palette as p} from './rocket.js';

export function createLaunchComplex(kit){
  const {box,cyl,sphere,beam,mat,sign}=kit,group=new THREE.Group();group.name='Launch complex';
  const dark=mat(p.dark,.25,.78),steel=mat(p.steel,.6,.55),orange=mat(p.orange,.12,.6),concrete=mat(p.concrete),white=mat(p.ivory),sage=mat(p.sage);
  // A cutaway diorama base, with the full-scale industrial world condensed onto it.
  box(group,12.8,.5,10.6,dark,0,-.28,0);
  box(group,12.65,.12,10.45,concrete,0,.015,0);
  box(group,5.8,.025,10.3,dark,.2,.087,0);
  for(let z=-4.6;z<5;z+=1.15){box(group,.07,.01,.48,white,2.8,.106,z);box(group,.07,.01,.48,white,-2.3,.106,z);}
  // Pad with a sunken flame trench, marked perimeter, and four support clamps.
  box(group,3.9,.58,3.7,dark,0,.35,.35);box(group,3.7,.09,3.5,steel,0,.675,.35);
  cyl(group,1.35,1.35,.07,dark,0,.765,0);cyl(group,1.12,1.12,.06,orange,0,.81,0);
  cyl(group,.86,.86,.065,dark,0,.849,0);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;box(group,.25,.26,.25,steel,Math.sin(a)*1.21,.87,Math.cos(a)*1.21);}
  for(let i=0;i<11;i++){const s=box(group,.15,.012,.32,p.gold,-1.6+i*.31,.73,1.96);s.rotation.y=-.45;}
  sign(group,'PAD A',1.6,.42,0,.4,2.213,{color:p.ivory,size:80});
  box(group,1.55,.16,3.3,dark,0,.18,3.35);box(group,1.16,.035,3.3,p.dark,0,.29,3.35);
  for(let i=0;i<6;i++)box(group,.1,.09,1.3,steel,-2.42+i*.13,.15+i*.07,1.2);
  // Open steel truss tower: diagonals stay visible through its silhouette.
  const tower=new THREE.Group();tower.position.set(-2.45,.15,-1.65);group.add(tower);
  box(tower,1.8,.3,1.8,dark,0,.15,0);
  for(const x of [-.56,.56])for(const z of [-.56,.56])box(tower,.13,9.6,.13,orange,x,4.9,z);
  for(let i=0;i<8;i++){
    const y=.35+i*1.16;
    box(tower,1.25,.085,1.25,steel,0,y,0);
    for(const z of [-.56,.56]){beam(tower,[-.56,y,z],[.56,y+1.16,z],.055,orange);beam(tower,[.56,y,z],[-.56,y+1.16,z],.055,orange);}
    for(const x of [-.56,.56]){beam(tower,[x,y,-.56],[x,y+1.16,.56],.055,orange);}
  }
  box(tower,1.6,.2,1.65,white,0,9.7,0);box(tower,1.4,.5,1.25,dark,0,9.97,0);box(tower,.91,.22,.028,p.steel,0,9.98,.64);
  cyl(tower,.035,.035,1.7,steel,0,11,0);
  const beaconMat=new THREE.MeshStandardMaterial({color:'#ff7946',emissive:'#ef4720',emissiveIntensity:.8});const beacon=sphere(tower,.075,beaconMat,0,11.92,0);
  // A ladder, individual rungs, handrails, and two hinged umbilical walkways.
  for(let i=0;i<35;i++)box(tower,.32,.022,.04,p.gold,-.15,.45+i*.25,.66);
  for(const x of [-.33,.03])box(tower,.035,9,.035,steel,x,4.75,.67);
  const arms=[];
  for(const y of [4.4,7.8]){
    const arm=new THREE.Group();arm.position.set(.58,y,.18);tower.add(arm);arms.push(arm);
    box(arm,1.8,.13,.47,steel,.85,0,0);for(const z of [-.23,.23]){box(arm,1.8,.035,.035,white,.85,.48,z);for(const x of [.1,.65,1.2,1.7])box(arm,.035,.5,.035,orange,x,.25,z);}
    box(arm,.32,.5,.6,orange,1.77,.06,0);beam(arm,[0,-.35,0],[1.65,-.07,0],.07,steel);
  }
  // Ground services, tanks, pipework, and a tiny mission control building.
  for(const z of [-2.7,-.4,1.9]){
    cyl(group,.7,.7,1.7,white,4.65,.99,z);sphere(group,.7,white,4.65,1.82,z);cyl(group,.73,.73,.1,steel,4.65,.24,z);
    cyl(group,.71,.71,.08,sage,4.65,1.35,z);cyl(group,.065,.065,.5,steel,4.65,2.65,z);
    const pipe=cyl(group,.055,.055,1.6,steel,3.53,.4,z);pipe.rotation.z=Math.PI/2;
    for(const x of [3.1,3.8])box(group,.12,.32,.18,dark,x,.24,z);
  }
  box(group,2.3,.9,2.7,white,-4.6,.58,2.6);box(group,2.46,.16,2.86,steel,-4.6,1.09,2.6);
  box(group,1.83,.24,.04,dark,-4.6,.74,3.975);for(let i=0;i<4;i++)box(group,.035,.25,.055,white,-5.29+i*.45,.74,3.999);
  box(group,.03,.33,1.65,dark,-3.435,.72,2.53);box(group,.36,.67,.035,dark,-5.32,.5,3.981);
  sign(group,'MISSION CONTROL',1.45,.18,-4.47,.98,3.99,{size:48});
  for(let i=0;i<2;i++){box(group,.47,.23,.65,p.concrete,-5.05+i*.85,1.28,2.35);for(let j=0;j<4;j++)box(group,.38,.025,.035,dark,-5.05+i*.85,1.4,2.16+j*.12);}
  const dish=new THREE.Group();dish.position.set(-4.55,1.2,3.28);group.add(dish);cyl(dish,.04,.06,.6,steel,0,.3,0);const bowl=new THREE.Mesh(new THREE.SphereGeometry(.35,24,12,0,Math.PI*2,0,Math.PI*.45),white);bowl.rotation.z=.55;bowl.position.y=.62;dish.add(bowl);beam(dish,[0,.62,0],[.15,1.05,0],.025,steel);
  // A fuel line from the storage farm to the pad.
  beam(group,[3,.2,-3.5],[0,.2,-3.5],.12,steel);beam(group,[0,.2,-3.5],[0,.2,-1.4],.12,steel);
  for(let i=0;i<7;i++){box(group,.14,.05,.8,p.gold,2.3+i*.42,.13,-4.33);}
  // A service vehicle and its rubber wheels.
  const truck=new THREE.Group();truck.position.set(-3.8,.19,-3.8);group.add(truck);
  box(truck,1.6,.25,.72,dark,0,.31,0);box(truck,.54,.56,.73,orange,-.5,.65,0);box(truck,.04,.26,.52,p.dark,-.785,.72,0);box(truck,.8,.45,.63,white,.3,.61,0);
  for(const x of [-.48,.52])for(const z of [-.38,.38]){const w=cyl(truck,.19,.19,.13,dark,x,.2,z,20);w.rotation.x=Math.PI/2;const hub=cyl(truck,.095,.095,.14,steel,x,.2,z,16);hub.rotation.x=Math.PI/2;}
  // Low fencing and practical apron lights.
  const lamps=[];
  const lampMat=new THREE.MeshStandardMaterial({color:'#fff3bb',emissive:'#ffd077',emissiveIntensity:.3});
  for(const x of [-5.9,5.9])for(const z of [-4.4,4.4]){cyl(group,.04,.065,2.4,steel,x,1.3,z);box(group,.38,.12,.24,dark,x,2.53,z);const lamp=box(group,.29,.025,.18,lampMat,x,2.46,z);lamps.push(lamp);}
  for(let x=-5.8;x<6;x+=.6){box(group,.027,.54,.027,steel,x,.37,-5.08);}
  for(const y of [.2,.63])box(group,11.8,.028,.028,steel,0,y,-5.08);
  // Human scale is conveyed through a few small shrubs and utility crates.
  for(const [x,z] of [[-5.7,-1.7],[-5.7,-2.3],[-4.6,-.1],[5.7,3.4],[5.6,3.9]]){sphere(group,.24,sage,x,.27,z);sphere(group,.16,p.sage,x+.15,.19,z+.13);}
  for(let i=0;i<3;i++){box(group,.38,.38,.4,p.copper,-4.1+i*.46,.29,-1.8);box(group,.03,.39,.41,p.gold,-4.1+i*.46,.29,-1.8);}
  return {group,arms,beacon,beaconMat,lampMat,dish,dispose(){beaconMat.dispose();lampMat.dispose();bowl.geometry.dispose();}};
}
