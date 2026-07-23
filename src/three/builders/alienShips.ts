/**
 * UFO craft models and their running lights.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function addUFOLights(group: THREE.Group, scale: number, color: THREE.Color): void {
      const lightCount = 8;
      for (let i = 0; i < lightCount; i++) {
          const lightGeom = new THREE.SphereGeometry(0.05 * scale, 8, 8);
          const lightMat = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.9
          });
          const light = new THREE.Mesh(lightGeom, lightMat);

          const angle = (i / lightCount) * Math.PI * 2;
          light.position.set(
              Math.cos(angle) * 0.7 * scale,
              -0.15 * scale,
              Math.sin(angle) * 0.7 * scale
          );
          light.userData.lightIndex = i;
          group.add(light);
      }
}

export function createScoutShip(group: THREE.Group, data: any, scale: number): void {
      // Classic UFO saucer shape
      const bodyGeom = new THREE.SphereGeometry(1 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
          color: data.color || 0x4a4a4a,
          metalness: 0.9,
          roughness: 0.1
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      body.scale.y = 0.3;
      group.add(body);

      // Bottom dome
      const bottomGeom = new THREE.SphereGeometry(1 * scale, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bottom = new THREE.Mesh(bottomGeom, bodyMat);
      bottom.scale.y = 0.2;
      group.add(bottom);

      // Cockpit dome
      const cockpitGeom = new THREE.SphereGeometry(0.4 * scale, 16, 16);
      const cockpitMat = new THREE.MeshStandardMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.6,
          emissive: 0x00ff88,
          emissiveIntensity: 0.5
      });
      const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
      cockpit.position.y = 0.2 * scale;
      cockpit.scale.y = 0.5;
      group.add(cockpit);

      // Glowing ring around edge
      const ringGeom = new THREE.TorusGeometry(0.9 * scale, 0.05 * scale, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
          color: data.glowColor || 0x00ffff,
          transparent: true,
          opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Bottom lights
      addUFOLights(group, scale, data.glowColor || 0x00ffff);

      // Engine glow
      const engineGlow = new THREE.PointLight(data.glowColor || 0x00ffff, 1, 5 * scale);
      engineGlow.position.y = -0.3 * scale;
      group.add(engineGlow);
      group.userData.engineLight = engineGlow;
}

export function createMothership(group: THREE.Group, data: any, scale: number): void {
      // Large triangular/disc mothership
      const hullGeom = new THREE.CylinderGeometry(2 * scale, 3 * scale, 0.5 * scale, 6);
      const hullMat = new THREE.MeshStandardMaterial({
          color: data.color || 0x2a2a3a,
          metalness: 0.95,
          roughness: 0.1
      });
      const hull = new THREE.Mesh(hullGeom, hullMat);
      group.add(hull);

      // Upper structure
      const upperGeom = new THREE.CylinderGeometry(1 * scale, 2 * scale, 0.8 * scale, 6);
      const upper = new THREE.Mesh(upperGeom, hullMat);
      upper.position.y = 0.5 * scale;
      group.add(upper);

      // Command tower
      const towerGeom = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 0.6 * scale, 8);
      const tower = new THREE.Mesh(towerGeom, hullMat);
      tower.position.y = 1.1 * scale;
      group.add(tower);

      // Bridge windows
      const bridgeMat = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.8
      });
      for (let i = 0; i < 8; i++) {
          const windowGeom = new THREE.BoxGeometry(0.15 * scale, 0.1 * scale, 0.02 * scale);
          const win = new THREE.Mesh(windowGeom, bridgeMat);
          const angle = (i / 8) * Math.PI * 2;
          win.position.set(
              Math.cos(angle) * 0.35 * scale,
              1.1 * scale,
              Math.sin(angle) * 0.35 * scale
          );
          win.lookAt(0, 1.1 * scale, 0);
          group.add(win);
      }

      // Engine pods
      const engineMat = new THREE.MeshBasicMaterial({
          color: data.glowColor || 0xff4400,
          transparent: true,
          opacity: 0.9
      });
      for (let i = 0; i < 6; i++) {
          const engineGeom = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 0.3 * scale, 8);
          const engine = new THREE.Mesh(engineGeom, engineMat);
          const angle = (i / 6) * Math.PI * 2;
          engine.position.set(
              Math.cos(angle) * 2.5 * scale,
              -0.3 * scale,
              Math.sin(angle) * 2.5 * scale
          );
          group.add(engine);

          // Engine lights
          const light = new THREE.PointLight(data.glowColor || 0xff4400, 0.5, 3 * scale);
          light.position.copy(engine.position);
          light.position.y -= 0.2 * scale;
          group.add(light);
      }

      // Central beam capability
      const beamGeom = new THREE.ConeGeometry(0.5 * scale, 3 * scale, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.y = -1.5 * scale;
      beam.visible = false; // Can be activated
      group.add(beam);
      group.userData.tractorBeam = beam;
}

export function createCruiserShip(group: THREE.Group, data: any, scale: number): void {
      // Elongated warship style
      const hullGeom = new THREE.CylinderGeometry(0.5 * scale, 0.8 * scale, 4 * scale, 8);
      const hullMat = new THREE.MeshStandardMaterial({
          color: data.color || 0x3a3a4a,
          metalness: 0.85,
          roughness: 0.2
      });
      const hull = new THREE.Mesh(hullGeom, hullMat);
      hull.rotation.x = Math.PI / 2;
      group.add(hull);

      // Forward section
      const bowGeom = new THREE.ConeGeometry(0.5 * scale, 1.5 * scale, 8);
      const bow = new THREE.Mesh(bowGeom, hullMat);
      bow.rotation.x = -Math.PI / 2;
      bow.position.z = -2.5 * scale;
      group.add(bow);

      // Engine section
      const engineGeom = new THREE.CylinderGeometry(0.8 * scale, 0.6 * scale, 1 * scale, 8);
      const engine = new THREE.Mesh(engineGeom, hullMat);
      engine.rotation.x = Math.PI / 2;
      engine.position.z = 2.5 * scale;
      group.add(engine);

      // Engine glow
      const glowGeom = new THREE.CircleGeometry(0.7 * scale, 16);
      const glowMat = new THREE.MeshBasicMaterial({
          color: data.glowColor || 0x4444ff,
          transparent: true,
          opacity: 0.9
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.z = 3 * scale;
      group.add(glow);

      // Wing-like structures
      const wingGeom = new THREE.BoxGeometry(3 * scale, 0.1 * scale, 1 * scale);
      const wing = new THREE.Mesh(wingGeom, hullMat);
      wing.position.z = 1 * scale;
      group.add(wing);

      // Weapon arrays (glowing)
      const weaponMat = new THREE.MeshBasicMaterial({
          color: 0xff0044,
      });
      for (let i = 0; i < 4; i++) {
          const weaponGeom = new THREE.SphereGeometry(0.1 * scale, 8, 8);
          const weapon = new THREE.Mesh(weaponGeom, weaponMat);
          weapon.position.set(
              (i < 2 ? -1 : 1) * 1.2 * scale,
              0,
              (i % 2 === 0 ? -1 : 0.5) * scale
          );
          group.add(weapon);
      }

      // Running lights
      const lightColor = data.glowColor || 0x4444ff;
      const light1 = new THREE.PointLight(lightColor, 0.5, 3 * scale);
      light1.position.z = 3 * scale;
      group.add(light1);
}

export function createAlienProbe(group: THREE.Group, data: any, scale: number): void {
      // Small spherical probe
      const coreGeom = new THREE.IcosahedronGeometry(0.5 * scale, 1);
      const coreMat = new THREE.MeshStandardMaterial({
          color: data.color || 0x222233,
          metalness: 0.9,
          roughness: 0.1
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      group.add(core);

      // Glowing energy core
      const energyGeom = new THREE.SphereGeometry(0.3 * scale, 16, 16);
      const energyMat = new THREE.MeshBasicMaterial({
          color: data.glowColor || 0x00ffaa,
          transparent: true,
          opacity: 0.7
      });
      const energy = new THREE.Mesh(energyGeom, energyMat);
      group.add(energy);
      group.userData.energyCore = energy;

      // Sensor arrays
      const sensorMat = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.8
      });
      for (let i = 0; i < 6; i++) {
          const sensorGeom = new THREE.ConeGeometry(0.08 * scale, 0.3 * scale, 6);
          const sensor = new THREE.Mesh(sensorGeom, sensorMat);

          // Position on icosahedron vertices
          const phi = Math.acos(-1 + (2 * i + 1) / 6);
          const theta = Math.sqrt(6 * Math.PI) * phi;
          sensor.position.setFromSpherical(new THREE.Spherical(0.6 * scale, phi, theta));
          sensor.lookAt(0, 0, 0);
          group.add(sensor);
      }

      // Orbiting particle ring
      const ringGeom = new THREE.TorusGeometry(0.8 * scale, 0.02 * scale, 4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
          color: data.glowColor || 0x00ffaa,
          transparent: true,
          opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      group.add(ring);
      group.userData.orbitRing = ring;
}

export function createAlienShipModel(data: any): THREE.Group {
      const group = new THREE.Group();
      const scale = data.size || 1;

      switch (data.type) {
          case 'scout':
              createScoutShip(group, data, scale);
              break;
          case 'mothership':
              createMothership(group, data, scale);
              break;
          case 'cruiser':
              createCruiserShip(group, data, scale);
              break;
          case 'probe':
              createAlienProbe(group, data, scale);
              break;
          default:
              createScoutShip(group, data, scale);
      }

      return group;
}
