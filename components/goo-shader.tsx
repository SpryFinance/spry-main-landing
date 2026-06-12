"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function GooShader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(rect.width, rect.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    sceneRef.current = scene
    rendererRef.current = renderer

    // Shader uniforms with brighter colors
    const uniforms = {
      iTime: { value: 0 },
      distortion: { value: 0.2 },
      jellyFreq: { value: 2.5 },
      fineNoiseAmp: { value: 0.12 },
      broadNoiseAmp: { value: 0.2 },
      noiseSpeed: { value: 0.5 },
      gooColor: { value: new THREE.Vector3(0.8, 0.4, 0.9) }, // Bright purple/pink
      iridescenceStrength: { value: 3.0 },
      iridescenceOffset: { value: 0.8 },
      specularShininess: { value: 64.0 },
      specularColor: { value: new THREE.Vector3(1.0, 0.8, 0.9) }, // Bright specular
    }

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        uniform float iTime;
        uniform float distortion;
        uniform float jellyFreq;
        uniform float fineNoiseAmp;
        uniform float broadNoiseAmp;
        uniform float noiseSpeed;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 F = vec2(1.0/3.0, 1.0/6.0);
          vec3 i = floor(v + dot(v, F.xxx));
          vec3 x0 = v - i + dot(i, F.yyy);

          vec3 g = vec3(0.0);
          if (x0.x < x0.y) {
            if (x0.y < x0.z) g = vec3(0,1,2); else if (x0.x < x0.z) g = vec3(0,2,1); else g = vec3(2,0,1);
          } else {
            if (x0.z < x0.y) g = vec3(2,1,0); else if (x0.z < x0.x) g = vec3(1,2,0); else g = vec3(1,0,2);
          }

          vec3 x1 = x0 - vec3(g.y, g.z, g.x) + F.yyy;
          vec3 x2 = x0 - vec3(g.z, g.x, g.y) + 2.0 * F.yyy;
          vec3 x3 = x0 - vec3(1.0, 1.0, 1.0) + 3.0 * F.yyy;

          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, g.x, g.y, g.z))
            + i.y + vec4(0.0, g.y, g.z, g.x))
            + i.x + vec4(0.0, g.z, g.x, g.y));

          vec4 pi = mod(floor(p / 4.0), 2.0) * 2.0 - 1.0;
          vec4 r0 = mod(p, 4.0);
          vec4 r1 = r0 - 2.0;

          vec4 p0 = vec4(r0.x, r1.x, r0.y, r1.y);
          vec4 p1 = vec4(r0.z, r1.z, r0.w, r1.w);

          vec4 h = taylorInvSqrt(vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)));
          vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          m = m * m;

          vec4 gx = p0 * pi.x + p1 * pi.y;
          vec4 gy = p0 * pi.z + p1 * pi.w;
          vec4 gz = r0 - 1.5;

          vec3 g0 = vec3(gx.x, gy.x, gz.x);
          vec3 g1 = vec3(gx.y, gy.y, gz.y);
          vec3 g2 = vec3(gx.z, gy.z, gz.z);
          vec3 g3 = vec3(gx.w, gy.w, gz.w);

          return 130.0 * dot(m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
        }

        void main() {
          vUv = uv;
          vNormal = normal;

          vec3 pos = position;

          float fineNoiseFreq = jellyFreq * 2.0;
          float broadNoiseFreq = jellyFreq * 0.5;

          float noiseValue =
            snoise(pos * fineNoiseFreq + iTime * noiseSpeed) * fineNoiseAmp +
            snoise(pos * broadNoiseFreq * 1.5 + iTime * noiseSpeed * 0.5 + vec3(10.0, 5.0, 2.0)) * broadNoiseAmp * 0.7 +
            snoise(pos * fineNoiseFreq * 0.75 + iTime * noiseSpeed * 1.2 + vec3(5.0, 15.0, 8.0)) * fineNoiseAmp * 0.5;

          float offset = distortion * noiseValue;
          pos += normal * offset;

          vViewPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec3 gooColor;
        uniform float iridescenceStrength;
        uniform float iridescenceOffset;
        uniform float specularShininess;
        uniform vec3 specularColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 F = vec2(1.0/3.0, 1.0/6.0);
          vec3 i = floor(v + dot(v, F.xxx));
          vec3 x0 = v - i + dot(i, F.yyy);

          vec3 g = vec3(0.0);
          if (x0.x < x0.y) {
            if (x0.y < x0.z) g = vec3(0,1,2); else if (x0.x < x0.z) g = vec3(0,2,1); else g = vec3(2,0,1);
          } else {
            if (x0.z < x0.y) g = vec3(2,1,0); else if (x0.z < x0.x) g = vec3(1,2,0); else g = vec3(1,0,2);
          }

          vec3 x1 = x0 - vec3(g.y, g.z, g.x) + F.yyy;
          vec3 x2 = x0 - vec3(g.z, g.x, g.y) + 2.0 * F.yyy;
          vec3 x3 = x0 - vec3(1.0, 1.0, 1.0) + 3.0 * F.yyy;

          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, g.x, g.y, g.z))
            + i.y + vec4(0.0, g.y, g.z, g.x))
            + i.x + vec4(0.0, g.z, g.x, g.y));

          vec4 pi = mod(floor(p / 4.0), 2.0) * 2.0 - 1.0;
          vec4 r0 = mod(p, 4.0);
          vec4 r1 = r0 - 2.0;

          vec4 p0 = vec4(r0.x, r1.x, r0.y, r1.y);
          vec4 p1 = vec4(r0.z, r1.z, r0.w, r1.w);

          vec4 h = taylorInvSqrt(vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)));
          vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          m = m * m;

          vec4 gx = p0 * pi.x + p1 * pi.y;
          vec4 gy = p0 * pi.z + p1 * pi.w;
          vec4 gz = r0 - 1.5;

          vec3 g0 = vec3(gx.x, gy.x, gz.x);
          vec3 g1 = vec3(gx.y, gy.y, gz.y);
          vec3 g2 = vec3(gx.z, gy.z, gz.z);
          vec3 g3 = vec3(gx.w, gy.w, gz.w);

          return 130.0 * dot(m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
        }

        void main() {
          vec3 normal = normalize(vNormal);

          float detailNoise = snoise(vViewPosition * 5.0 + iTime * 0.7 + vec3(1.0, 2.0, 3.0));
          float patternGoo = snoise(vViewPosition * 2.0 + iTime * 0.3 + vec3(4.0, 5.0, 6.0));
          float veryFineNoise = snoise(vViewPosition * 15.0 + iTime * 1.5 + vec3(7.0, 8.0, 9.0));

          float finalPattern = (detailNoise * 0.4) + (patternGoo * 0.4) + (veryFineNoise * 0.2);
          finalPattern = smoothstep(-0.5, 1.0, finalPattern);

          vec3 baseColor = mix(vec3(0.1), gooColor, finalPattern);

          vec3 lightDirection = normalize(vec3(0.5, 1.0, 0.8));

          vec3 normalOffset = vec3(
            snoise(vViewPosition * 10.0 + iTime * 1.0 + vec3(10.0)),
            snoise(vViewPosition * 10.0 + iTime * 1.0 + vec3(20.0)),
            snoise(vViewPosition * 10.0 + iTime * 1.0 + vec3(30.0))
          ) * 0.05 +
          vec3(
            snoise(vViewPosition * 25.0 + iTime * 2.0 + vec3(40.0)),
            snoise(vViewPosition * 25.0 + iTime * 2.0 + vec3(50.0)),
            snoise(vViewPosition * 25.0 + iTime * 2.0 + vec3(60.0))
          ) * 0.02;
          vec3 perturbedNormal = normalize(normal + normalOffset);

          float diffuse = max(dot(perturbedNormal, lightDirection), 0.0);

          vec3 viewDirection = normalize(-vViewPosition);
          vec3 reflectDirection = reflect(-lightDirection, perturbedNormal);
          float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), specularShininess);

          float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), iridescenceStrength);

          // Brighter iridescent colors
          vec3 iridColor1 = vec3(1.0, 0.4, 0.8); // Bright pink
          vec3 iridColor2 = vec3(0.4, 0.8, 1.0); // Bright cyan
          vec3 iridColor3 = vec3(0.8, 1.0, 0.4); // Bright yellow-green

          vec3 iridescence = mix(iridColor1, iridColor2, fract(fresnel * iridescenceOffset));
          iridescence = mix(iridescence, iridColor3, fract(fresnel * iridescenceOffset + 0.33));

          vec3 finalSpecularColor = mix(specularColor, iridescence, fresnel * 2.0);

          vec3 ambientLight = baseColor * 0.1;
          vec3 finalColor = ambientLight + (baseColor * diffuse * 0.6) + (finalSpecularColor * spec * 3.0);

          float glow = pow(1.0 - dot(viewDirection, normal), 2.0);
          finalColor += gooColor * glow * 0.4;

          // Increase overall brightness
          finalColor *= 1.5;
          finalColor = pow(finalColor, vec3(1.0 / 2.2));

          gl_FragColor = vec4(finalColor, 0.8);
        }
      `,
    })

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(1.5, 64, 64)
    const sphere = new THREE.Mesh(geometry, material)
    sphere.rotation.x = 0.5
    sphere.rotation.y = 0.3
    scene.add(sphere)

    // Animation loop
    const animate = (time: number) => {
      uniforms.iTime.value = time * 0.001

      sphere.rotation.x += 0.005
      sphere.rotation.y += 0.003

      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    // Handle resize
    const handleResize = () => {
      if (!container) return
      const newRect = container.getBoundingClientRect()
      camera.aspect = newRect.width / newRect.height
      camera.updateProjectionMatrix()
      renderer.setSize(newRect.width, newRect.height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />
}
