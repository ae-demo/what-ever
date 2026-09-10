// Records mirroring specs/design/components/diet-api/openapi.yaml exactly.
// Do not edit the spec; this file is the Ballerina side of that same contract.

public type ErrorDetail record {|
    int code;
    string message;
    string description?;
    string moreInfo?;
|};

public type Goal record {|
    string id;
    string dieterId;
    int calorieTarget;
    int proteinTargetG?;
    int carbTargetG?;
    int fatTargetG?;
|};

public type GoalInput record {|
    int calorieTarget;
    int proteinTargetG?;
    int carbTargetG?;
    int fatTargetG?;
|};

public type Recipe record {|
    string id;
    string name;
    int calories;
    int proteinG?;
    int carbG?;
    int fatG?;
|};

public type RecipePage record {|
    int count;
    string? next = ();
    string? previous = ();
    Recipe[] data;
|};

public type MealPlan record {|
    string id;
    string dieterId;
    string weekStarting;
|};

public type MealPlanInput record {|
    string weekStarting;
|};

public type MealPlanPage record {|
    int count;
    string? next = ();
    string? previous = ();
    MealPlan[] data;
|};

public type MealPlanEntry record {|
    string id;
    string mealPlanId;
    string recipeId;
    string day;
    string mealSlot;
|};

public type MealPlanEntryInput record {|
    string recipeId;
    string day;
    string mealSlot;
|};

public type LunchOrder record {|
    string id;
    string mealPlanEntryId;
    string whatsappMessageId?;
    string status;
|};

public type FoodLogEntry record {|
    string id;
    string dieterId;
    string recipeId;
    string loggedAt;
    int quantity;
|};

public type FoodLogEntryInput record {|
    string recipeId;
    string loggedAt?;
    int quantity;
|};

public type FoodLogPage record {|
    int count;
    string? next = ();
    string? previous = ();
    FoodLogEntry[] data;
    int totalCalories?;
    int totalProteinG?;
    int totalCarbG?;
    int totalFatG?;
|};

public type WeightEntry record {|
    string id;
    string dieterId;
    string recordedOn;
    decimal weightKg;
|};

public type WeightEntryInput record {|
    string recordedOn;
    decimal weightKg;
|};

public type WeightEntryPage record {|
    int count;
    string? next = ();
    string? previous = ();
    WeightEntry[] data;
|};

public type CoachConnection record {|
    string id;
    string dieterId;
    string coachId;
    string status;
|};

public type CoachInviteInput record {|
    string coachEmail;
|};

public type CoachConnectionPage record {|
    int count;
    string? next = ();
    string? previous = ();
    CoachConnection[] data;
|};

public type Feedback record {|
    string id;
    string coachConnectionId;
    string message;
    string sentAt;
|};

public type FeedbackInput record {|
    string message;
|};

public type FeedbackPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Feedback[] data;
|};

// Internal role model - specs/design/security.json.
public enum UserRole {
    DIETER = "Dieter",
    COACH = "Coach"
}

public type StoredUser record {|
    string userId;
    string displayName;
    string role;
|};
