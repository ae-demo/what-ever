import ballerina/http;
import ballerina/sql;

// No directory is published for this project (thunder-authentication's "no
// directory" path): this service owns people records itself, keyed on the
// caller's opaque X-User-Id. One resolver, called by every protected handler.
function resolveCaller(string callerId, string? callerName) returns StoredUser|error {
    StoredUser|error existing = dbClient->queryRow(`
        SELECT user_id AS "userId", display_name AS "displayName", role
        FROM users WHERE user_id = ${callerId}
    `);
    if existing is StoredUser {
        return existing;
    }
    if !(existing is sql:NoRowsError) {
        return existing;
    }

    // First-ever call from this caller: cold-start per specs/design/security.json.
    string safeCallerName = callerName is string ? callerName : "";
    string role = DIETER;
    if safeCallerName.trim() != "" {
        int pendingCount = check dbClient->queryRow(`
            SELECT count(*) FROM coach_connections
            WHERE status = 'pending' AND coach_id IS NULL AND lower(coach_email) = lower(${safeCallerName})
        `);
        if pendingCount > 0 {
            role = COACH;
        }
    }

    _ = check dbClient->execute(`
        INSERT INTO users (user_id, display_name, role) VALUES (${callerId}, ${safeCallerName}, ${role})
    `);

    if role == COACH {
        // One coach can be invited by multiple dieters: activate every matching
        // pending connection, not just one.
        _ = check dbClient->execute(`
            UPDATE coach_connections SET status = 'active', coach_id = ${callerId}
            WHERE status = 'pending' AND coach_id IS NULL AND lower(coach_email) = lower(${safeCallerName})
        `);
    }

    return {userId: callerId, displayName: safeCallerName, role};
}

// Called at the top of every protected resource. X-User-Id missing -> 401 (the
// gateway always sets it on a request that came through it). Otherwise the
// caller always resolves to a role (Dieter cold-start), so an error here is a
// genuine backend fault, not a missing role.
function requireCaller(string? callerId, string? callerName) returns StoredUser|http:Unauthorized|error {
    if callerId is () || callerId.trim() == "" {
        ErrorDetail err = {code: 401, message: "missing caller identity"};
        return <http:Unauthorized>{body: err};
    }
    return resolveCaller(callerId, callerName);
}
