/**
 * Event horizon, accretion disk and relativistic jets.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function createRelativisticJets(group: THREE.Group, data: any): void {
      const jetGeometry = new THREE.ConeGeometry(data.scale * 0.1, data.scale * 3, 16);
      const jetMaterial = new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending
      });

      const jet1 = new THREE.Mesh(jetGeometry, jetMaterial);
      jet1.position.y = data.scale * 1.5;
      group.add(jet1);

      const jet2 = new THREE.Mesh(jetGeometry, jetMaterial);
      jet2.position.y = -data.scale * 1.5;
      jet2.rotation.x = Math.PI;
      group.add(jet2);
}
