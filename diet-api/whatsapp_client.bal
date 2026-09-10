import ballerina/http;
import ballerina/log;

type WhatsappText record {|
    string body;
|};

type SendMessageRequest record {|
    string messaging_product = "whatsapp";
    string recipient_type = "individual";
    string to;
    string 'type = "text";
    WhatsappText text;
|};

// Loosely-specified inbound payload from an external provider - open records so an
// unmodelled field never breaks parsing.
type SendMessageResponseMessage record {
    string id?;
};

type SendMessageResponse record {
    SendMessageResponseMessage[] messages?;
};

final http:Client? whatsappClient = initWhatsappClient();

function initWhatsappClient() returns http:Client? {
    if whatsappAccessToken.trim() == "" || whatsappPhoneNumberId.trim() == "" {
        return ();
    }
    http:Client|error waClient = new ("https://graph.facebook.com/v23.0", {auth: {token: whatsappAccessToken}, timeout: 10});
    if waClient is error {
        log:printWarn("failed to initialize whatsapp client", 'error = waClient);
        return ();
    }
    return waClient;
}

// Returns the WhatsApp message id on success, or () when the send could not be
// attempted (no token configured) or failed - both cases are treated the same by
// callers: the resulting LunchOrder/notification records status "failed" and the
// request still succeeds, per the component contract.
function sendWhatsappMessage(string toNumber, string body) returns string? {
    http:Client? waClient = whatsappClient;
    if waClient is () {
        return ();
    }
    SendMessageRequest payload = {
        to: toNumber,
        text: {body: body}
    };
    string path = string `/${whatsappPhoneNumberId}/messages`;
    SendMessageResponse|error response = waClient->post(path, payload);
    if response is error {
        log:printWarn("whatsapp send failed", 'error = response);
        return ();
    }
    SendMessageResponseMessage[]? messages = response.messages;
    if messages is () || messages.length() == 0 {
        return ();
    }
    return messages[0].id;
}
