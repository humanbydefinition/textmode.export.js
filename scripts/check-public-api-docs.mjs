import path from 'node:path';
import process from 'node:process';

import { Application, PackageJsonReader, ReflectionKind, TSConfigReader } from 'typedoc';

const ENTRY_POINT = 'src/index.ts';
const TARGET_KINDS = ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor;

const ISSUE_KIND = {
	MISSING_DOCSTRING: 'missing-docstring',
	MISSING_EXAMPLE: 'missing-example',
};

async function loadProject() {
	const app = await Application.bootstrap(
		{
			entryPoints: [ENTRY_POINT],
			entryPointStrategy: 'resolve',
			tsconfig: 'tsconfig.json',
			excludeInternal: true,
			excludePrivate: true,
			excludeProtected: true,
			readme: 'none',
			emit: 'none',
			logLevel: 'Error',
		},
		[new PackageJsonReader(), new TSConfigReader()]
	);

	const project = await app.convert();

	if (!project || app.logger.hasErrors()) {
		throw new Error('TypeDoc failed to resolve the public API surface.');
	}

	return project;
}

function isIncludedReflection(reflection, targetKinds) {
	if (!reflection.kindOf(targetKinds)) {
		return false;
	}

	if (reflection.flags.isPrivate || reflection.flags.isProtected || reflection.flags.isInherited) {
		return false;
	}

	for (let current = reflection; current && !current.isProject(); current = current.parent) {
		if (current.name.startsWith('_')) {
			return false;
		}
	}

	return true;
}

function getRelevantComments(reflection) {
	const comments = [];

	if (reflection.comment) {
		comments.push(reflection.comment);
	}

	if (!reflection.isDeclaration()) {
		return comments;
	}

	for (const signature of reflection.signatures ?? []) {
		if (signature.comment) {
			comments.push(signature.comment);
		}
	}

	if (reflection.getSignature?.comment) {
		comments.push(reflection.getSignature.comment);
	}

	if (reflection.setSignature?.comment) {
		comments.push(reflection.setSignature.comment);
	}

	return comments;
}

function hasDocstring(reflection) {
	return getRelevantComments(reflection).length > 0;
}

function hasExample(reflection) {
	return getRelevantComments(reflection).some((comment) =>
		comment.getTags('@example').some((tag) => tag.content.some((part) => (part.text ?? '').trim().length > 0))
	);
}

function getSourceCandidates(reflection) {
	if (!reflection.isDeclaration()) {
		return [];
	}

	return [
		...(reflection.sources ?? []),
		...(reflection.signatures ?? []).flatMap((signature) => signature.sources ?? []),
		...(reflection.getSignature?.sources ?? []),
		...(reflection.setSignature?.sources ?? []),
	];
}

function getPrimaryLocation(reflection) {
	const [source] = getSourceCandidates(reflection);

	if (!source) {
		return {
			file: path.resolve('<unknown>'),
			line: 1,
			column: 1,
			printable: '<unknown>:1:1',
		};
	}

	const file = source.fullFileName || path.resolve(source.fileName);
	const line = source.line || 1;
	const column = (source.character ?? 0) + 1;

	return {
		file,
		line,
		column,
		printable: `${file}:${line}:${column}`,
	};
}

function createIssue(reflection, kind) {
	const location = getPrimaryLocation(reflection);

	return {
		kind,
		name: reflection.getFriendlyFullName(),
		file: location.file,
		line: location.line,
		column: location.column,
		location: location.printable,
	};
}

function compareIssues(left, right) {
	return (
		left.file.localeCompare(right.file) ||
		left.line - right.line ||
		left.column - right.column ||
		left.name.localeCompare(right.name)
	);
}

function renderIssueSection(title, issues) {
	if (issues.length === 0) {
		return;
	}

	console.log('');
	console.log(`${title}: ${issues.length}`);

	for (const issue of issues) {
		console.log(`- ${issue.name}`);
		console.log(`  ${issue.location}`);
	}
}

async function main() {
	try {
		if (process.argv.includes('--help') || process.argv.includes('-h')) {
			console.log('Usage: node ./scripts/check-public-api-docs.mjs');
			console.log('');
			console.log(`Checks the exported public API reachable from ${ENTRY_POINT}.`);
			console.log('Skips private/protected/inherited members and any API path segment starting with "_".');
			console.log(
				'Requires a JSDoc docstring and at least one @example tag for every exported function, method, and accessor.'
			);
			return;
		}

		const project = await loadProject();
		const reflections = project
			.getReflectionsByKind(TARGET_KINDS)
			.filter((reflection) => isIncludedReflection(reflection, TARGET_KINDS));
		const scopeLabel = 'exported functions, methods, and accessors';

		const missingDocstrings = reflections
			.filter((reflection) => !hasDocstring(reflection))
			.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_DOCSTRING))
			.sort(compareIssues);

		const missingExamples = reflections
			.filter((reflection) => hasDocstring(reflection) && !hasExample(reflection))
			.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_EXAMPLE))
			.sort(compareIssues);

		if (missingDocstrings.length === 0 && missingExamples.length === 0) {
			console.log('Public API documentation check passed.');
			console.log(`Scanned ${reflections.length} ${scopeLabel} from ${ENTRY_POINT}.`);
			console.log('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
			console.log('Every included API item has a JSDoc docstring and at least one @example tag.');
			return;
		}

		console.error('Public API documentation check failed.');
		console.error(`Scanned ${reflections.length} ${scopeLabel} from ${ENTRY_POINT}.`);
		console.error('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
		console.error(
			`Found ${missingDocstrings.length + missingExamples.length} issue(s): ${missingDocstrings.length} missing docstring, ${missingExamples.length} missing @example.`
		);

		renderIssueSection('Missing JSDoc docstring', missingDocstrings);
		renderIssueSection('Missing @example tag', missingExamples);

		process.exitCode = 1;
	} catch (error) {
		console.error('Public API documentation check could not complete.');
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 2;
	}
}

await main();
