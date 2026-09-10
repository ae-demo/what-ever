screen Dashboard "Today's calorie/macro totals against goal"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  heading "Today"
  row
    card "Calories | 1,420 | of 2,000 goal"
    card "Protein | 88g | of 120g goal"
    card "Carbs | 140g | of 220g goal"
    card "Fat | 45g | of 65g goal"
  chart "Calories this week" 600x260
  button "Set goal" -> SetGoal
  button "Log a meal" primary -> FoodLog

screen SetGoal "Set calorie and macro targets"
  navbar "Diet Manager"
  heading "Diet goal"
  input "Calorie target"
  input "Protein target (g)"
  input "Carb target (g)"
  input "Fat target (g)"
  row
    right
    button "Cancel" -> Dashboard
    button "Save" primary -> Dashboard

screen Recipes "Browse the recipe catalog"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard -> Dashboard | Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  row
    search "Search recipes"
    right
    select "Meal type"
  table "Recipe | Calories | Protein | Carbs | Fat" -> RecipeDetail
    row "Grilled chicken bowl | 480 | 42g | 38g | 16g"
    row "Veggie stir fry | 350 | 18g | 45g | 10g"
    row "Salmon salad | 420 | 36g | 12g | 24g"

screen RecipeDetail "Recipe nutrition detail"
  navbar "Diet Manager"
  heading "Grilled chicken bowl"
  card "Calories | 480 | per serving"
  row
    card "Protein | 42g"
    card "Carbs | 38g"
    card "Fat | 16g"
  row
    right
    button "Add to meal plan" primary -> MealPlan
    button "Order for lunch" -> OrderLunch

screen MealPlan "This week's planned meals"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard -> Dashboard | Recipes -> Recipes | Meal Plan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  heading "Week of Sep 8"
  table "Day | Breakfast | Lunch | Dinner" -> MealPlanEntry
    row "Mon | Oatmeal | Grilled chicken bowl | Salmon salad"
    row "Tue | Yogurt bowl | Veggie stir fry | Grilled chicken bowl"
  button "Add recipe to plan" primary -> Recipes

screen MealPlanEntry "One planned meal"
  navbar "Diet Manager"
  heading "Monday lunch: Grilled chicken bowl"
  card "Calories | 480"
  row
    right
    button "Remove" danger -> MealPlan
    button "Order for lunch" primary -> OrderLunch

screen OrderLunch "Confirm ordering this meal through Uber Eats"
  navbar "Diet Manager"
  heading "Order for lunch"
  text "Grilled chicken bowl will be ordered through Uber Eats."
  badge "Uber Eats" info
  row
    right
    button "Cancel" -> MealPlanEntry
    button "Place order" primary -> OrderConfirmation

screen OrderConfirmation "Lunch order placed"
  navbar "Diet Manager"
  heading "Order placed"
  badge "Confirmed" success
  text "Your lunch order has been sent to Uber Eats."
  button "Back to meal plan" primary -> MealPlan

screen FoodLog "Log what was actually eaten"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard -> Dashboard | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log | Weight -> WeightProgress | Coaches -> Coaches"
  row
    right
    button "Log a meal" primary -> LogMeal
  table "Time | Meal | Calories"
    row "8:10am | Oatmeal | 320"
    row "1:05pm | Grilled chicken bowl | 480"
  card "Today's total | 800 | of 2,000 goal"

screen LogMeal "Log a meal eaten"
  navbar "Diet Manager"
  heading "Log a meal"
  search "Find recipe"
  input "Quantity"
  row
    right
    button "Cancel" -> FoodLog
    button "Save" primary -> FoodLog

screen WeightProgress "Weight trend over time"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard -> Dashboard | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight | Coaches -> Coaches"
  heading "Weight trend"
  chart "Weight over time" 600x260
  row
    right
    button "Record weight" primary -> RecordWeight

screen RecordWeight "Record today's weight"
  navbar "Diet Manager"
  heading "Record weight"
  input "Weight (kg)"
  row
    right
    button "Cancel" -> WeightProgress
    button "Save" primary -> WeightProgress

screen Coaches "Connected coaches"
  navbar "Diet Manager | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches -> Coaches"
  sidebar "Dashboard -> Dashboard | Recipes -> Recipes | Meal Plan -> MealPlan | Food Log -> FoodLog | Weight -> WeightProgress | Coaches"
  row
    right
    button "Invite a coach" primary -> InviteCoach
  list "Dr. Amara Lee (active) | Coach Sam Rios (pending)"

screen InviteCoach "Invite a coach to connect"
  navbar "Diet Manager"
  heading "Invite a coach"
  input "Coach's email"
  row
    right
    button "Cancel" -> Coaches
    button "Send invite" primary -> Coaches

screen ConnectedDieters "Dieters connected to me"
  navbar "Diet Manager | Dieters -> ConnectedDieters"
  sidebar "Dieters -> ConnectedDieters"
  heading "My dieters"
  table "Dieter | Goal | Last log" -> DieterProgress
    row "Alex Kim | 2,000 kcal | Today"
    row "Jo Patel | 1,800 kcal | Yesterday"

screen DieterProgress "A connected dieter's plan and progress"
  navbar "Diet Manager"
  heading "Alex Kim"
  row
    card "Today | 1,420 kcal | of 2,000 goal"
    chart "Weight trend" 400x220
  table "Day | Breakfast | Lunch | Dinner"
    row "Mon | Oatmeal | Grilled chicken bowl | Salmon salad"
  button "Leave feedback" primary -> LeaveFeedback

screen LeaveFeedback "Write feedback for a dieter"
  navbar "Diet Manager"
  heading "Feedback for Alex Kim"
  textarea "Write your feedback"
  text "Alex will be notified on WhatsApp."
  row
    right
    button "Cancel" -> DieterProgress
    button "Send" primary -> DieterProgress

flow "Plan and order lunch"
  role "Dieter"
  description "A dieter browses recipes, plans meals, and orders a planned lunch through Uber Eats"
  Dashboard
  Recipes
  RecipeDetail
  MealPlan
  MealPlanEntry
  OrderLunch
  OrderConfirmation

flow "Log food and track progress"
  role "Dieter"
  description "A dieter logs what they ate, tracks weight, and connects a coach"
  Dashboard
  FoodLog
  LogMeal
  WeightProgress
  RecordWeight
  Coaches
  InviteCoach

flow "Guide connected dieters"
  role "Coach"
  description "A coach reviews a connected dieter's progress and leaves feedback"
  ConnectedDieters
  DieterProgress
  LeaveFeedback
