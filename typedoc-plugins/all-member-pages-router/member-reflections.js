// @ts-check

import { ReflectionKind } from 'typedoc';

import {
	ALWAYS_OWN_PAGE_KIND_NAMES,
	MAX_INLINE_SANDPACK_EXAMPLES,
	MEMBER_PAGE_KINDS,
	METHOD_PAGE_OWNER_KINDS,
} from './constants.js';

/**
 * @typedef {{
 *   membersWithOwnFile: string[];
 *   kindsToString: Map<import('typedoc').ReflectionKind, string>;
 * }} OwnPagePolicyRouter
 */

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {number}
 */
function countOwnSandpackExamples(reflection) {
	return (reflection.comment?.blockTags || []).filter((tag) => {
		if (tag.tag !== '@example') {
			return false;
		}

		const content = (tag.content || []).map((part) => part.text).join('');
		return /```(?:js|javascript|jsx|ts|typescript|tsx)\b/i.test(content);
	}).length;
}

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {number}
 */
function countReflectionSandpackExamples(reflection) {
	const signatureExamples = (reflection.signatures || []).reduce((count, signature) => {
		return count + countOwnSandpackExamples(signature);
	}, 0);

	return countOwnSandpackExamples(reflection) + signatureExamples;
}

/**
 * @param {import('typedoc').Reflection} owner
 * @returns {number}
 */
function countInlineMethodSandpackExamples(owner) {
	return (owner.children || [])
		.filter((child) => child.kind === ReflectionKind.Method)
		.reduce((count, method) => count + countReflectionSandpackExamples(method), 0);
}

/**
 * Check whether direct methods should become focused pages for this owner.
 *
 * @param {import('typedoc').Reflection} owner
 * @returns {boolean}
 */
function shouldRenderMethodMemberPages(owner) {
	if (!METHOD_PAGE_OWNER_KINDS.has(owner.kind)) {
		return false;
	}

	const inlineExampleCount = countReflectionSandpackExamples(owner) + countInlineMethodSandpackExamples(owner);
	return inlineExampleCount > MAX_INLINE_SANDPACK_EXAMPLES;
}

/**
 * Check whether a reflection is a direct method that should become a focused
 * page.
 *
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {boolean}
 */
export function isDirectMemberPageReflection(reflection) {
	return Boolean(
		reflection?.parent && MEMBER_PAGE_KINDS.has(reflection.kind) && shouldRenderMethodMemberPages(reflection.parent)
	);
}

/**
 * Preserve the markdown MemberRouter own-page policy while extending it to
 * direct methods when the owner page would otherwise render too many Sandpack
 * examples.
 *
 * @param {import('typedoc').Reflection} reflection
 * @param {OwnPagePolicyRouter} router
 * @returns {boolean}
 */
export function shouldRenderOwnPage(reflection, router) {
	if (isDirectMemberPageReflection(reflection)) {
		return true;
	}

	return [...ALWAYS_OWN_PAGE_KIND_NAMES, ...router.membersWithOwnFile].includes(
		router.kindsToString.get(reflection.kind)
	);
}
