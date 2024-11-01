// src/app/page.tsx
import {Logo} from "@/components/Logo";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-12">
                <div className="transition-all duration-1000">
                    <Logo className="w-48 h-48 text-white animate-float" />
                </div>

                <h1 className="text-8xl font-bold text-white tracking-widest">
                    VIBE
                </h1>
            </div>
        </main>
    )
}