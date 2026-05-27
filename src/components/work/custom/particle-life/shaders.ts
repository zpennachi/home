export const simPositionFrag = `
varying vec2 vUv;
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform float uTime;
uniform float uDelta;
uniform float uSpeed;
uniform float uWorldSize;

void main() {
  vec4 pos = texture2D(uPosition, vUv);
  vec4 vel = texture2D(uVelocity, vUv);

  // Update position based on velocity
  pos.xyz += vel.xyz * uDelta * uSpeed;

  // Boundary wrapping 3D
  float halfSize = uWorldSize / 2.0;

  if (pos.x > halfSize) pos.x -= uWorldSize;
  if (pos.x < -halfSize) pos.x += uWorldSize;
  if (pos.y > halfSize) pos.y -= uWorldSize;
  if (pos.y < -halfSize) pos.y += uWorldSize;
  if (pos.z > halfSize) pos.z -= uWorldSize;
  if (pos.z < -halfSize) pos.z += uWorldSize;

  // Age (Alpha channel)
  pos.w += uDelta; 

  gl_FragColor = pos;
}
`;

export const simVelocityFrag = `
varying vec2 vUv;
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform sampler2D uData; 
uniform sampler2D uRules; 
uniform float uTime;
uniform float uDelta;
uniform float uFriction;
uniform float uWorldSize; 
uniform float uAttraction; // Global Strength multiplier
uniform float uRadius; // Interaction Radius
uniform float uSeed; // Random seed
uniform float uRepulsion; // Buffer zone strength

const float N_SPECIES = 6.0;
const int SAMPLES = 32; // Number of neighbors to sample per frame
const float BUFFER_ZONE = 0.3; // Normalized radius (0..1) where repulsion is enforced

// Hash function for random numbers
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec4 pos = texture2D(uPosition, vUv);
  vec4 vel = texture2D(uVelocity, vUv);
  vec4 data = texture2D(uData, vUv);
  
  float mySpecies = data.r; 

  vec3 totalForce = vec3(0.0);
  
  // Stochastic Sampling
  for (int i = 0; i < SAMPLES; i++) {
        vec2 seed = vUv + vec2(float(i), uSeed);
        vec2 randomUV = vec2(random(seed), random(seed + 1.0));
        
        vec4 otherPos = texture2D(uPosition, randomUV);
        vec4 otherData = texture2D(uData, randomUV);
        float otherSpecies = otherData.r;
        
        // Calculate Distance
        vec3 diff = otherPos.xyz - pos.xyz;
        
        // Wrap distance for toroidal world
        if (diff.x > uWorldSize * 0.5) diff.x -= uWorldSize;
        if (diff.x < -uWorldSize * 0.5) diff.x += uWorldSize;
        if (diff.y > uWorldSize * 0.5) diff.y -= uWorldSize;
        if (diff.y < -uWorldSize * 0.5) diff.y += uWorldSize;
        if (diff.z > uWorldSize * 0.5) diff.z -= uWorldSize;
        if (diff.z < -uWorldSize * 0.5) diff.z += uWorldSize;

        float dist = length(diff);
        
        if (dist > 0.0 && dist < uRadius) {
             float F = 0.0;
             float distNorm = dist / uRadius; // 0..1
             
             // PHYSICS RULES
             // 1. Buffer Zone (Short range universal repulsion)
             if (distNorm < BUFFER_ZONE) {
                 // F is negative (repulsion). 
                 // At distNorm=0, F = -1.0. At distNorm=BUFFER_ZONE, F = 0.0.
                 F = 2.0 * (distNorm / BUFFER_ZONE - 1.0); 
             } else {
                 // 2. Interaction Zone (Medium range)
                 // Scale distNorm to 0..1 within the interaction zone
                 // val goes from 0.0 (at BUFFER_ZONE) to 1.0 (at 1.0)
                 float val = (distNorm - BUFFER_ZONE) / (1.0 - BUFFER_ZONE);
                 
                 // Get Rule Strength (-1 to 1)
                 vec2 ruleUV = vec2((otherSpecies + 0.5)/N_SPECIES, (mySpecies + 0.5)/N_SPECIES);
                 float rule = texture2D(uRules, ruleUV).r; 
                 
                 // Standard Particle Life Curve:
                 // Peak attraction/repulsion at center of interaction zone
                 // Triangle/Tent function: 0 -> 1 -> 0
                 float interaction = 1.0 - abs(2.0 * val - 1.0);
                 
                 F = rule * interaction;
             }
             
             // Normalize direction and apply
             vec3 dir = normalize(diff);
             totalForce += dir * F;
        }
  }
  
  vel.xyz += totalForce * uAttraction * uDelta;
  
  // Apply Friction / Damping
  // Stronger friction to stabilize structures
  // uFriction 0..1
  float damping = clamp(1.0 - (uFriction * 5.0 * uDelta), 0.0, 1.0);
  vel *= damping;

  gl_FragColor = vel;
}
`;

export const simStateFrag = `
varying vec2 vUv;
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform sampler2D uData; 
uniform float uTime;
uniform float uDelta;
uniform float uSeed;
uniform float uWorldSize;
uniform float uDecay;

const int SAMPLES = 16; // Fewer samples for state update to save perf
const float N_SPECIES = 6.0;

// Hash function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec4 data = texture2D(uData, vUv);
    vec4 pos = texture2D(uPosition, vUv);
    
    float species = data.r;
    float energy = data.g; // 0..1
    float state = data.b;  // Unused
    float size = data.a;   // Particle Size multiplier

    // Base Decay - Slower decay for more life
    energy -= uDecay * uDelta;
    
    // Natural Regen for "Plants" (Species 3 - Green)
    if (abs(species - 3.0) < 0.1) {
        energy += 0.8 * uDelta; // Stronger regen
    }
    
    // Interaction Loop
    for (int i = 0; i < SAMPLES; i++) {
        vec2 seed = vUv + vec2(float(i), uSeed);
        vec2 randomUV = vec2(random(seed), random(seed + 1.0));
        
        vec4 otherPos = texture2D(uPosition, randomUV);
        vec4 otherData = texture2D(uData, randomUV);
        
        float otherSpecies = otherData.r;
        float otherEnergy = otherData.g;
        
        vec3 diff = otherPos.xyz - pos.xyz;
         if (diff.x > uWorldSize * 0.5) diff.x -= uWorldSize;
        if (diff.x < -uWorldSize * 0.5) diff.x += uWorldSize;
        if (diff.y > uWorldSize * 0.5) diff.y -= uWorldSize;
        if (diff.y < -uWorldSize * 0.5) diff.y += uWorldSize;
        if (diff.z > uWorldSize * 0.5) diff.z -= uWorldSize;
        if (diff.z < -uWorldSize * 0.5) diff.z += uWorldSize;
        
        float dist = length(diff);
        
        if (dist < 4.0) { // Interaction range
            // ENERGY TRANSFER
            // Species 4 (Blue - Water/Conductor) shares energy
            if (abs(otherSpecies - 4.0) < 0.1 && otherEnergy > energy) {
                float transfer = (otherEnergy - energy) * 0.5 * uDelta;
                energy += transfer;
            }
            
            // Species 1 (Magenta - Predator) steals energy
            if (abs(species - 1.0) < 0.1) {
                float steal = otherEnergy * 0.5 * uDelta;
                energy += steal;
            }
        }
    }
    
    energy = clamp(energy, 0.2, 1.0); // Clamp min energy to 0.2 so they never disappear
    
    // Size is driven by Energy (Restored & Tuned)
    // Range: 0.6 (Low Energy) -> 1.8 (High Energy)
    float pulse = sin(uTime * 3.0 + pos.x) * 0.1;
    size = 0.6 + energy * 1.2 + pulse;
    
    gl_FragColor = vec4(species, energy, state, size);
}
`;

export const renderVert = `
uniform sampler2D uPosition;
uniform sampler2D uData; // Species (R), Energy (G), Unused (B), Size (A)
uniform float uTime;
uniform float uBaseSize;

attribute vec2 reference;
varying vec3 vColor;
varying float vAlpha;

vec3 getSpeciesColor(float species) {
    if (species < 0.5) return vec3(0.0, 1.0, 1.0); // Cyan
    if (species < 1.5) return vec3(1.0, 0.0, 1.0); // Magenta
    if (species < 2.5) return vec3(1.0, 1.0, 0.0); // Yellow
    if (species < 3.5) return vec3(0.1, 1.0, 0.2); // Green
    if (species < 4.5) return vec3(0.2, 0.5, 1.0); // Blue
    return vec3(1.0, 0.5, 0.0); // Orange (was White)
}

void main() {
  vec4 pos = texture2D(uPosition, reference);
  vec4 data = texture2D(uData, reference);
  
  float species = data.r;
  float size = data.a; // Scale from biological state
  
  if (size < 0.1) size = 0.1; // Min safety
  
  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
  
  gl_Position = projectionMatrix * mvPosition;
  
  // Point size attenuation with Dynamic Scale
  gl_PointSize = (uBaseSize * size / -mvPosition.z);
  
  vColor = getSpeciesColor(species);
  vAlpha = 0.8;
}
`;

export const renderFrag = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Distance from center (0 to 0.5)
  float d = distance(gl_PointCoord, vec2(0.5));
  
  // Sharp circle with soft edge (Cellular look)
  if (d > 0.5) discard;
  
  // Glow gradient: Bright center, soft falloff
  // 0.0 at center, 0.5 at edge
  // Invert: 1.0 at center, 0.0 at edge
  float strength = 1.0 - (d * 2.0);
  strength = pow(strength, 1.5); // Tune falloff
  
  // Core is solid white-ish, edge is colored (Restored)
  // This gives the "glowing orb" look the user liked.
  vec3 finalColor = mix(vColor, vec3(1.0), strength * 0.5);
  
  gl_FragColor = vec4(finalColor, strength);
}
`;
