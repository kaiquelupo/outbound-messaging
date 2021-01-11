const TokenValidator = require('twilio-flex-token-validator').functionValidator;

const ID =  () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

let path = Runtime.getFunctions()['utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {

    try {

        const { 
            FLEX_FLOW_SID, 
            FLEX_PROXY_SERVICE_SID,
            TWILIO_PHONE_NUMBER,
            CHAT_SERVICE_SID
        } = context;

        const { customerNumber } = event;
        
        const client =  context.getTwilioClient();

        const channel = await client.flexApi.channel
            .create({
                target: customerNumber,
                taskAttributes: JSON.stringify({
                    to: customerNumber,
                    direction: 'outbound',
                    name: 'Kaique Lupo',
                    from: TWILIO_PHONE_NUMBER,
                    autoAnswer: 'true'
                }),
                identity: `sms_${customerNumber}`,
                chatFriendlyName: 'Outbound Chat with Kaique',
                flexFlowSid: FLEX_FLOW_SID,
                chatUserFriendlyName: 'Kaique Lupo'
            });

        const session = await client.proxy.services(FLEX_PROXY_SERVICE_SID)
            .sessions
            .create({
                uniqueName: `${channel.sid}.${ID()}`,
                mode: 'message-only',
                participants: [{
                    'Identifier': customerNumber, 
                    'ProxyIdentifier': TWILIO_PHONE_NUMBER
                }]
            });

        await client.proxy.services(FLEX_PROXY_SERVICE_SID)
            .sessions(session.sid)
            .participants
            .create({
                proxyIdentifier: TWILIO_PHONE_NUMBER,
                identifier: channel.sid
            });

        const { attributes: channelAttributes } = 
            await client.chat.services(CHAT_SERVICE_SID)
                .channels(channel.sid)
                .fetch();

        await client.chat.services(CHAT_SERVICE_SID)
            .channels(channel.sid)
            .update({
                attributes:  JSON.stringify({
                    ...JSON.parse(channelAttributes),
                    proxySession: session.sid
                })
            });

            callback(null, assets.response("json", {}));

    } catch (err) {

        console.log(err);

        callback(err);

    }

    
})