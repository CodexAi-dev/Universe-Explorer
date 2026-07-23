import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

/**
 * Earth's surface shader.
 *
 * Blends the NASA day map into the night-lights map across the real
 * terminator — the line where the Sun's rays go tangent to the surface. The
 * blend is deliberately narrow but not hard-edged, matching the way
 * atmospheric scattering softens real twilight over roughly 18° of longitude.
 *
 * Oceans get a specular highlight and land does not, keyed off how blue the
 * day map is at that texel — no separate specular map needed.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDirection;
  uniform vec3 cameraPositionW;
  uniform float nightLightStrength;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 normal = normalize(vNormalW);
    float sunAngle = dot(normal, normalize(sunDirection));

    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 nightColor = texture2D(nightMap, vUv).rgb;

    // Twilight band: full day above ~+0.10, full night below ~-0.12.
    float daylight = smoothstep(-0.12, 0.10, sunAngle);

    // Oceans are blue-dominant in the day map; use that as a water mask.
    float water = smoothstep(0.03, 0.16, dayColor.b - dayColor.r);

    // Specular sun-glint, only on water and only on the lit side.
    vec3 viewDir = normalize(cameraPositionW - vPositionW);
    vec3 halfway = normalize(normalize(sunDirection) + viewDir);
    float specular = pow(max(dot(normal, halfway), 0.0), 90.0) * water * daylight;

    // Lambert term, lifted slightly so the lit limb doesn't crush to black.
    float lambert = max(sunAngle, 0.0);
    vec3 lit = dayColor * (0.06 + 0.94 * lambert) + vec3(0.9, 0.95, 1.0) * specular * 0.7;

    // City lights only where the day map is dark enough to be land at night.
    vec3 lights = nightColor * nightLightStrength * (1.0 - daylight);

    gl_FragColor = vec4(mix(lights, lit, daylight), 1.0);
    #include <colorspace_fragment>
  }
`

interface EarthSurfaceProps {
  sunDirection: THREE.Vector3
}

export function EarthSurfaceMaterial({ sunDirection }: EarthSurfaceProps) {
  const [dayMap, nightMap] = useTexture([
    './textures/2k_earth_daymap.jpg',
    './textures/2k_earth_nightmap.jpg',
  ])

  const material = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      cameraPositionW: { value: new THREE.Vector3() },
      nightLightStrength: { value: 1.35 },
    }),
    [dayMap, nightMap],
  )

  useFrame((state) => {
    if (!material.current) return
    material.current.uniforms.sunDirection.value.copy(sunDirection)
    material.current.uniforms.cameraPositionW.value.copy(state.camera.position)
  })

  return (
    <shaderMaterial
      ref={material}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
    />
  )
}

/**
 * Atmospheric limb glow.
 *
 * Rendered on a slightly larger back-face sphere: a Fresnel term makes the
 * shell brightest where the line of sight grazes the surface, which is why a
 * real planet shows a bright rim rather than an even haze.
 */
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragment = /* glsl */ `
  uniform vec3 glowColor;
  uniform vec3 sunDirection;
  uniform vec3 cameraPositionW;
  uniform float intensity;

  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPositionW - vPositionW);

    // Back faces: flip so the term still peaks at the limb.
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.6);

    // Only the sunlit limb scatters light toward the viewer.
    float sunlit = smoothstep(-0.45, 0.35, dot(normal, normalize(sunDirection)));

    float alpha = fresnel * sunlit * intensity;
    gl_FragColor = vec4(glowColor, clamp(alpha, 0.0, 1.0));
  }
`

interface AtmosphereProps {
  radius: number
  color: THREE.ColorRepresentation
  sunDirection: THREE.Vector3
  intensity?: number
  segments?: number
}

export function Atmosphere({
  radius,
  color,
  sunDirection,
  intensity = 1.0,
  segments = 48,
}: AtmosphereProps) {
  const material = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      cameraPositionW: { value: new THREE.Vector3() },
      intensity: { value: intensity },
    }),
    [color, intensity],
  )

  useFrame((state) => {
    if (!material.current) return
    material.current.uniforms.sunDirection.value.copy(sunDirection)
    material.current.uniforms.cameraPositionW.value.copy(state.camera.position)
  })

  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
