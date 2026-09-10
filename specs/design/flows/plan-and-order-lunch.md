# Plan meals and order lunch

A Dieter builds a meal plan from the recipe catalog and orders a planned
lunch through Uber Eats.

```mermaid
sequenceDiagram
    actor Dieter
    participant diet-webapp
    participant diet-api
    participant nutrition-service
    participant ubereats

    Dieter->>diet-webapp: browse recipes
    diet-webapp->>diet-api: list recipes
    diet-api->>nutrition-service: look up nutrition facts
    nutrition-service-->>diet-api: calories, macros
    diet-api-->>diet-webapp: recipes with nutrition
    Dieter->>diet-webapp: add recipe to meal plan
    diet-webapp->>diet-api: create meal plan entry
    Dieter->>diet-webapp: order this entry for lunch
    diet-webapp->>diet-api: place lunch order
    diet-api->>ubereats: create order
    alt order accepted
        ubereats-->>diet-api: order confirmed
        diet-api-->>diet-webapp: order confirmed
    else order failed
        ubereats-->>diet-api: order rejected
        diet-api-->>diet-webapp: order failed
    end
```

