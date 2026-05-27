export interface StoryStep {
    id: string; // unique handle: 'mvpiq-upload'
    title: string;
    description: string;
    projectId: string; // 'mvpiq'
    visualVariant: string; // 'upload' passed to the visual component
}

export const projectStories: StoryStep[] = [
    // --- Krampus Slap Fight Stories ---
    {
        id: 'krampus-input',
        projectId: 'krampus',
        visualVariant: 'Input Logic',
        title: 'The Slap Mechanic',
        description: 'We needed a way to translate a simple screen tap into a visceral "slap." We implemented a touch-duration listener that mapped hold time to "strength." A quick tap was a tickle; a long hold charged a powerful blow. This variable input directly drove the animation state machine.'
    },
    {
        id: 'krampus-branching',
        projectId: 'krampus',
        visualVariant: 'State Machine',
        title: 'Branching Narratives',
        description: 'The character rig had to blend seamlessly between IDLE and three distinct reaction timelines (Tickle, Normal, Heavy). We used varying-length animation clips and careful blending windows to ensure the character never "popped" between states, maintaining the illusion of a living creature.'
    },
    {
        id: 'krampus-desktop',
        projectId: 'krampus',
        visualVariant: 'Fallback Flow',
        title: 'Desktop Compatibility',
        description: 'While WebAR is mobile-first, the client required a desktop fallback. We built a permission-gated flow that gracefully degraded the experience, presenting a QR code for mobile users while allowing desktop users to preview the assets in a simulated environment.'
    },

    // --- 8th Wall Box + Naughty/Nice Stories ---
    {
        id: 'boxnn-hybrid',
        projectId: 'box-nn',
        visualVariant: 'Hybrid Tracking',
        title: 'Merging Realities',
        description: 'The project combined Image Targets (for the box scan) and Face Effects (for the selfie game). Switching between these two tracking modes in 8th Wall is resource-intensive. We orchestrated a "handoff" sequence that disposed of the image tracker before initializing the face mesh to prevent memory crashes on iOS.'
    },
    {
        id: 'boxnn-memory',
        projectId: 'box-nn',
        visualVariant: 'Optimization',
        title: 'Memory Constraints',
        description: 'We hit the mobile browser memory ceiling early. To maintain 60fps, we aggressively de-scoped non-essential visual flair—removing a "beautifying" filter layer and a particle snowglobe effect—prioritizing the core stability of the determination logic over decorative post-processing.'
    },
    {
        id: 'boxnn-commerce',
        projectId: 'box-nn',
        visualVariant: 'Integration',
        title: 'AR-to-Commerce',
        description: 'The experience wasn’t just a toy; it was a funnel. The "Buy Tickets" CTA was integrated directly into the end-card of the AR view, requiring a seamless UI overlay that worked across varying screen aspect ratios without obscuring the camera feed.'
    },

    // --- Naughty/Nice (Snap) Stories ---
    {
        id: 'nnsnap-trigger',
        projectId: 'nn-snap',
        visualVariant: 'Face Signal',
        title: 'Smile Detection',
        description: 'Instead of a button, we used the user\'s face as the controller. The logic listened for the mouth curvature value provided by Snap\'s face mesh. "Not Smiling" triggered the sequence, effectively mocking the user into a reaction. This required fine-tuning the threshold to differentiate a neutral face from a frown.'
    },
    {
        id: 'nnsnap-clean',
        projectId: 'nn-snap',
        visualVariant: 'UX Pattern',
        title: 'The Clean Capture',
        description: 'Social sharing fails if the asset looks cluttered. We implemented a "UI Hiding" state that automatically stripped away all instructional text and buttons the moment the shutter was pressed, ensuring the final shared image was a clean, branded memory.'
    },
    {
        id: 'nnsnap-random',
        projectId: 'nn-snap',
        visualVariant: 'Algorithm',
        title: 'Pseudo-Randomness',
        description: 'True randomness feels unfair. Users reported streaks of 5 "Nice" results in a row. We implemented a "bag" randomization system that ensured an even distribution of outcomes over short sessions, making the experience feel more varied and magical.'
    },

    // --- Snowmen Attack Stories ---
    {
        id: 'snowmen-cam',
        projectId: 'snowmen',
        visualVariant: 'Workaround',
        title: 'The Camera Flip',
        description: '8th Wall restricts programmatic camera swapping. We couldn\'t just create a "Start Game" button that flipped the camera. We had to design a bespoke UX flow that instructed the user to manually flip the camera via the browser interface to initialize the world-tracking scene.'
    },
    {
        id: 'snowmen-pool',
        projectId: 'snowmen',
        visualVariant: 'Performance',
        title: 'Object Pooling',
        description: 'Spawning and destroying 3D objects (snowballs, snowmen) at high frequency causes garbage collection stutters. We implemented an Object Pool pattern, instantiating a fixed array of enemies at start and recycling them, keeping frame rates buttery smooth during intense action.'
    },
    {
        id: 'snowmen-damage',
        projectId: 'snowmen',
        visualVariant: 'Game Logic',
        title: 'Hitbox Precision',
        description: 'We differentiated between "Head" and "Body" colliders on the snowmen meshes. A raycast hitting the head collider triggered an instant kill and a higher score event, adding a layer of skill-based depth to the casual tapping mechanic.'
    },

    {
        id: 'mvpiq-intro',
        projectId: 'mvpiq',
        visualVariant: 'intro',
        title: 'The Problem: Fragmented Feedback',
        description: 'Coaches were using email, WhatsApp, and Dropbox to send feedback. We unified ingestion into a single, drag-and-drop zone that handles processing automatically.'
    },
    {
        id: 'mvpiq-upload',
        projectId: 'mvpiq',
        visualVariant: 'upload',
        title: 'Seamless Ingestion',
        description: 'Instant upload with client-side transcoding preview. The system identifies format and optimizes for streaming immediately.'
    },
    {
        id: 'mvpiq-analysis',
        projectId: 'mvpiq',
        visualVariant: 'analysis',
        title: 'Precision Annotation',
        description: 'Frame-accurate drawing tools allow coaches to mark up plays. We use vector overlays synchronized with the video timestamp.'
    },
    {
        id: 'mvpiq-payment',
        projectId: 'mvpiq',
        visualVariant: 'payment',
        title: 'Monetization via Stripe',
        description: 'Integrated checkout flows allow creators to gate content. Secure handling with webhooks ensuring access is granted only upon success.'
    },
    {
        id: 'mvpiq-mobile',
        projectId: 'mvpiq',
        visualVariant: 'mobile',
        title: 'Anywhere Access',
        description: 'A responsive mobile view ensures athletes can review feedback on the court, immediately after practice.'
    },

    // --- Hawkeye Stories ---
    {
        id: 'hawkeye-ingest',
        projectId: 'hawkeye',
        visualVariant: 'ingest',
        title: 'Optical Data Stream',
        description: 'Ingesting raw coordinate data from 12 cameras at 60fps. The system filters noise and stitches viewpoints into a single 3D scene.'
    },
    {
        id: 'hawkeye-skeleton',
        projectId: 'hawkeye',
        visualVariant: 'skeleton',
        title: 'Skeletal Reconstruction',
        description: 'Inverse kinematics reconstruct the player posture from keypoints, estimating joint angles even when occluded.'
    },
    {
        id: 'hawkeye-court',
        projectId: 'hawkeye',
        visualVariant: 'court',
        title: 'Spatial Context',
        description: 'Mapping player coordinates to a calibrated court model allows for true spatial analytics like spacing diagrams and gravity scores.'
    },
    {
        id: 'hawkeye-query',
        projectId: 'hawkeye',
        visualVariant: 'query',
        title: 'Play Query Engine',
        description: '"Show me all Pick & Rolls from the left wing." A semantic search engine builds SQL-like queries from basketball concepts.'
    },
    {
        id: 'hawkeye-analytics',
        projectId: 'hawkeye',
        visualVariant: 'analytics',
        title: 'Efficiency Heatmaps',
        description: 'Aggregating thousands of possessions to visualize scoring efficiency zoning, helping analysts spot defensive weaknesses.'
    },

    // --- Weekend Stories ---
    {
        id: 'weekend-loader',
        projectId: 'weekend',
        visualVariant: 'loader',
        title: 'Asset Loading Sequence',
        description: 'A cinematic preloader that manages texture and model decoupling, ensuring the experience is ready before the curtain lifts.'
    },
    {
        id: 'weekend-timeline',
        projectId: 'weekend',
        visualVariant: 'timeline',
        title: 'Choreographed Motion',
        description: 'Using GSAP timelines to sync DOM elements with WebGL camera moves. Everything dances to the same clock.'
    },
    {
        id: 'weekend-shader',
        projectId: 'weekend',
        visualVariant: 'shader',
        title: 'Custom Shaders',
        description: 'GLSL fragments handle the distortion effects. We pass scroll velocity as a uniform to warp the visuals dynamically.'
    },
    {
        id: 'weekend-scroll',
        projectId: 'weekend',
        visualVariant: 'scroll',
        title: 'Physics-Based Scroll',
        description: 'Replacing native scroll with a virtual lenis instance allows for momentum, snapping, and smooth interpolation.'
    },
    {
        id: 'weekend-perf',
        projectId: 'weekend',
        visualVariant: 'perf',
        title: 'Performance Monitoring',
        description: 'Real-time stats tracking draw calls and geometry. We optimize by instancing meshes and disposing of unused textures.'
    },

    // --- ZeroGhost Stories ---
    {
        id: '0ghost-chat',
        projectId: '0ghost-chat',
        visualVariant: 'chat',
        title: 'Zero-Trust Messaging',
        description: 'End-to-end encrypted chat where the server never sees the message content. Identity is verified via client-side RSA keypairs.'
    },
    {
        id: '0ghost-encrypted',
        projectId: '0ghost-chat',
        visualVariant: 'encrypted',
        title: 'AES-256-GCM Encryption',
        description: 'Messages are encrypted locally using rotating symmetric keys before they ever hit the network.'
    },
    {
        id: '0ghost-network',
        projectId: '0ghost-chat',
        visualVariant: 'network',
        title: 'P2P Relay Network',
        description: 'A decentralized relay system routes encrypted blobs between clients without inspecting the payload.'
    },
    {
        id: '0ghost-keys',
        projectId: '0ghost-chat',
        visualVariant: 'keys',
        title: 'Identity & Key Exchange',
        description: 'Users generate high-entropy RSA-4096 keys in the browser. Public keys are exchanged out-of-band via QR codes.'
    },
    {
        id: '0ghost-mobile',
        projectId: '0ghost-chat',
        visualVariant: 'mobile',
        title: 'Mobile-First Security',
        description: 'A responsive, PWA-ready interface ensures secure communication is accessible on any device, anywhere.'
    },

    // --- Particle Life Stories ---
    {
        id: 'pl-rules',
        projectId: 'particle-life-131',
        visualVariant: 'rules',
        title: 'The Rules of Life',
        description: 'Complex behaviors emerge from a simple interaction matrix. Each color exerts an attraction or repulsion force on every other color.'
    },
    {
        id: 'pl-soup',
        projectId: 'particle-life-131',
        visualVariant: 'soup',
        title: 'Primordial Soup',
        description: 'At the start, 1200 particles are scattered randomly. Without organized forces, the system is chaotic and high-entropy.'
    },
    {
        id: 'pl-emergence',
        projectId: 'particle-life-131',
        visualVariant: 'emergence',
        title: 'Emergence',
        description: 'As the rules take effect, localized clusters begin to form. Red builds cells with Blue, while Green orbits the perimeter.'
    },
    {
        id: 'pl-stable',
        projectId: 'particle-life-131',
        visualVariant: 'stable',
        title: 'Stable Structures',
        description: 'Certain parameter combinations yield stable "lifeforms"—gliders, cells, and worms that maintain cohesion while moving.'
    },
    {
        id: 'pl-complexity',
        projectId: 'particle-life-131',
        visualVariant: 'complexity',
        title: 'Global Complexity',
        description: 'Thousands of particles interacting at 60fps. The macroscopic behavior (the "organism") is totally distinct from the microscopic rules.'
    },
    // --- Nexus Stories ---
    {
        id: 'nexus-graph',
        projectId: 'nexus',
        visualVariant: 'graph',
        title: 'The Knowledge Graph',
        description: 'Visualizing the hidden connections between documentation, code, and people. A force-directed layout reveals organizational clusters.'
    },
    {
        id: 'nexus-editor',
        projectId: 'nexus',
        visualVariant: 'editor',
        title: 'Collaborative Editor',
        description: 'Real-time multiplayer editing with transclusion support. Reference live code snippets directly in your technical specs.'
    },
    {
        id: 'nexus-search',
        projectId: 'nexus',
        visualVariant: 'search',
        title: 'Semantic Command',
        description: 'Natural language search that understands context. Ask "How do we handle auth?" and get the exact architecture diagram.'
    },

    // --- Vantage Stories ---
    {
        id: 'vantage-hero',
        projectId: 'vantage',
        visualVariant: 'hero',
        title: 'High-Frequency Trading Engine',
        description: 'A React-based financial terminal capable of rendering 60+ updates per second. Canvas-driven charts ensure zero layout thrashing.'
    },
    {
        id: 'vantage-grid',
        projectId: 'vantage',
        visualVariant: 'grid',
        title: 'Institutional Data Grid',
        description: 'Dense, information-rich layouts inspired by Bloomberg Terminals. Optimized for scanning massive datasets with zero visual clutter.'
    },
    {
        id: 'vantage-anomaly',
        projectId: 'vantage',
        visualVariant: 'anomaly',
        title: 'Anomaly Detection',
        description: 'Real-time sonar radar for spotting market irregularities. When volume deviates >400%, the system pulses an alert.'
    }
];

export function getProjectStories(projectId: string) {
    return projectStories.filter(s => s.projectId.toLowerCase() === projectId.toLowerCase());
}
