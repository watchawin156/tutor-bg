// @ts-nocheck
interface Env {
    DB: D1Database;
}

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Robust helper to get valid columns for a table to prevent 500 errors on schema mismatch
async function getTableColumns(db: D1Database, tableName: string): Promise<string[]> {
    try {
        const { results } = await db.prepare(`PRAGMA table_info(${tableName})`).all();
        return results.map(r => r.name);
    } catch (e) {
        console.error(`Error fetching schema for ${tableName}:`, e);
        return [];
    }
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const path = params.path ? (params.path as string[]).join('/') : '';

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
    }

    const token = authHeader.split(" ")[1];
    let email: string;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (base64.length % 4)) % 4;
        const paddedBase64 = base64 + '='.repeat(padLength);
        const payload = JSON.parse(atob(paddedBase64));
        email = payload.email;
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid Token format" }), { status: 401, headers: CORS_HEADERS });
    }

    if (!email) {
        return new Response(JSON.stringify({ error: "Missing identity info" }), { status: 401, headers: CORS_HEADERS });
    }

    // Check Approval
    const userRow = await env.DB.prepare("SELECT is_approved FROM users WHERE email = ?").bind(email).first();
    const isAdmin = email === 'watchawin.tha@gmail.com';

    if (!userRow) {
        await env.DB.prepare("INSERT INTO users (email, is_approved) VALUES (?, 0)").bind(email).run();
        return new Response(JSON.stringify({ error: "Waiting for approval", isPending: true }), { status: 403, headers: CORS_HEADERS });
    }

    if (!(userRow as any).is_approved && !isAdmin) {
        return new Response(JSON.stringify({ error: "Account not approved", isPending: true }), { status: 403, headers: CORS_HEADERS });
    }

    // --- API ROUTES ---
    if (path.startsWith("users") && isAdmin) {
        if (request.method === "GET") {
            const users = await env.DB.prepare("SELECT * FROM users").all();
            return new Response(JSON.stringify({ users: users.results }), { headers: CORS_HEADERS });
        }
        if (request.method === "POST") {
            const body = await request.json() as any;
            await env.DB.prepare("UPDATE users SET is_approved = 1 WHERE email = ?").bind(body.email).run();
            return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
        }
    }

    if (request.method === "GET" && path === "init") {
        try {
            const tables = ['students', 'teachers', 'rooms', 'courses', 'enrollments', 'schedules', 'payments', 'expenses', 'teacherRatios', 'attendances'];
            const queries = tables.map(t => env.DB.prepare(`SELECT * FROM ${t}`).all());
            const results = await Promise.all(queries);

            const data = {};
            tables.forEach((t, i) => {
                data[t] = results[i].results || [];
            });

            // Special handling for ratios to match frontend expectation
            if (data.teacherRatios) {
                data.teacherRatios = data.teacherRatios.reduce((acc, curr) => ({ ...acc, [curr.teacherName]: curr.ratio }), {});
            }

            return new Response(JSON.stringify(data), { headers: CORS_HEADERS });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
        }
    }

    if (request.method === "POST" && path === "save") {
        try {
            const body = await request.json() as any;
            const { table, data, action } = body;

            // Whitelist tables for security
            const allowedTables = ['students', 'teachers', 'rooms', 'courses', 'enrollments', 'schedules', 'payments', 'expenses', 'teacherRatios', 'attendances'];
            if (!allowedTables.includes(table)) {
                return new Response(JSON.stringify({ error: "Invalid table name" }), { status: 400, headers: CORS_HEADERS });
            }

            if (action === "delete") {
                await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(data.id).run();
                return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
            }

            // --- ROBUST SAVING LOGIC (The "New Method") ---
            // 1. Get real columns from D1
            const validColumns = await getTableColumns(env.DB, table);
            if (validColumns.length === 0) throw new Error(`Could not verify schema for table ${table}`);

            // 2. Filter data to only include existing columns (ignore extra React fields)
            const cleanData = {};
            for (const col of validColumns) {
                if (data[col] !== undefined && col !== 'user_id') {
                    cleanData[col] = data[col];
                }
            }

            // 3. Handle primary key 'id'
            const existingId = cleanData.id;
            const isUpdate = !!existingId;

            if (isUpdate) {
                const updateKeys = Object.keys(cleanData).filter(k => k !== 'id');
                const setClause = updateKeys.map(k => `${k} = ?`).join(', ');
                const values = updateKeys.map(k => cleanData[k]);

                await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
                    .bind(...values, existingId)
                    .run();

                return new Response(JSON.stringify({ success: true, id: existingId }), { headers: CORS_HEADERS });
            } else {
                // Insert
                const insertKeys = Object.keys(cleanData).filter(k => k !== 'id');
                const placeholders = insertKeys.map(() => '?').join(', ');
                const values = insertKeys.map(k => cleanData[k]);

                const result = await env.DB.prepare(`INSERT INTO ${table} (${insertKeys.join(', ')}) VALUES (${placeholders}) RETURNING id`)
                    .bind(...values)
                    .first();

                return new Response(JSON.stringify({ success: true, id: (result as any)?.id }), { headers: CORS_HEADERS });
            }
        } catch (e: any) {
            console.error("Save Error:", e);
            return new Response(JSON.stringify({
                error: e.message || String(e),
                details: e.cause?.message || "SQL operation failed"
            }), { status: 500, headers: CORS_HEADERS });
        }
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
};
