module.exports = {

"[project]/AI-Workspace/employee-identity-portal/.next-internal/server/app/api/pf/oidc/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/AI-Workspace/employee-identity-portal/src/app/api/pf/oidc/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
async function GET() {
    // Mocked list of OIDC connections created by the employee in Ping Federate
    const data = [
        {
            connectionId: "oidc-salesforce",
            application: "Salesforce",
            clientId: "sf_123_client",
            redirectUris: [
                "https://app.salesforce.com/callback"
            ],
            grantTypes: [
                "authorization_code",
                "refresh_token"
            ],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active"
        },
        {
            connectionId: "oidc-slack",
            application: "Slack",
            clientId: "slk_456_client",
            redirectUris: [
                "https://slack.com/callback"
            ],
            grantTypes: [
                "authorization_code"
            ],
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active"
        },
        {
            connectionId: "oidc-internal-portal",
            application: "Internal Portal",
            clientId: "int_789_client",
            redirectUris: [
                "https://portal.company.com/oidc/cb"
            ],
            grantTypes: [
                "authorization_code",
                "client_credentials"
            ],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "disabled"
        }
    ];
    // Only return the 5 most important values per connection in a flattened shape
    const summarized = data.map((c)=>({
            connectionId: c.connectionId,
            application: c.application,
            clientId: c.clientId,
            status: c.status,
            createdAt: c.createdAt
        }));
    return Response.json({
        ok: true,
        data: summarized
    });
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__f61454dc._.js.map