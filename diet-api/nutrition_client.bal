import ballerina/http;
import ballerina/log;
import ballerina/url;

// Static baseline macros for a recipe; best-effort enriched from nutrition-service
// (USDA FoodData Central) when FDC_API_KEY is configured, per the component contract.
public type NutritionFacts record {|
    int calories;
    int proteinG;
    int carbG;
    int fatG;
|};

// Loosely-specified inbound payload from an external provider - open records so an
// unmodelled field never breaks parsing.
type FdcAbridgedNutrient record {
    string name?;
    decimal amount?;
};

type FdcSearchResultFood record {
    string description?;
    FdcAbridgedNutrient[] foodNutrients?;
};

type FdcSearchResult record {
    FdcSearchResultFood[] foods?;
};

final http:Client? nutritionClient = initNutritionClient();

function initNutritionClient() returns http:Client? {
    if fdcApiKey.trim() == "" {
        return ();
    }
    http:Client|error fdcClient = new ("https://api.nal.usda.gov/fdc", {timeout: 5});
    if fdcClient is error {
        log:printWarn("failed to initialize nutrition-service client", 'error = fdcClient);
        return ();
    }
    return fdcClient;
}

// Best-effort enrichment: never fails a caller, always returns usable macros -
// enriched values on success, the static baseline on any error or when no key
// is configured.
function fetchNutritionFacts(string foodName, NutritionFacts baseline) returns NutritionFacts {
    http:Client? fdcClient = nutritionClient;
    if fdcClient is () {
        return baseline;
    }
    string|error encodedQuery = url:encode(foodName, "UTF-8");
    if encodedQuery is error {
        return baseline;
    }
    string path = string `/v1/foods/search?query=${encodedQuery}&pageSize=1&api_key=${fdcApiKey}`;
    FdcSearchResult[]|error response = fdcClient->get(path);
    if response is error {
        log:printWarn("nutrition-service lookup failed, using baseline macros", foodName = foodName, 'error = response);
        return baseline;
    }
    if response.length() == 0 {
        return baseline;
    }
    FdcSearchResultFood[]? foods = response[0].foods;
    if foods is () || foods.length() == 0 {
        return baseline;
    }
    FdcAbridgedNutrient[]? nutrients = foods[0].foodNutrients;
    if nutrients is () {
        return baseline;
    }
    int calories = baseline.calories;
    int proteinG = baseline.proteinG;
    int carbG = baseline.carbG;
    int fatG = baseline.fatG;
    foreach FdcAbridgedNutrient nutrient in nutrients {
        string? nutrientName = nutrient.name;
        decimal? nutrientAmount = nutrient.amount;
        if nutrientName is () || nutrientAmount is () {
            continue;
        }
        int amountRounded = <int>nutrientAmount;
        if nutrientName == "Energy" {
            calories = amountRounded;
        } else if nutrientName == "Protein" {
            proteinG = amountRounded;
        } else if nutrientName == "Carbohydrate, by difference" {
            carbG = amountRounded;
        } else if nutrientName == "Total lipid (fat)" {
            fatG = amountRounded;
        }
    }
    return {calories, proteinG, carbG, fatG};
}
