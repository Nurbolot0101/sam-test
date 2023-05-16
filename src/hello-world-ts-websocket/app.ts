import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApiGatewayManagementApi} from 'aws-sdk';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const domainName = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    console.log(connectionId)
    console.log(event)
    // Send a message to the connected client
    const message = 'Hello, world!';
    await sendToClient(connectionId, message, domainName, stage);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success' })
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'internal server error' })
    };
  }
};

// Helper function to send a message to the connected client
async function sendToClient(connectionId: string, message: string, domainName: string, stage: string): Promise<void> {
  const endpoint = `${domainName}/${stage}`;
  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${domainName}/${stage}`
  });

  try {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: message }).promise();
  } catch (err) {
    if (err.statusCode === 410) {
      console.log(`Connection ${connectionId} is gone`);
    } else {
      throw err;
    }
  }
}
