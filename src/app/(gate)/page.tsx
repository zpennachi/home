"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GatePage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch('/api/gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push('/new');
            router.refresh();
        } else {
            setError('Incorrect password');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm">
                <div className="mb-12 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-fg mb-4">
                        Preview Access
                    </p>
                    <h1 className="text-4xl font-display font-extralight tracking-tight text-foreground">
                        Enter Password
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoFocus
                            className="w-full px-4 py-3 bg-transparent border border-muted rounded-sm text-foreground placeholder:text-muted-fg/50 focus:outline-none focus:border-foreground transition-colors font-light tracking-wide"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 bg-foreground text-background text-sm font-medium uppercase tracking-[0.15em] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Checking...' : 'Enter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
