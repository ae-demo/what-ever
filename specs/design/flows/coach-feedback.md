# Coach reviews progress and leaves feedback

A Coach reviews a connected Dieter's plan and progress, then leaves feedback
that reaches the Dieter on WhatsApp.

```mermaid
sequenceDiagram
    actor Coach
    actor Dieter
    participant diet-webapp
    participant diet-api
    participant whatsapp

    Coach->>diet-webapp: open connected dieter's progress
    diet-webapp->>diet-api: get plan, logs, weight history
    diet-api-->>diet-webapp: progress data
    Coach->>diet-webapp: write feedback
    diet-webapp->>diet-api: submit feedback
    diet-api->>whatsapp: send feedback notification
    whatsapp-->>diet-api: message accepted
    Dieter->>diet-webapp: open feedback
```

