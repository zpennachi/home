"use client";

import { motion } from 'framer-motion';
import { Lock, Database, Code, Shield, Terminal, Key, Cpu, Network, Fingerprint, EyeOff, Server, FileJson } from 'lucide-react';

export default function ZeroGhostStory() {
    return (
        <div className="space-y-32 py-12">

            {/* Chapter 1: The Zero-Trust Axiom */}
            <section className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                            <Shield className="w-4 h-4" />
                            <span>Chapter 1: The Axiom</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                            Assume the Server is <span className="text-red-600 dark:text-red-500">Hostile.</span>
                        </h2>
                        <div className="prose prose-zinc dark:prose-invert text-lg leading-relaxed space-y-4 text-zinc-600 dark:text-white/70">
                            <p>
                                Most "secure" messengers rely on a fundamental contradiction: they promise privacy while
                                requiring you to trust their central identity server with your phone number and social graph.
                            </p>
                            <p>
                                <strong>0Ghost</strong> (codenamed `athoughtful.fun`) starts from a different premise:
                                <em>The server is already compromised.</em>
                                It is designed as a "Zero-Trust" system where the backend is treated as a malicious adversary
                                that must be cryptographically prevented from learning anything about its users.
                            </p>
                        </div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-[#090909] rounded-xl border border-zinc-200 dark:border-white/10 p-8 flex flex-col items-center justify-center aspect-video relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 dark:bg-red-900/5" />

                        {/* Hostile Server Diagram */}
                        <div className="flex items-center gap-8 relative z-10 w-full justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#0D0D0D] border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                                    <Terminal className="w-8 h-8 text-zinc-700 dark:text-white/80" />
                                </div>
                                <span className="text-xs font-mono text-zinc-400 dark:text-white/50">Client</span>
                            </div>

                            <div className="h-[2px] w-24 bg-red-500/20 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-zinc-100 dark:bg-[#090909] text-[10px] text-red-600 dark:text-red-500 font-mono border border-red-500/20 rounded">
                                    UNTRUSTED
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/10 border border-red-500/30 flex items-center justify-center relative">
                                    <Server className="w-8 h-8 text-red-600 dark:text-red-500" />
                                    <EyeOff className="w-4 h-4 text-red-600 dark:text-red-500 absolute top-2 right-2" />
                                </div>
                                <span className="text-xs font-mono text-zinc-400 dark:text-white/50">Server</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 2: Identity without Identification */}
            <section className="bg-zinc-50 dark:bg-[#0A0A0A] border-y border-zinc-200 dark:border-white/5 py-24 -mx-4 md:-mx-12 px-4 md:px-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="order-2 lg:order-1 bg-white dark:bg-[#050505] rounded-xl border border-zinc-200 dark:border-white/10 p-6 font-mono text-xs shadow-2xl overflow-x-auto">
                        <div className="flex gap-2 mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">
                            <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-white/10" />
                            <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-white/10" />
                            <span className="ml-auto text-zinc-400 dark:text-white/30">lib/crypto/keys.ts</span>
                        </div>

                        <div className="space-y-4 text-zinc-600 dark:text-white/60">
                            <div>
                                <span className="text-purple-600 dark:text-purple-400">export async function</span> <span className="text-yellow-600 dark:text-yellow-200">generateKeyPair</span>() {'{'}
                            </div>
                            <div className="pl-4">
                                <span className="text-zinc-400 dark:text-white/40">// RSA-OAEP for Identity (Key Exchange)</span><br />
                                <span className="text-blue-600 dark:text-blue-400">return await</span> crypto.subtle.generateKey(<br />
                                &nbsp;&nbsp;{'{'}<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;name: <span className="text-green-600 dark:text-green-400">"RSA-OAEP"</span>,<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;modulusLength: <span className="text-orange-600 dark:text-orange-400">2048</span>,<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;publicExponent: <span className="text-blue-600 dark:text-blue-400">new</span> Uint8Array([<span className="text-orange-600 dark:text-orange-400">1</span>, <span className="text-orange-600 dark:text-orange-400">0</span>, <span className="text-orange-600 dark:text-orange-400">1</span>]),<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;hash: <span className="text-green-600 dark:text-green-400">"SHA-256"</span><br />
                                &nbsp;&nbsp;{'}'},<br />
                                &nbsp;&nbsp;<span className="text-orange-600 dark:text-orange-400">true</span>,<br />
                                &nbsp;&nbsp;[<span className="text-green-600 dark:text-green-400">"encrypt"</span>, <span className="text-green-600 dark:text-green-400">"decrypt"</span>]<br />
                                );
                            </div>
                            <div>{'}'}</div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                            <Fingerprint className="w-4 h-4" />
                            <span>Chapter 2: Identity</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Identity without Identification</h3>
                        <div className="text-zinc-600 dark:text-white/70 leading-relaxed space-y-4">
                            <p>
                                In 0Ghost, an "Identity" is simply an <strong>RSA-OAEP Keypair</strong> generated client-side via the WebCrypto API.
                            </p>
                            <p>
                                There are no user tables. No passwords. No emails.
                                Your "Login" is simply possessing the private key in your browser's IndexedDB.
                                This means if you clear your cache, you cease to exist—a feature, not a bug,
                                for ephemeral activist operations.
                            </p>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-white/80">
                                    <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500"><Key className="w-3 h-3" /></div>
                                    Keys never leave the device (non-extractable).
                                </li>
                                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-white/80">
                                    <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500"><Shield className="w-3 h-3" /></div>
                                    Authentication proves <em>possession</em>, not <em>identity</em>.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 3: The Cryptography Pipeline */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                        <Network className="w-4 h-4" />
                        <span>Chapter 3: Transport</span>
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">The Encryption Pipeline</h3>
                    <p className="text-zinc-600 dark:text-white/70 leading-relaxed">
                        Messages traverse a rigorous pipeline before they ever touch the network stack.
                        We use <strong>AES-256-GCM</strong> for high-performance symmetric encryption of message bodies,
                        with rotating keys per "Circle".
                    </p>

                    <div className="space-y-4 mt-8">
                        <div className="p-4 bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/10 rounded-lg">
                            <div className="text-xs font-mono text-zinc-400 dark:text-white/40 mb-2">STEP 1: ENCODE</div>
                            <div className="text-zinc-900 dark:text-white font-mono">"Meet at 0400" <span className="text-zinc-400 dark:text-white/30">→</span> Uint8Array</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/10 rounded-lg">
                            <div className="text-xs font-mono text-zinc-400 dark:text-white/40 mb-2">STEP 2: ENCRYPT (AES-GCM)</div>
                            <div className="flex gap-2 items-center text-emerald-600 dark:text-emerald-500 font-mono text-sm">
                                <Lock className="w-3 h-3" />
                                <span>IV + Ciphertext + Tag</span>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/10 rounded-lg">
                            <div className="text-xs font-mono text-zinc-400 dark:text-white/40 mb-2">STEP 3: PADDING & PACKING</div>
                            <div className="text-zinc-900 dark:text-white font-mono text-sm break-all opacity-50">
                                U2FsdGVkX1+... (Base64)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#050505] rounded-xl border border-zinc-200 dark:border-white/10 p-6 font-mono text-xs shadow-2xl">
                    <div className="flex gap-2 mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">
                        <span className="text-zinc-400 dark:text-white/30">lib/crypto/encryption.ts</span>
                    </div>
                    <div className="space-y-2 text-zinc-600 dark:text-white/60">
                        <div>
                            <span className="text-purple-600 dark:text-purple-400">const</span> encrypted = <span className="text-blue-600 dark:text-blue-400">await</span> crypto.subtle.encrypt(
                        </div>
                        <div className="pl-4">
                            {'{'} name: <span className="text-green-600 dark:text-green-400">"AES-GCM"</span>, iv: iv {'}'},<br />
                            key,<br />
                            encodedData
                        </div>
                        <div>);</div>
                        <br />
                        <div className="text-zinc-400 dark:text-white/40 italic">
                            // Result: Version || Timestamp || Nonce || IV || Ciphertext
                        </div>
                        <div>
                            <span className="text-purple-600 dark:text-purple-400">const</span> combined = <span className="text-blue-600 dark:text-blue-400">new</span> Uint8Array(<br />
                            &nbsp;&nbsp;version.length + timestamp.length + ...<br />
                            );
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 4: Database Isolation */}
            <section className="border-t border-zinc-200 dark:border-white/5 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="bg-[#0D0D0D] rounded-xl border border-[#2B2B2B] p-6 relative">
                        <div className="absolute top-0 right-0 p-4 bg-orange-500/10 text-orange-500 font-bold text-xs rounded-bl-xl border-l border-b border-orange-500/20">
                            SUPABASE RLS POLICY
                        </div>
                        <pre className="text-[10px] md:text-xs text-white/70 font-mono leading-relaxed overflow-x-auto">
                            {`CREATE POLICY "Allow anonymous read"
ON anonymous_messages
FOR SELECT
USING (
  circle_id IN (
    SELECT circle_id 
    FROM capabilities 
    WHERE token_hash = sha256(current_setting('request.headers.authorization'))
  )
);`}
                        </pre>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                            <Database className="w-4 h-4" />
                            <span>Chapter 4: Isolation</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Database Isolation</h3>
                        <p className="text-zinc-600 dark:text-white/70 leading-relaxed">
                            How do you authorize a user you can't identify?
                            We implemented <strong>Capability-Based Access Control (CapBAC)</strong> directly in Postgres using Row Level Security.
                        </p>
                        <p className="text-zinc-600 dark:text-white/70 leading-relaxed">
                            The client presents a bearer token. The server hashes it (SHA-256) and checks the `capabilities` table.
                            If a match is found, the RLS policy dynamically unlocks the specific rows (Circle ID) linked to that capability.
                            This means the database enforces rules it cannot cryptographically verify itself, using the token hash as a proxy for permission.
                        </p>
                    </div>
                </div>
            </section>

            {/* Chapter 5: UI */}
            <section className="border-t border-zinc-200 dark:border-white/5 pt-24 text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-12">Designed for Silence</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {[
                        { icon: EyeOff, label: "Stealth Mode", desc: "Looks like a Notes app" },
                        { icon: Cpu, label: "Zero-Latency", desc: "Optimistic UI Updates" },
                        { icon: FileJson, label: "No Logs", desc: "Ephemeral-by-default" },
                        { icon: Lock, label: "Panic Trigger", desc: "Instant Wipe" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 p-6 rounded-xl bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/5">
                            <item.icon className="w-8 h-8 text-zinc-400 dark:text-white/40" />
                            <div className="font-bold text-zinc-900 dark:text-white">{item.label}</div>
                            <div className="text-xs text-zinc-500 dark:text-white/40">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
