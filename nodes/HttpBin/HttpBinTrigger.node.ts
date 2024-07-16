import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';

export class HttpBinTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CT Coach Dev Trigger',
		name: 'httpBinTrigger',
		icon: 'file:httpbin.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with HttpBin Trigger API',
		defaults: {
			name: 'CT Coach Dev Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'httpbintriggerApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'crmApi/trigger/message',
				isFullPath: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'On New Chat Message',
						value: 'triggerMessage',
					},
				],
				default: 'triggerMessage',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = req.body;
		const headers = req.headers;
		// Retrieve credentials
		const credentials = await this.getCredentials('httpbintriggerApi') as ICredentialDataDecryptedObject;
		const storedTriggerKey = (credentials.key).toString();

		// Validate the trigger key
		if (headers.triggerkey !== storedTriggerKey) {
			throw new NodeOperationError(this.getNode(), 'Invalid trigger key');
		}

		// Emit the data received from the webhook
		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}

	async webhookRegister(this: IHookFunctions): Promise<boolean> {
		const webhookUrl = this.getNodeWebhookUrl('default');
		const credentials = await this.getCredentials('httpbintriggerApi') as ICredentialDataDecryptedObject;
		if (!credentials || !credentials.key) {
			throw new NodeOperationError(this.getNode(), 'No credentials found');
		}

		const triggerKey = credentials.key as string;

		const response = await this.helpers.request({
			method: 'POST',
			url: 'https://a.coachtrigger.com/webhook/crmApi/trigger/message',
			headers: {
				'triggerKey': triggerKey,
			},
			body: {
				webhookUrl,
			},
			json: true,
		});

		if (response.success !== true) {
			throw new NodeOperationError(this.getNode(), 'Webhook registration failed');
		}

		return true;
	}

	async webhookUnregister(this: IHookFunctions): Promise<boolean> {
		const webhookUrl = this.getNodeWebhookUrl('default');
		const credentials = await this.getCredentials('httpbintriggerApi') as ICredentialDataDecryptedObject;
		if (!credentials || !credentials.key) {
			throw new NodeOperationError(this.getNode(), 'No credentials found');
		}

		const triggerKey = credentials.key as string;

		const response = await this.helpers.request({
			method: 'DELETE',
			url: 'https://a.coachtrigger.com/webhook/crmApi/trigger/message',
			headers: {
				'triggerKey': triggerKey,
			},
			body: {
				webhookUrl,
			},
			json: true,
		});

		if (response.success !== true) {
			throw new NodeOperationError(this.getNode(), 'Webhook unregistration failed');
		}

		return true;
	}
}
