import ballerina/http;
import ballerina/sql;
import ballerina/time;

listener http:Listener httpListener = new (9090);

service / on httpListener {

    // ---- Goal ----

    resource function get goal(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Goal|http:Unauthorized|http:NotFound|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        GoalRow|error row = dbClient->queryRow(`
            SELECT id, dieter_id AS "dieterId", calorie_target AS "calorieTarget",
                   protein_target_g AS "proteinTargetG", carb_target_g AS "carbTargetG", fat_target_g AS "fatTargetG"
            FROM goals WHERE dieter_id = ${caller.userId}
        `);
        if row is sql:NoRowsError {
            ErrorDetail err = {code: 404, message: "no goal set"};
            return <http:NotFound>{body: err};
        }
        if row is error {
            return row;
        }
        return toGoal(row);
    }

    resource function put goal(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name, GoalInput payload)
            returns Goal|http:Unauthorized|http:BadRequest|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        if payload.calorieTarget <= 0 {
            ErrorDetail err = {code: 400, message: "calorieTarget must be a positive integer"};
            return <http:BadRequest>{body: err};
        }
        string goalId = newId();
        int? proteinTargetG = payload?.proteinTargetG;
        int? carbTargetG = payload?.carbTargetG;
        int? fatTargetG = payload?.fatTargetG;
        _ = check dbClient->execute(`
            INSERT INTO goals (id, dieter_id, calorie_target, protein_target_g, carb_target_g, fat_target_g)
            VALUES (${goalId}, ${caller.userId}, ${payload.calorieTarget}, ${proteinTargetG}, ${carbTargetG}, ${fatTargetG})
            ON CONFLICT (dieter_id) DO UPDATE SET
                calorie_target = EXCLUDED.calorie_target,
                protein_target_g = EXCLUDED.protein_target_g,
                carb_target_g = EXCLUDED.carb_target_g,
                fat_target_g = EXCLUDED.fat_target_g
        `);
        GoalRow row = check dbClient->queryRow(`
            SELECT id, dieter_id AS "dieterId", calorie_target AS "calorieTarget",
                   protein_target_g AS "proteinTargetG", carb_target_g AS "carbTargetG", fat_target_g AS "fatTargetG"
            FROM goals WHERE dieter_id = ${caller.userId}
        `);
        return toGoal(row);
    }

    // ---- Recipes (catalog is public within an authenticated session; no per-caller scoping) ----

    resource function get recipes(int 'limit = 20, int offset = 0, string? search = ())
            returns RecipePage|error {
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        RecipeRow[] recipeRows;
        int count;
        if search is string && search.trim() != "" {
            string likePattern = "%" + search + "%";
            count = check dbClient->queryRow(`SELECT count(*) FROM recipes WHERE name ILIKE ${likePattern}`);
            stream<RecipeRow, sql:Error?> rows = dbClient->query(`
                SELECT id, name, calories, protein_g AS "proteinG", carb_g AS "carbG", fat_g AS "fatG"
                FROM recipes WHERE name ILIKE ${likePattern} ORDER BY name LIMIT ${boundedLimit} OFFSET ${offset}
            `);
            recipeRows = check from RecipeRow row in rows select row;
        } else {
            count = check dbClient->queryRow(`SELECT count(*) FROM recipes`);
            stream<RecipeRow, sql:Error?> rows = dbClient->query(`
                SELECT id, name, calories, protein_g AS "proteinG", carb_g AS "carbG", fat_g AS "fatG"
                FROM recipes ORDER BY name LIMIT ${boundedLimit} OFFSET ${offset}
            `);
            recipeRows = check from RecipeRow row in rows select row;
        }
        Recipe[] data = from RecipeRow row in recipeRows select toRecipe(row);
        [string?, string?] [next, previous] = buildPageLinks("/recipes", boundedLimit, offset, count);
        return {count, next, previous, data};
    }

    resource function get recipes/[string recipeId]() returns Recipe|http:NotFound|error {
        RecipeRow|error row = dbClient->queryRow(`
            SELECT id, name, calories, protein_g AS "proteinG", carb_g AS "carbG", fat_g AS "fatG"
            FROM recipes WHERE id = ${recipeId}
        `);
        if row is sql:NoRowsError {
            ErrorDetail err = {code: 404, message: "recipe not found"};
            return <http:NotFound>{body: err};
        }
        if row is error {
            return row;
        }
        return toRecipe(row);
    }

    // ---- Meal plans ----

    resource function get meal\-plans(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0) returns MealPlanPage|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        int count = check dbClient->queryRow(`SELECT count(*) FROM meal_plans WHERE dieter_id = ${caller.userId}`);
        stream<MealPlan, sql:Error?> rows = dbClient->query(`
            SELECT id, dieter_id AS "dieterId", week_starting AS "weekStarting"
            FROM meal_plans WHERE dieter_id = ${caller.userId}
            ORDER BY week_starting DESC LIMIT ${boundedLimit} OFFSET ${offset}
        `);
        MealPlan[] data = check from MealPlan row in rows select row;
        [string?, string?] [next, previous] = buildPageLinks("/meal-plans", boundedLimit, offset, count);
        return {count, next, previous, data};
    }

    resource function post meal\-plans(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            MealPlanInput payload) returns MealPlan|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        string mealPlanId = newId();
        _ = check dbClient->execute(`
            INSERT INTO meal_plans (id, dieter_id, week_starting) VALUES (${mealPlanId}, ${caller.userId}, ${payload.weekStarting})
        `);
        return {id: mealPlanId, dieterId: caller.userId, weekStarting: payload.weekStarting};
    }

    resource function post meal\-plans/[string mealPlanId]/entries(@http:Header string? x\-user\-id,
            @http:Header string? x\-user\-name, MealPlanEntryInput payload)
            returns MealPlanEntry|http:Unauthorized|http:NotFound|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int|error owningPlan = dbClient->queryRow(`
            SELECT count(*) FROM meal_plans WHERE id = ${mealPlanId} AND dieter_id = ${caller.userId}
        `);
        if owningPlan is error {
            return owningPlan;
        }
        if owningPlan == 0 {
            ErrorDetail err = {code: 404, message: "meal plan not found"};
            return <http:NotFound>{body: err};
        }
        string entryId = newId();
        _ = check dbClient->execute(`
            INSERT INTO meal_plan_entries (id, meal_plan_id, recipe_id, day, meal_slot)
            VALUES (${entryId}, ${mealPlanId}, ${payload.recipeId}, ${payload.day}, ${payload.mealSlot})
        `);
        return {id: entryId, mealPlanId, recipeId: payload.recipeId, day: payload.day, mealSlot: payload.mealSlot};
    }

    // ---- Lunch ordering (WhatsApp) ----

    resource function post meal\-plan\-entries/[string entryId]/'order(@http:Header string? x\-user\-id,
            @http:Header string? x\-user\-name) returns LunchOrder|http:Unauthorized|http:BadRequest|http:NotFound|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        record {| string recipeId; string day; string mealSlot; |}|error entry = dbClient->queryRow(`
            SELECT mpe.recipe_id AS "recipeId", mpe.day AS "day", mpe.meal_slot AS "mealSlot"
            FROM meal_plan_entries mpe JOIN meal_plans mp ON mpe.meal_plan_id = mp.id
            WHERE mpe.id = ${entryId} AND mp.dieter_id = ${caller.userId}
        `);
        if entry is sql:NoRowsError {
            ErrorDetail err = {code: 404, message: "meal plan entry not found"};
            return <http:NotFound>{body: err};
        }
        if entry is error {
            return entry;
        }
        if entry.mealSlot != "lunch" {
            ErrorDetail err = {code: 400, message: "only a lunch-slot entry can be ordered"};
            return <http:BadRequest>{body: err};
        }
        int|error alreadyOrdered = dbClient->queryRow(`
            SELECT count(*) FROM lunch_orders WHERE meal_plan_entry_id = ${entryId} AND status != 'failed'
        `);
        if alreadyOrdered is error {
            return alreadyOrdered;
        }
        if alreadyOrdered > 0 {
            ErrorDetail err = {code: 400, message: "this entry has already been ordered"};
            return <http:BadRequest>{body: err};
        }
        string recipeName = check dbClient->queryRow(`SELECT name FROM recipes WHERE id = ${entry.recipeId}`);
        string messageBody = string `New lunch order: ${recipeName} for ${entry.day} (${entry.mealSlot}).`;
        string? whatsappMessageId = sendWhatsappMessage(restaurantWhatsappNumber, messageBody);
        string status = whatsappMessageId is string ? "placed" : "failed";
        string lunchOrderId = newId();
        _ = check dbClient->execute(`
            INSERT INTO lunch_orders (id, meal_plan_entry_id, whatsapp_message_id, status)
            VALUES (${lunchOrderId}, ${entryId}, ${whatsappMessageId}, ${status})
        `);
        LunchOrder lunchOrder = {id: lunchOrderId, mealPlanEntryId: entryId, status};
        if whatsappMessageId is string {
            lunchOrder.whatsappMessageId = whatsappMessageId;
        }
        return lunchOrder;
    }

    // ---- Food log ----

    resource function get food\-log(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0, string? day = ())
            returns FoodLogPage|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        string dayFilter = day is string ? day : "";
        int count;
        stream<FoodLogEntry, sql:Error?> rows;
        record {| int totalCalories; int totalProteinG; int totalCarbG; int totalFatG; |} totals;
        if dayFilter != "" {
            count = check dbClient->queryRow(`
                SELECT count(*) FROM food_log_entries WHERE dieter_id = ${caller.userId} AND left(logged_at, 10) = ${dayFilter}
            `);
            rows = dbClient->query(`
                SELECT id, dieter_id AS "dieterId", recipe_id AS "recipeId", logged_at AS "loggedAt", quantity
                FROM food_log_entries WHERE dieter_id = ${caller.userId} AND left(logged_at, 10) = ${dayFilter}
                ORDER BY logged_at DESC LIMIT ${boundedLimit} OFFSET ${offset}
            `);
            totals = check dbClient->queryRow(`
                SELECT coalesce(sum(r.calories * f.quantity), 0)::int AS "totalCalories",
                       coalesce(sum(r.protein_g * f.quantity), 0)::int AS "totalProteinG",
                       coalesce(sum(r.carb_g * f.quantity), 0)::int AS "totalCarbG",
                       coalesce(sum(r.fat_g * f.quantity), 0)::int AS "totalFatG"
                FROM food_log_entries f JOIN recipes r ON f.recipe_id = r.id
                WHERE f.dieter_id = ${caller.userId} AND left(f.logged_at, 10) = ${dayFilter}
            `);
        } else {
            count = check dbClient->queryRow(`SELECT count(*) FROM food_log_entries WHERE dieter_id = ${caller.userId}`);
            rows = dbClient->query(`
                SELECT id, dieter_id AS "dieterId", recipe_id AS "recipeId", logged_at AS "loggedAt", quantity
                FROM food_log_entries WHERE dieter_id = ${caller.userId}
                ORDER BY logged_at DESC LIMIT ${boundedLimit} OFFSET ${offset}
            `);
            totals = check dbClient->queryRow(`
                SELECT coalesce(sum(r.calories * f.quantity), 0)::int AS "totalCalories",
                       coalesce(sum(r.protein_g * f.quantity), 0)::int AS "totalProteinG",
                       coalesce(sum(r.carb_g * f.quantity), 0)::int AS "totalCarbG",
                       coalesce(sum(r.fat_g * f.quantity), 0)::int AS "totalFatG"
                FROM food_log_entries f JOIN recipes r ON f.recipe_id = r.id
                WHERE f.dieter_id = ${caller.userId}
            `);
        }
        FoodLogEntry[] data = check from FoodLogEntry row in rows select row;
        [string?, string?] [next, previous] = buildPageLinks("/food-log", boundedLimit, offset, count);
        return {
            count,
            next,
            previous,
            data,
            totalCalories: totals.totalCalories,
            totalProteinG: totals.totalProteinG,
            totalCarbG: totals.totalCarbG,
            totalFatG: totals.totalFatG
        };
    }

    resource function post food\-log(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            FoodLogEntryInput payload) returns FoodLogEntry|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        string? loggedAtInput = payload?.loggedAt;
        string loggedAt = loggedAtInput is string && loggedAtInput.trim() != "" ? loggedAtInput : time:utcToString(time:utcNow());
        string entryId = newId();
        _ = check dbClient->execute(`
            INSERT INTO food_log_entries (id, dieter_id, recipe_id, logged_at, quantity)
            VALUES (${entryId}, ${caller.userId}, ${payload.recipeId}, ${loggedAt}, ${payload.quantity})
        `);
        return {id: entryId, dieterId: caller.userId, recipeId: payload.recipeId, loggedAt, quantity: payload.quantity};
    }

    // ---- Weight entries ----

    resource function get weight\-entries(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0) returns WeightEntryPage|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        int count = check dbClient->queryRow(`SELECT count(*) FROM weight_entries WHERE dieter_id = ${caller.userId}`);
        stream<WeightEntry, sql:Error?> rows = dbClient->query(`
            SELECT id, dieter_id AS "dieterId", recorded_on AS "recordedOn", weight_kg AS "weightKg"
            FROM weight_entries WHERE dieter_id = ${caller.userId}
            ORDER BY recorded_on DESC LIMIT ${boundedLimit} OFFSET ${offset}
        `);
        WeightEntry[] data = check from WeightEntry row in rows select row;
        [string?, string?] [next, previous] = buildPageLinks("/weight-entries", boundedLimit, offset, count);
        return {count, next, previous, data};
    }

    resource function post weight\-entries(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            WeightEntryInput payload) returns WeightEntry|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        string entryId = newId();
        _ = check dbClient->execute(`
            INSERT INTO weight_entries (id, dieter_id, recorded_on, weight_kg)
            VALUES (${entryId}, ${caller.userId}, ${payload.recordedOn}, ${payload.weightKg})
        `);
        return {id: entryId, dieterId: caller.userId, recordedOn: payload.recordedOn, weightKg: payload.weightKg};
    }

    // ---- Coach connections ----

    resource function get coach\-connections(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0, string? status = ())
            returns CoachConnectionPage|http:Unauthorized|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        sql:ParameterizedQuery scopeClause = caller.role == COACH
            ? `coach_id = ${caller.userId}` : `dieter_id = ${caller.userId}`;
        sql:ParameterizedQuery statusClause = status is string && status.trim() != ""
            ? sql:queryConcat(` AND status = `, `${status}`) : ``;
        int count = check dbClient->queryRow(sql:queryConcat(`SELECT count(*) FROM coach_connections WHERE `, scopeClause, statusClause));
        stream<CoachConnectionRow, sql:Error?> rows = dbClient->query(sql:queryConcat(
            `SELECT id, dieter_id AS "dieterId", coach_id AS "coachId", status FROM coach_connections WHERE `,
            scopeClause, statusClause, ` ORDER BY id LIMIT ${boundedLimit} OFFSET ${offset}`
        ));
        CoachConnectionRow[] connectionRows = check from CoachConnectionRow row in rows select row;
        CoachConnection[] data = from CoachConnectionRow row in connectionRows select toCoachConnection(row);
        [string?, string?] [next, previous] = buildPageLinks("/coach-connections", boundedLimit, offset, count);
        return {count, next, previous, data};
    }

    resource function post coach\-connections(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            CoachInviteInput payload) returns CoachConnection|http:Unauthorized|http:BadRequest|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        string coachEmail = payload.coachEmail.trim();
        if coachEmail == "" || !coachEmail.includes("@") {
            ErrorDetail err = {code: 400, message: "coachEmail must be a valid email address"};
            return <http:BadRequest>{body: err};
        }
        string connectionId = newId();
        _ = check dbClient->execute(`
            INSERT INTO coach_connections (id, dieter_id, coach_id, coach_email, status)
            VALUES (${connectionId}, ${caller.userId}, NULL, ${coachEmail}, 'pending')
        `);
        return {id: connectionId, dieterId: caller.userId, coachId: "", status: "pending"};
    }

    // ---- Coach feedback ----

    resource function get coach\-connections/[string connectionId]/feedback(@http:Header string? x\-user\-id,
            @http:Header string? x\-user\-name, int 'limit = 20, int offset = 0)
            returns FeedbackPage|http:Unauthorized|http:NotFound|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        int|error membership = dbClient->queryRow(`
            SELECT count(*) FROM coach_connections
            WHERE id = ${connectionId} AND (dieter_id = ${caller.userId} OR coach_id = ${caller.userId})
        `);
        if membership is error {
            return membership;
        }
        if membership == 0 {
            ErrorDetail err = {code: 404, message: "connection not found"};
            return <http:NotFound>{body: err};
        }
        int boundedLimit = 'limit > 100 ? 100 : 'limit;
        int count = check dbClient->queryRow(`SELECT count(*) FROM feedback WHERE coach_connection_id = ${connectionId}`);
        stream<Feedback, sql:Error?> rows = dbClient->query(`
            SELECT id, coach_connection_id AS "coachConnectionId", message, sent_at AS "sentAt"
            FROM feedback WHERE coach_connection_id = ${connectionId}
            ORDER BY sent_at DESC LIMIT ${boundedLimit} OFFSET ${offset}
        `);
        Feedback[] data = check from Feedback row in rows select row;
        [string?, string?] [next, previous] = buildPageLinks(
            string `/coach-connections/${connectionId}/feedback`, boundedLimit, offset, count);
        return {count, next, previous, data};
    }

    resource function post coach\-connections/[string connectionId]/feedback(@http:Header string? x\-user\-id,
            @http:Header string? x\-user\-name, FeedbackInput payload)
            returns Feedback|http:Unauthorized|http:Forbidden|http:NotFound|error {
        StoredUser|http:Unauthorized|error caller = requireCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller is error {
            return caller;
        }
        record {| string dieterId; string? coachId; |}|error connection = dbClient->queryRow(`
            SELECT dieter_id AS "dieterId", coach_id AS "coachId" FROM coach_connections WHERE id = ${connectionId}
        `);
        if connection is sql:NoRowsError {
            ErrorDetail err = {code: 404, message: "connection not found"};
            return <http:NotFound>{body: err};
        }
        if connection is error {
            return connection;
        }
        string? coachId = connection.coachId;
        if coachId is () || coachId != caller.userId {
            ErrorDetail err = {code: 403, message: "caller is not this connection's coach"};
            return <http:Forbidden>{body: err};
        }
        string feedbackId = newId();
        string sentAt = time:utcToString(time:utcNow());
        _ = check dbClient->execute(`
            INSERT INTO feedback (id, coach_connection_id, message, sent_at)
            VALUES (${feedbackId}, ${connectionId}, ${payload.message}, ${sentAt})
        `);
        string? _ = sendWhatsappMessage(dieterWhatsappNumber, string `Your coach left feedback: ${payload.message}`);
        return {id: feedbackId, coachConnectionId: connectionId, message: payload.message, sentAt};
    }
}
