import ballerina/os;

// diet-db (postgres-cnpg platform resource)
configurable string dietDbHost = os:getEnv("DIET_DB_HOST");
configurable string dietDbPort = os:getEnv("DIET_DB_PORT");
configurable string dietDbName = os:getEnv("DIET_DB_DBNAME");
configurable string dietDbUser = os:getEnv("DIET_DB_USER");
configurable string dietDbPassword = os:getEnv("DIET_DB_PASSWORD");

// user-auth (thunder-app platform resource) - identity is verified upstream by the
// gateway; this service never validates tokens itself, so these are unused for now
// but kept here as the single place any future need for them would read from.
configurable string userAuthIssuer = os:getEnv("USER_AUTH_ISSUER");
configurable string userAuthClientId = os:getEnv("USER_AUTH_CLIENT_ID");
configurable string userAuthJwksUrl = os:getEnv("USER_AUTH_JWKS_URL");
configurable string userAuthScopes = os:getEnv("USER_AUTH_SCOPES");

// whatsapp (external dependency) - empty token/phone-number-id means "skip the
// external call, don't crash", per the component contract.
configurable string whatsappAccessToken = os:getEnv("WHATSAPP_ACCESS_TOKEN");
configurable string whatsappPhoneNumberId = os:getEnv("WHATSAPP_PHONE_NUMBER_ID");

// Demo recipients: the domain model carries no phone number for a restaurant or a
// Dieter, so these are the one place a phone number lives. An operator overrides
// them via env var later.
configurable string restaurantWhatsappNumber = "+10000000000";
configurable string dieterWhatsappNumber = "+10000000001";

// nutrition-service (external dependency, USDA FoodData Central) - empty key means
// "skip enrichment, use the static baseline", per the component contract.
configurable string fdcApiKey = os:getEnv("FDC_API_KEY");
