/**
 * Comet models with dust/ion tails, debris field and meteors.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function createCometModel(data: any): THREE.Group {
      const group = new THREE.Group();
      const scale = data.size || 1;

      // Nucleus (rocky/icy core)
      const nucleusGeom = new THREE.SphereGeometry(0.5 * scale, 16, 16);
      const nucleusMat = new THREE.MeshStandardMaterial({
          color: 0x665544,
          roughness: 0.9,
          metalness: 0.1
      });
      const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);

      // Make nucleus irregular
      const posAttr = nucleusGeom.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
          const noise = 0.8 + Math.random() * 0.4;
          posAttr.setXYZ(
              i,
              posAttr.getX(i) * noise,
              posAttr.getY(i) * noise,
              posAttr.getZ(i) * noise
          );
      }
      nucleusGeom.computeVertexNormals();
      group.add(nucleus);

      // Coma (glowing gas cloud around nucleus)
      const comaGeom = new THREE.SphereGeometry(1.5 * scale, 16, 16);
      const comaMat = new THREE.MeshBasicMaterial({
          color: 0x88ccff,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending
      });
      const coma = new THREE.Mesh(comaGeom, comaMat);
      group.add(coma);

      // Dust tail (curved, yellowish)
      const dustTailGeom = new THREE.ConeGeometry(0.8 * scale, 8 * scale, 8, 1, true);
      const dustTailMat = new THREE.MeshBasicMaterial({
          color: 0xffdd88,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
      });
      const dustTail = new THREE.Mesh(dustTailGeom, dustTailMat);
      dustTail.rotation.x = Math.PI / 2;
      dustTail.position.z = 4 * scale;
      group.add(dustTail);
      group.userData.dustTail = dustTail;

      // Ion tail (straight, blue)
      const ionTailGeom = new THREE.ConeGeometry(0.3 * scale, 12 * scale, 8, 1, true);
      const ionTailMat = new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
      });
      const ionTail = new THREE.Mesh(ionTailGeom, ionTailMat);
      ionTail.rotation.x = Math.PI / 2;
      ionTail.position.z = 6 * scale;
      group.add(ionTail);
      group.userData.ionTail = ionTail;

      // Particle trail
      const particleCount = 200;
      const particleGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 2 * scale;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * scale;
          positions[i * 3 + 2] = Math.random() * 15 * scale;
          sizes[i] = Math.random() * 0.1 * scale;
      }

      particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
          color: 0xaaddff,
          size: 0.1 * scale,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(particleGeom, particleMat);
      group.add(particles);

      return group;
}

export function createMeteor(): THREE.Group {
      const group = new THREE.Group();

      // Meteor head
      const headGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const headMat = new THREE.MeshBasicMaterial({
          color: 0xffaa44,
          transparent: true,
          opacity: 0.9
      });
      const head = new THREE.Mesh(headGeom, headMat);
      group.add(head);

      // Glowing trail
      const trailGeom = new THREE.ConeGeometry(0.15, 3, 8, 1, true);
      const trailMat = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
      });
      const trail = new THREE.Mesh(trailGeom, trailMat);
      trail.rotation.x = -Math.PI / 2;
      trail.position.z = 1.5;
      group.add(trail);

      // Point light
      const light = new THREE.PointLight(0xff6600, 0.5, 5);
      group.add(light);

      group.userData = {
          velocity: new THREE.Vector3(),
          lifetime: 0,
          maxLifetime: 3
      };

      return group;
}
