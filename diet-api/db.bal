import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/uuid;
import ballerina/log;

final int dietDbPortNum = dietDbPort == "" ? 5432 : check int:fromString(dietDbPort);

final postgresql:Client dbClient = check new (
    host = dietDbHost,
    username = dietDbUser,
    password = dietDbPassword,
    database = dietDbName,
    port = dietDbPortNum
);

function newId() returns string {
    return uuid:createType4AsString();
}

function initSchema() returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            dieter_id TEXT NOT NULL UNIQUE,
            calorie_target INT NOT NULL,
            protein_target_g INT,
            carb_target_g INT,
            fat_target_g INT
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS recipes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            calories INT NOT NULL,
            protein_g INT,
            carb_g INT,
            fat_g INT
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS meal_plans (
            id TEXT PRIMARY KEY,
            dieter_id TEXT NOT NULL,
            week_starting TEXT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS meal_plan_entries (
            id TEXT PRIMARY KEY,
            meal_plan_id TEXT NOT NULL REFERENCES meal_plans(id),
            recipe_id TEXT NOT NULL,
            day TEXT NOT NULL,
            meal_slot TEXT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS lunch_orders (
            id TEXT PRIMARY KEY,
            meal_plan_entry_id TEXT NOT NULL,
            whatsapp_message_id TEXT,
            status TEXT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS food_log_entries (
            id TEXT PRIMARY KEY,
            dieter_id TEXT NOT NULL,
            recipe_id TEXT NOT NULL,
            logged_at TEXT NOT NULL,
            quantity INT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS weight_entries (
            id TEXT PRIMARY KEY,
            dieter_id TEXT NOT NULL,
            recorded_on TEXT NOT NULL,
            weight_kg NUMERIC NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS coach_connections (
            id TEXT PRIMARY KEY,
            dieter_id TEXT NOT NULL,
            coach_id TEXT,
            coach_email TEXT NOT NULL,
            status TEXT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            coach_connection_id TEXT NOT NULL REFERENCES coach_connections(id),
            message TEXT NOT NULL,
            sent_at TEXT NOT NULL
        )
    `);
    check seedRecipesIfEmpty();
}

type SeedRecipe record {|
    string name;
    int calories;
    int proteinG;
    int carbG;
    int fatG;
|};

final SeedRecipe[] demoRecipes = [
    {name: "Grilled chicken bowl", calories: 520, proteinG: 45, carbG: 48, fatG: 14},
    {name: "Veggie stir fry", calories: 380, proteinG: 14, carbG: 52, fatG: 12},
    {name: "Salmon salad", calories: 460, proteinG: 34, carbG: 18, fatG: 26},
    {name: "Turkey wrap", calories: 410, proteinG: 30, carbG: 40, fatG: 12},
    {name: "Quinoa power bowl", calories: 480, proteinG: 20, carbG: 62, fatG: 16},
    {name: "Egg white omelette", calories: 260, proteinG: 26, carbG: 8, fatG: 10},
    {name: "Lentil soup", calories: 340, proteinG: 18, carbG: 50, fatG: 6}
];

function seedRecipesIfEmpty() returns error? {
    int|error existingCount = dbClient->queryRow(`SELECT count(*) FROM recipes`);
    int count = existingCount is int ? existingCount : 0;
    if count > 0 {
        return;
    }
    foreach SeedRecipe seedRecipe in demoRecipes {
        NutritionFacts facts = fetchNutritionFacts(seedRecipe.name, {
            calories: seedRecipe.calories,
            proteinG: seedRecipe.proteinG,
            carbG: seedRecipe.carbG,
            fatG: seedRecipe.fatG
        });
        string recipeId = newId();
        _ = check dbClient->execute(`
            INSERT INTO recipes (id, name, calories, protein_g, carb_g, fat_g)
            VALUES (${recipeId}, ${seedRecipe.name}, ${facts.calories}, ${facts.proteinG}, ${facts.carbG}, ${facts.fatG})
        `);
    }
    log:printInfo("seeded recipe catalog", recipeCount = demoRecipes.length());
}

final () schemaReady = check initSchema();
