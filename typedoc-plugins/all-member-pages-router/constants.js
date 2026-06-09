// @ts-check

import { ReflectionKind } from 'typedoc';

export const ROUTER_NAME = 'all-member-pages';

export const ALWAYS_OWN_PAGE_KIND_NAMES = ['Module', 'Namespace', 'Document'];

export const MAX_INLINE_SANDPACK_EXAMPLES = 3;

export const METHOD_PAGE_OWNER_KINDS = new Set([ReflectionKind.Class, ReflectionKind.Interface]);

export const MEMBER_PAGE_KINDS = new Set([ReflectionKind.Method]);

export const MEMBER_DIRECTORIES = new Map([[ReflectionKind.Method, 'methods']]);
