import { a as pickPairs, i as pickOpponentForCore, r as pairKey, t as WEIGHT_PRESETS } from "./matching-DtfUiZax.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/persist.server-8760gIzF.js
var _0002_yupai_default = "-- 羽排 same-day singles rotation board\ncreate table if not exists yupai_sessions (\n  id text primary key,\n  code text not null unique,\n  host_token text not null,\n  venue_name text not null,\n  session_date date not null,\n  start_time text not null,\n  end_time text not null,\n  court_count integer not null default 4,\n  match_duration_min integer not null default 12,\n  consecutive_limit integer not null default 2,\n  force_rest_after_match boolean not null default true,\n  ban_recent_opponent boolean not null default false,\n  scoring_enabled boolean not null default false,\n  weight_wait integer not null default 4,\n  weight_plays integer not null default 4,\n  weight_rematch integer not null default 3,\n  weight_skill integer not null default 1,\n  weight_preset text not null default 'fair',\n  status text not null default 'active',\n  controller_device_id text,\n  transfer_pin text,\n  transfer_pin_expires_at timestamptz,\n  version integer not null default 1,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists yupai_players (\n  id text primary key,\n  session_id text not null references yupai_sessions(id) on delete cascade,\n  nickname text not null,\n  skill integer not null default 3,\n  is_drop_in boolean not null default false,\n  status text not null default 'not_arrived',\n  locked boolean not null default false,\n  court_no integer,\n  consecutive_played integer not null default 0,\n  play_count integer not null default 0,\n  bye_count integer not null default 0,\n  wait_total_sec integer not null default 0,\n  play_total_sec integer not null default 0,\n  last_wait_start timestamptz,\n  last_opponent_id text,\n  sort_order integer not null default 0,\n  created_at timestamptz not null default now()\n);\n\ncreate unique index if not exists yupai_players_nickname_idx\n  on yupai_players (session_id, nickname);\n\ncreate index if not exists yupai_players_session_idx on yupai_players (session_id);\n\ncreate table if not exists yupai_restrictions (\n  id text primary key,\n  session_id text not null references yupai_sessions(id) on delete cascade,\n  kind text not null,\n  player_a_id text not null,\n  player_b_id text not null,\n  used boolean not null default false,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists yupai_restrictions_session_idx\n  on yupai_restrictions (session_id);\n\ncreate table if not exists yupai_matches (\n  id text primary key,\n  session_id text not null references yupai_sessions(id) on delete cascade,\n  court_no integer not null,\n  player_a_id text not null,\n  player_b_id text not null,\n  started_at timestamptz,\n  ended_at timestamptz,\n  source text not null default 'manual',\n  status text not null default 'live',\n  winner_id text,\n  score_a integer,\n  score_b integer,\n  duration_min integer not null,\n  extended_sec integer not null default 0,\n  pause_accumulated_ms integer not null default 0,\n  paused_at timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists yupai_matches_session_idx on yupai_matches (session_id);\n\ncreate table if not exists yupai_ops (\n  id text primary key,\n  session_id text not null references yupai_sessions(id) on delete cascade,\n  action text not null,\n  before_json jsonb not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists yupai_ops_session_idx\n  on yupai_ops (session_id, created_at desc);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_yupai.sql": _0002_yupai_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var CODE_ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newId() {
	return crypto.randomUUID();
}
function sessionCode(len = 6) {
	const bytes = crypto.getRandomValues(new Uint8Array(len));
	let out = "";
	for (const b of bytes) out += CODE_ALPH[b % 32];
	return out;
}
function hostToken() {
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(18));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function transferPin() {
	return (crypto.getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0] % 1e4).toString().padStart(4, "0");
}
function cloneState(state) {
	return structuredClone(state);
}
function iso(now) {
	return new Date(now).toISOString();
}
function player(state, id) {
	const p = state.players.find((x) => x.id === id);
	if (!p) throw new Error("找不到這位球員");
	return p;
}
function liveMatchOnCourt(state, courtNo) {
	return state.matches.find((m) => m.status === "live" && m.courtNo === courtNo);
}
function occupants(state, courtNo, status) {
	return state.players.filter((p) => p.status === status && p.courtNo === courtNo);
}
function closeWait(p, now) {
	if (p.lastWaitStart) {
		p.waitTotalSec += Math.max(0, Math.round((now - Date.parse(p.lastWaitStart)) / 1e3));
		p.lastWaitStart = null;
	}
}
function startWait(p, now) {
	if (!p.lastWaitStart) p.lastWaitStart = iso(now);
}
function waitMs(p, now) {
	if (!p.lastWaitStart) return p.waitTotalSec * 1e3;
	return p.waitTotalSec * 1e3 + Math.max(0, now - Date.parse(p.lastWaitStart));
}
function nicknameTaken(state, nickname, exceptId) {
	const n = nickname.trim();
	return state.players.some((p) => p.nickname === n && p.id !== exceptId);
}
function meetingsMap(state) {
	const map = /* @__PURE__ */ new Map();
	for (const m of state.matches) {
		if (m.status !== "completed") continue;
		const k = pairKey(m.playerAId, m.playerBId);
		map.set(k, (map.get(k) ?? 0) + 1);
	}
	return map;
}
function lastOpponentsMap(state) {
	const map = /* @__PURE__ */ new Map();
	const done = state.matches.filter((m) => m.status === "completed" && m.endedAt).sort((a, b) => (a.endedAt ?? "").localeCompare(b.endedAt ?? ""));
	for (const m of done) {
		const push = (id, opp) => {
			const arr = map.get(id) ?? [];
			arr.push(opp);
			map.set(id, arr.slice(-2));
		};
		push(m.playerAId, m.playerBId);
		push(m.playerBId, m.playerAId);
	}
	return map;
}
function candidates(state, now) {
	return state.players.filter((p) => p.status === "rest" && !p.locked).map((p) => ({
		id: p.id,
		waitMs: waitMs(p, now),
		playCount: p.playCount,
		skill: p.skill
	}));
}
function preferredOpen(state) {
	return state.restrictions.filter((r) => r.kind === "preferred" && !r.used).map((r) => ({
		id: r.id,
		a: r.playerAId,
		b: r.playerBId
	}));
}
function blacklistSet(state) {
	const set = /* @__PURE__ */ new Set();
	for (const r of state.restrictions) if (r.kind === "blacklist") set.add(pairKey(r.playerAId, r.playerBId));
	return set;
}
function pairingInput(state, slotCount, now) {
	return {
		candidates: candidates(state, now),
		slotCount,
		meetings: meetingsMap(state),
		lastOpponents: lastOpponentsMap(state),
		blacklist: blacklistSet(state),
		preferred: preferredOpen(state),
		weights: state.session.weights,
		banRecent: state.session.banRecentOpponent
	};
}
function cancelLive(state, courtNo, now) {
	const match = liveMatchOnCourt(state, courtNo);
	if (!match) return;
	match.status = "cancelled";
	match.endedAt = iso(now);
}
function startMatch(state, courtNo, aId, bId, source, now) {
	cancelLive(state, courtNo, now);
	const a = player(state, aId);
	const b = player(state, bId);
	closeWait(a, now);
	closeWait(b, now);
	a.status = "on_court";
	b.status = "on_court";
	a.courtNo = courtNo;
	b.courtNo = courtNo;
	a.locked = false;
	b.locked = false;
	state.matches.push({
		id: newId(),
		courtNo,
		playerAId: aId,
		playerBId: bId,
		startedAt: iso(now),
		endedAt: null,
		source,
		status: "live",
		winnerId: null,
		scoreA: null,
		scoreB: null,
		durationMin: state.session.matchDurationMin,
		extendedSec: 0,
		pauseAccumulatedMs: 0,
		pausedAt: null
	});
}
function assignQueue(state, courtNo, aId, bId) {
	const a = player(state, aId);
	const b = player(state, bId);
	a.status = "queued";
	b.status = "queued";
	a.courtNo = courtNo;
	b.courtNo = courtNo;
}
function sendToRest(p, now) {
	p.status = "rest";
	p.courtNo = null;
	startWait(p, now);
}
function markUsedPreferred(state, ids) {
	for (const id of ids) {
		const r = state.restrictions.find((x) => x.id === id);
		if (r) r.used = true;
	}
}
function convertForceRest(state, now) {
	for (const p of state.players) {
		if (p.status !== "force_rest") continue;
		p.status = "rest";
		p.consecutivePlayed = 0;
		startWait(p, now);
	}
}
function applyBye(state, byeId) {
	if (!byeId) return;
	const p = state.players.find((x) => x.id === byeId);
	if (p) p.byeCount += 1;
}
function emptyCourts(state) {
	const out = [];
	for (let n = 1; n <= state.session.courtCount; n++) if (occupants(state, n, "on_court").length === 0) out.push(n);
	return out;
}
function emptyQueueSlots(state) {
	const out = [];
	for (let n = 1; n <= state.session.courtCount; n++) if (occupants(state, n, "queued").length === 0) out.push(n);
	return out;
}
function fillOneSeatCourts(state, now) {
	const warnings = [];
	for (let n = 1; n <= state.session.courtCount; n++) {
		const on = occupants(state, n, "on_court");
		if (on.length !== 1) continue;
		const core = on[0];
		const oppId = pickOpponentForCore(core.id, {
			candidates: [{
				id: core.id,
				waitMs: waitMs(core, now),
				playCount: core.playCount,
				skill: core.skill
			}, ...candidates(state, now)],
			meetings: meetingsMap(state),
			lastOpponents: lastOpponentsMap(state),
			blacklist: blacklistSet(state),
			weights: state.session.weights,
			banRecent: state.session.banRecentOpponent
		});
		if (!oppId) {
			warnings.push(`第 ${n} 場人數不足`);
			continue;
		}
		startMatch(state, n, core.id, oppId, "auto", now);
	}
	return warnings[0];
}
function fillNext(state, now) {
	const seatWarn = fillOneSeatCourts(state, now);
	const courts = emptyCourts(state);
	const queues = emptyQueueSlots(state);
	const slots = [...courts.map((no) => ({
		kind: "court",
		no
	})), ...queues.map((no) => ({
		kind: "queue",
		no
	}))];
	if (slots.length === 0) {
		convertForceRest(state, now);
		return { message: "沒有空場或空的下一場槽" };
	}
	const result = pickPairs(pairingInput(state, slots.length, now));
	if (result.failReason) {
		convertForceRest(state, now);
		return { warning: result.failReason };
	}
	for (let i = 0; i < result.pairs.length; i++) {
		const pair = result.pairs[i];
		const slot = slots[i];
		if (slot.kind === "court") startMatch(state, slot.no, pair.a, pair.b, "auto", now);
		else assignQueue(state, slot.no, pair.a, pair.b);
	}
	markUsedPreferred(state, result.usedPreferredIds);
	applyBye(state, result.byeId);
	convertForceRest(state, now);
	const warning = result.warning ?? seatWarn;
	return {
		message: `排出 ${result.pairs.length} 組`,
		warning
	};
}
function releaseFromCourt(state, p, now) {
	const courtNo = p.courtNo;
	if (courtNo != null) cancelLive(state, courtNo, now);
	sendToRest(p, now);
}
function releaseFromQueue(state, p, now) {
	const courtNo = p.courtNo;
	const partner = courtNo != null ? occupants(state, courtNo, "queued").find((x) => x.id !== p.id) : void 0;
	sendToRest(p, now);
	if (partner) sendToRest(partner, now);
}
function detach(state, ids, now) {
	for (const id of ids) {
		const p = player(state, id);
		if (p.status === "on_court") releaseFromCourt(state, p, now);
		else if (p.status === "queued") releaseFromQueue(state, p, now);
		else if (p.status === "left" || p.status === "not_arrived") {
			p.status = "rest";
			p.courtNo = null;
			startWait(p, now);
		} else {
			p.courtNo = null;
			if (p.status === "force_rest") {} else p.status = "rest";
			startWait(p, now);
		}
	}
}
function moveToRest(state, ids, now) {
	detach(state, ids, now);
	for (const id of ids) sendToRest(player(state, id), now);
}
function moveToCourt(state, ids, courtNo, replacePlayerId, now) {
	if (courtNo < 1 || courtNo > state.session.courtCount) throw new Error("場號不存在");
	const on = occupants(state, courtNo, "on_court");
	const incoming = ids.map((id) => player(state, id));
	if (incoming.length === 2 && on.length === 2) {
		for (const p of on) sendToRest(p, now);
		cancelLive(state, courtNo, now);
		detach(state, ids, now);
		startMatch(state, courtNo, incoming[0].id, incoming[1].id, "manual", now);
		return;
	}
	if (incoming.length === 2 && on.length === 0) {
		detach(state, ids, now);
		startMatch(state, courtNo, incoming[0].id, incoming[1].id, "manual", now);
		return;
	}
	if (incoming.length === 2 && on.length === 1) throw new Error("場上已有 1 人，請先拖單人補位或清場");
	const one = incoming[0];
	if (on.length >= 2) {
		if (!replacePlayerId) throw new Error("場上已有 2 人，請先指定要換下的人");
		const out = on.find((p) => p.id === replacePlayerId);
		if (!out) throw new Error("找不到要換下的人");
		detach(state, [one.id], now);
		sendToRest(out, now);
		cancelLive(state, courtNo, now);
		startMatch(state, courtNo, on.find((p) => p.id !== replacePlayerId).id, one.id, "manual", now);
		return;
	}
	if (on.length === 1) {
		const stay = on[0];
		if (stay.id === one.id) return;
		detach(state, [one.id], now);
		startMatch(state, courtNo, stay.id, one.id, "manual", now);
		return;
	}
	detach(state, [one.id], now);
	one.status = "on_court";
	one.courtNo = courtNo;
	closeWait(one, now);
}
function moveToQueue(state, ids, courtNo, replacePlayerId, now) {
	if (courtNo < 1 || courtNo > state.session.courtCount) throw new Error("場號不存在");
	const queued = occupants(state, courtNo, "queued");
	const incoming = ids.map((id) => player(state, id));
	if (incoming.length === 2) {
		for (const p of queued) sendToRest(p, now);
		detach(state, ids, now);
		assignQueue(state, courtNo, incoming[0].id, incoming[1].id);
		return;
	}
	const one = incoming[0];
	if (queued.length >= 2) {
		if (!replacePlayerId) throw new Error("下一場已有 2 人，請先指定要換下的人");
		const out = queued.find((p) => p.id === replacePlayerId);
		if (!out) throw new Error("找不到要換下的人");
		detach(state, [one.id], now);
		sendToRest(out, now);
		assignQueue(state, courtNo, queued.find((p) => p.id !== replacePlayerId).id, one.id);
		return;
	}
	if (queued.length === 1) {
		const stay = queued[0];
		if (stay.id === one.id) return;
		detach(state, [one.id], now);
		assignQueue(state, courtNo, stay.id, one.id);
		return;
	}
	detach(state, [one.id], now);
	one.status = "queued";
	one.courtNo = courtNo;
}
function applyMove(state, playerIds, dest, now) {
	const ids = [...new Set(playerIds)];
	if (ids.length === 0) throw new Error("沒有要移動的人");
	if (dest.zone === "rest") {
		moveToRest(state, ids, now);
		return;
	}
	if (dest.zone === "court") {
		moveToCourt(state, ids, dest.courtNo, dest.replacePlayerId, now);
		return;
	}
	moveToQueue(state, ids, dest.courtNo, dest.replacePlayerId, now);
}
function promoteCourt(state, courtNo, now) {
	const queued = occupants(state, courtNo, "queued");
	if (queued.length === 2) {
		startMatch(state, courtNo, queued[0].id, queued[1].id, "auto", now);
		return;
	}
	if (queued.length === 1) return `第 ${courtNo} 場下一組只有 1 人，無法開打`;
	const result = pickPairs(pairingInput(state, 1, now));
	if (result.failReason) return result.failReason;
	const pair = result.pairs[0];
	if (!pair) return "人數不足";
	startMatch(state, courtNo, pair.a, pair.b, "auto", now);
	markUsedPreferred(state, result.usedPreferredIds);
	applyBye(state, result.byeId);
}
function finishMatch(state, courtNo, now, winnerId, scoreA, scoreB) {
	const match = liveMatchOnCourt(state, courtNo);
	if (!match) throw new Error("這面場沒有進行中的單打");
	const a = player(state, match.playerAId);
	const b = player(state, match.playerBId);
	const started = match.startedAt ? Date.parse(match.startedAt) : now;
	const pausedNow = match.pausedAt ? now - Date.parse(match.pausedAt) : 0;
	const elapsed = Math.max(0, Math.round((now - started - match.pauseAccumulatedMs - pausedNow) / 1e3));
	match.status = "completed";
	match.endedAt = iso(now);
	match.pausedAt = null;
	if (winnerId) match.winnerId = winnerId;
	if (scoreA != null) match.scoreA = scoreA;
	if (scoreB != null) match.scoreB = scoreB;
	const finishPlayer = (p, oppId) => {
		p.playCount += 1;
		p.playTotalSec += elapsed;
		p.consecutivePlayed += 1;
		p.lastOpponentId = oppId;
		p.courtNo = null;
		p.status = state.session.forceRestAfterMatch || p.consecutivePlayed >= state.session.consecutiveLimit ? "force_rest" : "rest";
		startWait(p, now);
	};
	finishPlayer(a, b.id);
	finishPlayer(b, a.id);
	return promoteCourt(state, courtNo, now);
}
function addPlayer(state, nickname, skill, isDropIn, now) {
	const name = nickname.trim();
	if (!name) throw new Error("請輸入暱稱");
	if (nicknameTaken(state, name)) throw new Error("同一場次暱稱不可重複");
	const sk = Math.min(5, Math.max(1, Math.round(skill || 3)));
	state.players.push({
		id: newId(),
		nickname: name,
		skill: sk,
		isDropIn,
		status: "not_arrived",
		locked: false,
		courtNo: null,
		consecutivePlayed: 0,
		playCount: 0,
		byeCount: 0,
		waitTotalSec: 0,
		playTotalSec: 0,
		lastWaitStart: null,
		lastOpponentId: null,
		sortOrder: state.players.length
	});
}
function setStatus(state, playerId, status, now) {
	const p = player(state, playerId);
	if (p.status === "on_court" && status !== "on_court") releaseFromCourt(state, p, now);
	if (p.status === "queued" && status !== "queued") releaseFromQueue(state, p, now);
	p.status = status;
	if (status === "left" || status === "not_arrived") {
		p.courtNo = null;
		p.locked = false;
		p.lastWaitStart = null;
	} else if (status === "rest" || status === "force_rest") {
		p.courtNo = null;
		startWait(p, now);
	}
}
function assertWritable(state) {
	if (state.session.status === "ended") throw new Error("場次已結束，目前只讀");
}
function applyAction(state, action, now = Date.now()) {
	try {
		const next = cloneState(state);
		if (action.type !== "reopenSession") assertWritable(next);
		switch (action.type) {
			case "addPlayer":
				addPlayer(next, action.nickname, action.skill, action.isDropIn ?? false, now);
				return {
					state: next,
					message: `已加入 ${action.nickname.trim()}`
				};
			case "renamePlayer": {
				const name = action.nickname.trim();
				if (!name) throw new Error("請輸入暱稱");
				if (nicknameTaken(next, name, action.playerId)) throw new Error("同一場次暱稱不可重複");
				player(next, action.playerId).nickname = name;
				return { state: next };
			}
			case "removePlayer": {
				const p = player(next, action.playerId);
				if (p.status === "on_court") releaseFromCourt(next, p, now);
				if (p.status === "queued") releaseFromQueue(next, p, now);
				next.players = next.players.filter((x) => x.id !== p.id);
				next.restrictions = next.restrictions.filter((r) => r.playerAId !== p.id && r.playerBId !== p.id);
				return {
					state: next,
					message: `已刪除 ${p.nickname}`
				};
			}
			case "setStatus":
				setStatus(next, action.playerId, action.status, now);
				return { state: next };
			case "setLocked":
				player(next, action.playerId).locked = action.locked;
				return { state: next };
			case "setSkill":
				player(next, action.playerId).skill = Math.min(5, Math.max(1, action.skill));
				return { state: next };
			case "importPlayers": {
				let added = 0;
				for (const row of action.rows) {
					if (!row.nickname.trim()) continue;
					if (nicknameTaken(next, row.nickname.trim())) continue;
					addPlayer(next, row.nickname, row.skill, row.isDropIn, now);
					added += 1;
				}
				return {
					state: next,
					message: `匯入 ${added} 人`
				};
			}
			case "checkInAll": {
				let n = 0;
				for (const p of next.players) {
					if (p.status !== "not_arrived") continue;
					p.status = "rest";
					startWait(p, now);
					n += 1;
				}
				return {
					state: next,
					message: n ? `已簽到 ${n} 人` : "沒有未到球員"
				};
			}
			case "addRestriction":
				if (action.playerAId === action.playerBId) throw new Error("請選兩位不同的球員");
				player(next, action.playerAId);
				player(next, action.playerBId);
				next.restrictions.push({
					id: newId(),
					kind: action.kind,
					playerAId: action.playerAId,
					playerBId: action.playerBId,
					used: false
				});
				return {
					state: next,
					message: action.kind === "preferred" ? "已指定對戰" : "已加入黑名單"
				};
			case "removeRestriction":
				next.restrictions = next.restrictions.filter((r) => r.id !== action.id);
				return { state: next };
			case "fillNext": return {
				state: next,
				...fillNext(next, now)
			};
			case "reshuffleNext": {
				for (const p of next.players) if (p.status === "queued") sendToRest(p, now);
				const out = fillNext(next, now);
				return {
					state: next,
					message: out.message ?? "已重排下一場",
					warning: out.warning
				};
			}
			case "endMatch": {
				const warn = finishMatch(next, action.courtNo, now, action.winnerId, action.scoreA, action.scoreB);
				return {
					state: next,
					message: `第 ${action.courtNo} 場下場`,
					warning: warn
				};
			}
			case "pauseMatch": {
				const m = liveMatchOnCourt(next, action.courtNo);
				if (!m) throw new Error("這面場沒有進行中的單打");
				if (m.pausedAt) return { state: next };
				m.pausedAt = iso(now);
				return { state: next };
			}
			case "resumeMatch": {
				const m = liveMatchOnCourt(next, action.courtNo);
				if (!m) throw new Error("這面場沒有進行中的單打");
				if (!m.pausedAt) return { state: next };
				m.pauseAccumulatedMs += Math.max(0, now - Date.parse(m.pausedAt));
				m.pausedAt = null;
				return { state: next };
			}
			case "extendMatch": {
				const m = liveMatchOnCourt(next, action.courtNo);
				if (!m) throw new Error("這面場沒有進行中的單打");
				m.extendedSec += action.extraSec;
				return {
					state: next,
					message: `第 ${action.courtNo} 場延長 ${Math.round(action.extraSec / 60)} 分`
				};
			}
			case "move":
				applyMove(next, action.playerIds, action.dest, now);
				return { state: next };
			case "updateSettings": {
				const s = {
					...next.session,
					...action.patch
				};
				if (action.patch.courtCount) s.courtCount = Math.min(6, Math.max(1, action.patch.courtCount));
				if (action.patch.weights) s.weights = { ...action.patch.weights };
				next.session = s;
				for (const p of next.players) if (p.courtNo != null && p.courtNo > s.courtCount && (p.status === "on_court" || p.status === "queued")) sendToRest(p, now);
				return {
					state: next,
					message: "已更新場次設定"
				};
			}
			case "endSession":
				for (const m of next.matches) if (m.status === "live") {
					m.status = "cancelled";
					m.endedAt = iso(now);
				}
				next.session.status = "ended";
				return {
					state: next,
					message: "場次已結束"
				};
			case "reopenSession":
				next.session.status = "active";
				return {
					state: next,
					message: "已重開當日看板"
				};
			default: return { error: `未知操作: ${JSON.stringify(action)}` };
		}
	} catch (err) {
		return { error: err instanceof Error ? err.message : "操作失敗" };
	}
}
function snapshotOf(state) {
	return cloneState(state);
}
var NAMES = [
	{
		nickname: "阿明",
		skill: 3
	},
	{
		nickname: "小美",
		skill: 4
	},
	{
		nickname: "志偉",
		skill: 3
	},
	{
		nickname: "佳玲",
		skill: 5
	},
	{
		nickname: "阿豪",
		skill: 4
	},
	{
		nickname: "小芬",
		skill: 2
	},
	{
		nickname: "建宏",
		skill: 3
	},
	{
		nickname: "雅婷",
		skill: 4
	},
	{
		nickname: "冠宇",
		skill: 5
	},
	{
		nickname: "怡君",
		skill: 3
	},
	{
		nickname: "宗憲",
		skill: 2
	},
	{
		nickname: "佩珊",
		skill: 4
	},
	{
		nickname: "小傑",
		skill: 3
	}
];
function p(nick, skill, patch) {
	return {
		id: newId(),
		nickname: nick,
		skill,
		isDropIn: false,
		status: "rest",
		locked: false,
		courtNo: null,
		consecutivePlayed: 0,
		playCount: 0,
		byeCount: 0,
		waitTotalSec: 0,
		playTotalSec: 0,
		lastWaitStart: null,
		lastOpponentId: null,
		sortOrder: 0,
		...patch
	};
}
function buildDemoState(session, now) {
	const iso = (ms) => new Date(ms).toISOString();
	const players = NAMES.map((n, i) => p(n.nickname, n.skill, {
		sortOrder: i,
		lastWaitStart: iso(now - (18 - i) * 6e4),
		waitTotalSec: (18 - i) * 40
	}));
	const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] = players;
	a0.status = "on_court";
	a0.courtNo = 1;
	a0.lastWaitStart = null;
	a0.playCount = 1;
	a1.status = "on_court";
	a1.courtNo = 1;
	a1.lastWaitStart = null;
	a1.playCount = 1;
	a2.status = "on_court";
	a2.courtNo = 2;
	a2.lastWaitStart = null;
	a2.playCount = 2;
	a2.consecutivePlayed = 1;
	a3.status = "on_court";
	a3.courtNo = 2;
	a3.lastWaitStart = null;
	a3.playCount = 2;
	a3.consecutivePlayed = 1;
	a4.status = "queued";
	a4.courtNo = 1;
	a5.status = "queued";
	a5.courtNo = 1;
	a6.status = "force_rest";
	a6.consecutivePlayed = 2;
	a6.playCount = 2;
	a6.lastOpponentId = a7.id;
	a11.status = "not_arrived";
	a11.lastWaitStart = null;
	a11.isDropIn = true;
	a12.status = "rest";
	a12.locked = false;
	return {
		session: {
			...session,
			venueName: session.venueName || "鄰里羽球場",
			courtCount: 4,
			matchDurationMin: 12,
			consecutiveLimit: 2,
			forceRestAfterMatch: true,
			weights: { ...WEIGHT_PRESETS.fair },
			weightPreset: "fair"
		},
		players,
		restrictions: [{
			id: newId(),
			kind: "blacklist",
			playerAId: a8.id,
			playerBId: a9.id,
			used: false
		}, {
			id: newId(),
			kind: "preferred",
			playerAId: a9.id,
			playerBId: a10.id,
			used: false
		}],
		matches: [
			{
				id: newId(),
				courtNo: 1,
				playerAId: a0.id,
				playerBId: a1.id,
				startedAt: iso(now - 18e4),
				endedAt: null,
				source: "auto",
				status: "live",
				winnerId: null,
				scoreA: null,
				scoreB: null,
				durationMin: 12,
				extendedSec: 0,
				pauseAccumulatedMs: 0,
				pausedAt: null
			},
			{
				id: newId(),
				courtNo: 2,
				playerAId: a2.id,
				playerBId: a3.id,
				startedAt: iso(now - 66e4),
				endedAt: null,
				source: "manual",
				status: "live",
				winnerId: null,
				scoreA: null,
				scoreB: null,
				durationMin: 12,
				extendedSec: 0,
				pauseAccumulatedMs: 0,
				pausedAt: null
			},
			{
				id: newId(),
				courtNo: 3,
				playerAId: a6.id,
				playerBId: a7.id,
				startedAt: iso(now - 15e5),
				endedAt: iso(now - 78e4),
				source: "auto",
				status: "completed",
				winnerId: a6.id,
				scoreA: null,
				scoreB: null,
				durationMin: 12,
				extendedSec: 0,
				pauseAccumulatedMs: 0,
				pausedAt: null
			}
		]
	};
}
function asBool(v) {
	return v === true || v === "t" || v === "true";
}
function asInt(v, fallback = 0) {
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
}
function asIso(v) {
	if (v == null || v === "") return null;
	if (v instanceof Date) return v.toISOString();
	return String(v);
}
function asText(v) {
	return v == null ? "" : String(v);
}
function weightsFromRow(row) {
	return {
		wait: asInt(row.weight_wait, 4),
		plays: asInt(row.weight_plays, 4),
		rematch: asInt(row.weight_rematch, 3),
		skill: asInt(row.weight_skill, 1)
	};
}
function sessionFromRow(row) {
	const preset = asText(row.weight_preset);
	return {
		id: asText(row.id),
		code: asText(row.code),
		venueName: asText(row.venue_name),
		sessionDate: asText(row.session_date).slice(0, 10),
		startTime: asText(row.start_time),
		endTime: asText(row.end_time),
		courtCount: asInt(row.court_count, 4),
		matchDurationMin: asInt(row.match_duration_min, 12),
		consecutiveLimit: asInt(row.consecutive_limit, 2),
		forceRestAfterMatch: asBool(row.force_rest_after_match),
		banRecentOpponent: asBool(row.ban_recent_opponent),
		scoringEnabled: asBool(row.scoring_enabled),
		weights: weightsFromRow(row),
		weightPreset: preset === "intensity" || preset === "custom" ? preset : "fair",
		status: asText(row.status) === "ended" ? "ended" : "active",
		controllerDeviceId: row.controller_device_id ? asText(row.controller_device_id) : null,
		transferPin: row.transfer_pin ? asText(row.transfer_pin) : null,
		transferPinExpiresAt: asIso(row.transfer_pin_expires_at),
		version: asInt(row.version, 1)
	};
}
function playerFromRow(row) {
	return {
		id: asText(row.id),
		nickname: asText(row.nickname),
		skill: asInt(row.skill, 3),
		isDropIn: asBool(row.is_drop_in),
		status: asText(row.status),
		locked: asBool(row.locked),
		courtNo: row.court_no == null ? null : asInt(row.court_no),
		consecutivePlayed: asInt(row.consecutive_played),
		playCount: asInt(row.play_count),
		byeCount: asInt(row.bye_count),
		waitTotalSec: asInt(row.wait_total_sec),
		playTotalSec: asInt(row.play_total_sec),
		lastWaitStart: asIso(row.last_wait_start),
		lastOpponentId: row.last_opponent_id ? asText(row.last_opponent_id) : null,
		sortOrder: asInt(row.sort_order)
	};
}
function restrictionFromRow(row) {
	return {
		id: asText(row.id),
		kind: asText(row.kind) === "preferred" ? "preferred" : "blacklist",
		playerAId: asText(row.player_a_id),
		playerBId: asText(row.player_b_id),
		used: asBool(row.used)
	};
}
function matchFromRow(row) {
	const status = asText(row.status);
	return {
		id: asText(row.id),
		courtNo: asInt(row.court_no),
		playerAId: asText(row.player_a_id),
		playerBId: asText(row.player_b_id),
		startedAt: asIso(row.started_at),
		endedAt: asIso(row.ended_at),
		source: asText(row.source) === "auto" ? "auto" : "manual",
		status: status === "completed" || status === "cancelled" ? status : "live",
		winnerId: row.winner_id ? asText(row.winner_id) : null,
		scoreA: row.score_a == null ? null : asInt(row.score_a),
		scoreB: row.score_b == null ? null : asInt(row.score_b),
		durationMin: asInt(row.duration_min, 12),
		extendedSec: asInt(row.extended_sec),
		pauseAccumulatedMs: asInt(row.pause_accumulated_ms),
		pausedAt: asIso(row.paused_at)
	};
}
async function loadRow(sql, code) {
	return (await sql.query("select * from yupai_sessions where code = $1", [code.trim().toUpperCase()]))[0] ?? null;
}
async function loadState(code) {
	const sql = await getSql();
	const row = await loadRow(sql, code);
	if (!row) return null;
	const sessionId = asText(row.id);
	const [players, restrictions, matches, ops] = await Promise.all([
		sql.query("select * from yupai_players where session_id = $1 order by sort_order, created_at", [sessionId]),
		sql.query("select * from yupai_restrictions where session_id = $1", [sessionId]),
		sql.query("select * from yupai_matches where session_id = $1 order by created_at", [sessionId]),
		sql.query("select id from yupai_ops where session_id = $1 limit 1", [sessionId])
	]);
	return {
		row,
		hostToken: asText(row.host_token),
		canUndo: ops.length > 0,
		state: {
			session: sessionFromRow(row),
			players: players.map(playerFromRow),
			restrictions: restrictions.map(restrictionFromRow),
			matches: matches.map(matchFromRow)
		}
	};
}
function flags(loaded, givenToken, deviceId) {
	const isHost = Boolean(givenToken && givenToken === loaded.hostToken);
	return {
		isHost,
		isController: Boolean(isHost && deviceId && loaded.state.session.controllerDeviceId === deviceId)
	};
}
function boardPayload(loaded, givenToken, deviceId, extra) {
	const { isHost, isController } = flags(loaded, givenToken, deviceId);
	return {
		session: {
			...loaded.state.session,
			transferPin: isHost ? loaded.state.session.transferPin : null
		},
		players: loaded.state.players,
		restrictions: loaded.state.restrictions,
		matches: loaded.state.matches,
		version: loaded.state.session.version,
		canUndo: loaded.canUndo,
		isHost,
		isController,
		youAreHost: isHost,
		...extra
	};
}
async function writeState(sql, state) {
	const s = state.session;
	await sql.query(`update yupai_sessions set
      venue_name = $2,
      session_date = $3,
      start_time = $4,
      end_time = $5,
      court_count = $6,
      match_duration_min = $7,
      consecutive_limit = $8,
      force_rest_after_match = $9,
      ban_recent_opponent = $10,
      scoring_enabled = $11,
      weight_wait = $12,
      weight_plays = $13,
      weight_rematch = $14,
      weight_skill = $15,
      weight_preset = $16,
      status = $17,
      controller_device_id = $18,
      transfer_pin = $19,
      transfer_pin_expires_at = $20,
      updated_at = now()
    where id = $1`, [
		s.id,
		s.venueName,
		s.sessionDate,
		s.startTime,
		s.endTime,
		s.courtCount,
		s.matchDurationMin,
		s.consecutiveLimit,
		s.forceRestAfterMatch,
		s.banRecentOpponent,
		s.scoringEnabled,
		s.weights.wait,
		s.weights.plays,
		s.weights.rematch,
		s.weights.skill,
		s.weightPreset,
		s.status,
		s.controllerDeviceId,
		s.transferPin,
		s.transferPinExpiresAt
	]);
	await sql.query("delete from yupai_players where session_id = $1", [s.id]);
	for (const p of state.players) await sql.query(`insert into yupai_players (
        id, session_id, nickname, skill, is_drop_in, status, locked, court_no,
        consecutive_played, play_count, bye_count, wait_total_sec, play_total_sec,
        last_wait_start, last_opponent_id, sort_order
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, [
		p.id,
		s.id,
		p.nickname,
		p.skill,
		p.isDropIn,
		p.status,
		p.locked,
		p.courtNo,
		p.consecutivePlayed,
		p.playCount,
		p.byeCount,
		p.waitTotalSec,
		p.playTotalSec,
		p.lastWaitStart,
		p.lastOpponentId,
		p.sortOrder
	]);
	await sql.query("delete from yupai_restrictions where session_id = $1", [s.id]);
	for (const r of state.restrictions) await sql.query(`insert into yupai_restrictions (id, session_id, kind, player_a_id, player_b_id, used)
       values ($1,$2,$3,$4,$5,$6)`, [
		r.id,
		s.id,
		r.kind,
		r.playerAId,
		r.playerBId,
		r.used
	]);
	await sql.query("delete from yupai_matches where session_id = $1", [s.id]);
	for (const m of state.matches) await sql.query(`insert into yupai_matches (
        id, session_id, court_no, player_a_id, player_b_id, started_at, ended_at,
        source, status, winner_id, score_a, score_b, duration_min, extended_sec,
        pause_accumulated_ms, paused_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, [
		m.id,
		s.id,
		m.courtNo,
		m.playerAId,
		m.playerBId,
		m.startedAt,
		m.endedAt,
		m.source,
		m.status,
		m.winnerId,
		m.scoreA,
		m.scoreB,
		m.durationMin,
		m.extendedSec,
		m.pauseAccumulatedMs,
		m.pausedAt
	]);
}
async function casVersion(sql, sessionId, expected) {
	return (await sql.query(`update yupai_sessions set version = version + 1, updated_at = now()
     where id = $1 and version = $2 returning version`, [sessionId, expected]))[0]?.version ?? null;
}
async function pushUndo(sql, sessionId, action, before) {
	await sql.query("insert into yupai_ops (id, session_id, action, before_json) values ($1,$2,$3,$4)", [
		newId(),
		sessionId,
		action,
		snapshotOf(before)
	]);
}
async function createSessionRecord(input) {
	const sql = await getSql();
	const id = newId();
	const token = hostToken();
	let code = sessionCode();
	const weights = input.weights ?? WEIGHT_PRESETS.fair;
	for (let i = 0; i < 6; i++) try {
		await sql.query(`insert into yupai_sessions (
          id, code, host_token, venue_name, session_date, start_time, end_time,
          court_count, match_duration_min, consecutive_limit, force_rest_after_match,
          ban_recent_opponent, scoring_enabled, weight_wait, weight_plays,
          weight_rematch, weight_skill, weight_preset, controller_device_id
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`, [
			id,
			code,
			token,
			input.venueName.trim() || "羽球場",
			input.sessionDate,
			input.startTime,
			input.endTime,
			Math.min(6, Math.max(1, input.courtCount)),
			input.matchDurationMin,
			input.consecutiveLimit,
			input.forceRestAfterMatch,
			input.banRecentOpponent,
			input.scoringEnabled,
			weights.wait,
			weights.plays,
			weights.rematch,
			weights.skill,
			input.weightPreset,
			input.deviceId
		]);
		return {
			id,
			code,
			hostToken: token
		};
	} catch {
		code = sessionCode();
	}
	throw new Error("無法建立場次，請再試一次");
}
async function seedDemo(input) {
	const created = await createSessionRecord(input);
	const loaded = await loadState(created.code);
	if (!loaded) throw new Error("示範場次建立失敗");
	const demo = buildDemoState(loaded.state.session, Date.now());
	await writeState(await getSql(), demo);
	const again = await loadState(created.code);
	if (!again) throw new Error("示範場次讀取失敗");
	return {
		created,
		payload: boardPayload(again, created.hostToken, input.deviceId)
	};
}
async function fetchBoard(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	return boardPayload(loaded, input.hostToken, input.deviceId);
}
async function mutateBoard(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	if (input.hostToken !== loaded.hostToken) return { error: "沒有主控權限" };
	if (loaded.state.session.controllerDeviceId !== input.deviceId) return { error: "主控已在另一台裝置。請先取得主控。" };
	const sql = await getSql();
	const newVersion = await casVersion(sql, loaded.state.session.id, input.expectedVersion);
	if (newVersion == null) {
		const fresh = await loadState(input.code);
		if (!fresh) return { error: "找不到這個場次碼" };
		return boardPayload(fresh, input.hostToken, input.deviceId, {
			conflict: true,
			warning: "看板已由其他操作更新，未套用這一步"
		});
	}
	const before = snapshotOf(loaded.state);
	const result = applyAction(loaded.state, input.action);
	if ("error" in result) {
		await sql.query("update yupai_sessions set version = $2 where id = $1", [loaded.state.session.id, input.expectedVersion]);
		return { error: result.error };
	}
	result.state.session.version = newVersion;
	await pushUndo(sql, result.state.session.id, input.action.type, before);
	await writeState(sql, result.state);
	const fresh = await loadState(input.code);
	if (!fresh) return { error: "寫入後讀取失敗" };
	return boardPayload(fresh, input.hostToken, input.deviceId, {
		message: result.message,
		warning: result.warning
	});
}
async function undoBoard(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	if (input.hostToken !== loaded.hostToken) return { error: "沒有主控權限" };
	if (loaded.state.session.controllerDeviceId !== input.deviceId) return { error: "主控已在另一台裝置。請先取得主控。" };
	const sql = await getSql();
	const op = (await sql.query("select id, before_json from yupai_ops where session_id = $1 order by created_at desc limit 1", [loaded.state.session.id]))[0];
	if (!op) return { error: "沒有可撤銷的步驟" };
	const newVersion = await casVersion(sql, loaded.state.session.id, input.expectedVersion);
	if (newVersion == null) {
		const fresh = await loadState(input.code);
		if (!fresh) return { error: "找不到這個場次碼" };
		return boardPayload(fresh, input.hostToken, input.deviceId, {
			conflict: true,
			warning: "看板已更新，撤銷未套用"
		});
	}
	const restored = typeof op.before_json === "string" ? JSON.parse(op.before_json) : op.before_json;
	restored.session.version = newVersion;
	restored.session.id = loaded.state.session.id;
	restored.session.code = loaded.state.session.code;
	await writeState(sql, restored);
	await sql.query("delete from yupai_ops where id = $1", [op.id]);
	const fresh = await loadState(input.code);
	if (!fresh) return { error: "撤銷後讀取失敗" };
	return boardPayload(fresh, input.hostToken, input.deviceId, { message: "已撤銷上一步" });
}
async function claimControl(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	if (input.hostToken !== loaded.hostToken) return { error: "主控密鑰不正確" };
	await (await getSql()).query("update yupai_sessions set controller_device_id = $2, transfer_pin = null, transfer_pin_expires_at = null, version = version + 1 where id = $1", [loaded.state.session.id, input.deviceId]);
	const fresh = await loadState(input.code);
	if (!fresh) return { error: "讀取失敗" };
	return boardPayload(fresh, input.hostToken, input.deviceId, { message: "已取得主控" });
}
async function startHostTransfer(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	if (input.hostToken !== loaded.hostToken) return { error: "沒有主控權限" };
	if (loaded.state.session.controllerDeviceId !== input.deviceId) return { error: "請用目前主控裝置移交" };
	const pin = transferPin();
	const sql = await getSql();
	const expires = new Date(Date.now() + 3e5).toISOString();
	await sql.query("update yupai_sessions set transfer_pin = $2, transfer_pin_expires_at = $3, version = version + 1 where id = $1", [
		loaded.state.session.id,
		pin,
		expires
	]);
	return { pin };
}
async function acceptHostTransfer(input) {
	const loaded = await loadState(input.code);
	if (!loaded) return { error: "找不到這個場次碼" };
	const pin = input.pin.trim();
	if (!loaded.state.session.transferPin || loaded.state.session.transferPin !== pin) return { error: "移交碼不正確" };
	const exp = loaded.state.session.transferPinExpiresAt;
	if (exp && Date.parse(exp) < Date.now()) return { error: "移交碼已過期" };
	await (await getSql()).query("update yupai_sessions set controller_device_id = $2, transfer_pin = null, transfer_pin_expires_at = null, version = version + 1 where id = $1", [loaded.state.session.id, input.deviceId]);
	const fresh = await loadState(input.code);
	if (!fresh) return { error: "讀取失敗" };
	return {
		hostToken: fresh.hostToken,
		payload: boardPayload(fresh, fresh.hostToken, input.deviceId, { message: "已接下主控" })
	};
}
//#endregion
export { acceptHostTransfer, boardPayload, claimControl, createSessionRecord, fetchBoard, loadState, mutateBoard, seedDemo, startHostTransfer, undoBoard };
