/**
 * Detailed satellite, telescope and probe models.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function createISSModel(group: THREE.Group, data: any): void {
      const scale = data.size || 0.5;

      // Main truss
      const trussGeometry = new THREE.BoxGeometry(3 * scale, 0.2 * scale, 0.2 * scale);
      const trussMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          metalness: 0.8,
          roughness: 0.3
      });
      const truss = new THREE.Mesh(trussGeometry, trussMaterial);
      group.add(truss);

      // Solar panels (8 total)
      const panelMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a237e,
          metalness: 0.5,
          roughness: 0.4,
          emissive: 0x0d47a1,
          emissiveIntensity: 0.1
      });

      for (let i = 0; i < 4; i++) {
          const panelGeom = new THREE.BoxGeometry(0.8 * scale, 0.02 * scale, 0.4 * scale);
          const panel = new THREE.Mesh(panelGeom, panelMaterial);
          panel.position.set((i - 1.5) * 0.7 * scale, 0.3 * scale, 0);
          group.add(panel);

          const panel2 = panel.clone();
          panel2.position.y = -0.3 * scale;
          group.add(panel2);
      }

      // Modules
      const moduleMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.3,
          roughness: 0.5
      });

      const moduleGeom = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.6 * scale, 8);
      for (let i = 0; i < 3; i++) {
          const module = new THREE.Mesh(moduleGeom, moduleMaterial);
          module.rotation.z = Math.PI / 2;
          module.position.set((i - 1) * 0.5 * scale, 0, 0.15 * scale);
          group.add(module);
      }

      // Add glow
      const glowGeom = new THREE.SphereGeometry(1.5 * scale, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
          color: 0x4fc3f7,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      group.add(glow);
}

export function createTelescopeModel(group: THREE.Group, data: any): void {
      const scale = data.size || 0.4;

      if (data.shape === 'hexagonal') {
          // JWST style
          // Sunshield
          const shieldGeom = new THREE.BoxGeometry(2 * scale, 0.05 * scale, 1.5 * scale);
          const shieldMat = new THREE.MeshStandardMaterial({
              color: 0xffd700,
              metalness: 0.9,
              roughness: 0.1,
              emissive: 0xffaa00,
              emissiveIntensity: 0.2
          });
          const shield = new THREE.Mesh(shieldGeom, shieldMat);
          group.add(shield);

          // Hexagonal mirror segments
          const mirrorMat = new THREE.MeshStandardMaterial({
              color: 0xffd700,
              metalness: 1,
              roughness: 0,
              emissive: 0xffd700,
              emissiveIntensity: 0.3
          });

          for (let i = 0; i < 6; i++) {
              const hexGeom = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.02 * scale, 6);
              const hex = new THREE.Mesh(hexGeom, mirrorMat);
              hex.rotation.x = Math.PI / 2;
              const angle = (i / 6) * Math.PI * 2;
              hex.position.set(
                  Math.cos(angle) * 0.35 * scale,
                  0.3 * scale,
                  Math.sin(angle) * 0.35 * scale
              );
              group.add(hex);
          }
          // Center hex
          const centerHex = new THREE.Mesh(
              new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.02 * scale, 6),
              mirrorMat
          );
          centerHex.rotation.x = Math.PI / 2;
          centerHex.position.y = 0.3 * scale;
          group.add(centerHex);
      } else {
          // Hubble style
          const bodyGeom = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 1.5 * scale, 16);
          const bodyMat = new THREE.MeshStandardMaterial({
              color: 0xc0c0c0,
              metalness: 0.7,
              roughness: 0.3
          });
          const body = new THREE.Mesh(bodyGeom, bodyMat);
          body.rotation.z = Math.PI / 2;
          group.add(body);

          // Solar panels
          const panelMat = new THREE.MeshStandardMaterial({
              color: 0x1565c0,
              metalness: 0.5,
              roughness: 0.4
          });
          const panelGeom = new THREE.BoxGeometry(1 * scale, 0.02 * scale, 0.4 * scale);

          const panel1 = new THREE.Mesh(panelGeom, panelMat);
          panel1.position.y = 0.5 * scale;
          group.add(panel1);

          const panel2 = new THREE.Mesh(panelGeom, panelMat);
          panel2.position.y = -0.5 * scale;
          group.add(panel2);
      }
}

export function createProbeModel(group: THREE.Group, data: any): void {
      const scale = data.size || 0.3;

      // Main body
      const bodyGeom = new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.5 * scale);
      const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.6,
          roughness: 0.4
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      group.add(body);

      // Large dish antenna
      const dishGeom = new THREE.SphereGeometry(0.5 * scale, 16, 8, 0, Math.PI);
      const dishMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.3,
          roughness: 0.5,
          side: THREE.DoubleSide
      });
      const dish = new THREE.Mesh(dishGeom, dishMat);
      dish.rotation.x = -Math.PI / 2;
      dish.position.z = -0.4 * scale;
      group.add(dish);

      // Boom arm
      const boomGeom = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 1 * scale);
      const boomMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const boom = new THREE.Mesh(boomGeom, boomMat);
      boom.rotation.z = Math.PI / 2;
      boom.position.x = 0.5 * scale;
      group.add(boom);

      // RTG (power source)
      const rtgGeom = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.4 * scale);
      const rtgMat = new THREE.MeshStandardMaterial({
          color: 0x333333,
          emissive: 0xff4400,
          emissiveIntensity: 0.3
      });
      const rtg = new THREE.Mesh(rtgGeom, rtgMat);
      rtg.rotation.z = Math.PI / 2;
      rtg.position.x = 1 * scale;
      group.add(rtg);

      // Add subtle glow for RTG
      const glowGeom = new THREE.SphereGeometry(0.15 * scale, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.x = 1 * scale;
      group.add(glow);
}

export function createSmallSatModel(group: THREE.Group, data: any): void {
      const scale = data.size || 0.1;

      // CubeSat body
      const bodyGeom = new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.3 * scale);
      const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x444444,
          metalness: 0.5,
          roughness: 0.5
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      group.add(body);

      // Solar panel wings
      const panelMat = new THREE.MeshStandardMaterial({
          color: 0x1a237e,
          metalness: 0.4,
          roughness: 0.4,
          emissive: 0x0d47a1,
          emissiveIntensity: 0.1
      });
      const panelGeom = new THREE.BoxGeometry(0.5 * scale, 0.01 * scale, 0.2 * scale);

      const panel1 = new THREE.Mesh(panelGeom, panelMat);
      panel1.position.x = 0.4 * scale;
      group.add(panel1);

      const panel2 = new THREE.Mesh(panelGeom, panelMat);
      panel2.position.x = -0.4 * scale;
      group.add(panel2);

      // Antenna
      const antennaGeom = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 0.3 * scale);
      const antennaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const antenna = new THREE.Mesh(antennaGeom, antennaMat);
      antenna.position.y = 0.3 * scale;
      group.add(antenna);
}

export function createGenericSatModel(group: THREE.Group, data: any): void {
      const scale = data.size || 0.2;
      const bodyGeom = new THREE.SphereGeometry(0.2 * scale, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.5,
          roughness: 0.5
      });
      group.add(new THREE.Mesh(bodyGeom, bodyMat));
}

export function createSatelliteModel(data: any): THREE.Group {
      const group = new THREE.Group();

      switch (data.type) {
          case 'station':
              // ISS-like structure
              createISSModel(group, data);
              break;
          case 'telescope':
              // Hubble/JWST style
              createTelescopeModel(group, data);
              break;
          case 'probe':
              // Voyager style
              createProbeModel(group, data);
              break;
          case 'constellation':
              // Small satellite
              createSmallSatModel(group, data);
              break;
          default:
              createGenericSatModel(group, data);
      }

      return group;
}
