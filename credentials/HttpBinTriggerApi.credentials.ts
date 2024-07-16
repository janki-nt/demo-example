import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HttpBinTriggerApi implements ICredentialType {
	name = 'httpbintriggerApi';
	displayName = 'CT Coach Dev Trigger API';
	documentationUrl = 'https://httpbin.org';
	properties: INodeProperties[] = [
		{
			displayName: 'Trigger Key',
			name: 'key',
			type: 'string',
			default:'',
			required: true,
			typeOptions: {
				password: true,
			},
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'triggerKey': '={{$credentials.key}}'
			},
		},
	};
}
