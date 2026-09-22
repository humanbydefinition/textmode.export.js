import type { JSONParseResult } from './types';

/** Parse JSON syntax once before routing the resulting value by discriminator. */
export function parseJSON(json: string): JSONParseResult {
	try {
		return { ok: true, value: JSON.parse(json) as unknown };
	} catch (error) {
		return {
			ok: false,
			error: {
				code: 'INVALID_JSON',
				message: error instanceof Error ? error.message : 'The file is not valid JSON.',
			},
		};
	}
}
