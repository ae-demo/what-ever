// DB row shapes and their mapping to the openapi response records in types.bal.
// A nullable SQL column binds to an optional-typed row field; the mapper only
// sets the corresponding openapi-optional field when a value is present.

type GoalRow record {|
    string id;
    string dieterId;
    int calorieTarget;
    int? proteinTargetG;
    int? carbTargetG;
    int? fatTargetG;
|};

function toGoal(GoalRow row) returns Goal {
    Goal goal = {id: row.id, dieterId: row.dieterId, calorieTarget: row.calorieTarget};
    int? proteinTargetG = row.proteinTargetG;
    int? carbTargetG = row.carbTargetG;
    int? fatTargetG = row.fatTargetG;
    if proteinTargetG is int {
        goal.proteinTargetG = proteinTargetG;
    }
    if carbTargetG is int {
        goal.carbTargetG = carbTargetG;
    }
    if fatTargetG is int {
        goal.fatTargetG = fatTargetG;
    }
    return goal;
}

type RecipeRow record {|
    string id;
    string name;
    int calories;
    int? proteinG;
    int? carbG;
    int? fatG;
|};

function toRecipe(RecipeRow row) returns Recipe {
    Recipe recipe = {id: row.id, name: row.name, calories: row.calories};
    int? proteinG = row.proteinG;
    int? carbG = row.carbG;
    int? fatG = row.fatG;
    if proteinG is int {
        recipe.proteinG = proteinG;
    }
    if carbG is int {
        recipe.carbG = carbG;
    }
    if fatG is int {
        recipe.fatG = fatG;
    }
    return recipe;
}

type LunchOrderRow record {|
    string id;
    string mealPlanEntryId;
    string? whatsappMessageId;
    string status;
|};

function toLunchOrder(LunchOrderRow row) returns LunchOrder {
    LunchOrder lunchOrder = {id: row.id, mealPlanEntryId: row.mealPlanEntryId, status: row.status};
    string? whatsappMessageId = row.whatsappMessageId;
    if whatsappMessageId is string {
        lunchOrder.whatsappMessageId = whatsappMessageId;
    }
    return lunchOrder;
}

type CoachConnectionRow record {|
    string id;
    string dieterId;
    string? coachId;
    string status;
|};

function toCoachConnection(CoachConnectionRow row) returns CoachConnection {
    string? coachId = row.coachId;
    string resolvedCoachId = coachId is string ? coachId : "";
    return {id: row.id, dieterId: row.dieterId, coachId: resolvedCoachId, status: row.status};
}

// Relative-URI pagination links. Only limit/offset are preserved across pages;
// callers pass a basePath that already carries any extra filters they applied.
function buildPageLinks(string basePath, int 'limit, int offset, int count) returns [string?, string?] {
    string? next = ();
    string? previous = ();
    if offset + 'limit < count {
        next = string `${basePath}?limit=${'limit}&offset=${offset + 'limit}`;
    }
    if offset > 0 {
        int prevOffset = offset - 'limit;
        if prevOffset < 0 {
            prevOffset = 0;
        }
        previous = string `${basePath}?limit=${'limit}&offset=${prevOffset}`;
    }
    return [next, previous];
}
