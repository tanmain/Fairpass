"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/me/route";
exports.ids = ["app/api/auth/me/route"];
exports.modules = {

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var E_Projects_Ticketing_src_app_api_auth_me_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/me/route.ts */ \"(rsc)/./src/app/api/auth/me/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/me/route\",\n        pathname: \"/api/auth/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/me/route\"\n    },\n    resolvedPagePath: \"E:\\\\Projects\\\\Ticketing\\\\src\\\\app\\\\api\\\\auth\\\\me\\\\route.ts\",\n    nextConfigOutput,\n    userland: E_Projects_Ticketing_src_app_api_auth_me_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/auth/me/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbWUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlLnRzJmFwcERpcj1FJTNBJTVDUHJvamVjdHMlNUNUaWNrZXRpbmclNUNzcmMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUUlM0ElNUNQcm9qZWN0cyU1Q1RpY2tldGluZyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNVO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUdBQXVHO0FBQy9HO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDNko7O0FBRTdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGlja2V0LXBsYXRmb3JtLz83OGUyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkU6XFxcXFByb2plY3RzXFxcXFRpY2tldGluZ1xcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXG1lXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL21lL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9tZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9tZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkU6XFxcXFByb2plY3RzXFxcXFRpY2tldGluZ1xcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXG1lXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvbWUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/me/route.ts":
/*!**************************************!*\
  !*** ./src/app/api/auth/me/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\n// GET /api/auth/me\nasync function GET() {\n    const session = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.getSession)();\n    if (!session) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            user: null\n        }, {\n            status: 401\n        });\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        user: session\n    });\n}\n// POST /api/auth/logout\nasync function POST() {\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        ok: true\n    });\n    response.cookies.delete(\"session\");\n    return response;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL21lL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBdUQ7QUFDaEI7QUFFdkMsbUJBQW1CO0FBQ1osZUFBZUU7SUFDcEIsTUFBTUMsVUFBVSxNQUFNRixxREFBVUE7SUFDaEMsSUFBSSxDQUFDRSxTQUFTO1FBQ1osT0FBT0gscURBQVlBLENBQUNJLElBQUksQ0FBQztZQUFFQyxNQUFNO1FBQUssR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDekQ7SUFDQSxPQUFPTixxREFBWUEsQ0FBQ0ksSUFBSSxDQUFDO1FBQUVDLE1BQU1GO0lBQVE7QUFDM0M7QUFFQSx3QkFBd0I7QUFDakIsZUFBZUk7SUFDcEIsTUFBTUMsV0FBV1IscURBQVlBLENBQUNJLElBQUksQ0FBQztRQUFFSyxJQUFJO0lBQUs7SUFDOUNELFNBQVNFLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDO0lBQ3hCLE9BQU9IO0FBQ1QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aWNrZXQtcGxhdGZvcm0vLi9zcmMvYXBwL2FwaS9hdXRoL21lL3JvdXRlLnRzPzU4YmYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xyXG5pbXBvcnQgeyBnZXRTZXNzaW9uIH0gZnJvbSAnQC9saWIvYXV0aCdcclxuXHJcbi8vIEdFVCAvYXBpL2F1dGgvbWVcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcclxuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbigpXHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1c2VyOiBudWxsIH0sIHsgc3RhdHVzOiA0MDEgfSlcclxuICB9XHJcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXNlcjogc2Vzc2lvbiB9KVxyXG59XHJcblxyXG4vLyBQT1NUIC9hcGkvYXV0aC9sb2dvdXRcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QoKSB7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBOZXh0UmVzcG9uc2UuanNvbih7IG9rOiB0cnVlIH0pXHJcbiAgcmVzcG9uc2UuY29va2llcy5kZWxldGUoJ3Nlc3Npb24nKVxyXG4gIHJldHVybiByZXNwb25zZVxyXG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlc3Npb24iLCJHRVQiLCJzZXNzaW9uIiwianNvbiIsInVzZXIiLCJzdGF0dXMiLCJQT1NUIiwicmVzcG9uc2UiLCJvayIsImNvb2tpZXMiLCJkZWxldGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/me/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createQRToken: () => (/* binding */ createQRToken),\n/* harmony export */   createSessionToken: () => (/* binding */ createSessionToken),\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   hashIDForEvent: () => (/* binding */ hashIDForEvent),\n/* harmony export */   hashPassword: () => (/* binding */ hashPassword),\n/* harmony export */   requireOrganizer: () => (/* binding */ requireOrganizer),\n/* harmony export */   requireSession: () => (/* binding */ requireSession),\n/* harmony export */   verifyPassword: () => (/* binding */ verifyPassword),\n/* harmony export */   verifyQRToken: () => (/* binding */ verifyQRToken),\n/* harmony export */   verifySessionToken: () => (/* binding */ verifySessionToken)\n/* harmony export */ });\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\n\nconst SESSION_SECRET = process.env.NEXTAUTH_SECRET || \"dev-secret\";\nconst QR_SECRET = process.env.QR_JWT_SECRET || \"dev-qr-secret\";\n// ─── Password helpers ─────────────────────────────────────────────────────────\nasync function hashPassword(password) {\n    return bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().hash(password, 12);\n}\nasync function verifyPassword(password, hash) {\n    return bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().compare(password, hash);\n}\nfunction createSessionToken(payload) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().sign(payload, SESSION_SECRET, {\n        expiresIn: \"7d\"\n    });\n}\nfunction verifySessionToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().verify(token, SESSION_SECRET);\n    } catch  {\n        return null;\n    }\n}\nasync function getSession() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.cookies)();\n    const token = cookieStore.get(\"session\")?.value;\n    if (!token) return null;\n    return verifySessionToken(token);\n}\nasync function requireSession() {\n    const session = await getSession();\n    if (!session) throw new Error(\"UNAUTHORIZED\");\n    return session;\n}\nasync function requireOrganizer() {\n    const session = await requireSession();\n    if (session.role !== \"ORGANIZER\" && session.role !== \"ADMIN\") {\n        throw new Error(\"FORBIDDEN\");\n    }\n    return session;\n}\nfunction createQRToken(payload) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().sign(payload, QR_SECRET);\n}\nfunction verifyQRToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().verify(token, QR_SECRET);\n    } catch  {\n        return null;\n    }\n}\n// ─── ID hashing ───────────────────────────────────────────────────────────────\nfunction hashIDForEvent(idNumber, eventId) {\n    const crypto = __webpack_require__(/*! crypto */ \"crypto\");\n    return crypto.createHmac(\"sha256\", eventId).update(idNumber.toLowerCase().replace(/\\s/g, \"\")).digest(\"hex\");\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTZCO0FBQ0M7QUFDUTtBQUV0QyxNQUFNRyxpQkFBaUJDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZSxJQUFJO0FBQ3RELE1BQU1DLFlBQVlILFFBQVFDLEdBQUcsQ0FBQ0csYUFBYSxJQUFJO0FBRS9DLGlGQUFpRjtBQUUxRSxlQUFlQyxhQUFhQyxRQUFnQjtJQUNqRCxPQUFPVixvREFBVyxDQUFDVSxVQUFVO0FBQy9CO0FBRU8sZUFBZUUsZUFBZUYsUUFBZ0IsRUFBRUMsSUFBWTtJQUNqRSxPQUFPWCx1REFBYyxDQUFDVSxVQUFVQztBQUNsQztBQVdPLFNBQVNHLG1CQUFtQkMsT0FBdUI7SUFDeEQsT0FBT2Qsd0RBQVEsQ0FBQ2MsU0FBU1osZ0JBQWdCO1FBQUVjLFdBQVc7SUFBSztBQUM3RDtBQUVPLFNBQVNDLG1CQUFtQkMsS0FBYTtJQUM5QyxJQUFJO1FBQ0YsT0FBT2xCLDBEQUFVLENBQUNrQixPQUFPaEI7SUFDM0IsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxlQUFla0I7SUFDcEIsTUFBTUMsY0FBY3BCLHFEQUFPQTtJQUMzQixNQUFNaUIsUUFBUUcsWUFBWUMsR0FBRyxDQUFDLFlBQVlDO0lBQzFDLElBQUksQ0FBQ0wsT0FBTyxPQUFPO0lBQ25CLE9BQU9ELG1CQUFtQkM7QUFDNUI7QUFFTyxlQUFlTTtJQUNwQixNQUFNQyxVQUFVLE1BQU1MO0lBQ3RCLElBQUksQ0FBQ0ssU0FBUyxNQUFNLElBQUlDLE1BQU07SUFDOUIsT0FBT0Q7QUFDVDtBQUVPLGVBQWVFO0lBQ3BCLE1BQU1GLFVBQVUsTUFBTUQ7SUFDdEIsSUFBSUMsUUFBUUcsSUFBSSxLQUFLLGVBQWVILFFBQVFHLElBQUksS0FBSyxTQUFTO1FBQzVELE1BQU0sSUFBSUYsTUFBTTtJQUNsQjtJQUNBLE9BQU9EO0FBQ1Q7QUFhTyxTQUFTSSxjQUFjZixPQUFrQjtJQUM5QyxPQUFPZCx3REFBUSxDQUFDYyxTQUFTUjtBQUMzQjtBQUVPLFNBQVN3QixjQUFjWixLQUFhO0lBQ3pDLElBQUk7UUFDRixPQUFPbEIsMERBQVUsQ0FBQ2tCLE9BQU9aO0lBQzNCLEVBQUUsT0FBTTtRQUNOLE9BQU87SUFDVDtBQUNGO0FBRUEsaUZBQWlGO0FBRTFFLFNBQVN5QixlQUFlQyxRQUFnQixFQUFFQyxPQUFlO0lBQzlELE1BQU1DLFNBQVNDLG1CQUFPQSxDQUFDO0lBQ3ZCLE9BQU9ELE9BQ0pFLFVBQVUsQ0FBQyxVQUFVSCxTQUNyQkksTUFBTSxDQUFDTCxTQUFTTSxXQUFXLEdBQUdDLE9BQU8sQ0FBQyxPQUFPLEtBQzdDQyxNQUFNLENBQUM7QUFDWiIsInNvdXJjZXMiOlsid2VicGFjazovL3RpY2tldC1wbGF0Zm9ybS8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnXHJcbmltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJ1xyXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xyXG5cclxuY29uc3QgU0VTU0lPTl9TRUNSRVQgPSBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgfHwgJ2Rldi1zZWNyZXQnXHJcbmNvbnN0IFFSX1NFQ1JFVCA9IHByb2Nlc3MuZW52LlFSX0pXVF9TRUNSRVQgfHwgJ2Rldi1xci1zZWNyZXQnXHJcblxyXG4vLyDilIDilIDilIAgUGFzc3dvcmQgaGVscGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgcmV0dXJuIGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMilcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIHJldHVybiBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgaGFzaClcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNlc3Npb24gdG9rZW4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb25QYXlsb2FkIHtcclxuICB1c2VySWQ6IHN0cmluZ1xyXG4gIGVtYWlsOiBzdHJpbmdcclxuICByb2xlOiBzdHJpbmdcclxuICBuYW1lOiBzdHJpbmdcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25Ub2tlbihwYXlsb2FkOiBTZXNzaW9uUGF5bG9hZCk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGp3dC5zaWduKHBheWxvYWQsIFNFU1NJT05fU0VDUkVULCB7IGV4cGlyZXNJbjogJzdkJyB9KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpOiBTZXNzaW9uUGF5bG9hZCB8IG51bGwge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgU0VTU0lPTl9TRUNSRVQpIGFzIFNlc3Npb25QYXlsb2FkXHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb24oKTogUHJvbWlzZTxTZXNzaW9uUGF5bG9hZCB8IG51bGw+IHtcclxuICBjb25zdCBjb29raWVTdG9yZSA9IGNvb2tpZXMoKVxyXG4gIGNvbnN0IHRva2VuID0gY29va2llU3RvcmUuZ2V0KCdzZXNzaW9uJyk/LnZhbHVlXHJcbiAgaWYgKCF0b2tlbikgcmV0dXJuIG51bGxcclxuICByZXR1cm4gdmVyaWZ5U2Vzc2lvblRva2VuKHRva2VuKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZVNlc3Npb24oKTogUHJvbWlzZTxTZXNzaW9uUGF5bG9hZD4ge1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXNzaW9uKClcclxuICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignVU5BVVRIT1JJWkVEJylcclxuICByZXR1cm4gc2Vzc2lvblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZU9yZ2FuaXplcigpOiBQcm9taXNlPFNlc3Npb25QYXlsb2FkPiB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHJlcXVpcmVTZXNzaW9uKClcclxuICBpZiAoc2Vzc2lvbi5yb2xlICE9PSAnT1JHQU5JWkVSJyAmJiBzZXNzaW9uLnJvbGUgIT09ICdBRE1JTicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignRk9SQklEREVOJylcclxuICB9XHJcbiAgcmV0dXJuIHNlc3Npb25cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFFSIFRva2VuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBRUlBheWxvYWQge1xyXG4gIHRpY2tldElkOiBzdHJpbmdcclxuICBldmVudElkOiBzdHJpbmdcclxuICBhdHRlbmRlZU5hbWU6IHN0cmluZ1xyXG4gIGlkVHlwZTogc3RyaW5nXHJcbiAgaWRMYXN0NDogc3RyaW5nXHJcbiAgaXNzdWVkQXQ6IG51bWJlclxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUVJUb2tlbihwYXlsb2FkOiBRUlBheWxvYWQpOiBzdHJpbmcge1xyXG4gIHJldHVybiBqd3Quc2lnbihwYXlsb2FkLCBRUl9TRUNSRVQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlRUlRva2VuKHRva2VuOiBzdHJpbmcpOiBRUlBheWxvYWQgfCBudWxsIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGp3dC52ZXJpZnkodG9rZW4sIFFSX1NFQ1JFVCkgYXMgUVJQYXlsb2FkXHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIElEIGhhc2hpbmcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGFzaElERm9yRXZlbnQoaWROdW1iZXI6IHN0cmluZywgZXZlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKVxyXG4gIHJldHVybiBjcnlwdG9cclxuICAgIC5jcmVhdGVIbWFjKCdzaGEyNTYnLCBldmVudElkKVxyXG4gICAgLnVwZGF0ZShpZE51bWJlci50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccy9nLCAnJykpXHJcbiAgICAuZGlnZXN0KCdoZXgnKVxyXG59Il0sIm5hbWVzIjpbImJjcnlwdCIsImp3dCIsImNvb2tpZXMiLCJTRVNTSU9OX1NFQ1JFVCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJRUl9TRUNSRVQiLCJRUl9KV1RfU0VDUkVUIiwiaGFzaFBhc3N3b3JkIiwicGFzc3dvcmQiLCJoYXNoIiwidmVyaWZ5UGFzc3dvcmQiLCJjb21wYXJlIiwiY3JlYXRlU2Vzc2lvblRva2VuIiwicGF5bG9hZCIsInNpZ24iLCJleHBpcmVzSW4iLCJ2ZXJpZnlTZXNzaW9uVG9rZW4iLCJ0b2tlbiIsInZlcmlmeSIsImdldFNlc3Npb24iLCJjb29raWVTdG9yZSIsImdldCIsInZhbHVlIiwicmVxdWlyZVNlc3Npb24iLCJzZXNzaW9uIiwiRXJyb3IiLCJyZXF1aXJlT3JnYW5pemVyIiwicm9sZSIsImNyZWF0ZVFSVG9rZW4iLCJ2ZXJpZnlRUlRva2VuIiwiaGFzaElERm9yRXZlbnQiLCJpZE51bWJlciIsImV2ZW50SWQiLCJjcnlwdG8iLCJyZXF1aXJlIiwiY3JlYXRlSG1hYyIsInVwZGF0ZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImRpZ2VzdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();