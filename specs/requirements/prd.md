# Diet Manager — PRD

## Problem Statement

People trying to manage their diet struggle to turn a goal ("lose weight",
"eat more protein") into what actually ends up on their plate each day.
Planning balanced meals ahead of time takes effort, logging what was actually
eaten is tedious, and getting professional guidance usually means a separate
conversation with a coach or nutritionist that never sees the actual plan or
the actual log. The common workaround — a notes app plus a takeout app plus a
text thread with a coach — loses the connection between the plan, what was
eaten, and the guidance given.

## Solution

A diet management app where a person plans their meals from a recipe catalog,
logs what they actually eat, and tracks progress against their goals — with a
coach or nutritionist able to see that same plan and log to guide them. When a
planned meal is easier to order than to cook, the person can order it for
lunch directly through Uber Eats without leaving the app.

## Actors

- **Dieter** — the person managing their own diet: sets goals, plans meals
from recipes, logs what they eat, tracks progress, and can order lunch
through Uber Eats.
- **Coach** — a coach or nutritionist connected to one or more Dieters: views
their plans, logs, and progress, and leaves guidance and recommendations.

## User Stories

1. As a Dieter, I want to set my diet goals (calorie and macro targets), so
 that I have a clear target to plan against.
2. As a Dieter, I want to browse a catalog of recipes with their nutritional
 information, so that I can choose meals that fit my goals.
3. As a Dieter, I want to build a meal plan for the days ahead from recipes,
 so that I know what to eat before I get hungry.
4. As a Dieter, I want to log the meals I actually eat, so that I can track
 how closely I follow my plan.
5. As a Dieter, I want to see my daily calorie and macro totals against my
 goal, so that I know how I'm doing.
6. As a Dieter, I want to track my weight over time, so that I can see whether
 my diet is moving me toward my goal. *assumed*
7. As a Dieter, I want to order a planned lunch directly through Uber Eats
 from within the app, so that I can get a meal that fits my plan without
 switching apps.
8. As a Dieter, I want to invite a coach to connect to my account, so that
 they can see my plan and guide me.
9. As a Coach, I want to see the plans, logs, and progress of the Dieters
 connected to me, so that I can monitor how they're doing.
10. As a Coach, I want to leave feedback and recommendations on a Dieter's
 plan or progress, so that I can guide them toward their goals.
11. As a Dieter, I want to be notified when my coach leaves feedback, so that
 I don't have to keep checking for it. *assumed*

## Product Decisions

- Sign-in is via SSO through Thunder, the platform identity provider — every
actor signs in this way.
- Meal ordering: Uber Eats — the user already intends to use it for ordering
lunch, so it is named directly rather than left as a capability.
- Recipe and food nutrition lookups depend on a nutrition database capability;
no specific provider is fixed yet, so the concrete provider is chosen at
design time.
- Coach feedback notifications are sent by email via Resend, the
organization's transactional email provider. *assumed*
- A Coach can be connected to more than one Dieter; a Dieter can be connected
to more than one Coach. *assumed*

## Out of Scope

- Placing or managing any order other than lunch, and any order not placed
through Uber Eats.
- Payment processing for Uber Eats orders — handled entirely by Uber Eats
itself, never by this product.
- Dieters authoring or publishing their own recipes into the catalog.
- Clinical-grade nutrition analysis or medical advice.
- Billing or scheduling between a Dieter and their Coach.

## Open Questions

None at this time.

## Further Notes

None.