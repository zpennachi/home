
import { login } from './actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white selection:bg-white selection:text-black">
            <div className="w-full max-w-md p-8 space-y-8">
                <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full mx-auto mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight">Admin Access</h2>
                    <p className="text-white/40 mt-2 text-sm">Enter your credentials to continue.</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm"
                            placeholder="admin@zpennachi.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        formAction={login}
                        className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-white/90 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    )
}
