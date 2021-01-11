import { Resource, Serverless, FlexPlugin, CheckServerless } from 'twilio-pulumi-provider';
import * as pulumi from '@pulumi/pulumi';

const stack = pulumi.getStack();

const serviceName = 'outbound-sms-serverless';
const domain = CheckServerless.getDomainName(serviceName, stack);

const { 
    
    CHAT_SERVICE_SID, 
    FLEX_WORKSPACE_SID, 
    SMS_TASK_CHANNEL_SID, 
    EVERYONE_TASK_QUEUE_SID,
    TWILIO_PHONE_NUMBER,
    FLEX_PROXY_SERVICE_SID

} = process.env;

const flexWorkspace = new Resource("flex-workspace", {
    resource: ["taskrouter", "workspaces"],
    attributes: {
        sid: FLEX_WORKSPACE_SID
    }
});

const outboundSMSWorkflow = new Resource("outbound-sms-workflow", {
    resource: ["taskrouter", { "workspaces" : flexWorkspace.sid }, "workflows"],
    attributes: {
        friendlyName: 'Outbound SMS',
        configuration: JSON.stringify(
            {
                task_routing: {
                    default_filter: {
                        task_queue_sid: EVERYONE_TASK_QUEUE_SID
                    }
                }
            }
        )
    },
});

const outboundSMSFlexFlow = new Resource("outbound-sms-flex-flow", {
    resource: ["flexApi", "flexFlow"],
    attributes: {
        contactIdentity: TWILIO_PHONE_NUMBER,
        enabled: false,
        integrationType: 'task',
        'integration.workflowSid': outboundSMSWorkflow.sid,
        'integration.workspaceSid': flexWorkspace.sid,
        'integration.channel': SMS_TASK_CHANNEL_SID,
        'integration.retryCount': 3,
        friendlyName: 'Outbound SMS',
        chatServiceSid: CHAT_SERVICE_SID,
        channelType: 'sms',
        janitorEnabled: true
    }
});

const serverless = new Serverless("outbound-sms-functions-assets", {
    attributes: {
        cwd: `../serverless/main`,
        serviceName,
        envPath: `.${stack}.env`,
        env: {
            FLEX_FLOW_SID: outboundSMSFlexFlow.sid,
            FLEX_PROXY_SERVICE_SID,
            TWILIO_PHONE_NUMBER,
            CHAT_SERVICE_SID,
            WORKSPACE_SID: flexWorkspace.sid,
            WORKFLOW_SID: outboundSMSWorkflow.sid
        },
        functionsEnv: stack,
        pkgJson: require("../serverless/main/package.json")
    }
});

const outboundSmsFlexPlugin = new FlexPlugin("outbound-sms-flex-plugin", { 
    attributes: {
        cwd: "../flex-plugins/plugin-outbound-sms",
        env: pulumi.all([domain]).apply(([ domain ]) => (
            {
                REACT_APP_SERVICE_BASE_URL: `https://${domain}`
            }
        ))
    }
});
 

export let output =  {
    flexWorkspaceSid: flexWorkspace.sid,
    outboundSMSWorkflow: outboundSMSWorkflow.sid,
    outboundSMSFlexFlow: outboundSMSFlexFlow.sid,
    serverless: serverless.sid,
    outboundSmsFlexPluginSid: outboundSmsFlexPlugin.sid
}
