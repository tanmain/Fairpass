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
exports.id = "app/api/tickets/[id]/qr/route";
exports.ids = ["app/api/tickets/[id]/qr/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

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

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

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

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&page=%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&page=%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var E_Projects_Ticketing_src_app_api_tickets_id_qr_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/tickets/[id]/qr/route.ts */ \"(rsc)/./src/app/api/tickets/[id]/qr/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/tickets/[id]/qr/route\",\n        pathname: \"/api/tickets/[id]/qr\",\n        filename: \"route\",\n        bundlePath: \"app/api/tickets/[id]/qr/route\"\n    },\n    resolvedPagePath: \"E:\\\\Projects\\\\Ticketing\\\\src\\\\app\\\\api\\\\tickets\\\\[id]\\\\qr\\\\route.ts\",\n    nextConfigOutput,\n    userland: E_Projects_Ticketing_src_app_api_tickets_id_qr_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/tickets/[id]/qr/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ0aWNrZXRzJTJGJTVCaWQlNUQlMkZxciUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGdGlja2V0cyUyRiU1QmlkJTVEJTJGcXIlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZ0aWNrZXRzJTJGJTVCaWQlNUQlMkZxciUyRnJvdXRlLnRzJmFwcERpcj1FJTNBJTVDUHJvamVjdHMlNUNUaWNrZXRpbmclNUNzcmMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUUlM0ElNUNQcm9qZWN0cyU1Q1RpY2tldGluZyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNtQjtBQUNoRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL3RpY2tldC1wbGF0Zm9ybS8/NTUzYyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJFOlxcXFxQcm9qZWN0c1xcXFxUaWNrZXRpbmdcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcdGlja2V0c1xcXFxbaWRdXFxcXHFyXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS90aWNrZXRzL1tpZF0vcXIvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS90aWNrZXRzL1tpZF0vcXJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3RpY2tldHMvW2lkXS9xci9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkU6XFxcXFByb2plY3RzXFxcXFRpY2tldGluZ1xcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFx0aWNrZXRzXFxcXFtpZF1cXFxccXJcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvdGlja2V0cy9baWRdL3FyL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&page=%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/tickets/[id]/qr/route.ts":
/*!**********************************************!*\
  !*** ./src/app/api/tickets/[id]/qr/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var qrcode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! qrcode */ \"(rsc)/./node_modules/qrcode/lib/index.js\");\n\n\n\n\nasync function GET(req, { params }) {\n    try {\n        const session = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.requireSession)();\n        const ticket = await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.ticket.findUnique({\n            where: {\n                id: params.id\n            },\n            include: {\n                event: {\n                    select: {\n                        title: true\n                    }\n                }\n            }\n        });\n        if (!ticket) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Ticket not found\"\n        }, {\n            status: 404\n        });\n        if (ticket.userId !== session.userId) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Forbidden\"\n        }, {\n            status: 403\n        });\n        if (ticket.status !== \"BOUND\") return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Ticket not bound yet\"\n        }, {\n            status: 400\n        });\n        if (!ticket.qrToken) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"No QR token found\"\n        }, {\n            status: 400\n        });\n        const qrDataURL = await qrcode__WEBPACK_IMPORTED_MODULE_3__.toDataURL(ticket.qrToken, {\n            errorCorrectionLevel: \"H\",\n            width: 400,\n            margin: 2\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            qrDataURL,\n            attendeeName: ticket.attendeeName,\n            eventTitle: ticket.event.title,\n            idType: ticket.idType\n        });\n    } catch (err) {\n        if (err.message === \"UNAUTHORIZED\") return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Please log in\"\n        }, {\n            status: 401\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal server error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS90aWNrZXRzL1tpZF0vcXIvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUQ7QUFDWjtBQUNOO0FBQ1Y7QUFFcEIsZUFBZUksSUFDcEJDLEdBQWdCLEVBQ2hCLEVBQUVDLE1BQU0sRUFBOEI7SUFFdEMsSUFBSTtRQUNGLE1BQU1DLFVBQVUsTUFBTU4seURBQWNBO1FBRXBDLE1BQU1PLFNBQVMsTUFBTU4sK0NBQU1BLENBQUNNLE1BQU0sQ0FBQ0MsVUFBVSxDQUFDO1lBQzVDQyxPQUFPO2dCQUFFQyxJQUFJTCxPQUFPSyxFQUFFO1lBQUM7WUFDdkJDLFNBQVM7Z0JBQUVDLE9BQU87b0JBQUVDLFFBQVE7d0JBQUVDLE9BQU87b0JBQUs7Z0JBQUU7WUFBRTtRQUNoRDtRQUVBLElBQUksQ0FBQ1AsUUFBUSxPQUFPUixxREFBWUEsQ0FBQ2dCLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQW1CLEdBQUc7WUFBRUMsUUFBUTtRQUFJO1FBQ25GLElBQUlWLE9BQU9XLE1BQU0sS0FBS1osUUFBUVksTUFBTSxFQUFFLE9BQU9uQixxREFBWUEsQ0FBQ2dCLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQVksR0FBRztZQUFFQyxRQUFRO1FBQUk7UUFDckcsSUFBSVYsT0FBT1UsTUFBTSxLQUFLLFNBQVMsT0FBT2xCLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBdUIsR0FBRztZQUFFQyxRQUFRO1FBQUk7UUFDekcsSUFBSSxDQUFDVixPQUFPWSxPQUFPLEVBQUUsT0FBT3BCLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBb0IsR0FBRztZQUFFQyxRQUFRO1FBQUk7UUFFNUYsTUFBTUcsWUFBWSxNQUFNbEIsNkNBQWdCLENBQUNLLE9BQU9ZLE9BQU8sRUFBRTtZQUN2REcsc0JBQXNCO1lBQ3RCQyxPQUFPO1lBQ1BDLFFBQVE7UUFDVjtRQUVBLE9BQU96QixxREFBWUEsQ0FBQ2dCLElBQUksQ0FBQztZQUN2Qks7WUFDQUssY0FBY2xCLE9BQU9rQixZQUFZO1lBQ2pDQyxZQUFZbkIsT0FBT0ssS0FBSyxDQUFDRSxLQUFLO1lBQzlCYSxRQUFRcEIsT0FBT29CLE1BQU07UUFDdkI7SUFDRixFQUFFLE9BQU9DLEtBQVU7UUFDakIsSUFBSUEsSUFBSUMsT0FBTyxLQUFLLGdCQUFnQixPQUFPOUIscURBQVlBLENBQUNnQixJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFnQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtRQUN2RyxPQUFPbEIscURBQVlBLENBQUNnQixJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUM3RTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGlja2V0LXBsYXRmb3JtLy4vc3JjL2FwcC9hcGkvdGlja2V0cy9baWRdL3FyL3JvdXRlLnRzPzRkMGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXF1aXJlU2Vzc2lvbiB9IGZyb20gJ0AvbGliL2F1dGgnXHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcclxuaW1wb3J0IFFSQ29kZSBmcm9tICdxcmNvZGUnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKFxyXG4gIHJlcTogTmV4dFJlcXVlc3QsXHJcbiAgeyBwYXJhbXMgfTogeyBwYXJhbXM6IHsgaWQ6IHN0cmluZyB9IH1cclxuKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCByZXF1aXJlU2Vzc2lvbigpXHJcblxyXG4gICAgY29uc3QgdGlja2V0ID0gYXdhaXQgcHJpc21hLnRpY2tldC5maW5kVW5pcXVlKHtcclxuICAgICAgd2hlcmU6IHsgaWQ6IHBhcmFtcy5pZCB9LFxyXG4gICAgICBpbmNsdWRlOiB7IGV2ZW50OiB7IHNlbGVjdDogeyB0aXRsZTogdHJ1ZSB9IH0gfSxcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKCF0aWNrZXQpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVGlja2V0IG5vdCBmb3VuZCcgfSwgeyBzdGF0dXM6IDQwNCB9KVxyXG4gICAgaWYgKHRpY2tldC51c2VySWQgIT09IHNlc3Npb24udXNlcklkKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZvcmJpZGRlbicgfSwgeyBzdGF0dXM6IDQwMyB9KVxyXG4gICAgaWYgKHRpY2tldC5zdGF0dXMgIT09ICdCT1VORCcpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVGlja2V0IG5vdCBib3VuZCB5ZXQnIH0sIHsgc3RhdHVzOiA0MDAgfSlcclxuICAgIGlmICghdGlja2V0LnFyVG9rZW4pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm8gUVIgdG9rZW4gZm91bmQnIH0sIHsgc3RhdHVzOiA0MDAgfSlcclxuXHJcbiAgICBjb25zdCBxckRhdGFVUkwgPSBhd2FpdCBRUkNvZGUudG9EYXRhVVJMKHRpY2tldC5xclRva2VuLCB7XHJcbiAgICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiAnSCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIG1hcmdpbjogMixcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgcXJEYXRhVVJMLFxyXG4gICAgICBhdHRlbmRlZU5hbWU6IHRpY2tldC5hdHRlbmRlZU5hbWUsXHJcbiAgICAgIGV2ZW50VGl0bGU6IHRpY2tldC5ldmVudC50aXRsZSxcclxuICAgICAgaWRUeXBlOiB0aWNrZXQuaWRUeXBlLFxyXG4gICAgfSlcclxuICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgaWYgKGVyci5tZXNzYWdlID09PSAnVU5BVVRIT1JJWkVEJykgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdQbGVhc2UgbG9nIGluJyB9LCB7IHN0YXR1czogNDAxIH0pXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KVxyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJyZXF1aXJlU2Vzc2lvbiIsInByaXNtYSIsIlFSQ29kZSIsIkdFVCIsInJlcSIsInBhcmFtcyIsInNlc3Npb24iLCJ0aWNrZXQiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpZCIsImluY2x1ZGUiLCJldmVudCIsInNlbGVjdCIsInRpdGxlIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwidXNlcklkIiwicXJUb2tlbiIsInFyRGF0YVVSTCIsInRvRGF0YVVSTCIsImVycm9yQ29ycmVjdGlvbkxldmVsIiwid2lkdGgiLCJtYXJnaW4iLCJhdHRlbmRlZU5hbWUiLCJldmVudFRpdGxlIiwiaWRUeXBlIiwiZXJyIiwibWVzc2FnZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/tickets/[id]/qr/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createQRToken: () => (/* binding */ createQRToken),\n/* harmony export */   createSessionToken: () => (/* binding */ createSessionToken),\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   hashIDForEvent: () => (/* binding */ hashIDForEvent),\n/* harmony export */   hashPassword: () => (/* binding */ hashPassword),\n/* harmony export */   requireOrganizer: () => (/* binding */ requireOrganizer),\n/* harmony export */   requireSession: () => (/* binding */ requireSession),\n/* harmony export */   verifyPassword: () => (/* binding */ verifyPassword),\n/* harmony export */   verifyQRToken: () => (/* binding */ verifyQRToken),\n/* harmony export */   verifySessionToken: () => (/* binding */ verifySessionToken)\n/* harmony export */ });\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\n\nconst SESSION_SECRET = process.env.NEXTAUTH_SECRET || \"dev-secret\";\nconst QR_SECRET = process.env.QR_JWT_SECRET || \"dev-qr-secret\";\n// ─── Password helpers ─────────────────────────────────────────────────────────\nasync function hashPassword(password) {\n    return bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().hash(password, 12);\n}\nasync function verifyPassword(password, hash) {\n    return bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().compare(password, hash);\n}\nfunction createSessionToken(payload) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().sign(payload, SESSION_SECRET, {\n        expiresIn: \"7d\"\n    });\n}\nfunction verifySessionToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().verify(token, SESSION_SECRET);\n    } catch  {\n        return null;\n    }\n}\nasync function getSession() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.cookies)();\n    const token = cookieStore.get(\"session\")?.value;\n    if (!token) return null;\n    return verifySessionToken(token);\n}\nasync function requireSession() {\n    const session = await getSession();\n    if (!session) throw new Error(\"UNAUTHORIZED\");\n    return session;\n}\nasync function requireOrganizer() {\n    const session = await requireSession();\n    if (session.role !== \"ORGANIZER\" && session.role !== \"ADMIN\") {\n        throw new Error(\"FORBIDDEN\");\n    }\n    return session;\n}\nfunction createQRToken(payload) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().sign(payload, QR_SECRET);\n}\nfunction verifyQRToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().verify(token, QR_SECRET);\n    } catch  {\n        return null;\n    }\n}\n// ─── ID hashing ───────────────────────────────────────────────────────────────\nfunction hashIDForEvent(idNumber, eventId) {\n    const crypto = __webpack_require__(/*! crypto */ \"crypto\");\n    return crypto.createHmac(\"sha256\", eventId).update(idNumber.toLowerCase().replace(/\\s/g, \"\")).digest(\"hex\");\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTZCO0FBQ0M7QUFDUTtBQUV0QyxNQUFNRyxpQkFBaUJDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZSxJQUFJO0FBQ3RELE1BQU1DLFlBQVlILFFBQVFDLEdBQUcsQ0FBQ0csYUFBYSxJQUFJO0FBRS9DLGlGQUFpRjtBQUUxRSxlQUFlQyxhQUFhQyxRQUFnQjtJQUNqRCxPQUFPVixvREFBVyxDQUFDVSxVQUFVO0FBQy9CO0FBRU8sZUFBZUUsZUFBZUYsUUFBZ0IsRUFBRUMsSUFBWTtJQUNqRSxPQUFPWCx1REFBYyxDQUFDVSxVQUFVQztBQUNsQztBQVdPLFNBQVNHLG1CQUFtQkMsT0FBdUI7SUFDeEQsT0FBT2Qsd0RBQVEsQ0FBQ2MsU0FBU1osZ0JBQWdCO1FBQUVjLFdBQVc7SUFBSztBQUM3RDtBQUVPLFNBQVNDLG1CQUFtQkMsS0FBYTtJQUM5QyxJQUFJO1FBQ0YsT0FBT2xCLDBEQUFVLENBQUNrQixPQUFPaEI7SUFDM0IsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxlQUFla0I7SUFDcEIsTUFBTUMsY0FBY3BCLHFEQUFPQTtJQUMzQixNQUFNaUIsUUFBUUcsWUFBWUMsR0FBRyxDQUFDLFlBQVlDO0lBQzFDLElBQUksQ0FBQ0wsT0FBTyxPQUFPO0lBQ25CLE9BQU9ELG1CQUFtQkM7QUFDNUI7QUFFTyxlQUFlTTtJQUNwQixNQUFNQyxVQUFVLE1BQU1MO0lBQ3RCLElBQUksQ0FBQ0ssU0FBUyxNQUFNLElBQUlDLE1BQU07SUFDOUIsT0FBT0Q7QUFDVDtBQUVPLGVBQWVFO0lBQ3BCLE1BQU1GLFVBQVUsTUFBTUQ7SUFDdEIsSUFBSUMsUUFBUUcsSUFBSSxLQUFLLGVBQWVILFFBQVFHLElBQUksS0FBSyxTQUFTO1FBQzVELE1BQU0sSUFBSUYsTUFBTTtJQUNsQjtJQUNBLE9BQU9EO0FBQ1Q7QUFhTyxTQUFTSSxjQUFjZixPQUFrQjtJQUM5QyxPQUFPZCx3REFBUSxDQUFDYyxTQUFTUjtBQUMzQjtBQUVPLFNBQVN3QixjQUFjWixLQUFhO0lBQ3pDLElBQUk7UUFDRixPQUFPbEIsMERBQVUsQ0FBQ2tCLE9BQU9aO0lBQzNCLEVBQUUsT0FBTTtRQUNOLE9BQU87SUFDVDtBQUNGO0FBRUEsaUZBQWlGO0FBRTFFLFNBQVN5QixlQUFlQyxRQUFnQixFQUFFQyxPQUFlO0lBQzlELE1BQU1DLFNBQVNDLG1CQUFPQSxDQUFDO0lBQ3ZCLE9BQU9ELE9BQ0pFLFVBQVUsQ0FBQyxVQUFVSCxTQUNyQkksTUFBTSxDQUFDTCxTQUFTTSxXQUFXLEdBQUdDLE9BQU8sQ0FBQyxPQUFPLEtBQzdDQyxNQUFNLENBQUM7QUFDWiIsInNvdXJjZXMiOlsid2VicGFjazovL3RpY2tldC1wbGF0Zm9ybS8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnXHJcbmltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJ1xyXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xyXG5cclxuY29uc3QgU0VTU0lPTl9TRUNSRVQgPSBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgfHwgJ2Rldi1zZWNyZXQnXHJcbmNvbnN0IFFSX1NFQ1JFVCA9IHByb2Nlc3MuZW52LlFSX0pXVF9TRUNSRVQgfHwgJ2Rldi1xci1zZWNyZXQnXHJcblxyXG4vLyDilIDilIDilIAgUGFzc3dvcmQgaGVscGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgcmV0dXJuIGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMilcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIHJldHVybiBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgaGFzaClcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNlc3Npb24gdG9rZW4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb25QYXlsb2FkIHtcclxuICB1c2VySWQ6IHN0cmluZ1xyXG4gIGVtYWlsOiBzdHJpbmdcclxuICByb2xlOiBzdHJpbmdcclxuICBuYW1lOiBzdHJpbmdcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25Ub2tlbihwYXlsb2FkOiBTZXNzaW9uUGF5bG9hZCk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGp3dC5zaWduKHBheWxvYWQsIFNFU1NJT05fU0VDUkVULCB7IGV4cGlyZXNJbjogJzdkJyB9KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpOiBTZXNzaW9uUGF5bG9hZCB8IG51bGwge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgU0VTU0lPTl9TRUNSRVQpIGFzIFNlc3Npb25QYXlsb2FkXHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb24oKTogUHJvbWlzZTxTZXNzaW9uUGF5bG9hZCB8IG51bGw+IHtcclxuICBjb25zdCBjb29raWVTdG9yZSA9IGNvb2tpZXMoKVxyXG4gIGNvbnN0IHRva2VuID0gY29va2llU3RvcmUuZ2V0KCdzZXNzaW9uJyk/LnZhbHVlXHJcbiAgaWYgKCF0b2tlbikgcmV0dXJuIG51bGxcclxuICByZXR1cm4gdmVyaWZ5U2Vzc2lvblRva2VuKHRva2VuKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZVNlc3Npb24oKTogUHJvbWlzZTxTZXNzaW9uUGF5bG9hZD4ge1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXNzaW9uKClcclxuICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignVU5BVVRIT1JJWkVEJylcclxuICByZXR1cm4gc2Vzc2lvblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZU9yZ2FuaXplcigpOiBQcm9taXNlPFNlc3Npb25QYXlsb2FkPiB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHJlcXVpcmVTZXNzaW9uKClcclxuICBpZiAoc2Vzc2lvbi5yb2xlICE9PSAnT1JHQU5JWkVSJyAmJiBzZXNzaW9uLnJvbGUgIT09ICdBRE1JTicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignRk9SQklEREVOJylcclxuICB9XHJcbiAgcmV0dXJuIHNlc3Npb25cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFFSIFRva2VuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBRUlBheWxvYWQge1xyXG4gIHRpY2tldElkOiBzdHJpbmdcclxuICBldmVudElkOiBzdHJpbmdcclxuICBhdHRlbmRlZU5hbWU6IHN0cmluZ1xyXG4gIGlkVHlwZTogc3RyaW5nXHJcbiAgaWRMYXN0NDogc3RyaW5nXHJcbiAgaXNzdWVkQXQ6IG51bWJlclxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUVJUb2tlbihwYXlsb2FkOiBRUlBheWxvYWQpOiBzdHJpbmcge1xyXG4gIHJldHVybiBqd3Quc2lnbihwYXlsb2FkLCBRUl9TRUNSRVQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlRUlRva2VuKHRva2VuOiBzdHJpbmcpOiBRUlBheWxvYWQgfCBudWxsIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGp3dC52ZXJpZnkodG9rZW4sIFFSX1NFQ1JFVCkgYXMgUVJQYXlsb2FkXHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIElEIGhhc2hpbmcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGFzaElERm9yRXZlbnQoaWROdW1iZXI6IHN0cmluZywgZXZlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKVxyXG4gIHJldHVybiBjcnlwdG9cclxuICAgIC5jcmVhdGVIbWFjKCdzaGEyNTYnLCBldmVudElkKVxyXG4gICAgLnVwZGF0ZShpZE51bWJlci50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccy9nLCAnJykpXHJcbiAgICAuZGlnZXN0KCdoZXgnKVxyXG59Il0sIm5hbWVzIjpbImJjcnlwdCIsImp3dCIsImNvb2tpZXMiLCJTRVNTSU9OX1NFQ1JFVCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJRUl9TRUNSRVQiLCJRUl9KV1RfU0VDUkVUIiwiaGFzaFBhc3N3b3JkIiwicGFzc3dvcmQiLCJoYXNoIiwidmVyaWZ5UGFzc3dvcmQiLCJjb21wYXJlIiwiY3JlYXRlU2Vzc2lvblRva2VuIiwicGF5bG9hZCIsInNpZ24iLCJleHBpcmVzSW4iLCJ2ZXJpZnlTZXNzaW9uVG9rZW4iLCJ0b2tlbiIsInZlcmlmeSIsImdldFNlc3Npb24iLCJjb29raWVTdG9yZSIsImdldCIsInZhbHVlIiwicmVxdWlyZVNlc3Npb24iLCJzZXNzaW9uIiwiRXJyb3IiLCJyZXF1aXJlT3JnYW5pemVyIiwicm9sZSIsImNyZWF0ZVFSVG9rZW4iLCJ2ZXJpZnlRUlRva2VuIiwiaGFzaElERm9yRXZlbnQiLCJpZE51bWJlciIsImV2ZW50SWQiLCJjcnlwdG8iLCJyZXF1aXJlIiwiY3JlYXRlSG1hYyIsInVwZGF0ZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImRpZ2VzdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"query\",\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFFN0MsTUFBTUMsa0JBQWtCQztBQUlqQixNQUFNQyxTQUNYRixnQkFBZ0JFLE1BQU0sSUFDdEIsSUFBSUgsd0RBQVlBLENBQUM7SUFDZkksS0FBS0MsS0FBeUIsR0FBZ0I7UUFBQztRQUFTO1FBQVM7S0FBTyxHQUFHLENBQVM7QUFDdEYsR0FBRTtBQUVKLElBQUlBLElBQXlCLEVBQWNKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RpY2tldC1wbGF0Zm9ybS8uL3NyYy9saWIvcHJpc21hLnRzPzAxZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXHJcblxyXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xyXG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBwcmlzbWEgPVxyXG4gIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPz9cclxuICBuZXcgUHJpc21hQ2xpZW50KHtcclxuICAgIGxvZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyBbJ3F1ZXJ5JywgJ2Vycm9yJywgJ3dhcm4nXSA6IFsnZXJyb3InXSxcclxuICB9KVxyXG5cclxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWFcclxuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJsb2ciLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time","vendor-chunks/qrcode","vendor-chunks/pngjs","vendor-chunks/dijkstrajs"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&page=%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftickets%2F%5Bid%5D%2Fqr%2Froute.ts&appDir=E%3A%5CProjects%5CTicketing%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=E%3A%5CProjects%5CTicketing&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();