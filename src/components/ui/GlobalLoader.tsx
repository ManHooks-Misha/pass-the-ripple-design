import rippleLogo from "@/assets/ripple-logo.png";

const GlobalLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#EBE2E3]">
            <div className="flex flex-col items-center">
                <img
                    src={rippleLogo}
                    alt="Loading..."
                    className="w-24 h-auto animate-pulse mb-4"
                />
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#9F00C7] animate-[width_1s_ease-in-out_infinite]" style={{ width: '100%', animation: 'progress 1.5s ease-in-out infinite' }}></div>
                </div>
                <style>{`
                    @keyframes progress {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(0); }
                        100% { transform: translateX(100%); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default GlobalLoader;
