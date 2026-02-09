import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

type UseInactivityLogoutOptions = {
	// If true, call API logout before redirect; else just clear and redirect
	apiLogout?: () => Promise<void> | void;
	// Optional override for timeout
	timeoutMs?: number;
};

export function useInactivityLogout(options: UseInactivityLogoutOptions = {}) {
	const { apiLogout, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
	const navigate = useNavigate();
	const timerRef = useRef<number | null>(null);
	const apiLogoutRef = useRef<typeof apiLogout>(apiLogout);
	const timeoutMsRef = useRef(timeoutMs);
	const navigateRef = useRef(navigate);

	// Keep latest values without retriggering effects
	useEffect(() => {
		apiLogoutRef.current = apiLogout;
		timeoutMsRef.current = timeoutMs;
		navigateRef.current = navigate;
	}, [apiLogout, timeoutMs, navigate]);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const handleLogout = useCallback(async () => {
		try {
			if (apiLogoutRef.current) {
				await apiLogoutRef.current();
			} else {
				localStorage.clear();
			}
		} finally {
			// Signal session expiry for login screen toast
			localStorage.setItem("sessionExpired", "1");
			navigateRef.current("/login", { replace: true });
		}
	}, []);

	const resetTimer = useCallback(() => {
		clearTimer();
		timerRef.current = window.setTimeout(() => {
			handleLogout();
		}, timeoutMsRef.current);
	}, [clearTimer, handleLogout]);

	useEffect(() => {
		const events: (keyof WindowEventMap)[] = [
			"mousemove",
			"mousedown",
			"mouseup",
			"click",
			"dblclick",
			"scroll",
			"wheel",
			"keypress",
			"keydown",
			"keyup",
			"touchstart",
			"touchmove",
			"touchend",
			"focus",
			"blur",
			"input",
			"change",
			"submit",
		];

		// Use throttling to avoid excessive timer resets (max once per 100ms)
		// but ensure the timer is reset immediately when activity occurs
		let throttleTimeout: number | null = null;
		let lastResetTime = 0;
		const THROTTLE_MS = 100; // Throttle to max once per 100ms
		
		const throttledResetTimer = () => {
			const now = Date.now();
			
			// If enough time has passed since last reset, reset immediately
			if (now - lastResetTime >= THROTTLE_MS) {
				resetTimer();
				lastResetTime = now;
				
				// Clear any pending throttle timeout
				if (throttleTimeout !== null) {
					window.clearTimeout(throttleTimeout);
					throttleTimeout = null;
				}
			} else {
				// Schedule a reset if one isn't already scheduled
				if (throttleTimeout === null) {
					const timeSinceLastReset = now - lastResetTime;
					const remainingTime = THROTTLE_MS - timeSinceLastReset;
					
					throttleTimeout = window.setTimeout(() => {
						resetTimer();
						lastResetTime = Date.now();
						throttleTimeout = null;
					}, remainingTime);
				}
			}
		};

		// Initial timer setup
		resetTimer();
		lastResetTime = Date.now();

		// Add event listeners to window and document
		events.forEach((event) => {
			window.addEventListener(event, throttledResetTimer, { passive: true });
			document.addEventListener(event, throttledResetTimer, { passive: true });
		});

		return () => {
			// Cleanup
			events.forEach((event) => {
				window.removeEventListener(event, throttledResetTimer);
				document.removeEventListener(event, throttledResetTimer);
			});
			if (throttleTimeout !== null) {
				window.clearTimeout(throttleTimeout);
			}
			clearTimer();
		};
	}, [resetTimer, clearTimer]);

	return { resetTimer };
}

export default useInactivityLogout;


