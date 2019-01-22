/* eslint-disable  func-names */
/* eslint-disable  no-console */

const alexa = require('ask-sdk');
const myDocument = require('./main.json');
const summonDoc = require('./summon.json');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to The Magic Portal.  Try saying "summon a dragon".';

        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: myDocument,
                    datasources: {}
                })
                //.withSimpleCard('Hello World', speechText)
                .getResponse();
        } else {
            return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        }
    },
};

const InProgressSummonIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'Summon' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        console.log('Thing: ' + currentIntent.slots.thing.value);
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
}

const CompleteSummonIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'Summon' &&
            request.dialogState === 'COMPLETED';
    },
    handle(handlerInput) {
        //${currentIntent.slots.thing.value}
        const speechText = `You successfully summoned a dragon! You better hope he's been well fed!`;
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
            return handlerInput.responseBuilder
                .speak(speechText)
                //.withSimpleCard('Summoned', speechText)
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: summonDoc.document,
                    datasources: summonDoc.dataSources
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
        }
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say summon a dragon!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('The Magic Portal', speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('The Magic Portal', speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

let skill;
exports.handler = async (event, context) => {
    console.log(`REQUEST:\n\n${JSON.stringify(event, null, 4)}`);
    if (!skill) {
        skill = alexa.SkillBuilders.custom()
            .addRequestHandlers(
                LaunchRequestHandler,
                InProgressSummonIntentHandler,
                CompleteSummonIntentHandler,
                HelpIntentHandler,
                CancelAndStopIntentHandler,
                SessionEndedRequestHandler
            )
            //.withPersistenceAdapter(dynamoDbPersistenceAdapter)
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event, context);
    console.log(`RESPONSE:\n\n${JSON.stringify(response)}`);

    return response;
}