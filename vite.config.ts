import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	base: "/teambuilder/",
	plugins: [
		preact({
			prerender: {
				enabled: true,
				renderTarget: '#app',
				additionalPrerenderRoutes: ['/'],
				previewMiddlewareEnabled: true,
				previewMiddlewareFallback: '/teambuilder/404',
			},
			reactAliasesEnabled: true
		}),
		viteTsconfigPaths()
	],
	build: {
		target: ["es2024"]
	}
	// experimental: {
	// 	renderBuiltUrl() {
	// 		return {
	// 			relative: true
	// 		}
	// 	}
	// }
});
